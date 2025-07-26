
"use client"

import type React from "react"
import { useState } from "react"
import { Upload, Camera, Loader2, Search, Leaf, Bug, Sprout, FlaskConical, ExternalLink, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"

interface DiagnosisResult {
  diseaseName: string
  scientificName: string
  affectedCrop: string
  symptoms: string[]
  remedies: {
    cultural: string[]
    biological: string[]
    chemical: string[]
  }
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

export default function HomePage() {
  redirect("/landing")
}

function CropDiseaseDetector() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null)
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null)
  const [streamingSteps, setStreamingSteps] = useState<StreamingStep[]>([])
  const [currentStep, setCurrentStep] = useState<number>(-1)
  const [allSources, setAllSources] = useState<SearchResult[]>([])
  const [activeTab, setActiveTab] = useState<"answer" | "sources">("answer")

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      resetAnalysis()
    }
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
    const cameraInput = document.getElementById("camera-upload") as HTMLInputElement
    if (fileInput) fileInput.value = ""
    if (cameraInput) cameraInput.value = ""
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

  const getFavicon = (url: string) => {
    try {
      const parsedUrl = new URL(url)
      return `https://www.google.com/s2/favicons?sz=64&domain=${parsedUrl.hostname}`
    } catch (error) {
      console.error("Error getting favicon:", error)
      return null
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
        body: JSON.stringify({ image: base64Image }),
      }).then((res) => res.json())

      // Get diagnosis first
      const diagnosisRes = await diagnosisPromise

      // Then search with the actual disease name
      const searchPromise = fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diseaseName: diagnosisRes.diseaseName,
          cropName: diagnosisRes.affectedCrop,
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
          content: `The crop in your image appears to be affected by **${diagnosisRes.diseaseName}** (*${diagnosisRes.scientificName}*). This disease commonly affects ${diagnosisRes.affectedCrop} crops and presents with characteristic symptoms that match the visual indicators in your image.`,
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
      <div className="max-w-4xl mx-auto">
        {!selectedImage ? (
          /* Upload Interface - Fixed Spacing and Typography */
          <div className="min-h-screen flex items-center justify-center px-6">
            <div className="max-w-2xl w-full text-center">
              {/* Animation and Title Section - Reduced spacing */}
              <div className="mb-8">
                {/* Animated Element */}
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <video autoPlay loop muted playsInline className="w-16 h-16 object-contain">
                      <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Animation%20-%201751449783387-uNqyv50dyEc0r4AtKEFJPea03P9mhw.webm" type="video/webm" />
                      {/* Fallback for browsers that don't support webm */}
                      <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full animate-pulse"></div>
                    </video>
                  </div>
                </div>

                {/* Title - Improved Typography */}
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-white tracking-tight">AI Crop Doctor</h1>
                </div>

                {/* Main Heading - Better spacing */}
                <h2 className="text-3xl font-bold text-white mb-4 leading-tight">Analyze your crop for diseases</h2>

                {/* Description - Improved readability */}
                <p className="text-gray-300 text-base leading-relaxed max-w-lg mx-auto">
                  Upload or take a photo of your crop to get instant AI-powered disease diagnosis and treatment
                  recommendations.
                </p>
              </div>

              {/* Upload Area - Better proportions */}
              <div className="bg-gray-800 rounded-xl p-8 border-2 border-dashed border-gray-600 hover:border-gray-500 transition-colors">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="file-upload" />
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="camera-upload"
                />

                <div className="space-y-6">
                  {/* Upload Icon */}
                  <div className="flex justify-center">
                    <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                      <Upload className="w-6 h-6 text-gray-400" />
                    </div>
                  </div>

                  {/* Upload Text - Better typography */}
                  <div className="space-y-1">
                    <h3 className="text-white text-lg font-semibold">Upload crop image</h3>
                    <p className="text-gray-400 text-sm">PNG, JPG up to 10MB</p>
                  </div>

                  {/* Upload Buttons - Improved styling */}
                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={() => document.getElementById("file-upload")?.click()}
                      variant="outline"
                      className="flex items-center gap-2 px-5 py-2.5 bg-gray-700 border-gray-600 text-white hover:bg-gray-600 rounded-lg font-medium transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      Choose File
                    </Button>
                    <Button
                      onClick={() => document.getElementById("camera-upload")?.click()}
                      variant="outline"
                      className="flex items-center gap-2 px-5 py-2.5 bg-gray-700 border-gray-600 text-white hover:bg-gray-600 rounded-lg font-medium transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                      Take Photo
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Analysis Interface */
          <div className="min-h-screen">
            {/* Header - Improved */}
            <div className="border-b border-gray-800 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                    <video autoPlay loop muted playsInline className="w-8 h-8 object-contain">
                      <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Animation%20-%201751449783387-uNqyv50dyEc0r4AtKEFJPea03P9mhw.webm" type="video/webm" />
                      <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-500 rounded-lg animate-pulse"></div>
                    </video>
                  </div>
                  <h1 className="text-xl font-bold text-white tracking-tight">AI Crop Doctor</h1>
                </div>
                <Button
                  onClick={handleNewImage}
                  variant="outline"
                  className="flex items-center gap-2 bg-gray-800 border-gray-600 text-white hover:bg-gray-700 font-medium"
                >
                  <RotateCcw className="w-4 h-4" />
                  New Analysis
                </Button>
              </div>
            </div>

            <div className="px-6 py-6">
              {/* Tabs - Improved styling */}
              <div className="flex items-center gap-6 mb-6 border-b border-gray-800">
                <button
                  onClick={() => setActiveTab("answer")}
                  className={`pb-3 px-1 border-b-2 transition-colors font-medium ${
                    activeTab === "answer"
                      ? "border-white text-white"
                      : "border-transparent text-gray-400 hover:text-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Bug className="w-4 h-4" />
                    Answer
                  </div>
                </button>
                {diagnosis && (
                  <button
                    onClick={() => setActiveTab("sources")}
                    className={`pb-3 px-1 border-b-2 transition-colors font-medium ${
                      activeTab === "sources"
                        ? "border-white text-white"
                        : "border-transparent text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      Sources & Remedies
                    </div>
                  </button>
                )}
              </div>

              {activeTab === "answer" && (
                <div className="space-y-6">
                  {/* Image Preview and Analysis Section */}
                  {imagePreview && (
                    <div className="space-y-4">
                      {/* Image Preview Card */}
                      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="relative">
                            <img
                              src={imagePreview || "/placeholder.svg"}
                              alt="Crop image"
                              className="w-64 h-48 object-cover rounded-lg border-2 border-gray-600"
                            />
                          </div>

                          {!isAnalyzing && !diagnosis && (
                            <div className="text-center space-y-3">
                              <p className="text-gray-400 text-sm">Ready to analyze your crop image</p>
                              <Button
                                onClick={handleAnalyze}
                                className="bg-green-600 hover:bg-green-700 px-8 py-2.5 rounded-lg font-semibold"
                                size="lg"
                              >
                                <Search className="w-4 h-4 mr-2" />
                                Analyze Crop
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Analysis Results */}
                  {(isAnalyzing || diagnosis) && (
                    <div className="space-y-6">
                      {isAnalyzing && !diagnosis && (
                        <div className="flex items-center gap-3 bg-gray-800/50 rounded-lg p-4">
                          <Loader2 className="w-5 h-5 text-green-500 animate-spin" />
                          <span className="text-gray-300 font-medium">Analyzing your crop image...</span>
                        </div>
                      )}

                      {diagnosis && (
                        <div className="space-y-6">
                          {/* Main Diagnosis - Improved Structure */}
                          <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                            <div className="space-y-4">
                              <div className="flex items-center gap-2 mb-4">
                                <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                                  <Bug className="w-4 h-4 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-white">Disease Detected</h2>
                              </div>

                              <div className="space-y-3">
                                <p className="text-gray-300 leading-relaxed text-lg font-medium">
                                  Your crop appears to be affected by{" "}
                                  <span className="text-red-400 font-bold">{diagnosis.diseaseName}</span>.
                                </p>

                                <div className="bg-gray-700/50 rounded-lg p-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-400 font-medium">Scientific Name:</span>
                                      <p className="text-white font-semibold italic">{diagnosis.scientificName}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-400 font-medium">Affected Crop:</span>
                                      <p className="text-white font-semibold">{diagnosis.affectedCrop}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Disease Overview - Better Structure */}
                          <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-white">Disease Overview</h2>

                            <div className="grid gap-4">
                              {/* What is this disease */}
                              <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                  <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                                    <span className="text-xs text-white font-bold">?</span>
                                  </div>
                                  What is {diagnosis.diseaseName}?
                                </h3>
                                <div className="space-y-3 text-gray-300">
                                  <p className="leading-relaxed">
                                    <strong className="text-white">{diagnosis.diseaseName}</strong> is a common
                                    agricultural pest that affects various crops. These small insects typically feed on
                                    plant sap and can cause significant damage if left untreated.
                                  </p>
                                  <p className="leading-relaxed">
                                    They are usually found on the undersides of leaves and can multiply rapidly under
                                    favorable conditions.
                                  </p>
                                </div>
                              </div>

                              {/* Symptoms */}
                              <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                  <div className="w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center">
                                    <span className="text-xs text-white font-bold">!</span>
                                  </div>
                                  Symptoms & Damage
                                </h3>
                                <div className="grid gap-3">
                                  {diagnosis.symptoms.map((symptom, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-700/30 rounded-lg">
                                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-xs text-white font-bold">{index + 1}</span>
                                      </div>
                                      <div>
                                        <p className="text-gray-200 font-medium">{symptom}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Treatment Methods - Enhanced */}
                          <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-white">Treatment Recommendations</h2>

                            <div className="grid gap-4">
                              <div className="bg-green-900/20 border border-green-800/50 rounded-xl p-6">
                                <h3 className="font-bold text-green-400 mb-4 flex items-center gap-2 text-lg">
                                  <Sprout className="w-5 h-5" />
                                  Cultural Control Methods
                                </h3>
                                <div className="space-y-3">
                                  {diagnosis.remedies.cultural.map((remedy, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 bg-green-900/10 rounded-lg">
                                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                                      <div className="flex-1">
                                        <p className="text-gray-200 font-semibold mb-1">{remedy}</p>
                                        <p className="text-gray-400 text-sm">
                                          {index === 0 && "Ensure proper plant spacing and pruning for better airflow"}
                                          {index === 1 && "Use drip irrigation or soaker hoses instead of sprinklers"}
                                          {index === 2 && "Clean up fallen leaves and dispose of them properly"}
                                          {index === 3 && "Follow a 3-4 year rotation cycle with non-host crops"}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="bg-green-900/20 border border-green-800/50 rounded-xl p-6">
                                <h3 className="font-bold text-green-400 mb-4 flex items-center gap-2 text-lg">
                                  <Leaf className="w-5 h-5" />
                                  Biological Control Methods
                                </h3>
                                <div className="space-y-3">
                                  {diagnosis.remedies.biological.map((remedy, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 bg-green-900/10 rounded-lg">
                                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                                      <div className="flex-1">
                                        <p className="text-gray-200 font-semibold mb-2">{remedy}</p>
                                        <div className="text-gray-400 text-sm space-y-1">
                                          {index === 0 && (
                                            <div>
                                              <p className="mb-1">
                                                <span className="text-green-300 font-semibold">
                                                  Recommended products:
                                                </span>{" "}
                                                Serenade Garden, Cease Biological Fungicide
                                              </p>
                                              <p>Apply every 7-14 days as preventive treatment</p>
                                            </div>
                                          )}
                                          {index === 1 && (
                                            <div>
                                              <p>Mix 1 part compost with 10 parts water, steep for 24-48 hours</p>
                                              <p>Strain and spray on leaves during early morning or evening</p>
                                            </div>
                                          )}
                                          {index === 2 && (
                                            <div>
                                              <p className="mb-1">
                                                <span className="text-green-300 font-semibold">Products:</span>{" "}
                                                Trichoderma-based inoculants, EM-1 Microbial Inoculant
                                              </p>
                                              <p>Apply to soil around root zone monthly</p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="bg-orange-900/20 border border-orange-800/50 rounded-xl p-6">
                                <h3 className="font-bold text-orange-400 mb-4 flex items-center gap-2 text-lg">
                                  <FlaskConical className="w-5 h-5" />
                                  Chemical Control Methods
                                </h3>
                                <div className="space-y-3">
                                  {diagnosis.remedies.chemical.map((remedy, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 bg-orange-900/10 rounded-lg">
                                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                                      <div className="flex-1">
                                        <p className="text-gray-200 font-semibold mb-2">{remedy}</p>
                                        <div className="text-gray-400 text-sm space-y-1">
                                          {index === 0 && (
                                            <div>
                                              <p className="mb-1">
                                                <span className="text-orange-300 font-semibold">Products:</span> Bonide
                                                Copper Fungicide, Southern Ag Liquid Copper Fungicide
                                              </p>
                                              <p>Apply every 7-10 days, avoid during hot sunny periods</p>
                                            </div>
                                          )}
                                          {index === 1 && (
                                            <div>
                                              <p className="mb-1">
                                                <span className="text-orange-300 font-semibold">Products:</span> Ortho
                                                Garden Disease Control, Bayer Advanced Disease Control
                                              </p>
                                              <p>Use only for severe infections, follow label instructions carefully</p>
                                            </div>
                                          )}
                                          {index === 2 && (
                                            <div>
                                              <p>Rotate between copper-based and systemic fungicides</p>
                                              <p>Prevents development of fungicide resistance</p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-4 p-4 bg-orange-900/30 rounded-lg border border-orange-800/30">
                                  <p className="text-orange-200 text-sm font-semibold flex items-center gap-2">
                                    <span className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                                      !
                                    </span>
                                    Always read and follow label instructions. Wear protective equipment when applying
                                    chemicals.
                                  </p>
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

              {activeTab === "sources" && diagnosis && allSources.length > 0 && (
                <div className="space-y-4">
                  {/* Sources Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 bg-green-600 rounded-lg flex items-center justify-center">
                        <Search className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white">Research Sources & Additional Information</h3>
                    </div>
                    <div className="space-y-3">
                      {allSources.slice(0, 10).map((source, index) => (
                        <a
                          key={`source-${index}`}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer border border-gray-700/50 group"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="inline-flex items-center justify-center w-7 h-7 text-sm bg-green-600 text-white rounded-full flex-shrink-0 font-bold">
                              {index + 1}
                            </span>
                            {getFavicon(source.url) && (
                              <img
                                src={getFavicon(source.url) || "/placeholder.svg"}
                                alt=""
                                className="w-4 h-4 flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-gray-300 truncate group-hover:text-green-400 transition-colors font-semibold">
                                {source.title}
                              </h4>
                              <p className="text-sm text-gray-500 truncate mt-1">{source.content}</p>
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-green-400 transition-colors flex-shrink-0" />
                        </a>
                      ))}
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
