import { useState, useRef, useCallback } from 'react'
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk'
import type { LiveTranscriptionEvent } from '@deepgram/sdk'

export function useDeepgram() {
  const [transcript, setTranscript] = useState('')
  const [interim, setInterim] = useState('')
  const [listening, setListening] = useState(false)
  const [requesting, setRequesting] = useState(false)
  const [error, setError] = useState('')
  const connectionRef = useRef<ReturnType<ReturnType<typeof createClient>['listen']['live']> | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const cleanup = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      try { recorderRef.current.stop() } catch {}
    }
    if (connectionRef.current) {
      try { connectionRef.current.disconnect() } catch {}
      connectionRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setListening(false)
    setRequesting(false)
  }, [])

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
        const recorder = new MediaRecorder(stream, { mimeType })
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

      connection.on(LiveTranscriptionEvents.Transcript, (data: LiveTranscriptionEvent) => {
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
        const msg = err?.message || err?.error?.message || 'Connection failed. Check your Deepgram API key.'
        setError(msg)
        cleanup()
      })

      connection.on(LiveTranscriptionEvents.Close, () => {
        cleanup()
      })
    } catch (err: any) {
      setError(err.message)
      setRequesting(false)
    }
  }, [cleanup])

  const stopListening = useCallback(() => {
    cleanup()
  }, [cleanup])

  return { transcript, interim, listening, requesting, error, startListening, stopListening }
}
