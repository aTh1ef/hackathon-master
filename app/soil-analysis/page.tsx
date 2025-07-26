"use client"
import { useState, useRef, useEffect, type FormEvent } from "react"
import type React from "react"

import Image from "next/image"
import Link from "next/link"
import {
  Leaf,
  MapPin,
  Upload,
  Loader2,
  Languages,
  CheckCircle2,
  AlertTriangle,
  Camera,
  RefreshCw,
  ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getAnalysis, type AnalysisResult } from "@/app/actions"
import { AnalysisResultDisplay } from "@/components/analysis-result-display"

type Location = {
  latitude: number
  longitude: number
}

const translations: Record<string, any> = {
  en: {
    title: "AI Crop Doctor",
    subtitle: "Your AI assistant for smarter farming in India.",
    cardTitle: "Get Crop Recommendations",
    cardDescription: "Upload a soil sample and we'll handle the rest.",
    languageLabel: "Language",
    imageLabel: "Soil Image",
    uploadPrompt: "Click to upload photo",
    uploadHint: "or drag and drop",
    locationLabel: "Location",
    fetchingLocation: "Fetching Location...",
    locationAcquired: "Location Acquired",
    locationDisabled: "Location Disabled",
    locationCoords: "Lat: {lat}, Lng: {lng}",
    errorTitle: "Error",
    analyzeButton: "Get My Recommendations",
    analyzingButton: "Analyzing...",
    startNewAnalysis: "Start New Analysis",
    backToFeatures: "Back to Features",
    errorGettingLocation: "Error getting location: {message}. Please enable location services or try again.",
    errorMissingInput: "Please provide both a soil image and your location.",
    errorReadingImage: "Failed to read the image file.",
    errorUnknown: "An unknown error occurred.",
    recommendedCropsTitle: "Recommended Crops",
    recommendedCropsDescription: "Based on your soil and climate, we recommend the following crops:",
    soilAnalysisTitle: "Soil Analysis",
    soilTextureLabel: "Texture",
    soilConditionLabel: "Condition",
    climateOverviewTitle: "Climate Overview",
    climateRegionLabel: "Region",
    climateClimateLabel: "Climate",
    detectLocationButton: "Detect My Location",
  },
  hi: {
    title: "एआई क्रॉप डॉक्टर",
    subtitle: "भारत में बेहतर खेती के लिए आपका एआई सहायक।",
    cardTitle: "फसल सुझाव प्राप्त करें",
    cardDescription: "मिट्टी का नमूना अपलोड करें और बाकी हम संभाल लेंगे।",
    languageLabel: "भाषा",
    imageLabel: "मिट्टी की छवि",
    uploadPrompt: "फोटो अपलोड करने के लिए क्लिक करें",
    uploadHint: "या खींचें और छोड़ें",
    locationLabel: "स्थान",
    fetchingLocation: "स्थान प्राप्त हो रहा है...",
    locationAcquired: "स्थान प्राप्त हुआ",
    locationDisabled: "स्थान अक्षम है",
    locationCoords: "अक्षांश: {lat}, देशांतर: {lng}",
    errorTitle: "त्रुटि",
    analyzeButton: "मेरी सिफारिशें प्राप्त करें",
    analyzingButton: "विश्लेषण हो रहा है...",
    startNewAnalysis: "नया विश्लेषण शुरू करें",
    backToFeatures: "सुविधाओं पर वापस जाएं",
    errorGettingLocation: "स्थान प्राप्त करने में त्रुटि: {message}। कृपया स्थान सेवाएं सक्षम करें या पुनः प्रयास करें।",
    errorMissingInput: "कृपया मिट्टी की छवि और अपना स्थान दोनों प्रदान करें।",
    errorReadingImage: "छवि फ़ाइल पढ़ने में विफल।",
    errorUnknown: "एक अज्ञात त्रुटि हुई।",
    recommendedCropsTitle: "अनुशंसित फसलें",
    recommendedCropsDescription: "आपकी मिट्टी और जलवायु के आधार पर, हम निम्नलिखित फसलों की अनुशंसा करते हैं:",
    soilAnalysisTitle: "मृदा विश्लेषण",
    soilTextureLabel: "बनावट",
    soilConditionLabel: "दशा",
    climateOverviewTitle: "जलवायु अवलोकन",
    climateRegionLabel: "क्षेत्र",
    climateClimateLabel: "जलवायु",
    detectLocationButton: "मेरा स्थान पता लगाएँ",
  },
  kn: {
    title: "ಎಐ ಕ್ರಾಪ್ ಡಾಕ್ಟರ್",
    subtitle: "ಭಾರತದಲ್ಲಿ ಉತ್ತಮ ಕೃಷಿಗಾಗಿ ನಿಮ್ಮ AI ಸಹಾಯಕ.",
    cardTitle: "ಬೆಳೆ ಶಿಫಾರಸುಗಳನ್ನು ಪಡೆಯಿರಿ",
    cardDescription: "ಮಣ್ಣಿನ ಮಾದರಿಯನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಮತ್ತು ಉಳಿದದ್ದನ್ನು ನಾವು ನೋಡಿಕೊಳ್ಳುತ್ತೇವೆ.",
    languageLabel: "ಭಾಷೆ",
    imageLabel: "ಮಣ್ಣಿನ ಚಿತ್ರ",
    uploadPrompt: "ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ",
    uploadHint: "ಅಥವಾ ಡ್ರ್ಯಾಗ್ ಮತ್ತು ಡ್ರಾಪ್ ಮಾಡಿ",
    locationLabel: "ಸ್ಥಳ",
    fetchingLocation: "ಸ್ಥಳವನ್ನು ಪಡೆಯಲಾಗುತ್ತಿದೆ...",
    locationAcquired: "ಸ್ಥಳವನ್ನು ಪಡೆದುಕೊಳ್ಳಲಾಗಿದೆ",
    locationDisabled: "ಸ್ಥಳವನ್ನು ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ",
    locationCoords: "ಅಕ್ಷಾಂಶ: {lat}, ರೇಖಾಂಶ: {lng}",
    errorTitle: "ದೋಷ",
    analyzeButton: "ನನ್ನ ಶಿಫಾರಸುಗಳನ್ನು ಪಡೆಯಿರಿ",
    analyzingButton: "ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
    startNewAnalysis: "ಹೊಸ ವಿಶ್ಲೇಷಣೆಯನ್ನು ಪ್ರಾರಂಭಿಸಿ",
    backToFeatures: "ವೈಶಿಷ್ಟ್ಯಗಳಿಗೆ ಹಿಂತಿರುಗಿ",
    errorGettingLocation: "ಸ್ಥಳವನ್ನು ಪಡೆಯುವಲ್ಲಿ ದೋಷ: {message}. ದಯವಿಟ್ಟು ಸ್ಥಳ ಸೇವೆಗಳನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಿ ಅಥವಾ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    errorMissingInput: "ದಯವಿಟ್ಟು ಮಣ್ಣಿನ ಚಿತ್ರ ಮತ್ತು ನಿಮ್ಮ ಸ್ಥಳ ಎರಡನ್ನೂ ಒದಗಿಸಿ.",
    errorReadingImage: "ಚಿತ್ರ ಫೈಲ್ ಓದಲು ವಿಫಲವಾಗಿದೆ.",
    errorUnknown: "ಅಪರಿಚಿತ ದೋಷ ಸಂಭವಿಸಿದೆ.",
    recommendedCropsTitle: "ಶಿಫಾರಸು ಮಾಡಿದ ಬೆಳೆಗಳು",
    recommendedCropsDescription: "ನಿಮ್ಮ ಮಣ್ಣು ಮತ್ತು ಹವಾಮಾನವನ್ನು ಆಧರಿಸಿ, ನಾವು ಈ ಕೆಳಗಿನ ಬೆಳೆಗಳನ್ನು ಶಿಫಾರಸು ಮಾಡುತ್ತೇವೆ:",
    soilAnalysisTitle: "ಮಣ್ಣಿನ ವಿಶ್ಲೇಷಣೆ",
    soilTextureLabel: "ವಿನ್ಯಾಸ",
    soilConditionLabel: "ಸ್ಥಿತಿ",
    climateOverviewTitle: "ಹವಾಮಾನ ಅವಲೋಕನ",
    climateRegionLabel: "ಪ್ರದೇಶ",
    climateClimateLabel: "ಹವಾಮಾನ",
    detectLocationButton: "ನನ್ನ ಸ್ಥಳವನ್ನು ಪತ್ತೆ ಮಾಡಿ",
  },
  ta: {
    title: "ஏஐ க்ராப் டாக்டர்",
    subtitle: "இந்தியாவில் சிறந்த விவசாயத்திற்கான உங்கள் AI உதவியாளர்.",
    cardTitle: "பயிர் பரிந்துரைகளைப் பெறுங்கள்",
    cardDescription: "மண் மாதிரியைப் பதிவேற்றி, மீதமுள்ளதை நாங்கள் கவனித்துக்கொள்வோம்.",
    languageLabel: "மொழி",
    imageLabel: "மண் படம்",
    uploadPrompt: "புகைப்படத்தைப் பதிவேற்ற கிளிக் செய்யவும்",
    uploadHint: "அல்லது இழுத்து விடுங்கள்",
    locationLabel: "இடம்",
    fetchingLocation: "இடத்தைப் பெறுகிறது...",
    locationAcquired: "இடம் பெறப்பட்டது",
    locationDisabled: "இடம் முடக்கப்பட்டது",
    locationCoords: "அட்சரேகை: {lat}, தீர்க்கரேகை: {lng}",
    errorTitle: "பிழை",
    analyzeButton: "எனது பரிந்துரைகளைப் பெறுங்கள்",
    analyzingButton: "பகுப்பாய்வு செய்யப்படுகிறது...",
    startNewAnalysis: "புதிய பகுப்பாய்வைத் தொடங்குங்கள்",
    backToFeatures: "அம்சங்களுக்குத் திரும்பு",
    errorGettingLocation:
      "இடத்தைப் பெறுவதில் பிழை: {message}. தயவுசெய்து இருப்பிடச் சேவைகளை இயக்கவும் அல்லது மீண்டும் முயற்சிக்கவும்.",
    errorMissingInput: "தயவுசெய்து மண் படம் மற்றும் உங்கள் இருப்பிடம் இரண்டையும் வழங்கவும்.",
    errorReadingImage: "படக் கோப்பைப் படிக்கத் தவறிவிட்டது.",
    errorUnknown: "தெரியாத பிழை ஏற்பட்டது.",
    recommendedCropsTitle: "பரிந்துரைக்கப்பட்ட பயிர்கள்",
    recommendedCropsDescription: "உங்கள் மண் மற்றும் காலநிலையின் அடிப்படையில், பின்வரும் பயிர்களை நாங்கள் பரிந்துரைக்கிறோம்:",
    soilAnalysisTitle: "மண் பகுப்பாய்வு",
    soilTextureLabel: "அமைப்பு",
    soilConditionLabel: "நிலை",
    climateOverviewTitle: "காலநிலை கண்ணோட்டம்",
    climateRegionLabel: "பகுதி",
    climateClimateLabel: "காலநிலை",
    detectLocationButton: "எனது இருப்பிடத்தைக் கண்டறியவும்",
  },
  te: {
    title: "ఏఐ క్రాప్ డాక్టర్",
    subtitle: "భారతదేశంలో తెలివైన వ్యవసాయం కోసం మీ AI సహాయకుడు.",
    cardTitle: "పంట సిఫార్సులను పొందండి",
    cardDescription: "మట్టి నమూనాను అప్‌లోడ్ చేయండి మరియు మిగిలినవి మేము చూసుకుంటాము.",
    languageLabel: "భాష",
    imageLabel: "మట్టి చిత్రం",
    uploadPrompt: "ఫోటోను అప్‌లోడ్ చేయడానికి క్లిక్ చేయండి",
    uploadHint: "లేదా లాగి వదలండి",
    locationLabel: "స్థానం",
    fetchingLocation: "స్థానాన్ని పొందుతోంది...",
    locationAcquired: "స్థానం పొందబడింది",
    locationDisabled: "స్థానం నిలిపివేయబడింది",
    locationCoords: "అక్షాంశం: {lat}, రేఖాంశం: {lng}",
    errorTitle: "లోపం",
    analyzeButton: "నా సిఫార్సులను పొందండి",
    analyzingButton: "విశ్లేషిస్తోంది...",
    startNewAnalysis: "కొత్త విశ్లేషణను ప్రారంభించండి",
    backToFeatures: "ఫీచర్లకు తిరిగి వెళ్లండి",
    errorGettingLocation: "స్థానాన్ని పొందడంలో లోపం: {message}. దయచేసి స్థాన సేవలను ప్రారంభించండి లేదా మళ్లీ ప్రయత్నించండి.",
    errorMissingInput: "దయచేసి మట్టి చిత్రం మరియు మీ స్థానం రెండింటినీ అందించండి.",
    errorReadingImage: "చిత్ర ఫైల్‌ను చదవడం విఫలమైంది.",
    errorUnknown: "తెలియని లోపం సంభవించింది.",
    recommendedCropsTitle: "సిఫార్సు చేయబడిన పంటలు",
    recommendedCropsDescription: "మీ నేల మరియు వాతావరణం ఆధారంగా, మేము ఈ క్రింది పంటలను సిఫార్సు చేస్తున్నాము:",
    soilAnalysisTitle: "నేల విశ్లేషణ",
    soilTextureLabel: "ఆకృతి",
    soilConditionLabel: "పరిస్థితి",
    climateOverviewTitle: "వాతావరణం యొక్క అవలోకనం",
    climateRegionLabel: "ప్రాంతం",
    climateClimateLabel: "వాతావరణం",
    detectLocationButton: "నా స్థానాన్ని గుర్తించు",
  },
  bn: {
    title: "এআই ক্রপ ডাক্তার",
    subtitle: "ভারতে স্মার্ট চাষের জন্য আপনার এআই সহকারী।",
    cardTitle: "ফসলের সুপারিশ পান",
    cardDescription: "মাটির নমুনা আপলোড করুন এবং বাকিটা আমরা সামলে নেব।",
    languageLabel: "ভাষা",
    imageLabel: "মাটির ছবি",
    uploadPrompt: "ছবি আপলোড করতে ক্লিক করুন",
    uploadHint: "অথবা টেনে আনুন",
    locationLabel: "অবস্থান",
    fetchingLocation: "অবস্থান আনা হচ্ছে...",
    locationAcquired: "অবস্থান অর্জিত হয়েছে",
    locationDisabled: "অবস্থান নিষ্ক্রিয়",
    locationCoords: "অক্ষাংশ: {lat}, দ্রাঘিমাংশ: {lng}",
    errorTitle: "ত্রুটি",
    analyzeButton: "আমার সুপারিশ পান",
    analyzingButton: "বিশ্লেষণ করা হচ্ছে...",
    startNewAnalysis: "নতুন বিশ্লেষণ শুরু করুন",
    backToFeatures: "বৈশিষ্ট্যে ফিরে যান",
    errorGettingLocation: "অবস্থান পেতে ত্রুটি: {message}। অনুগ্রহ করে অবস্থান পরিষেবা সক্ষম করুন বা আবার চেষ্টা করুন।",
    errorMissingInput: "অনুগ্রহ করে মাটির ছবি এবং আপনার অবস্থান উভয়ই প্রদান করুন।",
    errorReadingImage: "ছবি ফাইল পড়তে ব্যর্থ হয়েছে।",
    errorUnknown: "একটি অজানা ত্রুটি ঘটেছে।",
    recommendedCropsTitle: "প্রস্তাবিত ফসল",
    recommendedCropsDescription: "আপনার মাটি এবং জলবায়ুর উপর ভিত্তি করে, আমরা নিম্নলিখিত ফসলগুলির সুপারিশ করছি:",
    soilAnalysisTitle: "মাটি বিশ্লেষণ",
    soilTextureLabel: "গঠন",
    soilConditionLabel: "অবস্থা",
    climateOverviewTitle: "জলবায়ু পরিদর্শন",
    climateRegionLabel: "অঞ্চল",
    climateClimateLabel: "জলবায়ু",
    detectLocationButton: "আমার অবস্থান সনাক্ত করুন",
  },
}

export default function AnnadataAIPage() {
  const [language, setLanguage] = useState("en")
  const [location, setLocation] = useState<Location | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationError, setLocationError] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const t = translations[language]

  const fetchLocation = () => {
    setIsGettingLocation(true)
    setLocationError(false)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setIsGettingLocation(false)
      },
      (err) => {
        setError(t.errorGettingLocation.replace("{message}", err.message))
        setLocationError(true)
        setIsGettingLocation(false)
      },
      { timeout: 15000 },
    )
  }

  useEffect(() => {
    fetchLocation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setImageFile(file)
      setError(null)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!imageFile || !location) {
      setError(t.errorMissingInput)
      return
    }

    setIsLoading(true)
    setError(null)
    setAnalysisResult(null)

    try {
      const reader = new FileReader()
      reader.readAsDataURL(imageFile)
      reader.onload = async () => {
        const photoDataUri = reader.result as string
        const result = await getAnalysis(photoDataUri, location.latitude, location.longitude, language)
        if (result.error) {
          setError(result.error)
        } else {
          setAnalysisResult(result)
        }
        setIsLoading(false)
      }
      reader.onerror = () => {
        setError(t.errorReadingImage)
        setIsLoading(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errorUnknown)
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setAnalysisResult(null)
    setImageFile(null)
    setImagePreview(null)
    setError(null)
    setIsLoading(false)
    setLocation(null)
    setLocationError(false)
    fetchLocation()
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const isFormComplete = location && imageFile

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
        {/* Back to Features Button */}
        <div className="w-full flex justify-start mb-6">
          <Link href="/features">
            <Button
              variant="outline"
              className="bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/70 hover:border-slate-500 transition-all duration-300 backdrop-blur-sm"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t.backToFeatures}
            </Button>
          </Link>
        </div>

        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-2xl">
              <Leaf className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent tracking-tight">
              {t.title}
            </h1>
          </div>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">{t.subtitle}</p>
        </header>

        {!analysisResult && !isLoading && (
          <Card className="w-full shadow-2xl bg-slate-800/90 backdrop-blur-xl border-slate-600/50 animate-in fade-in-0  hover:shadow-emerald-500/10 transition-all duration-300">
            <form onSubmit={handleSubmit}>
              <CardHeader className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-t-lg">
                <CardTitle className="text-3xl font-bold text-center text-white">{t.cardTitle}</CardTitle>
                <CardDescription className="text-center text-lg text-slate-300">{t.cardDescription}</CardDescription>
              </CardHeader>

              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 bg-slate-800/50">
                {/* Column 1: Language */}
                <div className="flex flex-col justify-center space-y-4">
                  <Label
                    htmlFor="language-select"
                    className="flex items-center justify-center gap-2 text-xl font-semibold text-white"
                  >
                    <Languages className="h-6 w-6 text-emerald-400" /> {t.languageLabel}
                  </Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger
                      id="language-select"
                      className="text-lg h-14 bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50 transition-colors"
                    >
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="en" className="text-white hover:bg-slate-700">
                        English
                      </SelectItem>
                      <SelectItem value="kn" className="text-white hover:bg-slate-700">
                        ಕನ್ನಡ (Kannada)
                      </SelectItem>
                      <SelectItem value="hi" className="text-white hover:bg-slate-700">
                        हिन्दी (Hindi)
                      </SelectItem>
                      <SelectItem value="ta" className="text-white hover:bg-slate-700">
                        தமிழ் (Tamil)
                      </SelectItem>
                      <SelectItem value="te" className="text-white hover:bg-slate-700">
                        తెలుగు (Telugu)
                      </SelectItem>
                      <SelectItem value="bn" className="text-white hover:bg-slate-700">
                        বাংলা (Bengali)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Column 2: Image Upload */}
                <div className="flex flex-col items-center justify-center space-y-4">
                  <Label htmlFor="soil-image" className="flex items-center gap-2 text-xl font-semibold text-white">
                    <Camera className="h-6 w-6 text-emerald-400" /> {t.imageLabel}
                  </Label>
                  <div
                    className="w-full h-48 border-2 border-dashed border-emerald-500/50 rounded-lg flex items-center justify-center text-slate-300 cursor-pointer hover:border-emerald-400 hover:bg-emerald-500/10 transition-all duration-300 bg-slate-700/30"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      id="soil-image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    {imagePreview ? (
                      <Image
                        src={imagePreview || "/placeholder.svg"}
                        alt="Soil preview"
                        width={200}
                        height={200}
                        className="h-full w-full object-cover rounded-md"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <Upload className="mx-auto h-10 w-10 mb-2 text-emerald-400" />
                        <p className="font-semibold text-white">{t.uploadPrompt}</p>
                        <p className="text-xs text-slate-400">{t.uploadHint}</p>
                      </div>
                    )}
                  </div>
                  {imageFile && (
                    <p className="text-sm text-slate-300 text-center animate-in fade-in-20 bg-slate-700/50 px-3 py-1 rounded-full">
                      {imageFile.name}
                    </p>
                  )}
                </div>

                {/* Column 3: Geolocation */}
                <div className="flex flex-col justify-center items-center space-y-4">
                  <Label className="flex items-center justify-center gap-2 text-xl font-semibold text-white">
                    <MapPin className="h-6 w-6 text-emerald-400" /> {t.locationLabel}
                  </Label>
                  <div className="w-full h-14 text-lg bg-slate-700/50 border border-slate-600 rounded-md flex items-center justify-center text-center px-2">
                    {isGettingLocation ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin text-emerald-400" />
                        <span className="text-white">{t.fetchingLocation}</span>
                      </>
                    ) : location ? (
                      <>
                        <CheckCircle2 className="mr-2 h-6 w-6 text-green-400 flex-shrink-0" />
                        <span className="text-white">{t.locationAcquired}</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="mr-2 h-6 w-6 text-red-400 flex-shrink-0" />
                        <span className="text-white">{t.locationDisabled}</span>
                      </>
                    )}
                  </div>
                  {location && !isGettingLocation && (
                    <p className="text-sm text-slate-300 text-center animate-in fade-in-20 bg-slate-700/50 px-3 py-1 rounded-full">
                      {t.locationCoords
                        .replace("{lat}", location.latitude.toFixed(4))
                        .replace("{lng}", location.longitude.toFixed(4))}
                    </p>
                  )}
                  {locationError && !isGettingLocation && (
                    <Button
                      onClick={fetchLocation}
                      variant="outline"
                      size="sm"
                      className="w-full bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/70 hover:border-slate-500"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      {t.detectLocationButton}
                    </Button>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex-col items-stretch gap-4 px-8 pb-8 bg-slate-800/30">
                {error && (
                  <Alert variant="destructive" className="bg-red-900/30 border-red-500/50 backdrop-blur-sm">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <AlertTitle className="text-red-300">{t.errorTitle}</AlertTitle>
                    <AlertDescription className="text-red-200">{error}</AlertDescription>
                  </Alert>
                )}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-16 text-2xl font-bold tracking-wider bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-[1.02]"
                  disabled={!isFormComplete || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                      {t.analyzingButton}
                    </>
                  ) : (
                    t.analyzeButton
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

        <AnalysisResultDisplay result={analysisResult} isLoading={isLoading} t={t} />

        {analysisResult && !isLoading && (
          <div className="mt-8 animate-in fade-in-0 duration-500">
            <Button
              onClick={handleReset}
              size="lg"
              className="h-14 text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white shadow-xl hover:shadow-slate-500/25 transition-all duration-300 transform hover:scale-[1.02]"
            >
              <RefreshCw className="mr-2 h-6 w-6" />
              {t.startNewAnalysis}
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}


// "use client";

// import { useState, useRef, useEffect, type FormEvent } from "react";
// import Image from "next/image";
// import {
//   Leaf,
//   MapPin,
//   Upload,
//   Loader2,
//   Languages,
//   CheckCircle2,
//   AlertTriangle,
//   Camera,
//   RefreshCw,
// } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { getAnalysis, type AnalysisResult } from "@/app/actions";
// import { AnalysisResultDisplay } from "@/components/analysis-result-display";

// type Location = {
//   latitude: number;
//   longitude: number;
// };

// const translations: Record<string, any> = {
//   en: {
//     title: "AI Crop Doctor",
//     subtitle: "Your AI assistant for smarter farming in India.",
//     cardTitle: "Get Crop Recommendations",
//     cardDescription: "Upload a soil sample and we'll handle the rest.",
//     languageLabel: "Language",
//     imageLabel: "Soil Image",
//     uploadPrompt: "Click to upload photo",
//     uploadHint: "or drag and drop",
//     locationLabel: "Location",
//     fetchingLocation: "Fetching Location...",
//     locationAcquired: "Location Acquired",
//     locationDisabled: "Location Disabled",
//     locationCoords: "Lat: {lat}, Lng: {lng}",
//     errorTitle: "Error",
//     analyzeButton: "Get My Recommendations",
//     analyzingButton: "Analyzing...",
//     startNewAnalysis: "Start New Analysis",
//     errorGettingLocation: "Error getting location: {message}. Please enable location services or try again.",
//     errorMissingInput: "Please provide both a soil image and your location.",
//     errorReadingImage: "Failed to read the image file.",
//     errorUnknown: "An unknown error occurred.",
//     recommendedCropsTitle: "Recommended Crops",
//     recommendedCropsDescription: "Based on your soil and climate, we recommend the following crops:",
//     soilAnalysisTitle: "Soil Analysis",
//     soilTextureLabel: "Texture",
//     soilConditionLabel: "Condition",
//     climateOverviewTitle: "Climate Overview",
//     climateRegionLabel: "Region",
//     climateClimateLabel: "Climate",
//     detectLocationButton: "Detect My Location",
//   },
//   hi: {
//     title: "एआई क्रॉप डॉक्टर",
//     subtitle: "भारत में बेहतर खेती के लिए आपका एआई सहायक।",
//     cardTitle: "फसल सुझाव प्राप्त करें",
//     cardDescription: "मिट्टी का नमूना अपलोड करें और बाकी हम संभाल लेंगे।",
//     languageLabel: "भाषा",
//     imageLabel: "मिट्टी की छवि",
//     uploadPrompt: "फोटो अपलोड करने के लिए क्लिक करें",
//     uploadHint: "या खींचें और छोड़ें",
//     locationLabel: "स्थान",
//     fetchingLocation: "स्थान प्राप्त हो रहा है...",
//     locationAcquired: "स्थान प्राप्त हुआ",
//     locationDisabled: "स्थान अक्षम है",
//     locationCoords: "अक्षांश: {lat}, देशांतर: {lng}",
//     errorTitle: "त्रुटि",
//     analyzeButton: "मेरी सिफारिशें प्राप्त करें",
//     analyzingButton: "विश्लेषण हो रहा है...",
//     startNewAnalysis: "नया विश्लेषण शुरू करें",
//     errorGettingLocation: "स्थान प्राप्त करने में त्रुटि: {message}। कृपया स्थान सेवाएं सक्षम करें या पुनः प्रयास करें।",
//     errorMissingInput: "कृपया मिट्टी की छवि और अपना स्थान दोनों प्रदान करें।",
//     errorReadingImage: "छवि फ़ाइल पढ़ने में विफल।",
//     errorUnknown: "एक अज्ञात त्रुटि हुई।",
//     recommendedCropsTitle: "अनुशंसित फसलें",
//     recommendedCropsDescription: "आपकी मिट्टी और जलवायु के आधार पर, हम निम्नलिखित फसलों की अनुशंसा करते हैं:",
//     soilAnalysisTitle: "मृदा विश्लेषण",
//     soilTextureLabel: "बनावट",
//     soilConditionLabel: "दशा",
//     climateOverviewTitle: "जलवायु अवलोकन",
//     climateRegionLabel: "क्षेत्र",
//     climateClimateLabel: "जलवायु",
//     detectLocationButton: "मेरा स्थान पता लगाएँ",
//   },
//   kn: {
//     title: "ಎಐ ಕ್ರಾಪ್ ಡಾಕ್ಟರ್",
//     subtitle: "ಭಾರತದಲ್ಲಿ ಉತ್ತಮ ಕೃಷಿಗಾಗಿ ನಿಮ್ಮ AI ಸಹಾಯಕ.",
//     cardTitle: "ಬೆಳೆ ಶಿಫಾರಸುಗಳನ್ನು ಪಡೆಯಿರಿ",
//     cardDescription: "ಮಣ್ಣಿನ ಮಾದರಿಯನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಮತ್ತು ಉಳಿದದ್ದನ್ನು ನಾವು ನೋಡಿಕೊಳ್ಳುತ್ತೇವೆ.",
//     languageLabel: "ಭಾಷೆ",
//     imageLabel: "ಮಣ್ಣಿನ ಚಿತ್ರ",
//     uploadPrompt: "ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ",
//     uploadHint: "ಅಥವಾ ಡ್ರ್ಯಾಗ್ ಮತ್ತು ಡ್ರಾಪ್ ಮಾಡಿ",
//     locationLabel: "ಸ್ಥಳ",
//     fetchingLocation: "ಸ್ಥಳವನ್ನು ಪಡೆಯಲಾಗುತ್ತಿದೆ...",
//     locationAcquired: "ಸ್ಥಳವನ್ನು ಪಡೆದುಕೊಳ್ಳಲಾಗಿದೆ",
//     locationDisabled: "ಸ್ಥಳವನ್ನು ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ",
//     locationCoords: "ಅಕ್ಷಾಂಶ: {lat}, ರೇಖಾಂಶ: {lng}",
//     errorTitle: "ದೋಷ",
//     analyzeButton: "ನನ್ನ ಶಿಫಾರಸುಗಳನ್ನು ಪಡೆಯಿರಿ",
//     analyzingButton: "ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
//     startNewAnalysis: "ಹೊಸ ವಿಶ್ಲೇಷಣೆಯನ್ನು ಪ್ರಾರಂಭಿಸಿ",
//     errorGettingLocation: "ಸ್ಥಳವನ್ನು ಪಡೆಯುವಲ್ಲಿ ದೋಷ: {message}. ದಯವಿಟ್ಟು ಸ್ಥಳ ಸೇವೆಗಳನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಿ ಅಥವಾ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
//     errorMissingInput: "ದಯವಿಟ್ಟು ಮಣ್ಣಿನ ಚಿತ್ರ ಮತ್ತು ನಿಮ್ಮ ಸ್ಥಳ ಎರಡನ್ನೂ ಒದಗಿಸಿ.",
//     errorReadingImage: "ಚಿತ್ರ ಫೈಲ್ ಓದಲು ವಿಫಲವಾಗಿದೆ.",
//     errorUnknown: "ಅಪರಿಚಿತ ದೋಷ ಸಂಭವಿಸಿದೆ.",
//     recommendedCropsTitle: "ಶಿಫಾರಸು ಮಾಡಿದ ಬೆಳೆಗಳು",
//     recommendedCropsDescription: "ನಿಮ್ಮ ಮಣ್ಣು ಮತ್ತು ಹವಾಮಾನವನ್ನು ಆಧರಿಸಿ, ನಾವು ಈ ಕೆಳಗಿನ ಬೆಳೆಗಳನ್ನು ಶಿಫಾರಸು ಮಾಡುತ್ತೇವೆ:",
//     soilAnalysisTitle: "ಮಣ್ಣಿನ ವಿಶ್ಲೇಷಣೆ",
//     soilTextureLabel: "ವಿನ್ಯಾಸ",
//     soilConditionLabel: "ಸ್ಥಿತಿ",
//     climateOverviewTitle: "ಹವಾಮಾನ ಅವಲೋಕನ",
//     climateRegionLabel: "ಪ್ರದೇಶ",
//     climateClimateLabel: "ಹವಾಮಾನ",
//     detectLocationButton: "ನನ್ನ ಸ್ಥಳವನ್ನು ಪತ್ತೆ ಮಾಡಿ",
//   },
//   ta: {
//     title: "ஏஐ க்ராப் டாக்டர்",
//     subtitle: "இந்தியாவில் சிறந்த விவசாயத்திற்கான உங்கள் AI உதவியாளர்.",
//     cardTitle: "பயிர் பரிந்துரைகளைப் பெறுங்கள்",
//     cardDescription: "மண் மாதிரியைப் பதிவேற்றி, மீதமுள்ளதை நாங்கள் கவனித்துக்கொள்வோம்.",
//     languageLabel: "மொழி",
//     imageLabel: "மண் படம்",
//     uploadPrompt: "புகைப்படத்தைப் பதிவேற்ற கிளிக் செய்யவும்",
//     uploadHint: "அல்லது இழுத்து விடுங்கள்",
//     locationLabel: "இடம்",
//     fetchingLocation: "இடத்தைப் பெறுகிறது...",
//     locationAcquired: "இடம் பெறப்பட்டது",
//     locationDisabled: "இடம் முடக்கப்பட்டது",
//     locationCoords: "அட்சரேகை: {lat}, தீர்க்கரேகை: {lng}",
//     errorTitle: "பிழை",
//     analyzeButton: "எனது பரிந்துரைகளைப் பெறுங்கள்",
//     analyzingButton: "பகுப்பாய்வு செய்யப்படுகிறது...",
//     startNewAnalysis: "புதிய பகுப்பாய்வைத் தொடங்குங்கள்",
//     errorGettingLocation: "இடத்தைப் பெறுவதில் பிழை: {message}. தயவுசெய்து இருப்பிடச் சேவைகளை இயக்கவும் அல்லது மீண்டும் முயற்சிக்கவும்.",
//     errorMissingInput: "దయచేసి మట్టి చిత్రం మరియు మీ స్థానం రెండింటినీ అందించండి.",
//     errorReadingImage: "படக் கோப்பைப் படிக்கத் தவறிவிட்டது.",
//     errorUnknown: "தெரியாத பிழை ஏற்பட்டது.",
//     recommendedCropsTitle: "பரிந்துரைக்கப்பட்ட பயிர்கள்",
//     recommendedCropsDescription: "உங்கள் மண் மற்றும் காலநிலையின் அடிப்படையில், பின்வரும் பயிர்களை நாங்கள் பரிந்துரைக்கிறோம்:",
//     soilAnalysisTitle: "மண் பகுப்பாய்வு",
//     soilTextureLabel: "அமைப்பு",
//     soilConditionLabel: "நிலை",
//     climateOverviewTitle: "காலநிலை கண்ணோட்டம்",
//     climateRegionLabel: "பகுதி",
//     climateClimateLabel: "காலநிலை",
//     detectLocationButton: "எனது இருப்பிடத்தைக் கண்டறியவும்",
//   },
//   te: {
//     title: "ఏఐ క్రాప్ డాక్టర్",
//     subtitle: "భారతదేశంలో తెలివైన వ్యవసాయం కోసం మీ AI సహాయకుడు.",
//     cardTitle: "పంట సిఫార్సులను పొందండి",
//     cardDescription: "మట్టి నమూనాను అప్‌లోడ్ చేయండి మరియు మిగిలినవి మేము చూసుకుంటాము.",
//     languageLabel: "భాష",
//     imageLabel: "మట్టి చిత్రం",
//     uploadPrompt: "ఫోటోను అప్‌లోడ్ చేయడానికి క్లిక్ చేయండి",
//     uploadHint: "లేదా లాగి వదలండి",
//     locationLabel: "స్థానం",
//     fetchingLocation: "స్థానాన్ని పొందుతోంది...",
//     locationAcquired: "స్థానం పొందబడింది",
//     locationDisabled: "స్థానం నిలిపివేయబడింది",
//     locationCoords: "అక్షాంశం: {lat}, రేఖాంశం: {lng}",
//     errorTitle: "లోపం",
//     analyzeButton: "నా సిఫార్సులను పొందండి",
//     analyzingButton: "విశ్లేషిస్తోంది...",
//     startNewAnalysis: "కొత్త విశ్లేషణను ప్రారంభించండి",
//     errorGettingLocation: "స్థానాన్ని పొందడంలో లోపం: {message}. దయచేసి స్థాన సేవలను ప్రారంభించండి లేదా మళ్లీ ప్రయత్నించండి.",
//     errorMissingInput: "దయచేసి మట్టి చిత్రం మరియు మీ స్థానం రెండింటినీ అందించండి.",
//     errorReadingImage: "చిత్ర ఫైల్‌ను చదవడం విఫలమైంది.",
//     errorUnknown: "తెలియని లోపం సంభవించింది.",
//     recommendedCropsTitle: "సిఫార్సు చేయబడిన పంటలు",
//     recommendedCropsDescription: "మీ నేల మరియు వాతావరణం ఆధారంగా, మేము ఈ క్రింది పంటలను సిఫార్సు చేస్తున్నాము:",
//     soilAnalysisTitle: "నేల విశ్లేషణ",
//     soilTextureLabel: "ఆకృతి",
//     soilConditionLabel: "పరిస్థితి",
//     climateOverviewTitle: "వాతావరణం యొక్క అవలోకనం",
//     climateRegionLabel: "ప్రాంతం",
//     climateClimateLabel: "వాతావరణం",
//     detectLocationButton: "నా స్థానాన్ని గుర్తించు",
//   },
//   bn: {
//     title: "এআই ক্রপ ডাক্তার",
//     subtitle: "ভারতে স্মার্ট চাষের জন্য আপনার এআই সহকারী।",
//     cardTitle: "ফসলের সুপারিশ পান",
//     cardDescription: "মাটির নমুনা আপলোড করুন এবং বাকিটা আমরা সামলে নেব।",
//     languageLabel: "ভাষা",
//     imageLabel: "মাটির ছবি",
//     uploadPrompt: "ছবি আপলোড করতে ক্লিক করুন",
//     uploadHint: "অথবা টেনে আনুন",
//     locationLabel: "অবস্থান",
//     fetchingLocation: "অবস্থান আনা হচ্ছে...",
//     locationAcquired: "অবস্থান অর্জিত হয়েছে",
//     locationDisabled: "অবস্থান নিষ্ক্রিয়",
//     locationCoords: "অক্ষাংশ: {lat}, দ্রাঘিমাংশ: {lng}",
//     errorTitle: "ত্রুটি",
//     analyzeButton: "আমার সুপারিশ পান",
//     analyzingButton: "বিশ্লেষণ করা হচ্ছে...",
//     startNewAnalysis: "নতুন বিশ্লেষণ শুরু করুন",
//     errorGettingLocation: "অবস্থান পেতে ত্রুটি: {message}। অনুগ্রহ করে অবস্থান পরিষেবা সক্ষম করুন বা আবার চেষ্টা করুন।",
//     errorMissingInput: "অনুগ্রহ করে মাটির ছবি এবং আপনার অবস্থান উভয়ই প্রদান করুন।",
//     errorReadingImage: "ছবি ফাইল পড়তে ব্যর্থ হয়েছে।",
//     errorUnknown: "একটি অজানা ত্রুটি ঘটেছে।",
//     recommendedCropsTitle: "প্রস্তাবিত ফসল",
//     recommendedCropsDescription: "আপনার মাটি এবং জলবায়ুর উপর ভিত্তি করে, আমরা নিম্নলিখিত ফসলগুলির সুপারিশ করছি:",
//     soilAnalysisTitle: "মাটি বিশ্লেষণ",
//     soilTextureLabel: "গঠন",
//     soilConditionLabel: "অবস্থা",
//     climateOverviewTitle: "জলবায়ু পরিদর্শন",
//     climateRegionLabel: "অঞ্চল",
//     climateClimateLabel: "জলবায়ু",
//     detectLocationButton: "আমার অবস্থান সনাক্ত করুন",
//   }
// };

// export default function AnnadataAIPage() {
//   const [language, setLanguage] = useState("en");
//   const [location, setLocation] = useState<Location | null>(null);
//   const [imageFile, setImageFile] = useState<File | null>(null);
//   const [imagePreview, setImagePreview] = useState<string | null>(null);

//   const [isLoading, setIsLoading] = useState(false);
//   const [isGettingLocation, setIsGettingLocation] = useState(false);
//   const [locationError, setLocationError] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const t = translations[language];

//   const fetchLocation = () => {
//     setIsGettingLocation(true);
//     setLocationError(false);
//     setError(null);
//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         setLocation({
//           latitude: position.coords.latitude,
//           longitude: position.coords.longitude,
//         });
//         setIsGettingLocation(false);
//       },
//       (err) => {
//         setError(t.errorGettingLocation.replace('{message}', err.message));
//         setLocationError(true);
//         setIsGettingLocation(false);
//       },
//       { timeout: 15000 }
//     );
//   };
  
//   useEffect(() => {
//     fetchLocation();
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       setImageFile(file);
//       setError(null); // Clear previous errors
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setImagePreview(reader.result as string);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleSubmit = async (event: FormEvent) => {
//     event.preventDefault();
//     if (!imageFile || !location) {
//       setError(t.errorMissingInput);
//       return;
//     }

//     setIsLoading(true);
//     setError(null);
//     setAnalysisResult(null);

//     try {
//       const reader = new FileReader();
//       reader.readAsDataURL(imageFile);
//       reader.onload = async () => {
//         const photoDataUri = reader.result as string;
//         const result = await getAnalysis(
//           photoDataUri,
//           location.latitude,
//           location.longitude,
//           language
//         );

//         if (result.error) {
//           setError(result.error);
//         } else {
//           setAnalysisResult(result);
//         }
//         setIsLoading(false);
//       };
//       reader.onerror = () => {
//         setError(t.errorReadingImage);
//         setIsLoading(false);
//       }
//     } catch (err) {
//       setError(err instanceof Error ? err.message : t.errorUnknown);
//       setIsLoading(false);
//     }
//   };
  
//   const handleReset = () => {
//     setAnalysisResult(null);
//     setImageFile(null);
//     setImagePreview(null);
//     setError(null);
//     setIsLoading(false);
//     setLocation(null);
//     setLocationError(false);
//     fetchLocation();
//     if (fileInputRef.current) {
//         fileInputRef.current.value = "";
//     }
//   };

//   const isFormComplete = location && imageFile;

//   return (
//     <main className="min-h-screen w-full bg-gradient-to-br from-background to-secondary/30 flex flex-col items-center p-4 sm:p-6 lg:p-8">
//       <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
//         <header className="text-center mb-10">
//           <div className="inline-flex items-center gap-3 mb-2">
//             <Leaf className="h-12 w-12 text-primary" />
//             <h1 className="text-5xl sm:text-6xl font-bold font-headline text-primary-foreground tracking-tight">
//               {t.title}
//             </h1>
//           </div>
//           <p className="text-xl text-muted-foreground">
//             {t.subtitle}
//           </p>
//         </header>

//         {!analysisResult && !isLoading && (
//             <Card className="w-full shadow-2xl bg-card/80 backdrop-blur-sm border-2 border-primary/20 animate-in fade-in-0 duration-500">
//             <form onSubmit={handleSubmit}>
//                 <CardHeader>
//                 <CardTitle className="text-3xl font-headline text-center">{t.cardTitle}</CardTitle>
//                 <CardDescription className="text-center text-lg">
//                     {t.cardDescription}
//                 </CardDescription>
//                 </CardHeader>
//                 <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
//                 {/* Column 1: Language */}
//                 <div className="flex flex-col justify-center space-y-4">
//                     <Label htmlFor="language-select" className="flex items-center justify-center gap-2 text-xl font-semibold">
//                         <Languages className="h-6 w-6" /> {t.languageLabel}
//                     </Label>
//                     <Select value={language} onValueChange={setLanguage}>
//                         <SelectTrigger id="language-select" className="text-lg h-14">
//                         <SelectValue placeholder="Select language" />
//                         </SelectTrigger>
//                         <SelectContent>
//                         <SelectItem value="en">English</SelectItem>
//                         <SelectItem value="kn">ಕನ್ನಡ (Kannada)</SelectItem>
//                         <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
//                         <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
//                         <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
//                         <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
//                         </SelectContent>
//                     </Select>
//                 </div>

//                 {/* Column 2: Image Upload */}
//                 <div className="flex flex-col items-center justify-center space-y-4">
//                     <Label htmlFor="soil-image" className="flex items-center gap-2 text-xl font-semibold">
//                         <Camera className="h-6 w-6" /> {t.imageLabel}
//                     </Label>
//                     <div 
//                     className="w-full h-48 border-2 border-dashed border-primary/50 rounded-lg flex items-center justify-center text-muted-foreground cursor-pointer hover:border-primary hover:bg-primary/10 transition-colors"
//                     onClick={() => fileInputRef.current?.click()}
//                     >
//                     <input
//                         ref={fileInputRef}
//                         id="soil-image"
//                         type="file"
//                         accept="image/*"
//                         className="hidden"
//                         onChange={handleImageChange}
//                     />
//                     {imagePreview ? (
//                         <Image
//                         src={imagePreview}
//                         alt="Soil preview"
//                         width={200}
//                         height={200}
//                         className="h-full w-full object-cover rounded-md"
//                         />
//                     ) : (
//                         <div className="text-center p-4">
//                         <Upload className="mx-auto h-10 w-10 mb-2" />
//                         <p className="font-semibold">{t.uploadPrompt}</p>
//                         <p className="text-xs">{t.uploadHint}</p>
//                         </div>
//                     )}
//                     </div>
//                     {imageFile && (
//                         <p className="text-sm text-muted-foreground text-center animate-in fade-in-20">
//                             {imageFile.name}
//                         </p>
//                     )}
//                 </div>

//                 {/* Column 3: Geolocation */}
//                 <div className="flex flex-col justify-center items-center space-y-4">
//                     <Label className="flex items-center justify-center gap-2 text-xl font-semibold">
//                         <MapPin className="h-6 w-6" /> {t.locationLabel}
//                     </Label>
//                     <div className="w-full h-14 text-lg bg-secondary/50 rounded-md flex items-center justify-center text-center px-2">
//                         {isGettingLocation ? (
//                         <>
//                             <Loader2 className="mr-2 h-5 w-5 animate-spin" />
//                             {t.fetchingLocation}
//                         </>
//                         ) : location ? (
//                         <>
//                             <CheckCircle2 className="mr-2 h-6 w-6 text-green-500 flex-shrink-0" />
//                             {t.locationAcquired}
//                         </>
//                         ) : (
//                         <>
//                             <AlertTriangle className="mr-2 h-6 w-6 text-destructive flex-shrink-0" />
//                             {t.locationDisabled}
//                         </>
//                         )}
//                     </div>
//                     {location && !isGettingLocation && (
//                         <p className="text-sm text-muted-foreground text-center animate-in fade-in-20">
//                             {t.locationCoords.replace('{lat}', location.latitude.toFixed(4)).replace('{lng}', location.longitude.toFixed(4))}
//                         </p>
//                     )}
//                      {locationError && !isGettingLocation && (
//                         <Button onClick={fetchLocation} variant="outline" size="sm" className="w-full">
//                            <RefreshCw className="mr-2 h-4 w-4" />
//                            {t.detectLocationButton}
//                         </Button>
//                     )}
//                     </div>
//                 </CardContent>
//                 <CardFooter className="flex-col items-stretch gap-4 px-8 pb-8">
//                 {error && (
//                     <Alert variant="destructive" className="bg-destructive/20">
//                     <AlertTriangle className="h-4 w-4 text-destructive" />
//                     <AlertTitle className="text-destructive-foreground">{t.errorTitle}</AlertTitle>
//                     <AlertDescription className="text-destructive-foreground/80">{error}</AlertDescription>
//                     </Alert>
//                 )}
//                 <Button type="submit" size="lg" className="w-full h-16 text-2xl font-bold tracking-wider" disabled={!isFormComplete || isLoading}>
//                     {isLoading ? (
//                     <>
//                         <Loader2 className="mr-2 h-8 w-8 animate-spin" />
//                         {t.analyzingButton}
//                     </>
//                     ) : (
//                         t.analyzeButton
//                     )}
//                 </Button>
//                 </CardFooter>
//             </form>
//             </Card>
//         )}

//         <AnalysisResultDisplay result={analysisResult} isLoading={isLoading} t={t}/>

//         {analysisResult && !isLoading && (
//             <div className="mt-8 animate-in fade-in-0 duration-500">
//                 <Button onClick={handleReset} size="lg" className="h-14 text-xl font-bold">
//                     <RefreshCw className="mr-2 h-6 w-6" />
//                     {t.startNewAnalysis}
//                 </Button>
//             </div>
//         )}
//       </div>
//     </main>
//   );
// }