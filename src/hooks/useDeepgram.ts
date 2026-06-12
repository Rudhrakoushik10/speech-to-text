import { useState, useRef, useCallback } from 'react'

export function useDeepgram() {
  const [transcript, setTranscript] = useState('')
  const [interim, setInterim] = useState('')
  const [listening, setListening] = useState(false)
  const [requesting, setRequesting] = useState(false)
  const [error, setError] = useState('')
  const wsRef = useRef<WebSocket | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startListening = useCallback(async () => {
    setError('')
    setTranscript('')
    setInterim('')
    setRequesting(true)

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Microphone API not available. Use HTTPS or http://localhost:5173')
      }

      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        console.log('[Deepgram] Mic access granted')
      } catch (micErr: any) {
        console.error('[Deepgram] Mic error:', micErr.name, micErr.message)
        if (micErr.name === 'NotAllowedError' || micErr.name === 'PermissionDeniedError') {
          throw new Error(
            'Microphone access blocked. Click the lock icon in the address bar, enable Microphone, then reload.'
          )
        }
        if (micErr.name === 'NotFoundError') {
          throw new Error('No microphone found. Connect a mic and try again.')
        }
        throw new Error(micErr.message || 'Microphone access denied')
      }

      streamRef.current = stream
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'
      const recorder = new MediaRecorder(stream, { mimeType })
      recorderRef.current = recorder
      console.log('[Deepgram] MediaRecorder created with', mimeType)

      const apiKey = import.meta.env.VITE_DEEPGRAM_KEY as string
      const url = new URL('wss://api.deepgram.com/v1/listen')
      url.searchParams.set('model', 'nova-2')
      url.searchParams.set('interim_results', 'true')
      console.log('[Deepgram] Connecting to:', url.toString())

      const ws = new WebSocket(url.toString(), ['token', apiKey])
      wsRef.current = ws
      console.log('[Deepgram] WebSocket created')

      let closed = false

      ws.onopen = () => {
        if (closed) return
        console.log('[Deepgram] WebSocket opened')
        recorder.start(250)
        setListening(true)
        setRequesting(false)
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('[Deepgram] Message type:', data.type, data)
          if (data.type === 'Results') {
            const alt = data.channel?.alternatives?.[0]
            if (alt && alt.transcript) {
              console.log('[Deepgram] Transcript:', alt.transcript, 'is_final:', data.is_final)
              if (data.is_final) {
                setTranscript((prev) => (prev ? prev + ' ' + alt.transcript : alt.transcript))
                setInterim('')
              } else {
                setInterim(alt.transcript)
              }
            } else {
              console.log('[Deepgram] No transcript in alternatives:', alt)
            }
          }
        } catch (e) {
          console.warn('[Deepgram] Parse error:', e)
        }
      }

      ws.onerror = (e) => {
        console.error('[Deepgram] WebSocket error:', e)
        if (!closed) {
          closed = true
          setError('Deepgram connection failed. Check your API key.')
          cleanup()
        }
      }

      ws.onclose = (e) => {
        console.log('[Deepgram] WebSocket closed:', e.code, e.reason)
        if (!closed) {
          closed = true
          if (e.code !== 1000) {
            setError(`Connection closed (code ${e.code}). Check your Deepgram API key.`)
          }
          cleanup()
        }
      }

      function cleanup() {
        if (recorder.state !== 'inactive') {
          try { recorder.stop() } catch {}
        }
        if (stream.active) stream.getTracks().forEach((t) => t.stop())
        setListening(false)
        setRequesting(false)
      }

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
          console.log('[Deepgram] Sending audio chunk:', event.data.size, 'bytes')
          ws.send(event.data)
        }
      }
    } catch (err: any) {
      console.error('[Deepgram] Start error:', err.message)
      setError(err.message)
      setRequesting(false)
    }
  }, [])

  const stopListening = useCallback(() => {
    console.log('[Deepgram] Stopping')
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop()
    }
    if (wsRef.current) {
      wsRef.current.close()
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
    }
    setListening(false)
    setRequesting(false)
  }, [])

  return { transcript, interim, listening, requesting, error, startListening, stopListening }
}
