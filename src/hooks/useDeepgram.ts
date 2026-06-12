import { useState, useRef, useCallback } from 'react'
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk'

export function useDeepgram() {
  const [transcript, setTranscript] = useState('')
  const [interim, setInterim] = useState('')
  const [listening, setListening] = useState(false)
  const [requesting, setRequesting] = useState(false)
  const [error, setError] = useState('')
  const connectionRef = useRef<any>(null)
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
      const deepgram = createClient(apiKey)
      const connection = deepgram.listen.live({
        model: 'nova-2',
        interim_results: true,
      })
      connectionRef.current = connection

      connection.on(LiveTranscriptionEvents.Open, () => {
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm'
        const recorder = new MediaRecorder(stream!, { mimeType })
        recorderRef.current = recorder

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            connection.send(event.data)
          }
        }

        recorder.start(250)
        setListening(true)
        setRequesting(false)
      })

      connection.on(LiveTranscriptionEvents.Transcript, (data: any) => {
        const alt = data.channel?.alternatives?.[0]
        if (alt && alt.transcript) {
          if (data.is_final) {
            setTranscript((prev) => (prev ? prev + ' ' + alt.transcript : alt.transcript))
            setInterim('')
          } else {
            setInterim(alt.transcript)
          }
        }
      })

      connection.on(LiveTranscriptionEvents.Error, (err: any) => {
        setError(`Deepgram error: ${err.message || 'Unknown error'}`)
      })

      connection.on(LiveTranscriptionEvents.Close, () => {
        if (recorderRef.current && recorderRef.current.state !== 'inactive') {
          try { recorderRef.current.stop() } catch {}
        }
        if (stream.active) stream.getTracks().forEach((t) => t.stop())
        setListening(false)
        setRequesting(false)
      })
    } catch (err: any) {
      setError(err.message)
      setRequesting(false)
    }
  }, [])

  const stopListening = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop()
    }
    if (connectionRef.current) {
      connectionRef.current.disconnect()
      connectionRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
    }
    setListening(false)
    setRequesting(false)
  }, [])

  return { transcript, interim, listening, requesting, error, startListening, stopListening }
}
