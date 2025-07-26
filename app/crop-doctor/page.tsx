"use client"

import type React from "react"
import { useState } from "react"
import { Upload, Camera, Loader2, Search, Leaf, Bug, Sprout, FlaskConical, RotateCcw, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import CameraCapture from "@/components/camera-capture"
import Chatbot from "@/components/chatbot"

interface DiagnosisResult {
  diseaseName: string
  scientificName: string
  affectedCrops: string[]
  symptoms: string[]
  remedies: {
    cultural: string[]
    biological: string[]
    chemical: string[]
  }
  diseaseDescription?: string
}

interface SearchResult {
  title: string
  url: string
  content: string
  score: number
}

interface SearchResults {
  diseaseInfo: SearchResult[]
  treatmentInfo: SearchResult[]
}

interface StreamingStep {
  id: string
  title: string
  content: string
  isComplete: boolean
  sources?: number[]
}

export default function CropDiseaseDetector() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null)
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null)
  const [streamingSteps, setStreamingSteps] = useState<StreamingStep[]>([])
  const [currentStep, setCurrentStep] = useState<number>(-1)
  const [allSources, setAllSources] = useState<SearchResult[]>([])
  const [activeTab, setActiveTab] = useState<"answer" | "treatment">("answer")
  const [showCamera, setShowCamera] = useState(false)

  const { language, t } = useLanguage()

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      processImageFile(file)
    }
  }

  const processImageFile = (file: File) => {
    setSelectedImage(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
    resetAnalysis()
  }

  const handleCameraCapture = (file: File) => {
    processImageFile(file)
    setShowCamera(false)
  }

  const resetAnalysis = () => {
    setDiagnosis(null)
    setSearchResults(null)
    setStreamingSteps([])
    setCurrentStep(-1)
    setAllSources([])
  }

  const handleNewImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    resetAnalysis()
    // Reset file inputs
    const fileInput = document.getElementById("file-upload") as HTMLInputElement
    if (fileInput) fileInput.value = ""
  }

  const simulateStreaming = async (steps: StreamingStep[]) => {
    setStreamingSteps(steps)

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i)

      // Simulate typing effect
      const step = steps[i]
      const words = step.content.split(" ")
      let currentContent = ""

      for (let j = 0; j < words.length; j++) {
        currentContent += (j > 0 ? " " : "") + words[j]
        setStreamingSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, content: currentContent } : s)))
        await new Promise((resolve) => setTimeout(resolve, 50))
      }

      // Mark step as complete
      setStreamingSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, isComplete: true } : s)))

      await new Promise((resolve) => setTimeout(resolve, 300))
    }
  }

  const handleAnalyze = async () => {
    if (!selectedImage) return

    setIsAnalyzing(true)
    resetAnalysis()

    try {
      // Convert image to base64
      const base64Image = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.readAsDataURL(selectedImage)
      })

      // Get diagnosis
      const diagnosisPromise = fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image, language }),
      }).then((res) => res.json())

      // Get diagnosis first
      const diagnosisRes = await diagnosisPromise

      // Then search with the actual disease name (still needed for potential future use)
      const searchPromise = fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diseaseName: diagnosisRes.diseaseName,
          cropName: diagnosisRes.affectedCrops?.[0] || "crops",
          language,
        }),
      }).then((res) => res.json())

      const searchRes = await searchPromise

      setSearchResults(searchRes)
      const sources = [...(searchRes.diseaseInfo || []), ...(searchRes.treatmentInfo || [])]
      setAllSources(sources)
      setDiagnosis(diagnosisRes)

      // Simulate streaming with final content
      await simulateStreaming([
        {
          id: "diagnosis",
          title: "Analysis Complete",
          content: `The crop in your image appears to be affected by **${diagnosisRes.diseaseName}** (*${diagnosisRes.scientificName}*). This disease commonly affects multiple crop types and presents with characteristic symptoms that match the visual indicators in your image.`,
          isComplete: false,
          sources: sources.slice(0, 3).map((_, idx) => idx + 1),
        },
      ])
    } catch (error) {
      console.error("Error analyzing crop:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white antialiased">
      {showCamera && <CameraCapture onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />}

      {/* Chatbot Component */}
      <Chatbot />

      <div className="max-w-7xl mx-auto">
        {!selectedImage ? (
          /* Upload Interface - Extremely Responsive */
          <div className="min-h-screen flex items-center justify-center px-3 sm:px-4 md:px-6">
            {/* Fixed Back Button at Top Left - Responsive */}
            <div className="fixed top-3 sm:top-4 md:top-6 left-3 sm:left-4 md:left-6 z-10">
              <Link href="/landing">
                <Button
                  variant="outline"
                  className="flex items-center gap-1 sm:gap-2 bg-gray-800/90 backdrop-blur-sm border-gray-600 text-white hover:bg-gray-700 shadow-lg text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
                >
                  <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{t("crop.backHome")}</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </Link>
            </div>

            <div className="max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl w-full text-center">
              {/* Animation and Title Section - Responsive */}
              <div className="mb-6 sm:mb-8">
                {/* Animated Element */}
                <div className="flex justify-center mb-3 sm:mb-4">
                  <div className="relative">
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 object-contain"
                    >
                      <source
                        src="https://ofhubh1u0o5vkedk.public.blob.vercel-storage.com/Animation%20-%201751449783387-eANbGUvzlNpOnoBj8MtprTaruUMMUJ.webm"
                        type="video/webm"
                      />
                      {/* Fallback for browsers that don't support webm */}
                      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full animate-pulse"></div>
                    </video>
                  </div>
                </div>

                {/* Title - Responsive Typography */}
                <div className="mb-4 sm:mb-6">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight">
                    {t("crop.title")}
                  </h1>
                </div>

                {/* Main Heading - Responsive */}
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4 leading-tight px-2 sm:px-0">
                  {t("crop.analyze")}
                </h2>

                {/* Description - Responsive */}
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-xs sm:max-w-sm md:max-w-lg mx-auto px-2 sm:px-0">
                  {t("crop.description")}
                </p>
              </div>

              {/* Upload Area - Highly Responsive */}
              <div className="bg-gray-800 rounded-xl p-4 sm:p-6 md:p-8 border-2 border-dashed border-gray-600 hover:border-gray-500 transition-colors">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="file-upload" />

                <div className="space-y-4 sm:space-y-6">
                  {/* Upload Icon */}
                  <div className="flex justify-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 rounded-full flex items-center justify-center">
                      <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                    </div>
                  </div>

                  {/* Upload Text - Responsive */}
                  <div className="space-y-1">
                    <h3 className="text-white text-base sm:text-lg font-semibold">{t("crop.uploadImage")}</h3>
                    <p className="text-gray-400 text-xs sm:text-sm">{t("crop.fileFormat")}</p>
                  </div>

                  {/* Upload Buttons - Responsive Layout */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                    <Button
                      onClick={() => document.getElementById("file-upload")?.click()}
                      variant="outline"
                      className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gray-700 border-gray-600 text-white hover:bg-gray-600 rounded-lg font-medium transition-colors text-sm sm:text-base w-full sm:w-auto"
                    >
                      <Upload className="w-4 h-4" />
                      {t("crop.chooseFile")}
                    </Button>
                    <Button
                      onClick={() => setShowCamera(true)}
                      variant="outline"
                      className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gray-700 border-gray-600 text-white hover:bg-gray-600 rounded-lg font-medium transition-colors text-sm sm:text-base w-full sm:w-auto"
                    >
                      <Camera className="w-4 h-4" />
                      {t("crop.takePhoto")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Analysis Interface - Extremely Responsive */
          <div className="min-h-screen">
            {/* Header - Responsive */}
            <div className="border-b border-gray-800 px-3 sm:px-4 md:px-6 py-3 sm:py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center overflow-hidden">
                    <video autoPlay loop muted playsInline className="w-6 h-6 sm:w-8 sm:h-8 object-contain">
                      <source
                        src="https://ofhubh1u0o5vkedk.public.blob.vercel-storage.com/Animation%20-%201751449783387-eANbGUvzlNpOnoBj8MtprTaruUMMUJ.webm"
                        type="video/webm"
                      />
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-pink-400 to-rose-500 rounded-lg animate-pulse"></div>
                    </video>
                  </div>
                  <h1 className="text-base sm:text-lg md:text-xl font-bold text-white tracking-tight">
                    {t("crop.title")}
                  </h1>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <Link href="/landing">
                    <Button
                      variant="outline"
                      className="flex items-center gap-1 sm:gap-2 bg-gray-800 border-gray-600 text-white hover:bg-gray-700 font-medium text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
                    >
                      <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">{t("crop.home")}</span>
                    </Button>
                  </Link>
                  <Button
                    onClick={handleNewImage}
                    variant="outline"
                    className="flex items-center gap-1 sm:gap-2 bg-gray-800 border-gray-600 text-white hover:bg-gray-700 font-medium text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
                  >
                    <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{t("crop.newAnalysis")}</span>
                    <span className="sm:hidden">New</span>
                  </Button>
                </div>
              </div>
            </div>

            <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6">
              {/* Tabs - Responsive */}
              <div className="flex items-center gap-3 sm:gap-6 mb-4 sm:mb-6 border-b border-gray-800 overflow-x-auto">
                <button
                  onClick={() => setActiveTab("answer")}
                  className={`pb-2 sm:pb-3 px-1 border-b-2 transition-colors font-medium whitespace-nowrap text-sm sm:text-base ${
                    activeTab === "answer"
                      ? "border-white text-white"
                      : "border-transparent text-gray-400 hover:text-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Bug className="w-3 h-3 sm:w-4 sm:h-4" />
                    {t("tabs.answer")}
                  </div>
                </button>
                {diagnosis && (
                  <button
                    onClick={() => setActiveTab("treatment")}
                    className={`pb-2 sm:pb-3 px-1 border-b-2 transition-colors font-medium whitespace-nowrap text-sm sm:text-base ${
                      activeTab === "treatment"
                        ? "border-white text-white"
                        : "border-transparent text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-1 sm:gap-2">
                      <FlaskConical className="w-3 h-3 sm:w-4 sm:h-4" />
                      {t("tabs.treatment")}
                    </div>
                  </button>
                )}
              </div>

              {activeTab === "answer" && (
                <div className="space-y-4 sm:space-y-6">
                  {/* Image Preview and Analysis Section - Responsive */}
                  {imagePreview && (
                    <div className="space-y-4">
                      {/* Image Preview Card */}
                      <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
                        <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                          <div className="relative">
                            <img
                              src={imagePreview || "/placeholder.svg"}
                              alt="Crop image"
                              className="w-48 h-36 sm:w-64 sm:h-48 md:w-80 md:h-60 object-cover rounded-lg border-2 border-gray-600"
                            />
                          </div>

                          {!isAnalyzing && !diagnosis && (
                            <div className="text-center space-y-3">
                              <p className="text-gray-400 text-xs sm:text-sm">{t("crop.ready")}</p>
                              <Button
                                onClick={handleAnalyze}
                                className="bg-green-600 hover:bg-green-700 px-6 sm:px-8 py-2 sm:py-2.5 rounded-lg font-semibold text-sm sm:text-base"
                                size="lg"
                              >
                                <Search className="w-4 h-4 mr-2" />
                                {t("crop.analyzeCrop")}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Analysis Results - Responsive */}
                  {(isAnalyzing || diagnosis) && (
                    <div className="space-y-4 sm:space-y-6">
                      {isAnalyzing && !diagnosis && (
                        <div className="flex items-center gap-3 bg-gray-800/50 rounded-lg p-3 sm:p-4">
                          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 animate-spin" />
                          <span className="text-gray-300 font-medium text-sm sm:text-base">{t("crop.analyzing")}</span>
                        </div>
                      )}

                      {diagnosis && (
                        <div className="space-y-4 sm:space-y-6">
                          {/* Main Diagnosis - Responsive */}
                          <div className="bg-gray-800/30 rounded-xl p-4 sm:p-6 border border-gray-700/50">
                            <div className="space-y-3 sm:space-y-4">
                              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-red-600 rounded-full flex items-center justify-center">
                                  <Bug className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                </div>
                                <h2 className="text-lg sm:text-xl font-bold text-white">{t("disease.detected")}</h2>
                              </div>

                              <div className="space-y-3">
                                <p className="text-gray-300 leading-relaxed text-base sm:text-lg font-medium">
                                  {t("disease.affected")}{" "}
                                  <span className="text-red-400 font-bold">{diagnosis.diseaseName}</span>.
                                </p>

                                <div className="bg-gray-700/50 rounded-lg p-3 sm:p-4">
                                  <div className="grid grid-cols-1 gap-3 sm:gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-400 font-medium">{t("disease.scientificName")}</span>
                                      <p className="text-white font-semibold italic">{diagnosis.scientificName}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-400 font-medium">{t("disease.affectedCrops")}</span>
                                      <div className="flex flex-wrap gap-1 sm:gap-2 mt-1">
                                        {diagnosis.affectedCrops.map((crop, index) => (
                                          <span
                                            key={index}
                                            className="inline-block bg-green-600/20 text-green-300 px-2 py-1 rounded-md text-xs sm:text-sm font-medium border border-green-600/30"
                                          >
                                            {crop}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Disease Overview - Responsive */}
                          <div className="space-y-3 sm:space-y-4">
                            <h2 className="text-xl sm:text-2xl font-bold text-white">{t("disease.overview")}</h2>

                            <div className="grid gap-3 sm:gap-4">
                              {/* What is this disease */}
                              <div className="bg-gray-800/30 rounded-xl p-4 sm:p-6 border border-gray-700/50">
                                <h3 className="text-base sm:text-lg font-bold text-white mb-2 sm:mb-3 flex items-center gap-2">
                                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-600 rounded-full flex items-center justify-center">
                                    <span className="text-xs text-white font-bold">?</span>
                                  </div>
                                  {t("disease.whatIs")} {diagnosis.diseaseName}?
                                </h3>
                                <div className="space-y-2 sm:space-y-3 text-gray-300">
                                  <p className="leading-relaxed text-sm sm:text-base">
                                    {diagnosis.diseaseDescription ||
                                      `${diagnosis.diseaseName} is a common agricultural disease that affects multiple crop types including ${diagnosis.affectedCrops.join(", ")}. Early detection and proper treatment are essential for effective management.`}
                                  </p>
                                </div>
                              </div>

                              {/* Symptoms */}
                              <div className="bg-gray-800/30 rounded-xl p-4 sm:p-6 border border-gray-700/50">
                                <h3 className="text-base sm:text-lg font-bold text-white mb-2 sm:mb-3 flex items-center gap-2">
                                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-orange-600 rounded-full flex items-center justify-center">
                                    <span className="text-xs text-white font-bold">!</span>
                                  </div>
                                  {t("disease.symptoms")}
                                </h3>
                                <div className="grid gap-2 sm:gap-3">
                                  {diagnosis.symptoms.map((symptom, index) => (
                                    <div
                                      key={index}
                                      className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-700/30 rounded-lg"
                                    >
                                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-xs text-white font-bold">{index + 1}</span>
                                      </div>
                                      <div>
                                        <p className="text-gray-200 font-medium text-sm sm:text-base">{symptom}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "treatment" && diagnosis && (
                <div className="space-y-4 sm:space-y-6">
                  {/* Treatment Methods - Responsive */}
                  <div className="space-y-3 sm:space-y-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-white">{t("disease.treatment")}</h2>

                    <div className="grid gap-3 sm:gap-4">
                      {/* Cultural Control Methods */}
                      <div className="bg-green-900/20 border border-green-800/50 rounded-xl p-4 sm:p-6">
                        <h3 className="font-bold text-green-400 mb-3 sm:mb-4 flex items-center gap-2 text-base sm:text-lg">
                          <Sprout className="w-4 h-4 sm:w-5 sm:h-5" />
                          {t("treatment.cultural")}
                        </h3>
                        <div className="space-y-2 sm:space-y-3">
                          {diagnosis.remedies.cultural.map((remedy, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-green-900/10 rounded-lg"
                            >
                              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                              <p className="text-gray-200 leading-relaxed text-sm sm:text-base">{remedy}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Biological Control Methods */}
                      <div className="bg-blue-900/20 border border-blue-800/50 rounded-xl p-4 sm:p-6">
                        <h3 className="font-bold text-blue-400 mb-3 sm:mb-4 flex items-center gap-2 text-base sm:text-lg">
                          <Leaf className="w-4 h-4 sm:w-5 sm:h-5" />
                          {t("treatment.biological")}
                        </h3>
                        <div className="space-y-2 sm:space-y-3">
                          {diagnosis.remedies.biological.map((remedy, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-blue-900/10 rounded-lg"
                            >
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                              <p className="text-gray-200 leading-relaxed text-sm sm:text-base">{remedy}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Chemical Control Methods */}
                      <div className="bg-orange-900/20 border border-orange-800/50 rounded-xl p-4 sm:p-6">
                        <h3 className="font-bold text-orange-400 mb-3 sm:mb-4 flex items-center gap-2 text-base sm:text-lg">
                          <FlaskConical className="w-4 h-4 sm:w-5 sm:h-5" />
                          {t("treatment.chemical")}
                        </h3>
                        <div className="space-y-2 sm:space-y-3">
                          {diagnosis.remedies.chemical.map((remedy, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-orange-900/10 rounded-lg"
                            >
                              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                              <p className="text-gray-200 leading-relaxed text-sm sm:text-base">{remedy}</p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-orange-900/30 rounded-lg border border-orange-800/30">
                          <p className="text-orange-200 text-xs sm:text-sm font-semibold flex items-center gap-2">
                            <span className="w-4 h-4 sm:w-5 sm:h-5 bg-orange-500 rounded-full flex items-center justify-center text-xs text-white font-bold flex-shrink-0">
                              !
                            </span>
                            {t("treatment.warning")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
