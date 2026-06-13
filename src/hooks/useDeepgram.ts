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
  const timeoutRef = useRef<number | null>(null)

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
      } catch (micErr: any) {
        if (micErr.name === 'NotAllowedError' || micErr.name === 'PermissionDeniedError') {
          throw new Error('Microphone access blocked. Click the lock icon in the address bar, enable Microphone, then reload.')
        }
        if (micErr.name === 'NotFoundError') {
          throw new Error('No microphone found. Connect a mic and try again.')
        }
        throw new Error(micErr.message || 'Microphone access denied')
      }

      streamRef.current = stream

      const apiKey = import.meta.env.VITE_DEEPGRAM_KEY as string
      if (!apiKey) {
        throw new Error('Deepgram API key is missing. Set VITE_DEEPGRAM_KEY in your .env file.')
      }

      const url = new URL('wss://api.deepgram.com/v1/listen')
      url.searchParams.set('model', 'nova-2')
      url.searchParams.set('interim_results', 'true')
      url.searchParams.set('token', apiKey)

      const ws = new WebSocket(url.toString())
      ws.binaryType = 'arraybuffer'
      wsRef.current = ws

      let closed = false

      timeoutRef.current = window.setTimeout(() => {
        if (!closed) {
          closed = true
          ws.close()
          setError('Connection timed out. Check your Deepgram API key and network.')
          cleanup()
        }
      }, 10000)

      ws.onopen = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        if (closed) return

        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm'
        const recorder = new MediaRecorder(stream, { mimeType })
        recorderRef.current = recorder

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
            ws.send(event.data)
          }
        }

        recorder.start(250)
        setListening(true)
        setRequesting(false)
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(typeof event.data === 'string' ? event.data : new TextDecoder().decode(event.data))
          if (data.type === 'Results') {
            const alt = data.channel?.alternatives?.[0]
            if (alt && alt.transcript) {
              if (data.is_final) {
                setTranscript((prev) => (prev ? prev + ' ' + alt.transcript : alt.transcript))
                setInterim('')
              } else {
                setInterim(alt.transcript)
              }
            }
          }
        } catch {
        }
      }

      ws.onerror = () => {
        if (!closed) {
          closed = true
          if (timeoutRef.current) clearTimeout(timeoutRef.current)
          setError('Connection failed. Check your Deepgram API key.')
          cleanup()
        }
      }

      ws.onclose = (e) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        if (!closed) {
          closed = true
          if (e.code !== 1000) {
            setError(`Connection closed (code ${e.code}). Check your API key.`)
          }
          cleanup()
        }
      }

      function cleanup() {
        if (recorderRef.current && recorderRef.current.state !== 'inactive') {
          try { recorderRef.current.stop() } catch {}
        }
        if (stream.active) stream.getTracks().forEach((t) => t.stop())
        setListening(false)
        setRequesting(false)
      }
    } catch (err: any) {
      setError(err.message)
      setRequesting(false)
    }
  }, [])

  const stopListening = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop()
    }
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
    }
    setListening(false)
    setRequesting(false)
  }, [])

  return { transcript, interim, listening, requesting, error, startListening, stopListening }
}
