"use client"
import type React from "react"
import { useState } from "react"
import {
  Upload,
  Camera,
  Loader2,
  Search,
  Leaf,
  Bug,
  Sprout,
  FlaskConical,
  RotateCcw,
  ArrowLeft,
  AlertTriangle,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import CameraCapture from "@/components/camera-capture"
import Chatbot from "@/components/chatbot"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

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

export default function CropDiseaseDetector() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null)
  const [activeTab, setActiveTab] = useState("answer")
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
    setActiveTab("answer")
  }

  const handleNewImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    resetAnalysis()
    const fileInput = document.getElementById("file-upload") as HTMLInputElement
    if (fileInput) fileInput.value = ""
  }

  const handleAnalyze = async () => {
    if (!selectedImage) return
    setIsAnalyzing(true)
    resetAnalysis()

    try {
      const base64Image = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.readAsDataURL(selectedImage)
      })

      const response = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image, language }),
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`)
      }

      const diagnosisRes = await response.json()
      setDiagnosis(diagnosisRes)
    } catch (error) {
      console.error("Error analyzing crop:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a2e1a] text-white antialiased relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-400/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-300/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/3 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-emerald-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {showCamera && <CameraCapture onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />}
      <Chatbot />

      <div className="container mx-auto py-4 sm:py-6 lg:py-8 relative z-10">
        {!selectedImage ? (
          <div className="min-h-[90vh] flex items-center justify-center px-4">
            <div className="fixed top-6 left-6 z-20">
              <Link href="/">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 bg-black/40 backdrop-blur-xl border-emerald-400/20 hover:bg-emerald-400/10 hover:border-emerald-400/40 text-white shadow-2xl transition-all duration-300 hover:shadow-emerald-400/10"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">{t("crop.backHome")}</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </Link>
            </div>

            <div className="max-w-2xl w-full text-center">
              <div className="mb-12">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/25 animate-pulse">
                      <Leaf className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </div>

                <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-4 font-headline">
                  {t("crop.title")}
                </h1>
                <p className="text-gray-400 text-xl leading-relaxed max-w-lg mx-auto">{t("crop.description")}</p>
              </div>

              <Card className="bg-black/20 backdrop-blur-xl border-emerald-400/10 shadow-2xl shadow-black/20 hover:shadow-black/30 transition-all duration-500">
                <CardContent className="p-8 sm:p-12">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="file-upload"
                  />

                  <div className="space-y-8">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-2xl flex items-center justify-center border border-emerald-500/30">
                        <Upload className="w-8 h-8 text-emerald-400" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-white text-2xl font-bold">{t("crop.uploadImage")}</h3>
                      <p className="text-gray-400 text-sm">{t("crop.fileFormat")}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button
                        onClick={() => document.getElementById("file-upload")?.click()}
                        className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 transform hover:scale-105"
                        size="lg"
                      >
                        <Upload className="w-5 h-5 mr-2" />
                        {t("crop.chooseFile")}
                      </Button>
                      <Button
                        onClick={() => setShowCamera(true)}
                        className="w-full sm:w-auto bg-black/40 backdrop-blur-sm border border-emerald-500/30 hover:bg-emerald-500/10 hover:border-emerald-400/50 text-emerald-100 shadow-lg transition-all duration-300 transform hover:scale-105"
                        size="lg"
                      >
                        <Camera className="w-5 h-5 mr-2" />
                        {t("crop.takePhoto")}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div>
            <header className="border-b border-emerald-400/10 bg-black/20 backdrop-blur-xl px-6 py-4 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                    <Leaf className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent tracking-tight font-headline">
                    {t("crop.title")}
                  </h1>
                </div>

                <div className="flex items-center gap-3">
                  <Link href="/">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-black/20 backdrop-blur-sm border-emerald-500/30 hover:bg-emerald-500/10 hover:border-emerald-400/50 text-emerald-100 transition-all duration-300"
                    >
                      <ArrowLeft className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">{t("crop.home")}</span>
                    </Button>
                  </Link>
                  <Button
                    onClick={handleNewImage}
                    variant="outline"
                    size="sm"
                    className="bg-black/20 backdrop-blur-sm border-emerald-500/30 hover:bg-emerald-500/10 hover:border-emerald-400/50 text-emerald-100 transition-all duration-300"
                  >
                    <RotateCcw className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">{t("crop.newAnalysis")}</span>
                    <span className="sm:hidden">New</span>
                  </Button>
                </div>
              </div>
            </header>

            <main className="px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <Card className="bg-black/20 backdrop-blur-xl border-emerald-400/10 shadow-2xl shadow-black/20 overflow-hidden">
                    <CardContent className="p-6">
                      <div className="relative group">
                        <img
                          src={imagePreview || "https://placehold.co/600x400.png"}
                          alt="Crop image"
                          className="w-full h-auto object-cover rounded-xl border border-emerald-500/20 shadow-lg transition-all duration-300 group-hover:shadow-emerald-500/20"
                          data-ai-hint="plant leaf"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    </CardContent>
                  </Card>

                  {!isAnalyzing && !diagnosis && (
                    <div className="text-center space-y-6">
                      <p className="text-emerald-200/80 text-lg">{t("crop.ready")}</p>
                      <Button
                        onClick={handleAnalyze}
                        size="lg"
                        className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-300 transform hover:scale-105"
                      >
                        <Search className="w-5 h-5 mr-2" />
                        {t("crop.analyzeCrop")}
                      </Button>
                    </div>
                  )}

                  {isAnalyzing && (
                    <div className="flex items-center justify-center gap-4 bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-emerald-400/10 shadow-lg">
                      <div className="relative">
                        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                        <div className="absolute inset-0 w-6 h-6 border-2 border-emerald-400/20 rounded-full animate-ping"></div>
                      </div>
                      <span className="text-white font-medium text-lg">{t("crop.analyzing")}</span>
                    </div>
                  )}
                </div>

                {diagnosis && (
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-black/30 backdrop-blur-xl border border-emerald-400/10 p-1">
                      <TabsTrigger
                        value="answer"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white text-gray-400 transition-all duration-300"
                      >
                        <Bug className="w-4 h-4 mr-2" />
                        {t("tabs.answer")}
                      </TabsTrigger>
                      <TabsTrigger
                        value="treatment"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white text-emerald-200 transition-all duration-300"
                      >
                        <FlaskConical className="w-4 h-4 mr-2" />
                        {t("tabs.treatment")}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="answer" className="mt-6 space-y-6">
                      <Card className="bg-black/20 backdrop-blur-xl border-emerald-400/10 shadow-2xl shadow-black/20 overflow-hidden">
                        <CardContent className="p-8 space-y-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/25">
                              <Bug className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-white font-headline">{t("disease.detected")}</h2>
                          </div>

                          <p className="text-xl text-gray-200">
                            {t("disease.affected")}{" "}
                            <span className="font-bold text-red-400">{diagnosis.diseaseName}</span>.
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                            <div className="space-y-2">
                              <p className="text-emerald-400 font-semibold">{t("disease.scientificName")}</p>
                              <p className="text-white font-semibold italic text-lg">{diagnosis.scientificName}</p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-emerald-400 font-semibold">{t("disease.affectedCrops")}</p>
                              <div className="flex flex-wrap gap-2">
                                {diagnosis.affectedCrops.map((crop, index) => (
                                  <Badge
                                    key={index}
                                    className="bg-emerald-500/20 text-emerald-200 border-emerald-500/30 hover:bg-emerald-500/30 transition-colors duration-200"
                                  >
                                    {crop}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-black/20 backdrop-blur-xl border-emerald-400/10 shadow-2xl shadow-black/20 overflow-hidden">
                        <CardContent className="p-8 space-y-4">
                          <h3 className="text-2xl font-bold text-white mb-4 font-headline">
                            {t("disease.whatIs")} {diagnosis.diseaseName}?
                          </h3>
                          <p className="text-gray-300 leading-relaxed text-lg">
                            {diagnosis.diseaseDescription ||
                              `${diagnosis.diseaseName} is a common agricultural disease that affects multiple crop types including ${diagnosis.affectedCrops.join(", ")}. Early detection and proper treatment are essential for effective management.`}
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="bg-black/20 backdrop-blur-xl border-emerald-400/10 shadow-2xl shadow-black/20 overflow-hidden">
                        <CardContent className="p-8 space-y-4">
                          <h3 className="text-2xl font-bold text-white mb-6 font-headline">{t("disease.symptoms")}</h3>
                          <ul className="space-y-4">
                            {diagnosis.symptoms.map((symptom, index) => (
                              <li key={index} className="flex items-start gap-4">
                                <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full mt-2 flex-shrink-0 shadow-sm shadow-emerald-500/25" />
                                <p className="text-white text-lg">{symptom}</p>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="treatment" className="mt-6 space-y-6">
                      <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-600/5 backdrop-blur-xl border-emerald-400/20 shadow-2xl shadow-black/10">
                        <CardContent className="p-8">
                          <h3 className="font-bold text-emerald-300 mb-6 flex items-center gap-3 text-2xl font-headline">
                            <Sprout className="w-6 h-6" />
                            {t("treatment.cultural")}
                          </h3>
                          <ul className="space-y-3">
                            {diagnosis.remedies.cultural.map((remedy, index) => (
                              <li key={index} className="flex items-start gap-4">
                                <div className="w-2 h-2 bg-emerald-400/70 rounded-full mt-[10px] flex-shrink-0" />
                                <p className="text-emerald-100/90 text-base leading-relaxed">{remedy}</p>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-xl border-blue-400/30 shadow-2xl shadow-blue-500/10">
                        <CardContent className="p-8">
                          <h3 className="font-bold text-blue-300 mb-6 flex items-center gap-3 text-2xl font-headline">
                            <Leaf className="w-6 h-6" />
                            {t("treatment.biological")}
                          </h3>
                          <ul className="space-y-3">
                            {diagnosis.remedies.biological.map((remedy, index) => (
                              <li key={index} className="flex items-start gap-4">
                                <div className="w-2 h-2 bg-blue-400/70 rounded-full mt-[10px] flex-shrink-0" />
                                <p className="text-blue-100/90 text-base leading-relaxed">{remedy}</p>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 backdrop-blur-xl border-orange-400/30 shadow-2xl shadow-orange-500/10">
                        <CardContent className="p-8">
                          <h3 className="font-bold text-orange-300 mb-6 flex items-center gap-3 text-2xl font-headline">
                            <FlaskConical className="w-6 h-6" />
                            {t("treatment.chemical")}
                          </h3>
                          <ul className="space-y-3">
                            {diagnosis.remedies.chemical.map((remedy, index) => (
                              <li key={index} className="flex items-start gap-4">
                                <div className="w-2 h-2 bg-orange-400/70 rounded-full mt-[10px] flex-shrink-0" />
                                <p className="text-orange-100/90 text-base leading-relaxed">{remedy}</p>
                              </li>
                            ))}
                          </ul>
                          <div className="mt-6 p-6 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl border border-orange-400/30 backdrop-blur-sm">
                            <p className="text-orange-200 font-semibold flex items-center gap-3 text-lg">
                              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                              {t("treatment.warning")}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                )}
              </div>
            </main>
          </div>
        )}
      </div>
    </div>
  )
}


// "use client"

// import type React from "react"
// import { useState } from "react"
// import { Upload, Camera, Loader2, Search, Leaf, Bug, Sprout, FlaskConical, RotateCcw, ArrowLeft, AlertTriangle } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import Link from "next/link"
// import { useLanguage } from "@/contexts/language-context"
// import CameraCapture from "@/components/camera-capture"
// import Chatbot from "@/components/chatbot"
// import { Card, CardContent } from "@/components/ui/card"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Badge } from "@/components/ui/badge"

// interface DiagnosisResult {
//   diseaseName: string
//   scientificName: string
//   affectedCrops: string[]
//   symptoms: string[]
//   remedies: {
//     cultural: string[]
//     biological: string[]
//     chemical: string[]
//   }
//   diseaseDescription?: string
// }

// export default function CropDiseaseDetector() {
//   const [selectedImage, setSelectedImage] = useState<File | null>(null)
//   const [imagePreview, setImagePreview] = useState<string | null>(null)
//   const [isAnalyzing, setIsAnalyzing] = useState(false)
//   const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null)
//   const [activeTab, setActiveTab] = useState("answer")
//   const [showCamera, setShowCamera] = useState(false)

//   const { language, t } = useLanguage()

//   const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0]
//     if (file) {
//       processImageFile(file)
//     }
//   }

//   const processImageFile = (file: File) => {
//     setSelectedImage(file)
//     const reader = new FileReader()
//     reader.onload = (e) => {
//       setImagePreview(e.target?.result as string)
//     }
//     reader.readAsDataURL(file)
//     resetAnalysis()
//   }

//   const handleCameraCapture = (file: File) => {
//     processImageFile(file)
//     setShowCamera(false)
//   }

//   const resetAnalysis = () => {
//     setDiagnosis(null)
//     setActiveTab("answer")
//   }

//   const handleNewImage = () => {
//     setSelectedImage(null)
//     setImagePreview(null)
//     resetAnalysis()
//     const fileInput = document.getElementById("file-upload") as HTMLInputElement
//     if (fileInput) fileInput.value = ""
//   }

//   const handleAnalyze = async () => {
//     if (!selectedImage) return

//     setIsAnalyzing(true)
//     resetAnalysis()

//     try {
//       const base64Image = await new Promise<string>((resolve) => {
//         const reader = new FileReader()
//         reader.onload = (e) => resolve(e.target?.result as string)
//         reader.readAsDataURL(selectedImage)
//       })

//       const response = await fetch("/api/diagnose", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ image: base64Image, language }),
//       })

//       if (!response.ok) {
//         throw new Error(`API Error: ${response.statusText}`)
//       }
      
//       const diagnosisRes = await response.json()
//       setDiagnosis(diagnosisRes)

//     } catch (error) {
//       console.error("Error analyzing crop:", error)
//     } finally {
//       setIsAnalyzing(false)
//     }
//   }

//   return (
//     <div className="min-h-screen bg-background text-foreground antialiased">
//       {showCamera && <CameraCapture onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />}
//       <Chatbot />

//       <div className="container mx-auto py-4 sm:py-6 lg:py-8">
//         {!selectedImage ? (
//           <div className="min-h-[90vh] flex items-center justify-center px-4">
//             <div className="fixed top-4 left-4 z-10">
//               <Link href="/">
//                 <Button variant="outline" className="flex items-center gap-2 backdrop-blur-sm shadow-lg">
//                   <ArrowLeft className="w-4 h-4" />
//                   <span className="hidden sm:inline">{t("crop.backHome")}</span>
//                   <span className="sm:hidden">Back</span>
//                 </Button>
//               </Link>
//             </div>

//             <div className="max-w-2xl w-full text-center">
//               <div className="mb-8">
//                 <div className="flex justify-center mb-4">
//                   <div className="relative w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
//                     <Leaf className="w-8 h-8 text-primary"/>
//                   </div>
//                 </div>

//                 <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-2 font-headline">
//                   {t("crop.title")}
//                 </h1>
//                 <p className="text-muted-foreground text-lg leading-relaxed max-w-lg mx-auto">
//                   {t("crop.description")}
//                 </p>
//               </div>

//               <Card className="p-6 sm:p-8">
//                 <CardContent className="p-0">
//                   <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="file-upload" />
//                   <div className="space-y-6">
//                     <div className="flex justify-center">
//                       <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
//                         <Upload className="w-6 h-6 text-primary" />
//                       </div>
//                     </div>
//                     <div className="space-y-1">
//                       <h3 className="text-foreground text-lg font-semibold">{t("crop.uploadImage")}</h3>
//                       <p className="text-muted-foreground text-sm">{t("crop.fileFormat")}</p>
//                     </div>
//                     <div className="flex flex-col sm:flex-row gap-3 justify-center">
//                       <Button
//                         onClick={() => document.getElementById("file-upload")?.click()}
//                         className="w-full sm:w-auto"
//                         size="lg"
//                       >
//                         <Upload className="w-4 h-4 mr-2" />
//                         {t("crop.chooseFile")}
//                       </Button>
//                       <Button
//                         onClick={() => setShowCamera(true)}
//                         variant="secondary"
//                         className="w-full sm:w-auto"
//                         size="lg"
//                       >
//                         <Camera className="w-4 h-4 mr-2" />
//                         {t("crop.takePhoto")}
//                       </Button>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>
//           </div>
//         ) : (
//           <div>
//             <header className="border-b px-4 py-3">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                    <div className="relative w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
//                     <Leaf className="w-5 h-5 text-primary"/>
//                   </div>
//                   <h1 className="text-xl font-bold text-foreground tracking-tight font-headline">
//                     {t("crop.title")}
//                   </h1>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Link href="/">
//                     <Button variant="outline" size="sm">
//                       <ArrowLeft className="w-4 h-4 sm:mr-2" />
//                       <span className="hidden sm:inline">{t("crop.home")}</span>
//                     </Button>
//                   </Link>
//                   <Button onClick={handleNewImage} variant="outline" size="sm">
//                     <RotateCcw className="w-4 h-4 sm:mr-2" />
//                     <span className="hidden sm:inline">{t("crop.newAnalysis")}</span>
//                     <span className="sm:hidden">New</span>
//                   </Button>
//                 </div>
//               </div>
//             </header>

//             <main className="p-4">
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                 <div className="space-y-6">
//                   <Card>
//                     <CardContent className="p-4">
//                       <img
//                         src={imagePreview || "https://placehold.co/600x400.png"}
//                         alt="Crop image"
//                         className="w-full h-auto object-cover rounded-lg border"
//                         data-ai-hint="plant leaf"
//                       />
//                     </CardContent>
//                   </Card>
//                   {!isAnalyzing && !diagnosis && (
//                     <div className="text-center space-y-4">
//                        <p className="text-muted-foreground">{t("crop.ready")}</p>
//                       <Button onClick={handleAnalyze} size="lg" className="w-full sm:w-auto">
//                         <Search className="w-5 h-5 mr-2" />
//                         {t("crop.analyzeCrop")}
//                       </Button>
//                     </div>
//                   )}
//                   {isAnalyzing && (
//                      <div className="flex items-center justify-center gap-3 bg-card rounded-lg p-4 border">
//                         <Loader2 className="w-5 h-5 text-primary animate-spin" />
//                         <span className="text-muted-foreground font-medium">{t("crop.analyzing")}</span>
//                       </div>
//                   )}
//                 </div>

//                 {diagnosis && (
//                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//                      <TabsList className="grid w-full grid-cols-2">
//                        <TabsTrigger value="answer"><Bug className="w-4 h-4 mr-2" />{t('tabs.answer')}</TabsTrigger>
//                        <TabsTrigger value="treatment"><FlaskConical className="w-4 h-4 mr-2" />{t('tabs.treatment')}</TabsTrigger>
//                      </TabsList>
//                      <TabsContent value="answer" className="mt-6 space-y-6">
//                         <Card>
//                             <CardContent className="p-6 space-y-4">
//                                 <div className="flex items-center gap-3">
//                                     <div className="w-8 h-8 bg-destructive/10 rounded-full flex items-center justify-center">
//                                         <Bug className="w-5 h-5 text-destructive" />
//                                     </div>
//                                     <h2 className="text-2xl font-bold text-foreground font-headline">{t("disease.detected")}</h2>
//                                 </div>
//                                  <p className="text-lg text-muted-foreground">
//                                     {t("disease.affected")} <span className="font-bold text-destructive">{diagnosis.diseaseName}</span>.
//                                 </p>
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//                                     <div>
//                                         <p className="text-muted-foreground font-medium">{t("disease.scientificName")}</p>
//                                         <p className="text-foreground font-semibold italic">{diagnosis.scientificName}</p>
//                                     </div>
//                                     <div>
//                                         <p className="text-muted-foreground font-medium">{t("disease.affectedCrops")}</p>
//                                         <div className="flex flex-wrap gap-2 mt-1">
//                                             {diagnosis.affectedCrops.map((crop, index) => (
//                                                 <Badge key={index} variant="secondary">{crop}</Badge>
//                                             ))}
//                                         </div>
//                                     </div>
//                                 </div>
//                             </CardContent>
//                         </Card>
//                         <Card>
//                             <CardContent className="p-6 space-y-4">
//                                <h3 className="text-xl font-bold text-foreground mb-2 font-headline">{t("disease.whatIs")} {diagnosis.diseaseName}?</h3>
//                                 <p className="text-muted-foreground leading-relaxed">
//                                     {diagnosis.diseaseDescription ||
//                                     `${diagnosis.diseaseName} is a common agricultural disease that affects multiple crop types including ${diagnosis.affectedCrops.join(", ")}. Early detection and proper treatment are essential for effective management.`}
//                                 </p>
//                             </CardContent>
//                         </Card>
//                          <Card>
//                             <CardContent className="p-6 space-y-4">
//                                 <h3 className="text-xl font-bold text-foreground mb-2 font-headline">{t("disease.symptoms")}</h3>
//                                 <ul className="space-y-3">
//                                   {diagnosis.symptoms.map((symptom, index) => (
//                                     <li key={index} className="flex items-start gap-3">
//                                       <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
//                                       <p className="text-foreground">{symptom}</p>
//                                     </li>
//                                   ))}
//                                 </ul>
//                             </CardContent>
//                         </Card>
//                      </TabsContent>
//                      <TabsContent value="treatment" className="mt-6 space-y-6">
//                         <Card className="border-primary/50 bg-primary/5">
//                              <CardContent className="p-6">
//                                 <h3 className="font-bold text-primary mb-3 flex items-center gap-2 text-lg font-headline">
//                                     <Sprout className="w-5 h-5" />
//                                     {t("treatment.cultural")}
//                                 </h3>
//                                 <ul className="space-y-2">
//                                     {diagnosis.remedies.cultural.map((remedy, index) => (
//                                         <li key={index} className="flex items-start gap-3 text-sm">
//                                             <div className="w-1.5 h-1.5 bg-primary/50 rounded-full mt-[7px] flex-shrink-0" />
//                                             <p className="text-foreground/80">{remedy}</p>
//                                         </li>
//                                     ))}
//                                 </ul>
//                             </CardContent>
//                         </Card>

//                         <Card className="border-blue-500/50 bg-blue-500/5">
//                              <CardContent className="p-6">
//                                 <h3 className="font-bold text-blue-500 mb-3 flex items-center gap-2 text-lg font-headline">
//                                     <Leaf className="w-5 h-5" />
//                                     {t("treatment.biological")}
//                                 </h3>
//                                 <ul className="space-y-2">
//                                     {diagnosis.remedies.biological.map((remedy, index) => (
//                                         <li key={index} className="flex items-start gap-3 text-sm">
//                                             <div className="w-1.5 h-1.5 bg-blue-500/50 rounded-full mt-[7px] flex-shrink-0" />
//                                             <p className="text-foreground/80">{remedy}</p>
//                                         </li>
//                                     ))}
//                                 </ul>
//                             </CardContent>
//                         </Card>
                        
//                          <Card className="border-accent/50 bg-accent/5">
//                              <CardContent className="p-6">
//                                 <h3 className="font-bold text-accent mb-3 flex items-center gap-2 text-lg font-headline">
//                                     <FlaskConical className="w-5 h-5" />
//                                     {t("treatment.chemical")}
//                                 </h3>
//                                 <ul className="space-y-2">
//                                     {diagnosis.remedies.chemical.map((remedy, index) => (
//                                         <li key={index} className="flex items-start gap-3 text-sm">
//                                             <div className="w-1.5 h-1.5 bg-accent/50 rounded-full mt-[7px] flex-shrink-0" />
//                                             <p className="text-foreground/80">{remedy}</p>
//                                         </li>
//                                     ))}
//                                 </ul>
//                                 <div className="mt-4 p-4 bg-accent/10 rounded-lg border border-accent/20">
//                                 <p className="text-accent text-sm font-semibold flex items-center gap-2">
//                                     <AlertTriangle className="w-5 h-5 flex-shrink-0" />
//                                     {t("treatment.warning")}
//                                 </p>
//                                 </div>
//                             </CardContent>
//                         </Card>
//                      </TabsContent>
//                    </Tabs>
//                 )}
//               </div>
//             </main>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }


// "use client"

// import type React from "react"
// import { useState } from "react"
// import { Upload, Camera, Loader2, Search, Leaf, Bug, Sprout, FlaskConical, RotateCcw, ArrowLeft } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import Link from "next/link"
// import { useLanguage } from "@/contexts/language-context"
// import CameraCapture from "@/components/camera-capture"
// import Chatbot from "@/components/chatbot"

// interface DiagnosisResult {
//   diseaseName: string
//   scientificName: string
//   affectedCrops: string[]
//   symptoms: string[]
//   remedies: {
//     cultural: string[]
//     biological: string[]
//     chemical: string[]
//   }
//   diseaseDescription?: string
// }

// interface SearchResult {
//   title: string
//   url: string
//   content: string
//   score: number
// }

// interface SearchResults {
//   diseaseInfo: SearchResult[]
//   treatmentInfo: SearchResult[]
// }

// interface StreamingStep {
//   id: string
//   title: string
//   content: string
//   isComplete: boolean
//   sources?: number[]
// }

// export default function CropDiseaseDetector() {
//   const [selectedImage, setSelectedImage] = useState<File | null>(null)
//   const [imagePreview, setImagePreview] = useState<string | null>(null)
//   const [isAnalyzing, setIsAnalyzing] = useState(false)
//   const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null)
//   const [searchResults, setSearchResults] = useState<SearchResults | null>(null)
//   const [streamingSteps, setStreamingSteps] = useState<StreamingStep[]>([])
//   const [currentStep, setCurrentStep] = useState<number>(-1)
//   const [allSources, setAllSources] = useState<SearchResult[]>([])
//   const [activeTab, setActiveTab] = useState<"answer" | "treatment">("answer")
//   const [showCamera, setShowCamera] = useState(false)

//   const { language, t } = useLanguage()

//   const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0]
//     if (file) {
//       processImageFile(file)
//     }
//   }

//   const processImageFile = (file: File) => {
//     setSelectedImage(file)
//     const reader = new FileReader()
//     reader.onload = (e) => {
//       setImagePreview(e.target?.result as string)
//     }
//     reader.readAsDataURL(file)
//     resetAnalysis()
//   }

//   const handleCameraCapture = (file: File) => {
//     processImageFile(file)
//     setShowCamera(false)
//   }

//   const resetAnalysis = () => {
//     setDiagnosis(null)
//     setSearchResults(null)
//     setStreamingSteps([])
//     setCurrentStep(-1)
//     setAllSources([])
//   }

//   const handleNewImage = () => {
//     setSelectedImage(null)
//     setImagePreview(null)
//     resetAnalysis()
//     // Reset file inputs
//     const fileInput = document.getElementById("file-upload") as HTMLInputElement
//     if (fileInput) fileInput.value = ""
//   }

//   const simulateStreaming = async (steps: StreamingStep[]) => {
//     setStreamingSteps(steps)

//     for (let i = 0; i < steps.length; i++) {
//       setCurrentStep(i)

//       // Simulate typing effect
//       const step = steps[i]
//       const words = step.content.split(" ")
//       let currentContent = ""

//       for (let j = 0; j < words.length; j++) {
//         currentContent += (j > 0 ? " " : "") + words[j]
//         setStreamingSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, content: currentContent } : s)))
//         await new Promise((resolve) => setTimeout(resolve, 50))
//       }

//       // Mark step as complete
//       setStreamingSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, isComplete: true } : s)))

//       await new Promise((resolve) => setTimeout(resolve, 300))
//     }
//   }

//   const handleAnalyze = async () => {
//     if (!selectedImage) return

//     setIsAnalyzing(true)
//     resetAnalysis()

//     try {
//       // Convert image to base64
//       const base64Image = await new Promise<string>((resolve) => {
//         const reader = new FileReader()
//         reader.onload = (e) => resolve(e.target?.result as string)
//         reader.readAsDataURL(selectedImage)
//       })

//       // Get diagnosis
//       const diagnosisPromise = fetch("/api/diagnose", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ image: base64Image, language }),
//       }).then((res) => res.json())

//       // Get diagnosis first
//       const diagnosisRes = await diagnosisPromise

//       // Then search with the actual disease name (still needed for potential future use)
//       const searchPromise = fetch("/api/search", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           diseaseName: diagnosisRes.diseaseName,
//           cropName: diagnosisRes.affectedCrops?.[0] || "crops",
//           language,
//         }),
//       }).then((res) => res.json())

//       const searchRes = await searchPromise

//       setSearchResults(searchRes)
//       const sources = [...(searchRes.diseaseInfo || []), ...(searchRes.treatmentInfo || [])]
//       setAllSources(sources)
//       setDiagnosis(diagnosisRes)

//       // Simulate streaming with final content
//       await simulateStreaming([
//         {
//           id: "diagnosis",
//           title: "Analysis Complete",
//           content: `The crop in your image appears to be affected by **${diagnosisRes.diseaseName}** (*${diagnosisRes.scientificName}*). This disease commonly affects multiple crop types and presents with characteristic symptoms that match the visual indicators in your image.`,
//           isComplete: false,
//           sources: sources.slice(0, 3).map((_, idx) => idx + 1),
//         },
//       ])
//     } catch (error) {
//       console.error("Error analyzing crop:", error)
//     } finally {
//       setIsAnalyzing(false)
//     }
//   }

//   return (
//     <div className="min-h-screen bg-gray-900 text-white antialiased">
//       {showCamera && <CameraCapture onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />}

//       {/* Chatbot Component */}
//       <Chatbot />

//       <div className="max-w-7xl mx-auto">
//         {!selectedImage ? (
//           /* Upload Interface - Extremely Responsive */
//           <div className="min-h-screen flex items-center justify-center px-3 sm:px-4 md:px-6">
//             {/* Fixed Back Button at Top Left - Responsive */}
//             <div className="fixed top-3 sm:top-4 md:top-6 left-3 sm:left-4 md:left-6 z-10">
//               <Link href="/landing">
//                 <Button
//                   variant="outline"
//                   className="flex items-center gap-1 sm:gap-2 bg-gray-800/90 backdrop-blur-sm border-gray-600 text-white hover:bg-gray-700 shadow-lg text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
//                 >
//                   <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
//                   <span className="hidden sm:inline">{t("crop.backHome")}</span>
//                   <span className="sm:hidden">Back</span>
//                 </Button>
//               </Link>
//             </div>

//             <div className="max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl w-full text-center">
//               {/* Animation and Title Section - Responsive */}
//               <div className="mb-6 sm:mb-8">
//                 {/* Animated Element */}
//                 <div className="flex justify-center mb-3 sm:mb-4">
//                   <div className="relative">
//                     <video
//                       autoPlay
//                       loop
//                       muted
//                       playsInline
//                       className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 object-contain"
//                     >
//                       <source
//                         src="https://ofhubh1u0o5vkedk.public.blob.vercel-storage.com/Animation%20-%201751449783387-eANbGUvzlNpOnoBj8MtprTaruUMMUJ.webm"
//                         type="video/webm"
//                       />
//                       {/* Fallback for browsers that don't support webm */}
//                       <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full animate-pulse"></div>
//                     </video>
//                   </div>
//                 </div>

//                 {/* Title - Responsive Typography */}
//                 <div className="mb-4 sm:mb-6">
//                   <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight">
//                     {t("crop.title")}
//                   </h1>
//                 </div>

//                 {/* Main Heading - Responsive */}
//                 <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4 leading-tight px-2 sm:px-0">
//                   {t("crop.analyze")}
//                 </h2>

//                 {/* Description - Responsive */}
//                 <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-xs sm:max-w-sm md:max-w-lg mx-auto px-2 sm:px-0">
//                   {t("crop.description")}
//                 </p>
//               </div>

//               {/* Upload Area - Highly Responsive */}
//               <div className="bg-gray-800 rounded-xl p-4 sm:p-6 md:p-8 border-2 border-dashed border-gray-600 hover:border-gray-500 transition-colors">
//                 <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="file-upload" />

//                 <div className="space-y-4 sm:space-y-6">
//                   {/* Upload Icon */}
//                   <div className="flex justify-center">
//                     <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 rounded-full flex items-center justify-center">
//                       <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
//                     </div>
//                   </div>

//                   {/* Upload Text - Responsive */}
//                   <div className="space-y-1">
//                     <h3 className="text-white text-base sm:text-lg font-semibold">{t("crop.uploadImage")}</h3>
//                     <p className="text-gray-400 text-xs sm:text-sm">{t("crop.fileFormat")}</p>
//                   </div>

//                   {/* Upload Buttons - Responsive Layout */}
//                   <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
//                     <Button
//                       onClick={() => document.getElementById("file-upload")?.click()}
//                       variant="outline"
//                       className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gray-700 border-gray-600 text-white hover:bg-gray-600 rounded-lg font-medium transition-colors text-sm sm:text-base w-full sm:w-auto"
//                     >
//                       <Upload className="w-4 h-4" />
//                       {t("crop.chooseFile")}
//                     </Button>
//                     <Button
//                       onClick={() => setShowCamera(true)}
//                       variant="outline"
//                       className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gray-700 border-gray-600 text-white hover:bg-gray-600 rounded-lg font-medium transition-colors text-sm sm:text-base w-full sm:w-auto"
//                     >
//                       <Camera className="w-4 h-4" />
//                       {t("crop.takePhoto")}
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ) : (
//           /* Analysis Interface - Extremely Responsive */
//           <div className="min-h-screen">
//             {/* Header - Responsive */}
//             <div className="border-b border-gray-800 px-3 sm:px-4 md:px-6 py-3 sm:py-4">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2 sm:gap-3">
//                   <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center overflow-hidden">
//                     <video autoPlay loop muted playsInline className="w-6 h-6 sm:w-8 sm:h-8 object-contain">
//                       <source
//                         src="https://ofhubh1u0o5vkedk.public.blob.vercel-storage.com/Animation%20-%201751449783387-eANbGUvzlNpOnoBj8MtprTaruUMMUJ.webm"
//                         type="video/webm"
//                       />
//                       <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-pink-400 to-rose-500 rounded-lg animate-pulse"></div>
//                     </video>
//                   </div>
//                   <h1 className="text-base sm:text-lg md:text-xl font-bold text-white tracking-tight">
//                     {t("crop.title")}
//                   </h1>
//                 </div>
//                 <div className="flex items-center gap-1 sm:gap-2">
//                   <Link href="/landing">
//                     <Button
//                       variant="outline"
//                       className="flex items-center gap-1 sm:gap-2 bg-gray-800 border-gray-600 text-white hover:bg-gray-700 font-medium text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
//                     >
//                       <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
//                       <span className="hidden sm:inline">{t("crop.home")}</span>
//                     </Button>
//                   </Link>
//                   <Button
//                     onClick={handleNewImage}
//                     variant="outline"
//                     className="flex items-center gap-1 sm:gap-2 bg-gray-800 border-gray-600 text-white hover:bg-gray-700 font-medium text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
//                   >
//                     <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
//                     <span className="hidden sm:inline">{t("crop.newAnalysis")}</span>
//                     <span className="sm:hidden">New</span>
//                   </Button>
//                 </div>
//               </div>
//             </div>

//             <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6">
//               {/* Tabs - Responsive */}
//               <div className="flex items-center gap-3 sm:gap-6 mb-4 sm:mb-6 border-b border-gray-800 overflow-x-auto">
//                 <button
//                   onClick={() => setActiveTab("answer")}
//                   className={`pb-2 sm:pb-3 px-1 border-b-2 transition-colors font-medium whitespace-nowrap text-sm sm:text-base ${
//                     activeTab === "answer"
//                       ? "border-white text-white"
//                       : "border-transparent text-gray-400 hover:text-gray-300"
//                   }`}
//                 >
//                   <div className="flex items-center gap-1 sm:gap-2">
//                     <Bug className="w-3 h-3 sm:w-4 sm:h-4" />
//                     {t("tabs.answer")}
//                   </div>
//                 </button>
//                 {diagnosis && (
//                   <button
//                     onClick={() => setActiveTab("treatment")}
//                     className={`pb-2 sm:pb-3 px-1 border-b-2 transition-colors font-medium whitespace-nowrap text-sm sm:text-base ${
//                       activeTab === "treatment"
//                         ? "border-white text-white"
//                         : "border-transparent text-gray-400 hover:text-gray-300"
//                     }`}
//                   >
//                     <div className="flex items-center gap-1 sm:gap-2">
//                       <FlaskConical className="w-3 h-3 sm:w-4 sm:h-4" />
//                       {t("tabs.treatment")}
//                     </div>
//                   </button>
//                 )}
//               </div>

//               {activeTab === "answer" && (
//                 <div className="space-y-4 sm:space-y-6">
//                   {/* Image Preview and Analysis Section - Responsive */}
//                   {imagePreview && (
//                     <div className="space-y-4">
//                       {/* Image Preview Card */}
//                       <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
//                         <div className="flex flex-col items-center space-y-3 sm:space-y-4">
//                           <div className="relative">
//                             <img
//                               src={imagePreview || "/placeholder.svg"}
//                               alt="Crop image"
//                               className="w-48 h-36 sm:w-64 sm:h-48 md:w-80 md:h-60 object-cover rounded-lg border-2 border-gray-600"
//                             />
//                           </div>

//                           {!isAnalyzing && !diagnosis && (
//                             <div className="text-center space-y-3">
//                               <p className="text-gray-400 text-xs sm:text-sm">{t("crop.ready")}</p>
//                               <Button
//                                 onClick={handleAnalyze}
//                                 className="bg-green-600 hover:bg-green-700 px-6 sm:px-8 py-2 sm:py-2.5 rounded-lg font-semibold text-sm sm:text-base"
//                                 size="lg"
//                               >
//                                 <Search className="w-4 h-4 mr-2" />
//                                 {t("crop.analyzeCrop")}
//                               </Button>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   {/* Analysis Results - Responsive */}
//                   {(isAnalyzing || diagnosis) && (
//                     <div className="space-y-4 sm:space-y-6">
//                       {isAnalyzing && !diagnosis && (
//                         <div className="flex items-center gap-3 bg-gray-800/50 rounded-lg p-3 sm:p-4">
//                           <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 animate-spin" />
//                           <span className="text-gray-300 font-medium text-sm sm:text-base">{t("crop.analyzing")}</span>
//                         </div>
//                       )}

//                       {diagnosis && (
//                         <div className="space-y-4 sm:space-y-6">
//                           {/* Main Diagnosis - Responsive */}
//                           <div className="bg-gray-800/30 rounded-xl p-4 sm:p-6 border border-gray-700/50">
//                             <div className="space-y-3 sm:space-y-4">
//                               <div className="flex items-center gap-2 mb-3 sm:mb-4">
//                                 <div className="w-5 h-5 sm:w-6 sm:h-6 bg-red-600 rounded-full flex items-center justify-center">
//                                   <Bug className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
//                                 </div>
//                                 <h2 className="text-lg sm:text-xl font-bold text-white">{t("disease.detected")}</h2>
//                               </div>

//                               <div className="space-y-3">
//                                 <p className="text-gray-300 leading-relaxed text-base sm:text-lg font-medium">
//                                   {t("disease.affected")}{" "}
//                                   <span className="text-red-400 font-bold">{diagnosis.diseaseName}</span>.
//                                 </p>

//                                 <div className="bg-gray-700/50 rounded-lg p-3 sm:p-4">
//                                   <div className="grid grid-cols-1 gap-3 sm:gap-4 text-sm">
//                                     <div>
//                                       <span className="text-gray-400 font-medium">{t("disease.scientificName")}</span>
//                                       <p className="text-white font-semibold italic">{diagnosis.scientificName}</p>
//                                     </div>
//                                     <div>
//                                       <span className="text-gray-400 font-medium">{t("disease.affectedCrops")}</span>
//                                       <div className="flex flex-wrap gap-1 sm:gap-2 mt-1">
//                                         {diagnosis.affectedCrops.map((crop, index) => (
//                                           <span
//                                             key={index}
//                                             className="inline-block bg-green-600/20 text-green-300 px-2 py-1 rounded-md text-xs sm:text-sm font-medium border border-green-600/30"
//                                           >
//                                             {crop}
//                                           </span>
//                                         ))}
//                                       </div>
//                                     </div>
//                                   </div>
//                                 </div>
//                               </div>
//                             </div>
//                           </div>

//                           {/* Disease Overview - Responsive */}
//                           <div className="space-y-3 sm:space-y-4">
//                             <h2 className="text-xl sm:text-2xl font-bold text-white">{t("disease.overview")}</h2>

//                             <div className="grid gap-3 sm:gap-4">
//                               {/* What is this disease */}
//                               <div className="bg-gray-800/30 rounded-xl p-4 sm:p-6 border border-gray-700/50">
//                                 <h3 className="text-base sm:text-lg font-bold text-white mb-2 sm:mb-3 flex items-center gap-2">
//                                   <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-600 rounded-full flex items-center justify-center">
//                                     <span className="text-xs text-white font-bold">?</span>
//                                   </div>
//                                   {t("disease.whatIs")} {diagnosis.diseaseName}?
//                                 </h3>
//                                 <div className="space-y-2 sm:space-y-3 text-gray-300">
//                                   <p className="leading-relaxed text-sm sm:text-base">
//                                     {diagnosis.diseaseDescription ||
//                                       `${diagnosis.diseaseName} is a common agricultural disease that affects multiple crop types including ${diagnosis.affectedCrops.join(", ")}. Early detection and proper treatment are essential for effective management.`}
//                                   </p>
//                                 </div>
//                               </div>

//                               {/* Symptoms */}
//                               <div className="bg-gray-800/30 rounded-xl p-4 sm:p-6 border border-gray-700/50">
//                                 <h3 className="text-base sm:text-lg font-bold text-white mb-2 sm:mb-3 flex items-center gap-2">
//                                   <div className="w-4 h-4 sm:w-5 sm:h-5 bg-orange-600 rounded-full flex items-center justify-center">
//                                     <span className="text-xs text-white font-bold">!</span>
//                                   </div>
//                                   {t("disease.symptoms")}
//                                 </h3>
//                                 <div className="grid gap-2 sm:gap-3">
//                                   {diagnosis.symptoms.map((symptom, index) => (
//                                     <div
//                                       key={index}
//                                       className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-700/30 rounded-lg"
//                                     >
//                                       <div className="w-5 h-5 sm:w-6 sm:h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
//                                         <span className="text-xs text-white font-bold">{index + 1}</span>
//                                       </div>
//                                       <div>
//                                         <p className="text-gray-200 font-medium text-sm sm:text-base">{symptom}</p>
//                                       </div>
//                                     </div>
//                                   ))}
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               )}

//               {activeTab === "treatment" && diagnosis && (
//                 <div className="space-y-4 sm:space-y-6">
//                   {/* Treatment Methods - Responsive */}
//                   <div className="space-y-3 sm:space-y-4">
//                     <h2 className="text-xl sm:text-2xl font-bold text-white">{t("disease.treatment")}</h2>

//                     <div className="grid gap-3 sm:gap-4">
//                       {/* Cultural Control Methods */}
//                       <div className="bg-green-900/20 border border-green-800/50 rounded-xl p-4 sm:p-6">
//                         <h3 className="font-bold text-green-400 mb-3 sm:mb-4 flex items-center gap-2 text-base sm:text-lg">
//                           <Sprout className="w-4 h-4 sm:w-5 sm:h-5" />
//                           {t("treatment.cultural")}
//                         </h3>
//                         <div className="space-y-2 sm:space-y-3">
//                           {diagnosis.remedies.cultural.map((remedy, index) => (
//                             <div
//                               key={index}
//                               className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-green-900/10 rounded-lg"
//                             >
//                               <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
//                               <p className="text-gray-200 leading-relaxed text-sm sm:text-base">{remedy}</p>
//                             </div>
//                           ))}
//                         </div>
//                       </div>

//                       {/* Biological Control Methods */}
//                       <div className="bg-blue-900/20 border border-blue-800/50 rounded-xl p-4 sm:p-6">
//                         <h3 className="font-bold text-blue-400 mb-3 sm:mb-4 flex items-center gap-2 text-base sm:text-lg">
//                           <Leaf className="w-4 h-4 sm:w-5 sm:h-5" />
//                           {t("treatment.biological")}
//                         </h3>
//                         <div className="space-y-2 sm:space-y-3">
//                           {diagnosis.remedies.biological.map((remedy, index) => (
//                             <div
//                               key={index}
//                               className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-blue-900/10 rounded-lg"
//                             >
//                               <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
//                               <p className="text-gray-200 leading-relaxed text-sm sm:text-base">{remedy}</p>
//                             </div>
//                           ))}
//                         </div>
//                       </div>

//                       {/* Chemical Control Methods */}
//                       <div className="bg-orange-900/20 border border-orange-800/50 rounded-xl p-4 sm:p-6">
//                         <h3 className="font-bold text-orange-400 mb-3 sm:mb-4 flex items-center gap-2 text-base sm:text-lg">
//                           <FlaskConical className="w-4 h-4 sm:w-5 sm:h-5" />
//                           {t("treatment.chemical")}
//                         </h3>
//                         <div className="space-y-2 sm:space-y-3">
//                           {diagnosis.remedies.chemical.map((remedy, index) => (
//                             <div
//                               key={index}
//                               className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-orange-900/10 rounded-lg"
//                             >
//                               <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
//                               <p className="text-gray-200 leading-relaxed text-sm sm:text-base">{remedy}</p>
//                             </div>
//                           ))}
//                         </div>
//                         <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-orange-900/30 rounded-lg border border-orange-800/30">
//                           <p className="text-orange-200 text-xs sm:text-sm font-semibold flex items-center gap-2">
//                             <span className="w-4 h-4 sm:w-5 sm:h-5 bg-orange-500 rounded-full flex items-center justify-center text-xs text-white font-bold flex-shrink-0">
//                               !
//                             </span>
//                             {t("treatment.warning")}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }
