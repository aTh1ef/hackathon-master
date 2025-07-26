"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle, X, Send, Loader2, Mic, MicOff, Trash2 } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface Message {
  id: string
  type: "user" | "bot" | "system"
  content: string
  timestamp: Date
}

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

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [chatLanguage, setChatLanguage] = useState<"en" | "hi" | "kn">("en")
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const { language, t } = useLanguage()

  // Language code mapping for speech recognition
  const speechLanguageCodes = {
    en: "en-US",
    hi: "hi-IN",
    kn: "kn-IN",
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Check if speech recognition is supported
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      setSpeechSupported(!!SpeechRecognition)

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        const recognition = recognitionRef.current

        recognition.continuous = false
        recognition.interimResults = false

        recognition.addEventListener("result", (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript
          setInputValue(transcript)
          setIsRecording(false)
        })

        recognition.addEventListener("error", (event: SpeechRecognitionErrorEvent) => {
          console.error("Speech recognition error:", event.error)
          setIsRecording(false)

          // Show error message based on language (concise)
          const errorMessages = {
            en: "Couldn't hear you. Try again?",
            hi: "सुनाई नहीं दिया। फिर कोशिश करें?",
            kn: "ಕೇಳಿಸಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ?",
          }

          const errorMessage: Message = {
            id: `error-${Date.now()}`,
            type: "bot",
            content: errorMessages[chatLanguage],
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, errorMessage])
        })

        recognition.addEventListener("end", () => {
          setIsRecording(false)
        })
      }
    }
  }, [chatLanguage])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initialize with welcome messages based on user's selected language (concise)
      const welcomeMessages: Message[] = [
        {
          id: "welcome-1",
          type: "bot",
          content: getWelcomeMessage(language),
          timestamp: new Date(),
        },
        {
          id: "welcome-2",
          type: "system",
          content: t("chatbot.selectLanguage"),
          timestamp: new Date(),
        },
      ]
      setMessages(welcomeMessages)
      setChatLanguage(language) // Set initial chat language to user's selected language
    }
  }, [isOpen, language, t])

  const getWelcomeMessage = (lang: string) => {
    const welcomes = {
      en: "Hi! I'm your farming assistant. I remember our conversation, so just ask away!",
      hi: "नमस्ते! मैं आपका कृषि सहायक हूँ। मैं हमारी बातचीत याद रखता हूँ, बस पूछिए!",
      kn: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಕೃಷಿ ಸಹಾಯಕ. ನಾನು ನಮ್ಮ ಸಂಭಾಷಣೆ ನೆನಪಿಟ್ಟುಕೊಳ್ಳುತ್ತೇನೆ, ಕೇಳಿ!",
    }
    return welcomes[lang as keyof typeof welcomes] || welcomes.en
  }

  const handleLanguageSelect = (lang: "en" | "hi" | "kn") => {
    setChatLanguage(lang)
    setHasSelectedLanguage(true)

    // Update speech recognition language
    if (recognitionRef.current) {
      recognitionRef.current.lang = speechLanguageCodes[lang]
    }

    const confirmationMessage: Message = {
      id: `lang-confirm-${Date.now()}`,
      type: "bot",
      content: getLanguageConfirmation(lang),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, confirmationMessage])
  }

  const getLanguageConfirmation = (lang: "en" | "hi" | "kn") => {
    const confirmations = {
      en: "Perfect! Ask me anything about farming. I'll keep our chat in mind.",
      hi: "बढ़िया! कृषि के बारे में कुछ भी पूछें। मैं हमारी बात याद रखूंगा।",
      kn: "ಚೆನ್ನಾಗಿದೆ! ಕೃಷಿಯ ಬಗ್ಗೆ ಏನು ಬೇಕಾದರೂ ಕೇಳಿ. ನಮ್ಮ ಚರ್ಚೆ ನೆನಪಿಟ್ಟುಕೊಳ್ಳುತ್ತೇನೆ.",
    }
    return confirmations[lang]
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      // Get conversation history (excluding system messages)
      const conversationHistory = messages
        .filter((msg) => msg.type !== "system")
        .map((msg) => ({
          type: msg.type,
          content: msg.content,
        }))

      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: inputValue,
          language: chatLanguage,
          conversationHistory: conversationHistory,
        }),
      })

      const data = await response.json()

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        type: "bot",
        content: data.response || "Sorry, couldn't help right now.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: "bot",
        content: "Error occurred. Try again?",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const startRecording = () => {
    if (!recognitionRef.current || !speechSupported) return

    try {
      setIsRecording(true)
      recognitionRef.current.lang = speechLanguageCodes[chatLanguage]
      recognitionRef.current.start()
    } catch (error) {
      console.error("Error starting speech recognition:", error)
      setIsRecording(false)
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsRecording(false)
    }
  }

  const clearConversation = () => {
    setMessages([])
    setHasSelectedLanguage(false)
    // Re-initialize with welcome message
    setTimeout(() => {
      const welcomeMessages: Message[] = [
        {
          id: "welcome-1",
          type: "bot",
          content: getWelcomeMessage(language),
          timestamp: new Date(),
        },
        {
          id: "welcome-2",
          type: "system",
          content: t("chatbot.selectLanguage"),
          timestamp: new Date(),
        },
      ]
      setMessages(welcomeMessages)
    }, 100)
  }

  const getPlaceholderText = () => {
    if (!hasSelectedLanguage) {
      return t("chatbot.selectLanguageFirst")
    }

    const placeholders = {
      en: speechSupported ? "Ask me anything..." : "Type your question...",
      hi: speechSupported ? "कुछ भी पूछें..." : "अपना प्रश्न टाइप करें...",
      kn: speechSupported ? "ಏನು ಬೇಕಾದರೂ ಕೇಳಿ..." : "ನಿಮ್ಮ ಪ್ರಶ್ನೆ ಟೈಪ್ ಮಾಡಿ...",
    }

    return placeholders[chatLanguage]
  }

  return (
    <>
      {/* Floating Chat Button - Responsive */}
      <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-green-600 hover:bg-green-700 shadow-lg transition-all duration-200 hover:scale-110"
          size="icon"
        >
          {isOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />}
        </Button>
      </div>

      {/* Chat Popup - Extremely Responsive */}
      {isOpen && (
        <div className="fixed bottom-16 sm:bottom-24 right-2 sm:right-6 w-[calc(100vw-16px)] sm:w-96 max-w-sm sm:max-w-none h-[70vh] sm:h-[500px] bg-gray-800 rounded-xl shadow-2xl border border-gray-700 z-50 flex flex-col">
          {/* Header - Responsive */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-700 bg-gray-800 rounded-t-xl">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-white text-sm sm:text-base truncate">{t("chatbot.title")}</h3>
                <p className="text-xs text-gray-400 truncate">{t("chatbot.subtitle")}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* Clear conversation button */}
              {messages.length > 2 && (
                <Button
                  onClick={clearConversation}
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white flex-shrink-0 w-8 h-8 sm:w-auto sm:h-auto"
                  title="Clear conversation"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              )}
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white flex-shrink-0 w-8 h-8 sm:w-auto sm:h-auto"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages - Responsive */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
            {messages.map((message) => (
              <div key={message.id}>
                {message.type === "system" ? (
                  <div className="text-center">
                    <p className="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-3">{message.content}</p>
                    {!hasSelectedLanguage && (
                      <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <Button
                          onClick={() => handleLanguageSelect("en")}
                          variant="outline"
                          size="sm"
                          className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 text-xs sm:text-sm"
                        >
                          English
                        </Button>
                        <Button
                          onClick={() => handleLanguageSelect("hi")}
                          variant="outline"
                          size="sm"
                          className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 text-xs sm:text-sm"
                        >
                          हिंदी
                        </Button>
                        <Button
                          onClick={() => handleLanguageSelect("kn")}
                          variant="outline"
                          size="sm"
                          className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 text-xs sm:text-sm"
                        >
                          ಕನ್ನಡ
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] sm:max-w-[80%] p-2 sm:p-3 rounded-lg ${
                        message.type === "user" ? "bg-green-600 text-white" : "bg-gray-700 text-gray-100"
                      }`}
                    >
                      <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-700 text-gray-100 p-2 sm:p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                    <span className="text-xs sm:text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input - Responsive */}
          <div className="p-3 sm:p-4 border-t border-gray-700">
            <div className="flex gap-1 sm:gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={getPlaceholderText()}
                disabled={!hasSelectedLanguage || isLoading || isRecording}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-2 sm:px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-green-500 disabled:opacity-50 text-xs sm:text-sm"
              />

              {/* Microphone Button */}
              {speechSupported && hasSelectedLanguage && (
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isLoading}
                  className={`${
                    isRecording ? "bg-red-600 hover:bg-red-700 animate-pulse" : "bg-green-600 hover:bg-green-700"
                  } disabled:opacity-50 w-8 h-8 sm:w-10 sm:h-10`}
                  size="icon"
                >
                  {isRecording ? (
                    <MicOff className="w-3 h-3 sm:w-4 sm:h-4" />
                  ) : (
                    <Mic className="w-3 h-3 sm:w-4 sm:h-4" />
                  )}
                </Button>
              )}

              {/* Send Button */}
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || !hasSelectedLanguage || isLoading || isRecording}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 w-8 h-8 sm:w-10 sm:h-10"
                size="icon"
              >
                <Send className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>

            {/* Recording Indicator */}
            {isRecording && (
              <div className="mt-2 text-center">
                <span className="text-xs sm:text-sm text-red-400 animate-pulse">🎤 Listening...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
