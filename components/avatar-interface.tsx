"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { useAvatar } from "@/contexts/avatar-context"
import { ConversationManager } from "@/lib/conversation-manager"
import { Mic, MicOff } from "lucide-react"

// Speech Recognition types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  addEventListener(type: "result", listener: (event: SpeechRecognitionEvent) => void): void
  addEventListener(type: "error", listener: (event: SpeechRecognitionErrorEvent) => void): void
  addEventListener(type: "end", listener: () => void): void
  addEventListener(type: "start", listener: () => void): void
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

// Update the component to use language from avatar context
export default function AvatarInterface() {
  const [inputText, setInputText] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const conversationManagerRef = useRef<ConversationManager | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const { state, setThinking, setSpeaking, setStatus, setSpeechText, setError, setListening, addMessage } = useAvatar()

  // Language code mapping for speech recognition
  const speechLanguageCodes = {
    en: "en-US",
    hi: "hi-IN",
    kn: "kn-IN",
  }

  // Initialize speech recognition with language support
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      setSpeechSupported(!!SpeechRecognition)

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        const recognition = recognitionRef.current

        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = speechLanguageCodes[state.language] // Use language from state

        recognition.addEventListener("result", (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript
          setInputText(transcript)
          setIsRecording(false)
          setListening(false)

          // Automatically submit the recognized speech
          handleSubmit(transcript)
        })

        recognition.addEventListener("error", (event: SpeechRecognitionErrorEvent) => {
          console.error("Speech recognition error:", event.error)
          setIsRecording(false)
          setListening(false)
          setError(`Speech recognition error: ${event.error}`)
        })

        recognition.addEventListener("end", () => {
          setIsRecording(false)
          setListening(false)
        })

        recognition.addEventListener("start", () => {
          setIsRecording(true)
          setListening(true)
          setStatus("Listening...")
        })
      }
    }
  }, [setError, setListening, setStatus, state.language]) // Add state.language as dependency

  // Initialize conversation manager with language support and conversation history
  useEffect(() => {
    if (state.isReady) {
      conversationManagerRef.current = new ConversationManager(
        {
          onThinkingStart: () => {
            setThinking(true)
            setStatus("Processing response...")
            setSpeechText("Thinking...")
          },
          onSpeakingStart: (text: string) => {
            setThinking(false)
            setSpeaking(true)
            setStatus("Speaking...")
            setSpeechText(text)
          },
          onSpeakingEnd: () => {
            setSpeaking(false)
            setStatus("Ready")
            setSpeechText("")
          },
          onError: (error: string) => {
            setError(error)
            setThinking(false)
            setSpeaking(false)
            setStatus("Error occurred")
          },
          onMessageAdd: (message) => {
            // Add this callback
            addMessage(message)
          },
        },
        state.language,
        state.conversationHistory, // Pass conversation history
      )
    }
  }, [
    state.isReady,
    state.language,
    state.conversationHistory,
    setThinking,
    setSpeaking,
    setStatus,
    setSpeechText,
    setError,
    addMessage,
  ])

  // Update conversation manager language and history when they change
  useEffect(() => {
    if (conversationManagerRef.current) {
      conversationManagerRef.current.updateLanguage(state.language)
      conversationManagerRef.current.updateConversationHistory(state.conversationHistory)
    }
    // Update speech recognition language
    if (recognitionRef.current) {
      recognitionRef.current.lang = speechLanguageCodes[state.language]
    }
  }, [state.language, state.conversationHistory])

  // Update placeholder text based on language
  const getPlaceholderText = () => {
    const placeholders = {
      en: isRecording ? "Listening..." : "Type what you want the avatar to say...",
      hi: isRecording ? "सुन रहे हैं..." : "अवतार से क्या कहलवाना चाहते हैं टाइप करें...",
      kn: isRecording ? "ಕೇಳುತ್ತಿದ್ದೇವೆ..." : "ಅವತಾರ ಏನು ಹೇಳಬೇಕು ಎಂದು ಟೈಪ್ ಮಾಡಿ...",
    }
    return placeholders[state.language]
  }

  const handleSubmit = useCallback(
    async (text: string = inputText) => {
      if (!text.trim() || state.isSpeaking || !conversationManagerRef.current) return

      try {
        await conversationManagerRef.current.handleConversation(text.trim())
        setInputText("")
      } catch (error) {
        console.error("Conversation error:", error)
        setError(`Conversation failed: ${error}`)
      }
    },
    [inputText, state.isSpeaking, setError],
  )

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit],
  )

  const startRecording = useCallback(() => {
    if (!recognitionRef.current || !speechSupported || state.isSpeaking || state.isThinking) return

    try {
      recognitionRef.current.start()
    } catch (error) {
      console.error("Error starting speech recognition:", error)
      setError("Failed to start voice recognition")
    }
  }, [speechSupported, state.isSpeaking, state.isThinking, setError])

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }, [])

  const isDisabled = !state.isReady || state.isSpeaking || state.isThinking

  return (
    <>
      {/* Status Display */}
      <div className="fixed top-6 left-6 px-4 py-3 bg-gray-800/95 backdrop-blur-sm border border-gray-600/50 rounded-lg text-xs font-mono text-gray-300 z-50">
        Status: {state.status}
        {state.isListening && (
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-400">Listening...</span>
          </div>
        )}
      </div>

      {/* Speech Bubble */}
      {(state.isSpeaking || state.isThinking) && (
        <div className="fixed top-1/2 right-6 transform -translate-y-1/2 bg-gray-800/95 backdrop-blur-sm border border-gray-600/50 rounded-lg p-4 max-w-xs shadow-lg z-50">
          <div className="text-sm text-white leading-relaxed">{state.speechText}</div>
          {/* Speech bubble arrow */}
          <div className="absolute left-[-6px] top-5 w-3 h-3 bg-gray-800/95 border-l border-b border-gray-600/50 transform rotate-45"></div>
        </div>
      )}

      {/* Input Interface */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4 z-50">
        <div className="flex gap-3 items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={getPlaceholderText()}
            disabled={isDisabled || isRecording}
            className="flex-1 px-6 py-4 text-lg bg-gray-800/95 backdrop-blur-sm border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            autoFocus
          />

          {/* Microphone Button */}
          {speechSupported && (
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isDisabled}
              className={`p-4 backdrop-blur-sm border border-gray-600/50 rounded-lg transition-colors disabled:opacity-50 ${
                isRecording
                  ? "bg-red-600/95 text-white border-red-400 animate-pulse"
                  : "bg-gray-800/95 text-gray-300 hover:text-blue-400 hover:border-blue-400"
              }`}
              title={isRecording ? "Stop recording" : "Start voice input"}
            >
              {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
          )}
        </div>

        {/* Recording Indicator */}
        {isRecording && (
          <div className="mt-3 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/20 border border-red-500/30 rounded-full">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-400 text-sm font-medium">
                {state.language === "hi"
                  ? "रिकॉर्डिंग... अब बोलें"
                  : state.language === "kn"
                    ? "ರೆಕಾರ್ಡಿಂಗ್... ಈಗ ಮಾತನಾಡಿ"
                    : "Recording... Speak now"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Loading Screen */}
      {state.isLoading && (
        <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <div className="flex gap-2 justify-center mb-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: "0.3s" }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: "0.6s" }}></div>
            </div>
            <p className="text-white text-lg">{state.status}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {state.error && (
        <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-red-500/50 rounded-lg p-6 max-w-md text-center">
            <h3 className="text-red-400 text-xl font-bold mb-4">Error</h3>
            <p className="text-gray-300 mb-6">{state.error}</p>
            <button
              onClick={() => setError(null)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </>
  )
}
