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

    // Chatbot Page
    "chatbot.backToFeatures": "Back to Features",
    "chatbot.textChat": "Text Chat",
    "chatbot.avatarMode": "Avatar Mode",

    // Languages
    "lang.english": "English",
    "lang.hindi": "हिंदी",
    "lang.kannada": "ಕನ್ನಡ",

    // Features Page
    "features.title": "Features",
    "features.description":
      "Discover our comprehensive suite of AI-powered agricultural tools designed to revolutionize your farming experience",
    "features.backToHome": "Back to Home",
    "features.getStarted": "Get Started",
    "features.comingSoon": "Coming Soon",
    "features.moreFeaturesTitle": "More Features Coming Soon",
    "features.moreFeaturesDescription":
      "We're constantly working to bring you more innovative agricultural tools. Stay tuned for market analysis, smart mapping, weather forecasting, and much more!",
    "features.developmentInProgress": "Development in Progress",

    "features.cropAnalysis.title": "Crop Analysis",
    "features.cropAnalysis.description":
      "Analyze your crops using AI-powered image recognition technology for instant disease detection and treatment recommendations",
    "features.cropAnalysis.feature1": "AI Disease Detection",
    "features.cropAnalysis.feature2": "Instant Results",
    "features.cropAnalysis.feature3": "Treatment Plans",

    "features.chatbot.title": "AI Assistant",
    "features.chatbot.description":
      "Get personalized farming advice and expert guidance from our intelligent chatbot with multi-language support",
    "features.chatbot.feature1": "24/7 Support",
    "features.chatbot.feature2": "Voice Recognition",
    "features.chatbot.feature3": "Multi-Language",

    "features.marketAnalysis.title": "Market Analysis",
    "features.marketAnalysis.description":
      "Access real-time market trends, pricing insights, and crop demand forecasting tools for better decisions",
    "features.marketAnalysis.feature1": "Price Trends",
    "features.marketAnalysis.feature2": "Demand Forecast",
    "features.marketAnalysis.feature3": "Market Insights",

    "features.maps.title": "Smart Maps",
    "features.maps.description":
      "Explore agricultural mapping, weather patterns, soil analysis, and location-based farming insights",
    "features.maps.feature1": "Weather Data",
    "features.maps.feature2": "Soil Analysis",
    "features.maps.feature3": "Location Insights",

    // Government Schemes
    "schemes.title": "Government Schemes",
    "schemes.subtitle": "AI-powered scheme assistance",
    "schemes.selectScheme": "Select a scheme to explore documents and get AI-powered assistance",
    "schemes.uploadDoc": "Upload Text Document to Chat",
    "schemes.uploadDescription": "Upload your own TXT document to analyze and chat with",
    "schemes.chat": "Chat with Scheme",
    "schemes.upload": "Upload Document",
    "schemes.analyzing": "Analyzing...",
    "schemes.askQuestion": "Ask about the scheme or uploaded document...",
    "schemes.changeScheme": "Change Scheme",
    "schemes.documentUploaded": "Document uploaded successfully!",
    "schemes.backToFeatures": "Back to Features",
    "schemes.backToSelection": "Back to Selection",
    "schemes.documentUploadChat": "Document Upload & Chat",
    "schemes.uploadTxtDocument": "Upload and chat with your own TXT document",
    "schemes.activeNamespace": "Active namespace:",
    "schemes.uploadTxtFile": "Upload TXT Document",
    "schemes.documentProcessed": "Document Processed",
    "schemes.supportedFormat": "Supported format: TXT files only (UTF-8 encoded)",
    "schemes.maxFileSize": "Maximum file size: 5MB",
    "schemes.askAboutDocument": "Ask about your document...",
    "schemes.uploadDocumentFirst": "Upload a TXT document first...",
    "schemes.askAboutScheme": "Ask about the scheme...",
    "schemes.readingText": "Reading text from file...",
    "schemes.processedSuccessfully": "Document processed successfully!",
    "schemes.analyzedSections":
      "I've analyzed {count} sections of your document. You can now ask me questions about its content.",
    "schemes.uploadTxtWelcome":
      "Welcome! Please upload a TXT document to start chatting with it. I'll analyze the document and answer your questions based on its content.",
    "schemes.uploadProcessError": "Please upload and process a TXT document first before asking questions.",
    "schemes.uploadError":
      "Sorry, there was an error processing your document. Please try again with a valid TXT file.",
    "schemes.processingError": "Sorry, there was an error processing your request. Please try again.",
    "schemes.welcomeScheme":
      "Welcome! I can help you with information about {scheme}. Ask me anything about this scheme.",
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

    // Chatbot Page
    "chatbot.backToFeatures": "सुविधाओं पर वापस",
    "chatbot.textChat": "टेक्स्ट चैट",
    "chatbot.avatarMode": "अवतार मोड",

    // Languages
    "lang.english": "English",
    "lang.hindi": "हिंदी",
    "lang.kannada": "ಕನ್ನಡ",

    // Features Page
    "features.title": "सुविधाएं",
    "features.description":
      "अपने कृषि अनुभव में क्रांति लाने के लिए डिज़ाइन किए गए AI-संचालित कृषि उपकरणों के हमारे व्यापक सूट की खोज करें",
    "features.backToHome": "घर वापस",
    "features.getStarted": "शुरू करें",
    "features.comingSoon": "जल्द आ रहा है",
    "features.moreFeaturesTitle": "और सुविधाएं जल्द आ रही हैं",
    "features.moreFeaturesDescription":
      "हम लगातार आपके लिए और भी नवाचार कृषि उपकरण लाने पर काम कर रहे हैं। बाजार विश्लेषण, स्मार्ट मैपिंग, मौसम पूर्वानुमान और बहुत कुछ के लिए बने रहें!",
    "features.developmentInProgress": "विकास प्रगति में है",

    "features.cropAnalysis.title": "फसल विश्लेषण",
    "features.cropAnalysis.description":
      "तत्काल रोग पहचान और उपचार सिफारिशों के लिए AI-संचालित छवि पहचान तकनीक का उपयोग करके अपनी फसलों का विश्लेषण करें",
    "features.cropAnalysis.feature1": "AI रोग पहचान",
    "features.cropAnalysis.feature2": "तत्काल परिणाम",
    "features.cropAnalysis.feature3": "उपचार योजनाएं",

    "features.chatbot.title": "AI सहायक",
    "features.chatbot.description":
      "बहुभाषी समर्थन के साथ हमारे बुद्धिमान चैटबॉट से व्यक्तिगत कृषि सलाह और विशेषज्ञ मार्गदर्शन प्राप्त करें",
    "features.chatbot.feature1": "24/7 सहायता",
    "features.chatbot.feature2": "आवाज पहचान",
    "features.chatbot.feature3": "बहुभाषी",

    "features.marketAnalysis.title": "बाजार विश्लेषण",
    "features.marketAnalysis.description":
      "बेहतर निर्णयों के लिए वास्तविक समय बाजार रुझान, मूल्य निर्धारण अंतर्दृष्टि और फसल मांग पूर्वानुमान उपकरणों तक पहुंच",
    "features.marketAnalysis.feature1": "मूल्य रुझान",
    "features.marketAnalysis.feature2": "मांग पूर्वानुमान",
    "features.marketAnalysis.feature3": "बाजार अंतर्दृष्टि",

    "features.maps.title": "स्मार्ट मैप्स",
    "features.maps.description": "कृषि मैपिंग, मौसम पैटर्न, मिट्टी विश्लेषण और स्थान-आधारित कृषि अंतर्दृष्टि का अन्वेषण करें",
    "features.maps.feature1": "मौसम डेटा",
    "features.maps.feature2": "मिट्टी विश्लेषण",
    "features.maps.feature3": "स्थान अंतर्दृष्टि",

    // Government Schemes
    "schemes.title": "सरकारी योजनाएं",
    "schemes.subtitle": "AI-संचालित योजना सहायता",
    "schemes.selectScheme": "दस्तावेजों का अन्वेषण करने और AI-संचालित सहायता प्राप्त करने के लिए एक योजना चुनें",
    "schemes.uploadDoc": "चैट के लिए टेक्स्ट दस्तावेज़ अपलोड करें",
    "schemes.uploadDescription": "विश्लेषण और चैट के लिए अपना TXT दस्तावेज़ अपलोड करें",
    "schemes.chat": "योजना के साथ चैट करें",
    "schemes.upload": "दस्तावेज़ अपलोड करें",
    "schemes.analyzing": "विश्लेषण कर रहे हैं...",
    "schemes.askQuestion": "योजना या अपलोड किए गए दस्तावेज़ के बारे में पूछें...",
    "schemes.changeScheme": "योजना बदलें",
    "schemes.documentUploaded": "दस्तावेज़ सफलतापूर्वक अपलोड हुआ!",
    "schemes.backToFeatures": "सुविधाओं पर वापस",
    "schemes.backToSelection": "चयन पर वापस",
    "schemes.documentUploadChat": "दस्तावेज़ अपलोड और चैट",
    "schemes.uploadTxtDocument": "अपना TXT दस्तावेज़ अपलोड करें और उसके साथ चैट करें",
    "schemes.activeNamespace": "सक्रिय नेमस्पेस:",
    "schemes.uploadTxtFile": "TXT दस्तावेज़ अपलोड करें",
    "schemes.documentProcessed": "दस्तावेज़ प्रोसेस हो गया",
    "schemes.supportedFormat": "समर्थित प्रारूप: केवल TXT फ़ाइलें (UTF-8 एन्कोडेड)",
    "schemes.maxFileSize": "अधिकतम फ़ाइल आकार: 5MB",
    "schemes.askAboutDocument": "अपने दस्तावेज़ के बारे में पूछें...",
    "schemes.uploadDocumentFirst": "पहले एक TXT दस्तावेज़ अपलोड करें...",
    "schemes.askAboutScheme": "योजना के बारे में पूछें...",
    "schemes.readingText": "फ़ाइल से टेक्स्ट पढ़ रहे हैं...",
    "schemes.processedSuccessfully": "दस्तावेज़ सफलतापूर्वक प्रोसेस हुआ!",
    "schemes.analyzedSections":
      "मैंने आपके दस्तावेज़ के {count} अनुभागों का विश्लेषण किया है। अब आप इसकी सामग्री के बारे में मुझसे प्रश्न पूछ सकते हैं।",
    "schemes.uploadTxtWelcome":
      "स्वागत है! कृपया एक TXT दस्तावेज़ अपलोड करें और उसके साथ चैट शुरू करें। मैं दस्तावेज़ का विश्लेषण करूंगा और इसकी सामग्री के आधार पर आपके प्रश्नों का उत्तर दूंगा।",
    "schemes.uploadProcessError": "प्रश्न पूछने से पहले कृपया एक TXT दस्तावेज़ अपलोड और प्रोसेस करें।",
    "schemes.uploadError": "खुशी है, आपके दस्तावेज़ को प्रोसेस करने में त्रुटि हुई। कृपया एक वैध TXT फ़ाइल के साथ पुनः प्रयास करें।",
    "schemes.processingError": "खुशी है, आपके अनुरोध को प्रोसेस करने में त्रुटि हुई। कृपया पुनः प्रयास करें।",
    "schemes.welcomeScheme":
      "स्वागत है! मैं {scheme} के बारे में जानकारी के साथ आपकी सहायता कर सकता हूं। इस योजना के बारे में कुछ भी पूछें।",
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

    // Chatbot Page
    "chatbot.backToFeatures": "ವೈಶಿಷ್ಟ್ಯಗಳಿಗೆ ಹಿಂತಿರುಗಿ",
    "chatbot.textChat": "ಪಠ್ಯ ಚಾಟ್",
    "chatbot.avatarMode": "ಅವತಾರ್ ಮೋಡ್",

    // Languages
    "lang.english": "English",
    "lang.hindi": "हिंदी",
    "lang.kannada": "ಕನ್ನಡ",

    // Features Page
    "features.title": "ವೈಶಿಷ್ಟ್ಯಗಳು",
    "features.description": "ನಿಮ್ಮ ಕೃಷಿ ಅನುಭವವನ್ನು ಕ್ರಾಂತಿಗೊಳಿಸಲು ವಿನ್ಯಾಸಗೊಳಿಸಲಾದ AI-ಚಾಲಿತ ಕೃಷಿ ಸಾಧನಗಳ ನಮ್ಮ ಸಮಗ್ರ ಸೂಟ್ ಅನ್ನು ಅನ್ವೇಷಿಸಿ",
    "features.backToHome": "ಮನೆಗೆ ಹಿಂತಿರುಗಿ",
    "features.getStarted": "ಪ್ರಾರಂಭಿಸಿ",
    "features.comingSoon": "ಶೀಘ್ರದಲ್ಲೇ ಬರುತ್ತಿದೆ",
    "features.moreFeaturesTitle": "ಹೆಚ್ಚಿನ ವೈಶಿಷ್ಟ್ಯಗಳು ಶೀಘ್ರದಲ್ಲೇ ಬರುತ್ತಿವೆ",
    "features.moreFeaturesDescription":
      "ನಿಮಗೆ ಹೆಚ್ಚು ನವೀನ ಕೃಷಿ ಸಾಧನಗಳನ್ನು ತರಲು ನಾವು ನಿರಂತರವಾಗಿ ಕೆಲಸ ಮಾಡುತ್ತಿದ್ದೇವೆ. ಮಾರುಕಟ್ಟೆ ವಿಶ್ಲೇಷಣೆ, ಸ್ಮಾರ್ಟ್ ಮ್ಯಾಪಿಂಗ್, ಹವಾಮಾನ ಮುನ್ನೋಟ ಮತ್ತು ಇನ್ನೂ ಹೆಚ್ಚಿನವುಗಳಿಗಾಗಿ ಕಾಯಿರಿ!",
    "features.developmentInProgress": "ಅಭಿವೃದ್ಧಿ ಪ್ರಗತಿಯಲ್ಲಿದೆ",

    "features.cropAnalysis.title": "ಬೆಳೆ ವಿಶ್ಲೇಷಣೆ",
    "features.cropAnalysis.description":
      "ತತ್ಕ್ಷಣ ರೋಗ ಪತ್ತೆ ಮತ್ತು ಚಿಕಿತ್ಸೆ ಶಿಫಾರಸುಗಳಿಗಾಗಿ AI-ಚಾಲಿತ ಚಿತ್ರ ಗುರುತಿಸುವಿಕೆ ತಂತ್ರಜ್ಞಾನವನ್ನು ಬಳಸಿಕೊಂಡು ನಿಮ್ಮ ಬೆಳೆಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಿ",
    "features.cropAnalysis.feature1": "AI ರೋಗ ಪತ್ತೆ",
    "features.cropAnalysis.feature2": "ತತ್ಕ್ಷಣ ಫಲಿತಾಂಶಗಳು",
    "features.cropAnalysis.feature3": "ಚಿಕಿತ್ಸೆ ಯೋಜನೆಗಳು",

    "features.chatbot.title": "AI ಸಹಾಯಕ",
    "features.chatbot.description": "ಬಹುಭಾಷಾ ಬೆಂಬಲದೊಂದಿಗೆ ನಮ್ಮ ಬುದ್ಧಿವಂತ ಚಾಟ್‌ಬಾಟ್‌ನಿಂದ ವೈಯಕ್ತಿಕ ಕೃಷಿ ಸಲಹೆ ಮತ್ತು ತಜ್ಞ ಮಾರ್ಗದರ್ಶನವನ್ನು ಪಡೆಯಿರಿ",
    "features.chatbot.feature1": "24/7 ಬೆಂಬಲ",
    "features.chatbot.feature2": "ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ",
    "features.chatbot.feature3": "ಬಹುಭಾಷಾ",

    "features.marketAnalysis.title": "ಮಾರುಕಟ್ಟೆ ವಿಶ್ಲೇಷಣೆ",
    "features.marketAnalysis.description":
      "ಉತ್ತಮ ನಿರ್ಧಾರಗಳಿಗಾಗಿ ನೈಜ-ಸಮಯದ ಮಾರುಕಟ್ಟೆ ಪ್ರವೃತ್ತಿಗಳು, ಬೆಲೆ ಒಳನೋಟಗಳು ಮತ್ತು ಬೆಳೆ ಬೇಡಿಕೆ ಮುನ್ನೋಟ ಸಾಧನಗಳನ್ನು ಪ್ರವೇಶಿಸಿ",
    "features.marketAnalysis.feature1": "ಬೆಲೆ ಪ್ರವೃತ್ತಿಗಳು",
    "features.marketAnalysis.feature2": "ಬೇಡಿಕೆ ಮುನ್ನೋಟ",
    "features.marketAnalysis.feature3": "ಮಾರುಕಟ್ಟೆ ಒಳನೋಟಗಳು",

    "features.maps.title": "ಸ್ಮಾರ್ಟ್ ನಕ್ಷೆಗಳು",
    "features.maps.description": "ಕೃಷಿ ಮ್ಯಾಪಿಂಗ್, ಹವಾಮಾನ ಮಾದರಿಗಳು, ಮಣ್ಣಿನ ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ಸ್ಥಳ-ಆಧಾರಿತ ಕೃಷಿ ಒಳನೋಟಗಳನ್ನು ಅನ್ವೇಷಿಸಿ",
    "features.maps.feature1": "ಹವಾಮಾನ ಡೇಟಾ",
    "features.maps.feature2": "ಮಣ್ಣಿನ ವಿಶ್ಲೇಷಣೆ",
    "features.maps.feature3": "ಸ್ಥಳ ಒಳನೋಟಗಳು",

    // Government Schemes
    "schemes.title": "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು",
    "schemes.subtitle": "AI-ಚಾಲಿತ ಯೋಜನೆ ಸಹಾಯ",
    "schemes.selectScheme": "ದಾಖಲೆಗಳನ್ನು ಅನ್ವೇಷಿಸಲು ಮತ್ತು AI-ಚಾಲಿತ ಸಹಾಯವನ್ನು ಪಡೆಯಲು ಯೋಜನೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    "schemes.uploadDoc": "ಚಾಟ್‌ಗಾಗಿ ಪಠ್ಯ ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    "schemes.uploadDescription": "ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ಚಾಟ್‌ಗಾಗಿ ನಿಮ್ಮ TXT ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    "schemes.chat": "ಯೋಜನೆಯೊಂದಿಗೆ ಚಾಟ್ ಮಾಡಿ",
    "schemes.upload": "ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    "schemes.analyzing": "ವಿಶ್ಲೇಷಿಸುತ್ತಿದೆ...",
    "schemes.askQuestion": "ಯೋಜನೆ ಅಥವಾ ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ದಾಖಲೆಯ ಬಗ್ಗೆ ಕೇಳಿ...",
    "schemes.changeScheme": "ಯೋಜನೆ ಬದಲಾಯಿಸಿ",
    "schemes.documentUploaded": "ದಾಖಲೆ ಯಶಸ್ವಿಯಾಗಿ ಅಪ್‌ಲೋಡ್ ಆಗಿದೆ!",
    "schemes.backToFeatures": "ವೈಶಿಷ್ಟ್ಯಗಳಿಗೆ ಹಿಂತಿರುಗಿ",
    "schemes.backToSelection": "ಆಯ್ಕೆಗೆ ಹಿಂತಿರುಗಿ",
    "schemes.documentUploadChat": "ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ ಮತ್ತು ಚಾಟ್",
    "schemes.uploadTxtDocument": "ನಿಮ್ಮ TXT ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಮತ್ತು ಅದರೊಂದಿಗೆ ಚಾಟ್ ಮಾಡಿ",
    "schemes.activeNamespace": "ಸಕ್ರಿಯ ನೇಮ್‌ಸ್ಪೇಸ್:",
    "schemes.uploadTxtFile": "TXT ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    "schemes.documentProcessed": "ದಾಖಲೆ ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲಾಗಿದೆ",
    "schemes.supportedFormat": "ಬೆಂಬಲಿತ ಸ್ವರೂಪ: ಕೇವಲ TXT ಫೈಲ್‌ಗಳು (UTF-8 ಎನ್‌ಕೋಡೆಡ್)",
    "schemes.maxFileSize": "ಗರಿಷ್ಠ ಫೈಲ್ ಗಾತ್ರ: 5MB",
    "schemes.askAboutDocument": "ನಿಮ್ಮ ದಾಖಲೆಯ ಬಗ್ಗೆ ಕೇಳಿ...",
    "schemes.uploadDocumentFirst": "ಮೊದಲು TXT ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ...",
    "schemes.askAboutScheme": "ಯೋಜನೆಯ ಬಗ್ಗೆ ಕೇಳಿ...",
    "schemes.readingText": "ಫೈಲ್‌ನಿಂದ ಪಠ್ಯ ಓದುತ್ತಿದೆ...",
    "schemes.processedSuccessfully": "ದಾಖಲೆ ಯಶಸ್ವಿಯಾಗಿ ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲಾಗಿದೆ!",
    "schemes.analyzedSections":
      "ನಾನು ನಿಮ್ಮ ದಾಖಲೆಯ {count} ವಿಭಾಗಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಿದ್ದೇನೆ. ಈಗ ನೀವು ಅದರ ವಿಷಯದ ಬಗ್ಗೆ ನನ್ನಿಂದ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಬಹುದು.",
    "schemes.uploadTxtWelcome":
      "ಸ್ವಾಗತ! ದಯವಿಟ್ಟು TXT ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಮತ್ತು ಅದರೊಂದಿಗೆ ಚಾಟ್ ಪ್ರಾರಂಭಿಸಿ. ನಾನು ದಾಖಲೆಯನ್ನು ವಿಶ್ಲೇಷಿಸುತ್ತೇನೆ ಮತ್ತು ಅದರ ವಿಷಯದ ಆಧಾರದ ಮೇಲೆ ನಿಮ್ಮ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಿಸುತ್ತೇನೆ.",
    "schemes.uploadProcessError": "ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳುವ ಮೊದಲು ದಯವಿಟ್ಟು TXT ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಮತ್ತು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಿ.",
    "schemes.uploadError": "ಕ್ಷಮಿಸಿ, ನಿಮ್ಮ ದಾಖಲೆಯನ್ನು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸುವಲ್ಲಿ ದೋಷವಿದೆ. ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ TXT ಫೈಲ್‌ನೊಂದಿಗೆ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    "schemes.processingError": "ಕ್ಷಮಿಸಿ, ನಿಮ್ಮ ವಿನಂತಿಯನ್ನು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸುವಲ್ಲಿ ದೋಷವಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    "schemes.welcomeScheme": "ಸ್ವಾಗತ! ನಾನು {scheme} ಬಗ್ಗೆ ಮಾಹಿತಿಯೊಂದಿಗೆ ನಿಮಗೆ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ. ಈ ಯೋಜನೆಯ ಬಗ್ಗೆ ಏನು ಬೇಕಾದರೂ ಕೇಳಿ.",
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

// "use client"

// import type React from "react"
// import { createContext, useContext, useState, useEffect } from "react"

// type Language = "en" | "hi" | "kn"

// interface LanguageContextType {
//   language: Language
//   setLanguage: (lang: Language) => void
//   t: (key: string) => string
// }

// const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// // Translation objects
// const translations = {
//   en: {
//     // Landing Page
//     "landing.title": "Instant AI-Powered Crop Disease Diagnosis",
//     "landing.description":
//       "Upload or capture crop images to get instant disease identification, treatment recommendations, and expert agricultural guidance powered by advanced AI.",
//     "landing.launch": "Launch App",
//     "landing.free": "Free to Use",
//     "landing.selectLanguage": "Select Language",

//     // Typing Prompts
//     "prompts.tomato": "My tomato plants have brown spots on the leaves...",
//     "prompts.cucumber": "White powdery substance on cucumber leaves...",
//     "prompts.pepper": "Yellow wilting leaves on my pepper plants...",
//     "prompts.corn": "Small holes in corn leaves with brown edges...",
//     "prompts.potato": "Black spots appearing on potato plant stems...",

//     // Crop Doctor Page
//     "crop.title": "AI Crop Doctor",
//     "crop.analyze": "Analyze your crop for diseases",
//     "crop.description":
//       "Upload or take a photo of your crop to get instant AI-powered disease diagnosis and treatment recommendations.",
//     "crop.backHome": "Back to Home",
//     "crop.home": "Home",
//     "crop.newAnalysis": "New Analysis",
//     "crop.uploadImage": "Upload crop image",
//     "crop.fileFormat": "PNG, JPG up to 10MB",
//     "crop.chooseFile": "Choose File",
//     "crop.takePhoto": "Take Photo",
//     "crop.analyzing": "Analyzing your crop image...",
//     "crop.ready": "Ready to analyze your crop image",
//     "crop.analyzeCrop": "Analyze Crop",

//     // Tabs
//     "tabs.answer": "Answer",
//     "tabs.sources": "Sources & Remedies",
//     "tabs.treatment": "Treatment",

//     // Disease Detection
//     "disease.detected": "Disease Detected",
//     "disease.affected": "Your crop appears to be affected by",
//     "disease.scientificName": "Scientific Name:",
//     "disease.affectedCrop": "Affected Crop:",
//     "disease.affectedCrops": "Crops that can be affected:",
//     "disease.overview": "Disease Overview",
//     "disease.whatIs": "What is",
//     "disease.symptoms": "Symptoms & Damage",
//     "disease.treatment": "Treatment Recommendations",

//     // Treatment Methods
//     "treatment.cultural": "Cultural Control Methods",
//     "treatment.biological": "Biological Control Methods",
//     "treatment.chemical": "Chemical Control Methods",
//     "treatment.warning":
//       "Always read and follow label instructions. Wear protective equipment when applying chemicals.",
//     "treatment.products": "Products:",
//     "treatment.recommended": "Recommended products:",

//     // Sources
//     "sources.title": "Research Sources & Additional Information",

//     // Chatbot
//     "chatbot.title": "Farm Assistant",
//     "chatbot.subtitle": "Ask me anything about farming",
//     "chatbot.welcome":
//       "Hello! I'm your AI farming assistant. I'm here to help you with all your agricultural questions and provide expert guidance for better crop management.",
//     "chatbot.selectLanguage": "Please select your preferred language for our conversation:",
//     "chatbot.placeholder": "Ask me about farming, crops, diseases, or treatments...",
//     "chatbot.selectLanguageFirst": "Please select a language first",

//     // Languages
//     "lang.english": "English",
//     "lang.hindi": "हिंदी",
//     "lang.kannada": "ಕನ್ನಡ",
//   },
//   hi: {
//     // Landing Page
//     "landing.title": "तत्काल AI-संचालित फसल रोग निदान",
//     "landing.description":
//       "उन्नत AI द्वारा संचालित तत्काल रोग पहचान, उपचार सिफारिशें और विशेषज्ञ कृषि मार्गदर्शन प्राप्त करने के लिए फसल की छवियां अपलोड या कैप्चर करें।",
//     "landing.launch": "ऐप लॉन्च करें",
//     "landing.free": "उपयोग के लिए निःशुल्क",
//     "landing.selectLanguage": "भाषा चुनें",

//     // Typing Prompts
//     "prompts.tomato": "मेरे टमाटर के पौधों की पत्तियों पर भूरे धब्बे हैं...",
//     "prompts.cucumber": "खीरे की पत्तियों पर सफेद पाउडर जैसा पदार्थ...",
//     "prompts.pepper": "मेरे मिर्च के पौधों की पत्तियां पीली होकर मुरझा रही हैं...",
//     "prompts.corn": "मक्के की पत्तियों में भूरे किनारों के साथ छोटे छेद...",
//     "prompts.potato": "आलू के पौधे के तने पर काले धब्बे दिखाई दे रहे हैं...",

//     // Crop Doctor Page
//     "crop.title": "AI फसल डॉक्टर",
//     "crop.analyze": "अपनी फसल में बीमारियों का विश्लेषण करें",
//     "crop.description": "तत्काल AI-संचालित रोग निदान और उपचार सिफारिशें प्राप्त करने के लिए अपनी फसल की फोटो अपलोड या लें।",
//     "crop.backHome": "घर वापस",
//     "crop.home": "घर",
//     "crop.newAnalysis": "नया विश्लेषण",
//     "crop.uploadImage": "फसल की छवि अपलोड करें",
//     "crop.fileFormat": "PNG, JPG 10MB तक",
//     "crop.chooseFile": "फ़ाइल चुनें",
//     "crop.takePhoto": "फोटो लें",
//     "crop.analyzing": "आपकी फसल की छवि का विश्लेषण कर रहे हैं...",
//     "crop.ready": "आपकी फसल की छवि का विश्लेषण करने के लिए तैयार",
//     "crop.analyzeCrop": "फसल का विश्लेषण करें",

//     // Tabs
//     "tabs.answer": "उत्तर",
//     "tabs.sources": "स्रोत और उपचार",
//     "tabs.treatment": "उपचार",

//     // Disease Detection
//     "disease.detected": "रोग का पता चला",
//     "disease.affected": "आपकी फसल प्रभावित लगती है",
//     "disease.scientificName": "वैज्ञानिक नाम:",
//     "disease.affectedCrop": "प्रभावित फसल:",
//     "disease.affectedCrops": "प्रभावित हो सकने वाली फसलें:",
//     "disease.overview": "रोग अवलोकन",
//     "disease.whatIs": "क्या है",
//     "disease.symptoms": "लक्षण और नुकसान",
//     "disease.treatment": "उपचार सिफारिशें",

//     // Treatment Methods
//     "treatment.cultural": "सांस्कृतिक नियंत्रण विधियां",
//     "treatment.biological": "जैविक नियंत्रण विधियां",
//     "treatment.chemical": "रासायनिक नियंत्रण विधियां",
//     "treatment.warning": "हमेशा लेबल निर्देशों को पढ़ें और उनका पालन करें। रसायन लगाते समय सुरक्षा उपकरण पहनें।",
//     "treatment.products": "उत्पाद:",
//     "treatment.recommended": "अनुशंसित उत्पाद:",

//     // Sources
//     "sources.title": "अनुसंधान स्रोत और अतिरिक्त जानकारी",

//     // Chatbot
//     "chatbot.title": "कृषि सहायक",
//     "chatbot.subtitle": "खेती के बारे में कुछ भी पूछें",
//     "chatbot.welcome":
//       "नमस्ते! मैं आपका AI कृषि सहायक हूं। मैं आपके सभी कृषि प्रश्नों में मदद करने और बेहतर फसल प्रबंधन के लिए विशेषज्ञ मार्गदर्शन प्रदान करने के लिए यहां हूं।",
//     "chatbot.selectLanguage": "कृपया हमारी बातचीत के लिए अपनी पसंदीदा भाषा चुनें:",
//     "chatbot.placeholder": "खेती, फसल, रोग या उपचार के बारे में पूछें...",
//     "chatbot.selectLanguageFirst": "कृपया पहले एक भाषा चुनें",

//     // Languages
//     "lang.english": "English",
//     "lang.hindi": "हिंदी",
//     "lang.kannada": "कನ್ನಡ",
//   },
//   kn: {
//     // Landing Page
//     "landing.title": "ತತ್ಕ್ಷಣ AI-ಚಾಲಿತ ಬೆಳೆ ರೋಗ ನಿರ್ಣಯ",
//     "landing.description":
//       "ಸುಧಾರಿತ AI ಯಿಂದ ಚಾಲಿತ ತತ್ಕ್ಷಣ ರೋಗ ಗುರುತಿಸುವಿಕೆ, ಚಿಕಿತ್ಸೆ ಶಿಫಾರಸುಗಳು ಮತ್ತು ತಜ್ಞ ಕೃಷಿ ಮಾರ್ಗದರ್ಶನವನ್ನು ಪಡೆಯಲು ಬೆಳೆ ಚಿತ್ರಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಅಥವಾ ಸೆರೆಹಿಡಿಯಿರಿ.",
//     "landing.launch": "ಅಪ್ಲಿಕೇಶನ್ ಪ್ರಾರಂಭಿಸಿ",
//     "landing.free": "ಬಳಕೆಗೆ ಉಚಿತ",
//     "landing.selectLanguage": "ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ",

//     // Typing Prompts
//     "prompts.tomato": "ನನ್ನ ಟೊಮೇಟೊ ಗಿಡಗಳ ಎಲೆಗಳ ಮೇಲೆ ಕಂದು ಬಣ್ಣದ ಚುಕ್ಕೆಗಳಿವೆ...",
//     "prompts.cucumber": "ಸೌತೆಕಾಯಿ ಎಲೆಗಳ ಮೇಲೆ ಬಿಳಿ ಪುಡಿಯಂತಹ ವಸ್ತು...",
//     "prompts.pepper": "ನನ್ನ ಮೆಣಸಿನಕಾಯಿ ಗಿಡಗಳ ಎಲೆಗಳು ಹಳದಿಯಾಗಿ ಬಾಡುತ್ತಿವೆ...",
//     "prompts.corn": "ಜೋಳದ ಎಲೆಗಳಲ್ಲಿ ಕಂದು ಅಂಚುಗಳೊಂದಿಗೆ ಸಣ್ಣ ರಂಧ್ರಗಳು...",
//     "prompts.potato": "ಆಲೂಗೆಡ್ಡೆ ಗಿಡದ ಕಾಂಡದ ಮೇಲೆ ಕಪ್ಪು ಚುಕ್ಕೆಗಳು ಕಾಣಿಸುತ್ತಿವೆ...",

//     // Crop Doctor Page
//     "crop.title": "AI ಬೆಳೆ ವೈದ್ಯ",
//     "crop.analyze": "ರೋಗಗಳಿಗಾಗಿ ನಿಮ್ಮ ಬೆಳೆಯನ್ನು ವಿಶ್ಲೇಷಿಸಿ",
//     "crop.description": "ತತ್ಕ್ಷಣ AI-ಚಾಲಿತ ರೋಗ ನಿರ್ಣಯ ಮತ್ತು ಚಿಕಿತ್ಸೆ ಶಿಫಾರಸುಗಳನ್ನು ಪಡೆಯಲು ನಿಮ್ಮ ಬೆಳೆಯ ಫೋಟೋವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಅಥವಾ ತೆಗೆದುಕೊಳ್ಳಿ.",
//     "crop.backHome": "ಮನೆಗೆ ಹಿಂತಿರುಗಿ",
//     "crop.home": "ಮನೆ",
//     "crop.newAnalysis": "ಹೊಸ ವಿಶ್ಲೇಷಣೆ",
//     "crop.uploadImage": "ಬೆಳೆ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
//     "crop.fileFormat": "PNG, JPG 10MB ವರೆಗೆ",
//     "crop.chooseFile": "ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ",
//     "crop.takePhoto": "ಫೋಟೋ ತೆಗೆದುಕೊಳ್ಳಿ",
//     "crop.analyzing": "ನಿಮ್ಮ ಬೆಳೆ ಚಿತ್ರವನ್ನು ವಿಶ್ಲೇಷಿಸುತ್ತಿದ್ದೇವೆ...",
//     "crop.ready": "ನಿಮ್ಮ ಬೆಳೆ ಚಿತ್ರವನ್ನು ವಿಶ್ಲೇಷಿಸಲು ಸಿದ್ಧ",
//     "crop.analyzeCrop": "ಬೆಳೆ ವಿಶ್ಲೇಷಿಸಿ",

//     // Tabs
//     "tabs.answer": "ಉತ್ತರ",
//     "tabs.sources": "ಮೂಲಗಳು ಮತ್ತು ಪರಿಹಾರಗಳು",
//     "tabs.treatment": "ಚಿಕಿತ್ಸೆ",

//     // Disease Detection
//     "disease.detected": "ರೋಗ ಪತ್ತೆಯಾಗಿದೆ",
//     "disease.affected": "ನಿಮ್ಮ ಬೆಳೆ ಪ್ರಭಾವಿತವಾಗಿರುವಂತೆ ತೋರುತ್ತದೆ",
//     "disease.scientificName": "ವೈಜ್ಞಾನಿಕ ಹೆಸರು:",
//     "disease.affectedCrop": "ಪ್ರಭಾವಿತ ಬೆಳೆ:",
//     "disease.affectedCrops": "ಪ್ರಭಾವಿತವಾಗಬಹುದಾದ ಬೆಳೆಗಳು:",
//     "disease.overview": "ರೋಗ ಅವಲೋಕನ",
//     "disease.whatIs": "ಏನು",
//     "disease.symptoms": "ಲಕ್ಷಣಗಳು ಮತ್ತು ಹಾನಿ",
//     "disease.treatment": "ಚಿಕಿತ್ಸೆ ಶಿಫಾರಸುಗಳು",

//     // Treatment Methods
//     "treatment.cultural": "ಸಾಂಸ್ಕೃತಿಕ ನಿಯಂತ್ರಣ ವಿಧಾನಗಳು",
//     "treatment.biological": "ಜೈವಿಕ ನಿಯಂತ್ರಣ ವಿಧಾನಗಳು",
//     "treatment.chemical": "ರಾಸಾಯನಿಕ ನಿಯಂತ್ರಣ ವಿಧಾನಗಳು",
//     "treatment.warning": "ಯಾವಾಗಲೂ ಲೇಬಲ್ ಸೂಚನೆಗಳನ್ನು ಓದಿ ಮತ್ತು ಅನುಸರಿಸಿ. ರಾಸಾಯನಿಕಗಳನ್ನು ಅನ್ವಯಿಸುವಾಗ ರಕ್ಷಣಾ ಸಾಧನಗಳನ್ನು ಧರಿಸಿ.",
//     "treatment.products": "ಉತ್ಪಾದನೆಗಳು:",
//     "treatment.recommended": "ಶಿಫಾರಸು ಮಾಡಿದ ಉತ್ಪಾದನೆಗಳು:",

//     // Sources
//     "sources.title": "ಸಂಶೋಧನಾ ಮೂಲಗಳು ಮತ್ತು ಹೆಚ್ಚುವರಿ ಮಾಹಿತಿ",

//     // Chatbot
//     "chatbot.title": "ಕೃಷಿ ಸಹಾಯಕ",
//     "chatbot.subtitle": "ಕೃಷಿಯ ಬಗ್ಗೆ ಏನು ಬೇಕಾದರೂ ಕೇಳಿ",
//     "chatbot.welcome":
//       "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ AI ಕೃಷಿ ಸಹಾಯಕ. ನಿಮ್ಮ ಎಲ್ಲಾ ಕೃಷಿ ಪ್ರಶ್ನೆಗಳಿಗೆ ಸಹಾಯ ಮಾಡಲು ಮತ್ತು ಉತ್ತಮ ಬೆಳೆ ನಿರ್ವಹಣೆಗಾಗಿ ತಜ್ಞ ಮಾರ್ಗದರ್ಶನ ನೀಡಲು ನಾನು ಇಲ್ಲಿದ್ದೇನೆ.",
//     "chatbot.selectLanguage": "ದಯವಿಟ್ಟು ನಮ್ಮ ಸಂಭಾಷಣೆಗಾಗಿ ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ:",
//     "chatbot.placeholder": "ಕೃಷಿ, ಬೆಳೆಗಳು, ರೋಗಗಳು ಅಥವಾ ಚಿಕಿತ್ಸೆಗಳ ಬಗ್ಗೆ ಕೇಳಿ...",
//     "chatbot.selectLanguageFirst": "ದಯವಿಟ್ಟು ಮೊದಲು ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",

//     // Languages
//     "lang.english": "English",
//     "lang.hindi": "हिंदी",
//     "lang.kannada": "ಕನ್ನಡ",
//   },
// }

// export function LanguageProvider({ children }: { children: React.ReactNode }) {
//   const [language, setLanguage] = useState<Language>("en")

//   // Load language from localStorage on mount
//   useEffect(() => {
//     const savedLanguage = localStorage.getItem("language") as Language
//     if (savedLanguage && ["en", "hi", "kn"].includes(savedLanguage)) {
//       setLanguage(savedLanguage)
//     }
//   }, [])

//   // Save language to localStorage when it changes
//   const handleSetLanguage = (lang: Language) => {
//     setLanguage(lang)
//     localStorage.setItem("language", lang)
//   }

//   // Translation function
//   const t = (key: string): string => {
//     return translations[language][key as keyof (typeof translations)[typeof language]] || key
//   }

//   return (
//     <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
//       {children}
//     </LanguageContext.Provider>
//   )
// }

// export function useLanguage() {
//   const context = useContext(LanguageContext)
//   if (context === undefined) {
//     throw new Error("useLanguage must be used within a LanguageProvider")
//   }
//   return context
// }
