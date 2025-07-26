"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, FileText, Upload, Send, Loader2, File, X, Globe } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import CssGridBackground from "@/components/css-grid-background"
import FramerSpotlight from "@/components/framer-spotlight"

interface Message {
  id: string
  type: "user" | "bot"
  content: string
  timestamp: Date
}

interface Namespace {
  id: string
  name: string
  displayName: string
  description: string
  documentCount?: number
}

const namespaces: Namespace[] = [
  {
    id: "pradhan-mantri-fasal-bima-yojana",
    name: "pradhan-mantri-fasal-bima-yojana",
    displayName: "Pradhan Mantri Fasal Bima Yojana",
    description: "Crop insurance scheme for farmers",
    documentCount: 45,
  },
  {
    id: "pradhan-mantri-kisan-maandhan-yojana",
    name: "pradhan-mantri-kisan-maandhan-yojana",
    displayName: "Pradhan Mantri Kisan Maandhan Yojana",
    description: "Pension scheme for small and marginal farmers",
    documentCount: 32,
  },
  {
    id: "pradhan-mantri-kisan-samman-nidhi",
    name: "pradhan-mantri-kisan-samman-nidhi",
    displayName: "Pradhan Mantri Kisan Samman Nidhi",
    description: "Income support scheme for farmers",
    documentCount: 67,
  },
]

export default function GovernmentSchemesPage() {
  const { t, language, setLanguage } = useLanguage()
  const [selectedNamespace, setSelectedNamespace] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<string>("")
  const [documentProcessed, setDocumentProcessed] = useState(false)
  const [isUploadMode, setIsUploadMode] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleNamespaceSelect = (namespaceId: string) => {
    console.log("🎯 Namespace selected:", namespaceId)
    console.log("  - Display name:", namespaces.find((ns) => ns.id === namespaceId)?.displayName)

    setSelectedNamespace(namespaceId)
    setMessages([])
    setUploadStatus("")
    setIsUploadMode(false)
    setDocumentProcessed(false)
    setUploadedFile(null)

    const namespace = namespaces.find((ns) => ns.id === namespaceId)
    if (namespace) {
      const welcomeMessage: Message = {
        id: `welcome-${Date.now()}`,
        type: "bot",
        content: t("schemes.welcomeScheme").replace("{scheme}", namespace.displayName),
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
      console.log("✅ Welcome message added for namespace:", namespaceId)
    }
  }

  const handleUploadModeSelect = () => {
    console.log("📁 Upload mode selected")
    setIsUploadMode(true)
    setSelectedNamespace(null)
    setMessages([])
    setUploadStatus("")
    setDocumentProcessed(false)
    setUploadedFile(null)

    const welcomeMessage: Message = {
      id: `upload-welcome-${Date.now()}`,
      type: "bot",
      content: t("schemes.uploadTxtWelcome"),
      timestamp: new Date(),
    }
    setMessages([welcomeMessage])
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) {
      console.log("❌ Cannot send message:")
      console.log("  - Input value:", inputValue.trim())
      console.log("  - Is loading:", isLoading)
      return
    }

    // Check if we're in upload mode and document is not processed
    if (isUploadMode && !documentProcessed) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: "bot",
        content: t("schemes.uploadProcessError"),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
      return
    }

    // Check if we're in namespace mode and no namespace is selected
    if (!isUploadMode && !selectedNamespace) {
      console.log("❌ No namespace selected")
      return
    }

    console.log("📤 Sending message:")
    console.log("  - Message:", inputValue)
    console.log("  - Mode:", isUploadMode ? "Upload" : "Namespace")
    console.log("  - Namespace:", selectedNamespace)
    console.log("  - Document processed:", documentProcessed)

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
      let apiEndpoint = "/api/government-schemes/chat"
      const requestBody: any = {
        message: inputValue,
        conversationHistory: messages.slice(-10),
        language: language, // Add language to request
      }

      if (isUploadMode && uploadedFile) {
        // Use uploaded document namespace
        const documentNamespace = uploadedFile.name.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()
        requestBody.namespace = documentNamespace
        apiEndpoint = "/api/government-schemes/document-chat"
      } else {
        // Use selected government scheme namespace
        requestBody.namespace = selectedNamespace
      }

      console.log("🚀 Making API request to:", apiEndpoint)
      console.log("🚀 Request body:", requestBody)

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      console.log("📥 API response received:")
      console.log("  - Status:", response.status)
      console.log("  - OK:", response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ API response error:", errorText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("✅ API response data received")

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        type: "bot",
        content: data.response || t("schemes.processingError"),
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
      console.log("✅ Bot message added to conversation")
    } catch (error) {
      console.error("❌ Error sending message:", error)
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: "bot",
        content: t("schemes.processingError"),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      console.log("✅ Message sending completed")
    }
  }

  const handleFileUpload = async (file: File) => {
    console.log("📁 Starting file upload:")
    console.log("  - File name:", file.name)
    console.log("  - File size:", file.size)
    console.log("  - File type:", file.type)

    setIsUploading(true)
    setUploadedFile(file)
    setUploadStatus(t("schemes.readingText"))

    try {
      const formData = new FormData()
      formData.append("file", file)
      const documentNamespace = file.name.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()
      formData.append("namespace", documentNamespace)

      console.log("🚀 Making upload request...")

      const response = await fetch("/api/government-schemes/upload", {
        method: "POST",
        body: formData,
      })

      console.log("📥 Upload response received:")
      console.log("  - Status:", response.status)
      console.log("  - OK:", response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Upload response error:", errorText)
        throw new Error(`Upload failed: ${response.status}`)
      }

      const data = await response.json()
      console.log("✅ Upload response data:", data)

      if (data.success) {
        setUploadStatus(t("schemes.processedSuccessfully"))
        setDocumentProcessed(true)

        const uploadMessage: Message = {
          id: `upload-${Date.now()}`,
          type: "bot",
          content: `${t("schemes.documentUploaded")} ${t("schemes.analyzedSections").replace("{count}", data.details?.chunksProcessed || "multiple")}`,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, uploadMessage])
        console.log("✅ Upload success message added")
      } else {
        console.log("❌ Upload failed:", data.error)
        throw new Error(data.error || "Upload failed")
      }
    } catch (error) {
      console.error("❌ Error uploading file:", error)
      setUploadStatus("Upload failed. Please try again.")
      const errorMessage: Message = {
        id: `upload-error-${Date.now()}`,
        type: "bot",
        content: t("schemes.uploadError"),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsUploading(false)
      console.log("✅ File upload completed")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const resetToSelection = () => {
    setSelectedNamespace(null)
    setIsUploadMode(false)
    setMessages([])
    setUploadedFile(null)
    setUploadStatus("")
    setDocumentProcessed(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-black text-white relative overflow-hidden">
      <CssGridBackground />
      <FramerSpotlight />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/features">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">{t("schemes.backToFeatures")}</span>
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">{t("schemes.title")}</span>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as "en" | "hi" | "kn")}
              className="bg-gray-800/50 border border-gray-600/50 text-white text-sm rounded-lg px-3 py-1 focus:outline-none focus:border-indigo-500"
            >
              <option value="en">{t("lang.english")}</option>
              <option value="hi">{t("lang.hindi")}</option>
              <option value="kn">{t("lang.kannada")}</option>
            </select>
          </div>
        </div>

        {!selectedNamespace && !isUploadMode ? (
          /* Selection View */
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center">
                    <FileText className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl blur opacity-20"></div>
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent">
                {t("schemes.title")}
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed">{t("schemes.selectScheme")}</p>
            </div>

            {/* Namespace Cards */}
            <div className="space-y-4 mb-8">
              {namespaces.map((namespace) => (
                <Card
                  key={namespace.id}
                  className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 backdrop-blur-sm border border-indigo-500/20 hover:border-indigo-400/40 rounded-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
                  onClick={() => handleNamespaceSelect(namespace.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-black mb-1">{namespace.displayName}</h3>
                          <p className="text-gray-400 text-sm">{namespace.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-black text-sm font-medium">{namespace.documentCount} docs</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Upload Option */}
            <Card
              className="bg-gradient-to-r from-emerald-900/20 to-green-900/20 backdrop-blur-sm border border-emerald-500/20 hover:border-emerald-400/40 rounded-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
              onClick={handleUploadModeSelect}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-black mb-1">{t("schemes.uploadDoc")}</h3>
                    <p className="text-gray-400 text-sm">{t("schemes.uploadDescription")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Chat Interface */
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <Card className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 backdrop-blur-sm border border-indigo-500/20 rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center">
                        {isUploadMode ? (
                          <Upload className="w-5 h-5 text-white" />
                        ) : (
                          <FileText className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-black">
                          {isUploadMode
                            ? t("schemes.documentUploadChat")
                            : namespaces.find((ns) => ns.id === selectedNamespace)?.displayName}
                        </h2>
                        <p className="text-gray-400 text-sm">
                          {isUploadMode
                            ? t("schemes.uploadTxtDocument")
                            : namespaces.find((ns) => ns.id === selectedNamespace)?.description}
                        </p>
                        {!isUploadMode && (
                          <p className="text-xs text-indigo-300 mt-1">
                            {t("schemes.activeNamespace")} {selectedNamespace}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button onClick={resetToSelection} variant="ghost" className="text-gray-400 hover:text-white">
                      <X className="w-4 h-4 mr-2" />
                      {t("schemes.backToSelection")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upload Section (only in upload mode) */}
            {isUploadMode && (
              <div className="mb-6">
                <Card className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload(file)
                        }}
                        className="hidden"
                      />
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading || documentProcessed}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        {isUploading ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Upload className="w-4 h-4 mr-2" />
                        )}
                        {documentProcessed ? t("schemes.documentProcessed") : t("schemes.uploadTxtFile")}
                      </Button>

                      {uploadedFile && (
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <File className="w-4 h-4" />
                          <span>{uploadedFile.name}</span>
                          {documentProcessed && (
                            <span className="text-green-400 ml-2">✓ {t("schemes.documentProcessed")}</span>
                          )}
                        </div>
                      )}

                      {uploadStatus && <div className="text-sm text-gray-300">{uploadStatus}</div>}
                    </div>

                    {/* File format info */}
                    <div className="mt-3 text-xs text-gray-400">
                      <p>📄 {t("schemes.supportedFormat")}</p>
                      <p>📏 {t("schemes.maxFileSize")}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Chat Messages */}
            <Card className="bg-black/20 backdrop-blur-sm border border-gray-700/50 rounded-2xl mb-6">
              <CardContent className="p-0">
                <div className="h-96 overflow-y-auto p-6 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] p-4 rounded-2xl ${
                          message.type === "user"
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                            : "bg-gray-800/80 text-gray-100"
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs opacity-70 mt-2">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-800/80 text-gray-100 p-4 rounded-2xl">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">{t("schemes.analyzing")}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Message Input */}
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  isUploadMode
                    ? documentProcessed
                      ? t("schemes.askAboutDocument")
                      : t("schemes.uploadDocumentFirst")
                    : t("schemes.askAboutScheme")
                }
                disabled={isLoading || (isUploadMode && !documentProcessed)}
                className="flex-1 bg-gray-900/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-indigo-500"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading || (isUploadMode && !documentProcessed)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white px-6"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// "use client"

// import type React from "react"

// import { useState, useRef } from "react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { ArrowLeft, FileText, Upload, Send, Loader2, File, X } from "lucide-react"
// import Link from "next/link"
// import { useLanguage } from "@/contexts/language-context"
// import CssGridBackground from "@/components/css-grid-background"
// import FramerSpotlight from "@/components/framer-spotlight"

// interface Message {
//   id: string
//   type: "user" | "bot"
//   content: string
//   timestamp: Date
// }

// interface Namespace {
//   id: string
//   name: string
//   displayName: string
//   description: string
//   documentCount?: number
// }

// const namespaces: Namespace[] = [
//   {
//     id: "pradhan-mantri-fasal-bima-yojana",
//     name: "pradhan-mantri-fasal-bima-yojana",
//     displayName: "Pradhan Mantri Fasal Bima Yojana",
//     description: "Crop insurance scheme for farmers",
//     documentCount: 45,
//   },
//   {
//     id: "pradhan-mantri-kisan-maandhan-yojana",
//     name: "pradhan-mantri-kisan-maandhan-yojana",
//     displayName: "Pradhan Mantri Kisan Maandhan Yojana",
//     description: "Pension scheme for small and marginal farmers",
//     documentCount: 32,
//   },
//   {
//     id: "pradhan-mantri-kisan-samman-nidhi",
//     name: "pradhan-mantri-kisan-samman-nidhi",
//     displayName: "Pradhan Mantri Kisan Samman Nidhi",
//     description: "Income support scheme for farmers",
//     documentCount: 67,
//   },
// ]

// export default function GovernmentSchemesPage() {
//   const { t } = useLanguage()
//   const [selectedNamespace, setSelectedNamespace] = useState<string | null>(null)
//   const [messages, setMessages] = useState<Message[]>([])
//   const [inputValue, setInputValue] = useState("")
//   const [isLoading, setIsLoading] = useState(false)
//   const [uploadedFile, setUploadedFile] = useState<File | null>(null)
//   const [isUploading, setIsUploading] = useState(false)
//   const [uploadStatus, setUploadStatus] = useState<string>("")
//   const [documentProcessed, setDocumentProcessed] = useState(false)
//   const [isUploadMode, setIsUploadMode] = useState(false)
//   const fileInputRef = useRef<HTMLInputElement>(null)

//   const handleNamespaceSelect = (namespaceId: string) => {
//     console.log("🎯 Namespace selected:", namespaceId)
//     console.log("  - Display name:", namespaces.find((ns) => ns.id === namespaceId)?.displayName)

//     setSelectedNamespace(namespaceId)
//     setMessages([])
//     setUploadStatus("")
//     setIsUploadMode(false)
//     setDocumentProcessed(false)
//     setUploadedFile(null)

//     const namespace = namespaces.find((ns) => ns.id === namespaceId)
//     if (namespace) {
//       const welcomeMessage: Message = {
//         id: `welcome-${Date.now()}`,
//         type: "bot",
//         content: `Welcome! I can help you with information about ${namespace.displayName}. Ask me anything about this scheme.`,
//         timestamp: new Date(),
//       }
//       setMessages([welcomeMessage])
//       console.log("✅ Welcome message added for namespace:", namespaceId)
//     }
//   }

//   const handleUploadModeSelect = () => {
//     console.log("📁 Upload mode selected")
//     setIsUploadMode(true)
//     setSelectedNamespace(null)
//     setMessages([])
//     setUploadStatus("")
//     setDocumentProcessed(false)
//     setUploadedFile(null)

//     const welcomeMessage: Message = {
//       id: `upload-welcome-${Date.now()}`,
//       type: "bot",
//       content:
//         "Welcome! Please upload a TXT document to start chatting with it. I'll analyze the document and answer your questions based on its content.",
//       timestamp: new Date(),
//     }
//     setMessages([welcomeMessage])
//   }

//   const handleSendMessage = async () => {
//     if (!inputValue.trim() || isLoading) {
//       console.log("❌ Cannot send message:")
//       console.log("  - Input value:", inputValue.trim())
//       console.log("  - Is loading:", isLoading)
//       return
//     }

//     // Check if we're in upload mode and document is not processed
//     if (isUploadMode && !documentProcessed) {
//       const errorMessage: Message = {
//         id: `error-${Date.now()}`,
//         type: "bot",
//         content: "Please upload and process a TXT document first before asking questions.",
//         timestamp: new Date(),
//       }
//       setMessages((prev) => [...prev, errorMessage])
//       return
//     }

//     // Check if we're in namespace mode and no namespace is selected
//     if (!isUploadMode && !selectedNamespace) {
//       console.log("❌ No namespace selected")
//       return
//     }

//     console.log("📤 Sending message:")
//     console.log("  - Message:", inputValue)
//     console.log("  - Mode:", isUploadMode ? "Upload" : "Namespace")
//     console.log("  - Namespace:", selectedNamespace)
//     console.log("  - Document processed:", documentProcessed)

//     const userMessage: Message = {
//       id: `user-${Date.now()}`,
//       type: "user",
//       content: inputValue,
//       timestamp: new Date(),
//     }

//     setMessages((prev) => [...prev, userMessage])
//     setInputValue("")
//     setIsLoading(true)

//     try {
//       let apiEndpoint = "/api/government-schemes/chat"
//       const requestBody: any = {
//         message: inputValue,
//         conversationHistory: messages.slice(-10),
//       }

//       if (isUploadMode && uploadedFile) {
//         // Use uploaded document namespace
//         const documentNamespace = uploadedFile.name.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()
//         requestBody.namespace = documentNamespace
//         apiEndpoint = "/api/government-schemes/document-chat"
//       } else {
//         // Use selected government scheme namespace
//         requestBody.namespace = selectedNamespace
//       }

//       console.log("🚀 Making API request to:", apiEndpoint)
//       console.log("🚀 Request body:", requestBody)

//       const response = await fetch(apiEndpoint, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(requestBody),
//       })

//       console.log("📥 API response received:")
//       console.log("  - Status:", response.status)
//       console.log("  - OK:", response.ok)

//       if (!response.ok) {
//         const errorText = await response.text()
//         console.error("❌ API response error:", errorText)
//         throw new Error(`HTTP error! status: ${response.status}`)
//       }

//       const data = await response.json()
//       console.log("✅ API response data received")

//       const botMessage: Message = {
//         id: `bot-${Date.now()}`,
//         type: "bot",
//         content: data.response || "Sorry, I couldn't process your request right now.",
//         timestamp: new Date(),
//       }

//       setMessages((prev) => [...prev, botMessage])
//       console.log("✅ Bot message added to conversation")
//     } catch (error) {
//       console.error("❌ Error sending message:", error)
//       const errorMessage: Message = {
//         id: `error-${Date.now()}`,
//         type: "bot",
//         content: "Sorry, there was an error processing your request. Please try again.",
//         timestamp: new Date(),
//       }
//       setMessages((prev) => [...prev, errorMessage])
//     } finally {
//       setIsLoading(false)
//       console.log("✅ Message sending completed")
//     }
//   }

//   const handleFileUpload = async (file: File) => {
//     console.log("📁 Starting file upload:")
//     console.log("  - File name:", file.name)
//     console.log("  - File size:", file.size)
//     console.log("  - File type:", file.type)

//     setIsUploading(true)
//     setUploadedFile(file)
//     setUploadStatus("Reading text from file...")

//     try {
//       const formData = new FormData()
//       formData.append("file", file)
//       const documentNamespace = file.name.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()
//       formData.append("namespace", documentNamespace)

//       console.log("🚀 Making upload request...")

//       const response = await fetch("/api/government-schemes/upload", {
//         method: "POST",
//         body: formData,
//       })

//       console.log("📥 Upload response received:")
//       console.log("  - Status:", response.status)
//       console.log("  - OK:", response.ok)

//       if (!response.ok) {
//         const errorText = await response.text()
//         console.error("❌ Upload response error:", errorText)
//         throw new Error(`Upload failed: ${response.status}`)
//       }

//       const data = await response.json()
//       console.log("✅ Upload response data:", data)

//       if (data.success) {
//         setUploadStatus("Document processed successfully!")
//         setDocumentProcessed(true)

//         const uploadMessage: Message = {
//           id: `upload-${Date.now()}`,
//           type: "bot",
//           content: `Document "${file.name}" has been processed successfully! I've analyzed ${data.details?.chunksProcessed || "multiple"} sections of your document. You can now ask me questions about its content.`,
//           timestamp: new Date(),
//         }
//         setMessages((prev) => [...prev, uploadMessage])
//         console.log("✅ Upload success message added")
//       } else {
//         console.log("❌ Upload failed:", data.error)
//         throw new Error(data.error || "Upload failed")
//       }
//     } catch (error) {
//       console.error("❌ Error uploading file:", error)
//       setUploadStatus("Upload failed. Please try again.")
//       const errorMessage: Message = {
//         id: `upload-error-${Date.now()}`,
//         type: "bot",
//         content: "Sorry, there was an error processing your document. Please try again with a valid TXT file.",
//         timestamp: new Date(),
//       }
//       setMessages((prev) => [...prev, errorMessage])
//     } finally {
//       setIsUploading(false)
//       console.log("✅ File upload completed")
//     }
//   }

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault()
//       handleSendMessage()
//     }
//   }

//   const resetToSelection = () => {
//     setSelectedNamespace(null)
//     setIsUploadMode(false)
//     setMessages([])
//     setUploadedFile(null)
//     setUploadStatus("")
//     setDocumentProcessed(false)
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-black text-white relative overflow-hidden">
//       <CssGridBackground />
//       <FramerSpotlight />

//       <div className="relative z-10 container mx-auto px-4 py-8">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-8">
//           <Link href="/features">
//             <Button
//               variant="ghost"
//               className="text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
//             >
//               <ArrowLeft className="w-5 h-5 mr-2" />
//               <span className="hidden sm:inline">Back to Features</span>
//             </Button>
//           </Link>

//           <div className="flex items-center gap-3">
//             <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center">
//               <FileText className="w-5 h-5 text-white" />
//             </div>
//             <span className="text-xl font-bold tracking-tight">Government Schemes</span>
//           </div>
//         </div>

//         {!selectedNamespace && !isUploadMode ? (
//           /* Selection View */
//           <div className="max-w-2xl mx-auto">
//             <div className="text-center mb-12">
//               <div className="flex justify-center mb-6">
//                 <div className="relative">
//                   <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center">
//                     <FileText className="w-10 h-10 text-white" />
//                   </div>
//                   <div className="absolute -inset-1 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl blur opacity-20"></div>
//                 </div>
//               </div>

//               <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent">
//                 Government Schemes
//               </h1>
//               <p className="text-xl text-gray-300 leading-relaxed">
//                 Select a scheme to explore documents and get AI-powered assistance
//               </p>
//             </div>

//             {/* Namespace Cards */}
//             <div className="space-y-4 mb-8">
//               {namespaces.map((namespace) => (
//                 <Card
//                   key={namespace.id}
//                   className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 backdrop-blur-sm border border-indigo-500/20 hover:border-indigo-400/40 rounded-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
//                   onClick={() => handleNamespaceSelect(namespace.id)}
//                 >
//                   <CardContent className="p-6">
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-4">
//                         <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
//                           <FileText className="w-6 h-6 text-white" />
//                         </div>
//                         <div>
//                           <h3 className="text-lg font-semibold text-white mb-1">{namespace.displayName}</h3>
//                           <p className="text-gray-400 text-sm">{namespace.description}</p>
//                         </div>
//                       </div>
//                       <div className="text-right">
//                         <div className="text-indigo-300 text-sm font-medium">{namespace.documentCount} docs</div>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>

//             {/* Upload Option */}
//             <Card
//               className="bg-gradient-to-r from-emerald-900/20 to-green-900/20 backdrop-blur-sm border border-emerald-500/20 hover:border-emerald-400/40 rounded-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
//               onClick={handleUploadModeSelect}
//             >
//               <CardContent className="p-6">
//                 <div className="flex items-center justify-center gap-4">
//                   <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
//                     <Upload className="w-6 h-6 text-white" />
//                   </div>
//                   <div className="text-center">
//                     <h3 className="text-lg font-semibold text-white mb-1">Upload Text Document to Chat</h3>
//                     <p className="text-gray-400 text-sm">Upload your own TXT document to analyze and chat with</p>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         ) : (
//           /* Chat Interface */
//           <div className="max-w-4xl mx-auto">
//             {/* Header */}
//             <div className="mb-6">
//               <Card className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 backdrop-blur-sm border border-indigo-500/20 rounded-2xl">
//                 <CardContent className="p-4">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                       <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center">
//                         {isUploadMode ? (
//                           <Upload className="w-5 h-5 text-white" />
//                         ) : (
//                           <FileText className="w-5 h-5 text-white" />
//                         )}
//                       </div>
//                       <div>
//                         <h2 className="text-lg font-semibold text-white">
//                           {isUploadMode
//                             ? "Document Upload & Chat"
//                             : namespaces.find((ns) => ns.id === selectedNamespace)?.displayName}
//                         </h2>
//                         <p className="text-gray-400 text-sm">
//                           {isUploadMode
//                             ? "Upload and chat with your own TXT document"
//                             : namespaces.find((ns) => ns.id === selectedNamespace)?.description}
//                         </p>
//                         {!isUploadMode && (
//                           <p className="text-xs text-indigo-300 mt-1">Active namespace: {selectedNamespace}</p>
//                         )}
//                       </div>
//                     </div>
//                     <Button onClick={resetToSelection} variant="ghost" className="text-gray-400 hover:text-white">
//                       <X className="w-4 h-4 mr-2" />
//                       Back to Selection
//                     </Button>
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>

//             {/* Upload Section (only in upload mode) */}
//             {isUploadMode && (
//               <div className="mb-6">
//                 <Card className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl">
//                   <CardContent className="p-4">
//                     <div className="flex items-center gap-4">
//                       <input
//                         ref={fileInputRef}
//                         type="file"
//                         accept=".txt"
//                         onChange={(e) => {
//                           const file = e.target.files?.[0]
//                           if (file) handleFileUpload(file)
//                         }}
//                         className="hidden"
//                       />
//                       <Button
//                         onClick={() => fileInputRef.current?.click()}
//                         disabled={isUploading || documentProcessed}
//                         className="bg-emerald-600 hover:bg-emerald-700 text-white"
//                       >
//                         {isUploading ? (
//                           <Loader2 className="w-4 h-4 animate-spin mr-2" />
//                         ) : (
//                           <Upload className="w-4 h-4 mr-2" />
//                         )}
//                         {documentProcessed ? "Document Processed" : "Upload TXT Document"}
//                       </Button>

//                       {uploadedFile && (
//                         <div className="flex items-center gap-2 text-sm text-gray-300">
//                           <File className="w-4 h-4" />
//                           <span>{uploadedFile.name}</span>
//                           {documentProcessed && <span className="text-green-400 ml-2">✓ Processed</span>}
//                         </div>
//                       )}

//                       {uploadStatus && <div className="text-sm text-gray-300">{uploadStatus}</div>}
//                     </div>

//                     {/* File format info */}
//                     <div className="mt-3 text-xs text-gray-400">
//                       <p>📄 Supported format: TXT files only (UTF-8 encoded)</p>
//                       <p>📏 Maximum file size: 5MB</p>
//                     </div>
//                   </CardContent>
//                 </Card>
//               </div>
//             )}

//             {/* Chat Messages */}
//             <Card className="bg-black/20 backdrop-blur-sm border border-gray-700/50 rounded-2xl mb-6">
//               <CardContent className="p-0">
//                 <div className="h-96 overflow-y-auto p-6 space-y-4">
//                   {messages.map((message) => (
//                     <div
//                       key={message.id}
//                       className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
//                     >
//                       <div
//                         className={`max-w-[80%] p-4 rounded-2xl ${
//                           message.type === "user"
//                             ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
//                             : "bg-gray-800/80 text-gray-100"
//                         }`}
//                       >
//                         <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
//                         <p className="text-xs opacity-70 mt-2">
//                           {message.timestamp.toLocaleTimeString([], {
//                             hour: "2-digit",
//                             minute: "2-digit",
//                           })}
//                         </p>
//                       </div>
//                     </div>
//                   ))}
//                   {isLoading && (
//                     <div className="flex justify-start">
//                       <div className="bg-gray-800/80 text-gray-100 p-4 rounded-2xl">
//                         <div className="flex items-center gap-2">
//                           <Loader2 className="w-4 h-4 animate-spin" />
//                           <span className="text-sm">Analyzing...</span>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Message Input */}
//             <div className="flex gap-2">
//               <Input
//                 value={inputValue}
//                 onChange={(e) => setInputValue(e.target.value)}
//                 onKeyPress={handleKeyPress}
//                 placeholder={
//                   isUploadMode
//                     ? documentProcessed
//                       ? "Ask about your document..."
//                       : "Upload a TXT document first..."
//                     : "Ask about the scheme..."
//                 }
//                 disabled={isLoading || (isUploadMode && !documentProcessed)}
//                 className="flex-1 bg-gray-900/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-indigo-500"
//               />
//               <Button
//                 onClick={handleSendMessage}
//                 disabled={!inputValue.trim() || isLoading || (isUploadMode && !documentProcessed)}
//                 className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white px-6"
//               >
//                 {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
//               </Button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }
