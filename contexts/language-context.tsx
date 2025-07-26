"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type Language = "en" | "hi" | "kn"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Translation objects
const translations = {
  en: {
    // Landing Page
    "landing.title": "Instant AI-Powered Crop Disease Diagnosis",
    "landing.description":
      "Upload or capture crop images to get instant disease identification, treatment recommendations, and expert agricultural guidance powered by advanced AI.",
    "landing.launch": "Launch App",
    "landing.free": "Free to Use",
    "landing.selectLanguage": "Select Language",

    // Typing Prompts
    "prompts.tomato": "My tomato plants have brown spots on the leaves...",
    "prompts.cucumber": "White powdery substance on cucumber leaves...",
    "prompts.pepper": "Yellow wilting leaves on my pepper plants...",
    "prompts.corn": "Small holes in corn leaves with brown edges...",
    "prompts.potato": "Black spots appearing on potato plant stems...",

    // Crop Doctor Page
    "crop.title": "AI Crop Doctor",
    "crop.analyze": "Analyze your crop for diseases",
    "crop.description":
      "Upload or take a photo of your crop to get instant AI-powered disease diagnosis and treatment recommendations.",
    "crop.backHome": "Back to Home",
    "crop.home": "Home",
    "crop.newAnalysis": "New Analysis",
    "crop.uploadImage": "Upload crop image",
    "crop.fileFormat": "PNG, JPG up to 10MB",
    "crop.chooseFile": "Choose File",
    "crop.takePhoto": "Take Photo",
    "crop.analyzing": "Analyzing your crop image...",
    "crop.ready": "Ready to analyze your crop image",
    "crop.analyzeCrop": "Analyze Crop",

    // Tabs
    "tabs.answer": "Answer",
    "tabs.sources": "Sources & Remedies",
    "tabs.treatment": "Treatment",

    // Disease Detection
    "disease.detected": "Disease Detected",
    "disease.affected": "Your crop appears to be affected by",
    "disease.scientificName": "Scientific Name:",
    "disease.affectedCrop": "Affected Crop:",
    "disease.affectedCrops": "Crops that can be affected:",
    "disease.overview": "Disease Overview",
    "disease.whatIs": "What is",
    "disease.symptoms": "Symptoms & Damage",
    "disease.treatment": "Treatment Recommendations",

    // Treatment Methods
    "treatment.cultural": "Cultural Control Methods",
    "treatment.biological": "Biological Control Methods",
    "treatment.chemical": "Chemical Control Methods",
    "treatment.warning":
      "Always read and follow label instructions. Wear protective equipment when applying chemicals.",
    "treatment.products": "Products:",
    "treatment.recommended": "Recommended products:",

    // Sources
    "sources.title": "Research Sources & Additional Information",

    // Chatbot
    "chatbot.title": "Farm Assistant",
    "chatbot.subtitle": "Ask me anything about farming",
    "chatbot.welcome":
      "Hello! I'm your AI farming assistant. I'm here to help you with all your agricultural questions and provide expert guidance for better crop management.",
    "chatbot.selectLanguage": "Please select your preferred language for our conversation:",
    "chatbot.placeholder": "Ask me about farming, crops, diseases, or treatments...",
    "chatbot.selectLanguageFirst": "Please select a language first",

    // Languages
    "lang.english": "English",
    "lang.hindi": "हिंदी",
    "lang.kannada": "ಕನ್ನಡ",
  },
  hi: {
    // Landing Page
    "landing.title": "तत्काल AI-संचालित फसल रोग निदान",
    "landing.description":
      "उन्नत AI द्वारा संचालित तत्काल रोग पहचान, उपचार सिफारिशें और विशेषज्ञ कृषि मार्गदर्शन प्राप्त करने के लिए फसल की छवियां अपलोड या कैप्चर करें।",
    "landing.launch": "ऐप लॉन्च करें",
    "landing.free": "उपयोग के लिए निःशुल्क",
    "landing.selectLanguage": "भाषा चुनें",

    // Typing Prompts
    "prompts.tomato": "मेरे टमाटर के पौधों की पत्तियों पर भूरे धब्बे हैं...",
    "prompts.cucumber": "खीरे की पत्तियों पर सफेद पाउडर जैसा पदार्थ...",
    "prompts.pepper": "मेरे मिर्च के पौधों की पत्तियां पीली होकर मुरझा रही हैं...",
    "prompts.corn": "मक्के की पत्तियों में भूरे किनारों के साथ छोटे छेद...",
    "prompts.potato": "आलू के पौधे के तने पर काले धब्बे दिखाई दे रहे हैं...",

    // Crop Doctor Page
    "crop.title": "AI फसल डॉक्टर",
    "crop.analyze": "अपनी फसल में बीमारियों का विश्लेषण करें",
    "crop.description": "तत्काल AI-संचालित रोग निदान और उपचार सिफारिशें प्राप्त करने के लिए अपनी फसल की फोटो अपलोड या लें।",
    "crop.backHome": "घर वापस",
    "crop.home": "घर",
    "crop.newAnalysis": "नया विश्लेषण",
    "crop.uploadImage": "फसल की छवि अपलोड करें",
    "crop.fileFormat": "PNG, JPG 10MB तक",
    "crop.chooseFile": "फ़ाइल चुनें",
    "crop.takePhoto": "फोटो लें",
    "crop.analyzing": "आपकी फसल की छवि का विश्लेषण कर रहे हैं...",
    "crop.ready": "आपकी फसल की छवि का विश्लेषण करने के लिए तैयार",
    "crop.analyzeCrop": "फसल का विश्लेषण करें",

    // Tabs
    "tabs.answer": "उत्तर",
    "tabs.sources": "स्रोत और उपचार",
    "tabs.treatment": "उपचार",

    // Disease Detection
    "disease.detected": "रोग का पता चला",
    "disease.affected": "आपकी फसल प्रभावित लगती है",
    "disease.scientificName": "वैज्ञानिक नाम:",
    "disease.affectedCrop": "प्रभावित फसल:",
    "disease.affectedCrops": "प्रभावित हो सकने वाली फसलें:",
    "disease.overview": "रोग अवलोकन",
    "disease.whatIs": "क्या है",
    "disease.symptoms": "लक्षण और नुकसान",
    "disease.treatment": "उपचार सिफारिशें",

    // Treatment Methods
    "treatment.cultural": "सांस्कृतिक नियंत्रण विधियां",
    "treatment.biological": "जैविक नियंत्रण विधियां",
    "treatment.chemical": "रासायनिक नियंत्रण विधियां",
    "treatment.warning": "हमेशा लेबल निर्देशों को पढ़ें और उनका पालन करें। रसायन लगाते समय सुरक्षा उपकरण पहनें।",
    "treatment.products": "उत्पाद:",
    "treatment.recommended": "अनुशंसित उत्पाद:",

    // Sources
    "sources.title": "अनुसंधान स्रोत और अतिरिक्त जानकारी",

    // Chatbot
    "chatbot.title": "कृषि सहायक",
    "chatbot.subtitle": "खेती के बारे में कुछ भी पूछें",
    "chatbot.welcome":
      "नमस्ते! मैं आपका AI कृषि सहायक हूं। मैं आपके सभी कृषि प्रश्नों में मदद करने और बेहतर फसल प्रबंधन के लिए विशेषज्ञ मार्गदर्शन प्रदान करने के लिए यहां हूं।",
    "chatbot.selectLanguage": "कृपया हमारी बातचीत के लिए अपनी पसंदीदा भाषा चुनें:",
    "chatbot.placeholder": "खेती, फसल, रोग या उपचार के बारे में पूछें...",
    "chatbot.selectLanguageFirst": "कृपया पहले एक भाषा चुनें",

    // Languages
    "lang.english": "English",
    "lang.hindi": "हिंदी",
    "lang.kannada": "कನ್ನಡ",
  },
  kn: {
    // Landing Page
    "landing.title": "ತತ್ಕ್ಷಣ AI-ಚಾಲಿತ ಬೆಳೆ ರೋಗ ನಿರ್ಣಯ",
    "landing.description":
      "ಸುಧಾರಿತ AI ಯಿಂದ ಚಾಲಿತ ತತ್ಕ್ಷಣ ರೋಗ ಗುರುತಿಸುವಿಕೆ, ಚಿಕಿತ್ಸೆ ಶಿಫಾರಸುಗಳು ಮತ್ತು ತಜ್ಞ ಕೃಷಿ ಮಾರ್ಗದರ್ಶನವನ್ನು ಪಡೆಯಲು ಬೆಳೆ ಚಿತ್ರಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಅಥವಾ ಸೆರೆಹಿಡಿಯಿರಿ.",
    "landing.launch": "ಅಪ್ಲಿಕೇಶನ್ ಪ್ರಾರಂಭಿಸಿ",
    "landing.free": "ಬಳಕೆಗೆ ಉಚಿತ",
    "landing.selectLanguage": "ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ",

    // Typing Prompts
    "prompts.tomato": "ನನ್ನ ಟೊಮೇಟೊ ಗಿಡಗಳ ಎಲೆಗಳ ಮೇಲೆ ಕಂದು ಬಣ್ಣದ ಚುಕ್ಕೆಗಳಿವೆ...",
    "prompts.cucumber": "ಸೌತೆಕಾಯಿ ಎಲೆಗಳ ಮೇಲೆ ಬಿಳಿ ಪುಡಿಯಂತಹ ವಸ್ತು...",
    "prompts.pepper": "ನನ್ನ ಮೆಣಸಿನಕಾಯಿ ಗಿಡಗಳ ಎಲೆಗಳು ಹಳದಿಯಾಗಿ ಬಾಡುತ್ತಿವೆ...",
    "prompts.corn": "ಜೋಳದ ಎಲೆಗಳಲ್ಲಿ ಕಂದು ಅಂಚುಗಳೊಂದಿಗೆ ಸಣ್ಣ ರಂಧ್ರಗಳು...",
    "prompts.potato": "ಆಲೂಗೆಡ್ಡೆ ಗಿಡದ ಕಾಂಡದ ಮೇಲೆ ಕಪ್ಪು ಚುಕ್ಕೆಗಳು ಕಾಣಿಸುತ್ತಿವೆ...",

    // Crop Doctor Page
    "crop.title": "AI ಬೆಳೆ ವೈದ್ಯ",
    "crop.analyze": "ರೋಗಗಳಿಗಾಗಿ ನಿಮ್ಮ ಬೆಳೆಯನ್ನು ವಿಶ್ಲೇಷಿಸಿ",
    "crop.description": "ತತ್ಕ್ಷಣ AI-ಚಾಲಿತ ರೋಗ ನಿರ್ಣಯ ಮತ್ತು ಚಿಕಿತ್ಸೆ ಶಿಫಾರಸುಗಳನ್ನು ಪಡೆಯಲು ನಿಮ್ಮ ಬೆಳೆಯ ಫೋಟೋವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಅಥವಾ ತೆಗೆದುಕೊಳ್ಳಿ.",
    "crop.backHome": "ಮನೆಗೆ ಹಿಂತಿರುಗಿ",
    "crop.home": "ಮನೆ",
    "crop.newAnalysis": "ಹೊಸ ವಿಶ್ಲೇಷಣೆ",
    "crop.uploadImage": "ಬೆಳೆ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    "crop.fileFormat": "PNG, JPG 10MB ವರೆಗೆ",
    "crop.chooseFile": "ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ",
    "crop.takePhoto": "ಫೋಟೋ ತೆಗೆದುಕೊಳ್ಳಿ",
    "crop.analyzing": "ನಿಮ್ಮ ಬೆಳೆ ಚಿತ್ರವನ್ನು ವಿಶ್ಲೇಷಿಸುತ್ತಿದ್ದೇವೆ...",
    "crop.ready": "ನಿಮ್ಮ ಬೆಳೆ ಚಿತ್ರವನ್ನು ವಿಶ್ಲೇಷಿಸಲು ಸಿದ್ಧ",
    "crop.analyzeCrop": "ಬೆಳೆ ವಿಶ್ಲೇಷಿಸಿ",

    // Tabs
    "tabs.answer": "ಉತ್ತರ",
    "tabs.sources": "ಮೂಲಗಳು ಮತ್ತು ಪರಿಹಾರಗಳು",
    "tabs.treatment": "ಚಿಕಿತ್ಸೆ",

    // Disease Detection
    "disease.detected": "ರೋಗ ಪತ್ತೆಯಾಗಿದೆ",
    "disease.affected": "ನಿಮ್ಮ ಬೆಳೆ ಪ್ರಭಾವಿತವಾಗಿರುವಂತೆ ತೋರುತ್ತದೆ",
    "disease.scientificName": "ವೈಜ್ಞಾನಿಕ ಹೆಸರು:",
    "disease.affectedCrop": "ಪ್ರಭಾವಿತ ಬೆಳೆ:",
    "disease.affectedCrops": "ಪ್ರಭಾವಿತವಾಗಬಹುದಾದ ಬೆಳೆಗಳು:",
    "disease.overview": "ರೋಗ ಅವಲೋಕನ",
    "disease.whatIs": "ಏನು",
    "disease.symptoms": "ಲಕ್ಷಣಗಳು ಮತ್ತು ಹಾನಿ",
    "disease.treatment": "ಚಿಕಿತ್ಸೆ ಶಿಫಾರಸುಗಳು",

    // Treatment Methods
    "treatment.cultural": "ಸಾಂಸ್ಕೃತಿಕ ನಿಯಂತ್ರಣ ವಿಧಾನಗಳು",
    "treatment.biological": "ಜೈವಿಕ ನಿಯಂತ್ರಣ ವಿಧಾನಗಳು",
    "treatment.chemical": "ರಾಸಾಯನಿಕ ನಿಯಂತ್ರಣ ವಿಧಾನಗಳು",
    "treatment.warning": "ಯಾವಾಗಲೂ ಲೇಬಲ್ ಸೂಚನೆಗಳನ್ನು ಓದಿ ಮತ್ತು ಅನುಸರಿಸಿ. ರಾಸಾಯನಿಕಗಳನ್ನು ಅನ್ವಯಿಸುವಾಗ ರಕ್ಷಣಾ ಸಾಧನಗಳನ್ನು ಧರಿಸಿ.",
    "treatment.products": "ಉತ್ಪಾದನೆಗಳು:",
    "treatment.recommended": "ಶಿಫಾರಸು ಮಾಡಿದ ಉತ್ಪಾದನೆಗಳು:",

    // Sources
    "sources.title": "ಸಂಶೋಧನಾ ಮೂಲಗಳು ಮತ್ತು ಹೆಚ್ಚುವರಿ ಮಾಹಿತಿ",

    // Chatbot
    "chatbot.title": "ಕೃಷಿ ಸಹಾಯಕ",
    "chatbot.subtitle": "ಕೃಷಿಯ ಬಗ್ಗೆ ಏನು ಬೇಕಾದರೂ ಕೇಳಿ",
    "chatbot.welcome":
      "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ AI ಕೃಷಿ ಸಹಾಯಕ. ನಿಮ್ಮ ಎಲ್ಲಾ ಕೃಷಿ ಪ್ರಶ್ನೆಗಳಿಗೆ ಸಹಾಯ ಮಾಡಲು ಮತ್ತು ಉತ್ತಮ ಬೆಳೆ ನಿರ್ವಹಣೆಗಾಗಿ ತಜ್ಞ ಮಾರ್ಗದರ್ಶನ ನೀಡಲು ನಾನು ಇಲ್ಲಿದ್ದೇನೆ.",
    "chatbot.selectLanguage": "ದಯವಿಟ್ಟು ನಮ್ಮ ಸಂಭಾಷಣೆಗಾಗಿ ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ:",
    "chatbot.placeholder": "ಕೃಷಿ, ಬೆಳೆಗಳು, ರೋಗಗಳು ಅಥವಾ ಚಿಕಿತ್ಸೆಗಳ ಬಗ್ಗೆ ಕೇಳಿ...",
    "chatbot.selectLanguageFirst": "ದಯವಿಟ್ಟು ಮೊದಲು ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",

    // Languages
    "lang.english": "English",
    "lang.hindi": "हिंदी",
    "lang.kannada": "ಕನ್ನಡ",
  },
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && ["en", "hi", "kn"].includes(savedLanguage)) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Save language to localStorage when it changes
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("language", lang)
  }

  // Translation function
  const t = (key: string): string => {
    return translations[language][key as keyof (typeof translations)[typeof language]] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
