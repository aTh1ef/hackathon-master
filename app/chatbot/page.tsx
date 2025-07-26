"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { MessageCircle, Send, Loader2, Mic, MicOff, Trash2, ArrowLeft, User } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import CssGridBackground from "@/components/css-grid-background"
import FramerSpotlight from "@/components/framer-spotlight"
import { AvatarProvider } from "@/contexts/avatar-context"
import Avatar3D from "@/components/avatar-3d"
import AvatarInterface from "@/components/avatar-interface"

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

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [chatLanguage, setChatLanguage] = useState<"en" | "hi" | "kn">("en")
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [activeMode, setActiveMode] = useState<"text" | "avatar">("text")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const { language, t } = useLanguage()
  const [avatarLanguage, setAvatarLanguage] = useState<"en" | "hi" | "kn">("en")

  // Language code mapping for speech recognition
  const speechLanguageCodes = {
    en: "en-US",
    hi: "hi-IN",
    kn: "kn-IN",
  }

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
    setAvatarLanguage(lang) // Sync avatar language
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
    // Initialize with welcome messages based on user's selected language
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
    setChatLanguage(language)
    setAvatarLanguage(language) // Sync avatar language
  }, [language, t])

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
    <div className="min-h-screen bg-gradient-to-br from-black via-emerald-950 to-black text-white relative overflow-hidden">
      <CssGridBackground />
      <FramerSpotlight />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/features">
            <Button variant="ghost" className="text-white hover:bg-white/10 p-2">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Features
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">AI Assistant</span>
          </div>

          {/* Clear conversation button */}
          {messages.length > 2 && activeMode === "text" && (
            <Button
              onClick={clearConversation}
              variant="ghost"
              className="text-white hover:bg-white/10 p-2"
              title="Clear conversation"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Mode Tabs */}
        <div className="flex items-center gap-4 mb-6 border-b border-gray-700/50">
          <button
            onClick={() => setActiveMode("text")}
            className={`pb-3 px-1 border-b-2 transition-colors font-medium ${
              activeMode === "text" ? "border-white text-white" : "border-transparent text-gray-400 hover:text-gray-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Text Chat
            </div>
          </button>
          <button
            onClick={() => setActiveMode("avatar")}
            className={`pb-3 px-1 border-b-2 transition-colors font-medium ${
              activeMode === "avatar"
                ? "border-white text-white"
                : "border-transparent text-gray-400 hover:text-gray-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Avatar Mode
            </div>
          </button>
        </div>

        {/* Text Chat Mode */}
        {activeMode === "text" && (
          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm h-[calc(100vh-200px)] flex flex-col">
            <CardHeader className="border-b border-gray-700/50 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">{t("chatbot.title")}</h3>
                  <p className="text-sm text-gray-400">{t("chatbot.subtitle")}</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div key={message.id}>
                    {message.type === "system" ? (
                      <div className="text-center">
                        <p className="text-sm text-gray-400 mb-3">{message.content}</p>
                        {!hasSelectedLanguage && (
                          <div className="flex flex-wrap gap-2 justify-center">
                            <Button
                              onClick={() => handleLanguageSelect("en")}
                              variant="outline"
                              size="sm"
                              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                            >
                              English
                            </Button>
                            <Button
                              onClick={() => handleLanguageSelect("hi")}
                              variant="outline"
                              size="sm"
                              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                            >
                              हिंदी
                            </Button>
                            <Button
                              onClick={() => handleLanguageSelect("kn")}
                              variant="outline"
                              size="sm"
                              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                            >
                              ಕನ್ನಡ
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.type === "user"
                              ? "bg-gradient-to-br from-blue-500 to-cyan-600 text-white"
                              : "bg-gray-700 text-gray-100"
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
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
                    <div className="bg-gray-700 text-gray-100 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-700/50">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={getPlaceholderText()}
                    disabled={!hasSelectedLanguage || isLoading || isRecording}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />

                  {/* Microphone Button */}
                  {speechSupported && hasSelectedLanguage && (
                    <Button
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={isLoading}
                      className={`${
                        isRecording ? "bg-red-600 hover:bg-red-700 animate-pulse" : "bg-blue-600 hover:bg-blue-700"
                      } disabled:opacity-50`}
                      size="icon"
                    >
                      {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </Button>
                  )}

                  {/* Send Button */}
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || !hasSelectedLanguage || isLoading || isRecording}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    size="icon"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>

                {/* Recording Indicator */}
                {isRecording && (
                  <div className="mt-2 text-center">
                    <span className="text-sm text-red-400 animate-pulse">🎤 Listening...</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Avatar Mode */}
        {activeMode === "avatar" && (
          <AvatarProvider language={avatarLanguage}>
            <div className="relative h-[calc(100vh-200px)] bg-white rounded-xl overflow-hidden">
              <Avatar3D />
              <AvatarInterface />
            </div>
          </AvatarProvider>
        )}
      </div>
    </div>
  )
}
