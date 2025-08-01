
"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type { google } from "google-maps"

interface UserLocation {
  lat: number
  lng: number
}

interface PlaceResult {
  place_id: string
  name: string
  vicinity: string
  rating?: number
  business_status?: string
  geometry: {
    location: google.maps.LatLng
  }
}

interface PlaceDetails {
  name: string
  formatted_address?: string
  formatted_phone_number?: string
  website?: string
  rating?: number
  user_ratings_total?: number
  opening_hours?: {
    weekday_text: string[]
  }
  price_level?: number
  types?: string[]
}

type ISpeechRecognition = typeof window.SpeechRecognition extends undefined 
  ? any 
  : typeof window.SpeechRecognition;

declare global {
  interface Window {
    google: typeof google;
    initGoogleMaps: () => void;
    SpeechRecognition: ISpeechRecognition;
    webkitSpeechRecognition: ISpeechRecognition;
  }
}


const translations = {
  en: {
    appTitle: "AgriLocator",
    appSubtitle: "Find agricultural markets & suppliers near you",
    initialMessage:
      "Enter your agricultural needs in the search bar below to find nearby markets, suppliers, and trading locations.",
    searchPlaceholder: "e.g., 'sell rice', 'buy fertilizer', 'grain market'",
    status: {
      gettingLocation: "Getting your precise location...",
      locationFoundAccuracy: "Location found with {accuracy}m accuracy!",
      locationFoundGood: "Location found (accuracy: {accuracy}m). Good enough for searching!",
      locationFoundBroad: "Location found but not very precise ({accuracy}km accuracy). Results may be broad.",
      locationDenied: "Location access denied. Please enable location permissions and refresh.",
      locationUnavailable: "Location information unavailable. Using default location.",
      locationTimeout: "Location request timed out. Using default location.",
      locationUnknownError: "Unknown location error. Using default location.",
      geolocationNotSupported: "Geolocation not supported. Using default location.",
      enterSearchTerm: "Please enter what you need to buy or sell.",
      analyzingAI: "Analyzing your request with AI...",
      aiAnalysis: "AI Analysis: Looking for {category} to {intent} {products}",
      aiFailedFallback: "AI analysis failed, using smart search...",
      listening: "Listening... Speak now!",
      heard: 'Heard: "{transcript}"',
      voiceError: "Voice search error. Please try again.",
      voiceNotSupported: "Voice search not supported in this browser.",
      foundLocations: "Found {count} relevant locations",
      noLocations: "No relevant locations found. Try a different search term.",
      noResultsForQuery:
        'No results found for "{query}". Try different keywords like "grain market", "fertilizer shop", or "agricultural supply".',
      couldNotLoadDetails: "Could not load place details.",
    },
    buttons: {
      myLocation: "My Location",
      refresh: "Refresh",
      voiceSearch: "Voice Search",
      directions: "Directions",
      details: "Details",
      close: "Close",
    },
    modal: {
      placeDetails: "Place Details",
      address: "Address",
      phone: "Phone",
      website: "Website",
      rating: "Rating",
      priceLevel: "Price Level",
      businessType: "Business Type",
      hours: "Hours",
      noRating: "No rating",
      open: "Open",
      closed: "Closed",
      notAvailable: "Not available",
      notSpecified: "Not specified",
    },
    languages: {
      english: "English",
      hindi: "Hindi",
      kannada: "Kannada",
    },
  },
  hi: {
    appTitle: "🌾 एग्रीलोकेटर",
    appSubtitle: "अपने आस-पास कृषि बाजार और आपूर्तिकर्ता खोजें",
    initialMessage:
      "अपने आस-पास के बाजारों, आपूर्तिकर्ताओं और व्यापारिक स्थानों को खोजने के लिए नीचे खोज बार में अपनी कृषि आवश्यकताएं दर्ज करें।",
    searchPlaceholder: "जैसे, 'चावल बेचना', 'उर्वरक खरीदना', 'अनाज मंडी'",
    status: {
      gettingLocation: "आपका सटीक स्थान प्राप्त कर रहा है...",
      locationFoundAccuracy: "{accuracy}मी सटीकता के साथ स्थान मिला!",
      locationFoundGood: "स्थान मिला ({accuracy}मी सटीकता)। खोज के लिए पर्याप्त है!",
      locationFoundBroad: "स्थान मिला लेकिन बहुत सटीक नहीं ({accuracy}किमी सटीकता)। परिणाम व्यापक हो सकते हैं।",
      locationDenied: "स्थान पहुंच अस्वीकृत। कृपया स्थान अनुमतियां सक्षम करें और रीफ्रेश करें।",
      locationUnavailable: "स्थान जानकारी अनुपलब्ध। डिफ़ॉल्ट स्थान का उपयोग कर रहा है।",
      locationTimeout: "स्थान अनुरोध का समय समाप्त हो गया। डिफ़ॉल्ट स्थान का उपयोग कर रहा है।",
      locationUnknownError: "अज्ञात स्थान त्रुटि। डिफ़ॉल्ट स्थान का उपयोग कर रहा है।",
      geolocationNotSupported: "भू-स्थान समर्थित नहीं है। डिफ़ॉल्ट स्थान का उपयोग कर रहा है।",
      enterSearchTerm: "कृपया दर्ज करें कि आपको क्या खरीदना या बेचना है।",
      analyzingAI: "एआई के साथ आपके अनुरोध का विश्लेषण कर रहा है...",
      aiAnalysis: "एआई विश्लेषण: {products} के लिए {category} ढूंढ रहा है ताकि {intent} में मदद मिल सके",
      aiFailedFallback: "एआई विश्लेषण विफल रहा, स्मार्ट खोज का उपयोग कर रहा है...",
      listening: "सुन रहा है... अब बोलें!",
      heard: 'सुना: "{transcript}"',
      voiceError: "वॉइस सर्च त्रुटि। कृपया पुनः प्रयास करें।",
      voiceNotSupported: "इस ब्राउज़र में वॉइस सर्च समर्थित नहीं है।",
      foundLocations: "{count} प्रासंगिक स्थान मिले",
      noLocations: "कोई प्रासंगिक स्थान नहीं मिला। एक अलग खोज शब्द का प्रयास करें।",
      noResultsForQuery:
        '"{query}" के लिए कोई परिणाम नहीं मिला। "अनाज मंडी", "उर्वरक दुकान", या "कृषि आपूर्ति" जैसे विभिन्न कीवर्ड का प्रयास करें।',
      couldNotLoadDetails: "स्थान विवरण लोड नहीं कर सका।",
    },
    buttons: {
      myLocation: "मेरा स्थान",
      refresh: "रीफ्रेश करें",
      voiceSearch: "वॉइस सर्च",
      directions: "दिशा-निर्देश",
      details: "विवरण",
      close: "बंद करें",
    },
    modal: {
      placeDetails: "स्थान विवरण",
      address: "पता",
      phone: "फ़ोन",
      website: "वेबसाइट",
      rating: "रेटिंग",
      priceLevel: "मूल्य स्तर",
      businessType: "व्यवसाय प्रकार",
      hours: "घंटे",
      noRating: "कोई रेटिंग नहीं",
      open: "खुला",
      closed: "बंद",
      notAvailable: "उपलब्ध नहीं",
      notSpecified: "निर्दिष्ट नहीं",
    },
    languages: {
      english: "अंग्रेज़ी",
      hindi: "हिंदी",
      kannada: "ಕನ್ನಡ",
    },
  },
  kn: {
    appTitle: "🌾 ಅಗ್ರಿಲೋಕೇಟರ್",
    appSubtitle: "ನಿಮ್ಮ ಹತ್ತಿರದ ಕೃಷಿ ಮಾರುಕಟ್ಟೆಗಳು ಮತ್ತು ಪೂರೈಕೆದಾರರನ್ನು ಹುಡುಕಿ",
    initialMessage:
      "ನಿಮ್ಮ ಹತ್ತಿರದ ಮಾರುಕಟ್ಟೆಗಳು, ಪೂರೈಕೆದಾರರು ಮತ್ತು ವ್ಯಾಪಾರ ಸ್ಥಳಗಳನ್ನು ಹುಡುಕಲು ಕೆಳಗಿನ ಹುಡುಕಾಟ ಪಟ್ಟಿಯಲ್ಲಿ ನಿಮ್ಮ ಕೃಷಿ ಅಗತ್ಯಗಳನ್ನು ನಮೂದಿಸಿ.",
    searchPlaceholder: "ಉದಾ, 'ಅಕ್ಕಿ ಮಾರಾಟ', 'ಗೊಬ್ಬರ ಖರೀದಿ', 'ಧಾನ್ಯ ಮಾರುಕಟ್ಟೆ'",
    status: {
      gettingLocation: "ನಿಮ್ಮ ನಿಖರವಾದ ಸ್ಥಳವನ್ನು ಪಡೆಯಲಾಗುತ್ತಿದೆ...",
      locationFoundAccuracy: "{accuracy}ಮೀ ನಿಖರತೆಯೊಂದಿಗೆ ಸ್ಥಳ ಕಂಡುಬಂದಿದೆ!",
      locationFoundGood: "ಸ್ಥಳ ಕಂಡುಬಂದಿದೆ (ನಿಖರತೆ: {accuracy}ಮೀ). ಹುಡುಕಾಟಕ್ಕೆ ಸಾಕಷ್ಟು ಉತ್ತಮವಾಗಿದೆ!",
      locationFoundBroad: "ಸ್ಥಳ ಕಂಡುಬಂದಿದೆ ಆದರೆ ಹೆಚ್ಚು ನಿಖರವಾಗಿಲ್ಲ ({accuracy}ಕಿಮೀ ನಿಖರತೆ). ಫಲಿತಾಂಶಗಳು ವಿಶಾಲವಾಗಿರಬಹುದು.",
      locationDenied: "ಸ್ಥಳ ಪ್ರವೇಶ ನಿರಾಕರಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ಸ್ಥಳ ಅನುಮತಿಗಳನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಿ ಮತ್ತು ರಿಫ್ರೆಶ್ ಮಾಡಿ.",
      locationUnavailable: "ಸ್ಥಳ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ. ಡೀಫಾಲ್ಟ್ ಸ್ಥಳವನ್ನು ಬಳಸಲಾಗುತ್ತಿದೆ.",
      locationTimeout: "ಸ್ಥಳ ವಿನಂತಿಯ ಸಮಯ ಮೀರಿತು. ಡೀಫಾಲ್ಟ್ ಸ್ಥಳವನ್ನು ಬಳಸಲಾಗುತ್ತಿದೆ.",
      locationUnknownError: "ಅಜ್ಞಾತ ಸ್ಥಳ ದೋಷ. ಡೀಫಾಲ್ಟ್ ಸ್ಥಳವನ್ನು ಬಳಸಲಾಗುತ್ತಿದೆ.",
      geolocationNotSupported: "ಭೂಸ್ಥಳ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ. ಡೀಫಾಲ್ಟ್ ಸ್ಥಳವನ್ನು ಬಳಸಲಾಗುತ್ತಿದೆ.",
      enterSearchTerm: "ದಯವಿಟ್ಟು ನೀವು ಏನು ಖರೀದಿಸಬೇಕು ಅಥವಾ ಮಾರಾಟ ಮಾಡಬೇಕು ಎಂಬುದನ್ನು ನಮೂದಿಸಿ.",
      analyzingAI: "AI ನೊಂದಿಗೆ ನಿಮ್ಮ ವಿನಂತಿಯನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
      aiAnalysis: "AI ವಿಶ್ಲೇಷಣೆ: {products} ಗೆ {category} ಹುಡುಕಲಾಗುತ್ತಿದೆ, {intent} ಗೆ ಸಹಾಯ ಮಾಡಲು",
      aiFailedFallback: "AI ವಿಶ್ಲೇಷಣೆ ವಿಫಲವಾಗಿದೆ, ಸ್ಮಾರ್ಟ್ ಹುಡುಕಾಟವನ್ನು ಬಳಸಲಾಗುತ್ತಿದೆ...",
      listening: "ಕೇಳಲಾಗುತ್ತಿದೆ... ಈಗ ಮಾತನಾಡಿ!",
      heard: 'ಕೇಳಿದ್ದು: "{transcript}"',
      voiceError: "ಧ್ವನಿ ಹುಡುಕಾಟ ದೋಷ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
      voiceNotSupported: "ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಹುಡುಕಾಟ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ.",
      foundLocations: "{count} ಸಂಬಂಧಿತ ಸ್ಥಳಗಳು ಕಂಡುಬಂದಿವೆ",
      noLocations: "ಯಾವುದೇ ಸಂಬಂಧಿತ ಸ್ಥಳಗಳು ಕಂಡುಬಂದಿಲ್ಲ. ಬೇರೆ ಹುಡುಕಾಟ ಪದವನ್ನು ಪ್ರಯತ್ನಿಸಿ.",
      noResultsForQuery:
        '"{query}" ಗಾಗಿ ಯಾವುದೇ ಫಲಿತಾಂಶಗಳು ಕಂಡುಬಂದಿಲ್ಲ. "ಧಾನ್ಯ ಮಾರುಕಟ್ಟೆ", "ಗೊಬ್ಬರ ಅಂಗಡಿ", ಅಥವಾ "ಕೃಷಿ ಪೂರೈಕೆ" ನಂತಹ ವಿಭಿನ್ನ ಕೀವರ್ಡ್‌ಗಳನ್ನು ಪ್ರಯತ್ನಿಸಿ.',
      couldNotLoadDetails: "ಸ್ಥಳದ ವಿವರಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
    },
    buttons: {
      myLocation: "ನನ್ನ ಸ್ಥಳ",
      refresh: "ರಿಫ್ರೆಶ್",
      voiceSearch: "ಧ್ವನಿ ಹುಡುಕಾಟ",
      directions: "ದಿಕ್ಕುಗಳು",
      details: "ವಿವರಗಳು",
      close: "ಮುಚ್ಚಿ",
    },
    modal: {
      placeDetails: "ಸ್ಥಳದ ವಿವರಗಳು",
      address: "ವಿಳಾಸ",
      phone: "ದೂರವಾಣಿ",
      website: "ವೆಬ್‌ಸೈಟ್",
      rating: "ರೇಟಿಂಗ್",
      priceLevel: "ಬೆಲೆ ಮಟ್ಟ",
      businessType: "ವ್ಯಾಪಾರ ಪ್ರಕಾರ",
      hours: "ಗಂಟೆಗಳು",
      noRating: "ರೇಟಿಂಗ್ ಇಲ್ಲ",
      open: "ತೆರೆದಿದೆ",
      closed: "ಮುಚ್ಚಿದೆ",
      notAvailable: "ಲಭ್ಯವಿಲ್ಲ",
      notSpecified: "ನಿರ್ದಿಷ್ಟಪಡಿಸಿಲ್ಲ",
    },
    languages: {
      english: "ಇಂಗ್ಲಿಷ್",
      hindi: "ಹಿಂದಿ",
      kannada: "ಕನ್ನಡ",
    },
  },
}

const langMap = {
  en: "en-US",
  hi: "hi-IN",
  kn: "kn-IN",
}

export default function SmartMapsPage() {
  const [currentLang, setCurrentLang] = useState("en")
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [service, setService] = useState<google.maps.places.PlacesService | null>(null)
  const [userLocation, setUserLocation] = useState<UserLocation>({ lat: 13.062753, lng: 77.474869 })
  const [markers, setMarkers] = useState<google.maps.Marker[]>([])
  const [places, setPlaces] = useState<PlaceResult[]>([])
  const [currentQuery, setCurrentQuery] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [status, setStatus] = useState<{ message: string; type: "loading" | "success" | "error"; visible: boolean }>({
    message: "",
    type: "loading",
    visible: false,
  })
  const [selectedPlaceIndex, setSelectedPlaceIndex] = useState<number | null>(null)
  const [modalPlace, setModalPlace] = useState<PlaceDetails | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isRecording, setIsRecording] = useState(false)

  const mapRef = useRef<HTMLDivElement>(null)
  const userMarkerRef = useRef<google.maps.Marker | null>(null)
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  const recognitionRef = useRef<any>(null)
  const watchIdRef = useRef<number | null>(null)
  const bestAccuracyRef = useRef<number>(Number.POSITIVE_INFINITY)

  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY 
  const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY 
  const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent"

  // Helper function to get nested property from object
  const getNested = (obj: any, path: string) => {
    return path.split(".").reduce((acc, part) => acc && acc[part], obj)
  }

  // Function to translate elements
  const translateUI = (lang: string) => {
    document.documentElement.lang = lang
    document.querySelectorAll("[data-i18n-key]").forEach((element) => {
      const key = element.getAttribute("data-i18n-key")!;
      
      const text = getNested(translations[lang as keyof typeof translations], key)

      if (text) {
        if (element.tagName === "INPUT" && element.hasAttribute("placeholder")) {
          element.setAttribute("placeholder", text)
        } else if (element.tagName === "BUTTON" && element.hasAttribute("title")) {
          element.setAttribute("title", text)
        } else {
          element.textContent = text
        }
      }
    })

    // Update language selector options
    const langSelect = document.getElementById("languageSelect")
    if (langSelect) {
      Array.from(langSelect.querySelectorAll("option")).forEach((option) => {
        const key = option.getAttribute("data-i18n-key")
        if (key) {
          option.textContent = getNested(translations[lang as keyof typeof translations], key)
        }
      })
    }
  }

  const showStatus = useCallback(
    (messageKey: string, type: "loading" | "success" | "error", replacements: Record<string, any> = {}) => {
      let message = getNested(translations[currentLang as keyof typeof translations], messageKey)
      Object.keys(replacements).forEach((key) => {
        message = message.replace(`{${key}}`, replacements[key])
      })
      setStatus({ message, type, visible: true })
    },
    [currentLang],
  )

  const hideStatus = useCallback(() => {
    setStatus((prev) => ({ ...prev, visible: false }))
  }, [])

  // Load Google Maps Script
  const loadGoogleMapsScript = useCallback(
    (langCode: string) => {
      if (window.google) {
        initMap()
        return
      }

      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
      if (existingScript) {
        existingScript.remove()
      }

      window.initGoogleMaps = () => {
        initMap()
      }

      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&loading=async&callback=initGoogleMaps&language=${langCode}`
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    },
    [GOOGLE_MAPS_API_KEY],
  )

  // Initialize Map
  const initMap = useCallback(() => {
    if (!mapRef.current || !window.google) return

    // Clear existing map instance and markers if they exist
    if (map) {
      clearMarkers()
    }

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: userLocation,
      zoom: 12,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
    })

    const serviceInstance = new window.google.maps.places.PlacesService(mapInstance)
    const infoWindow = new window.google.maps.InfoWindow()

    const userMarker = new window.google.maps.Marker({
      position: userLocation,
      map: mapInstance,
      title: translations[currentLang as keyof typeof translations].buttons.myLocation,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: "#4285f4",
        fillOpacity: 1,
        strokeColor: "white",
        strokeWeight: 3,
      },
      zIndex: 1000, // Ensure user marker is always on top
    })

    setMap(mapInstance)
    setService(serviceInstance)
    userMarkerRef.current = userMarker
    infoWindowRef.current = infoWindow

    // If there's a current query, re-perform search to populate results on the new map
    if (currentQuery) {
      performSearch()
    }
  }, [userLocation, currentLang, currentQuery])

  // Clear markers
  const clearMarkers = useCallback(() => {
    markers.forEach((marker) => marker.setMap(null))
    setMarkers([])
    if (infoWindowRef.current) {
      infoWindowRef.current.close()
    }
  }, [markers])

  // Calculate distance between two points
  const calculateDistance = (pos1: UserLocation, pos2: UserLocation) => {
    const R = 6371
    const dLat = ((pos2.lat - pos1.lat) * Math.PI) / 180
    const dLon = ((pos2.lng - pos1.lng) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((pos1.lat * Math.PI) / 180) *
        Math.cos((pos2.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Update user location on map
  const updateUserLocationOnMap = () => {
    if (map && userMarkerRef.current) {
      userMarkerRef.current.setPosition(userLocation)
    }
  }

  // Start location watching
  const startLocationWatching = (geoOptions: PositionOptions) => {
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newAccuracy = position.coords.accuracy

        if (newAccuracy < bestAccuracyRef.current - 50 || newAccuracy < 50) {
          bestAccuracyRef.current = newAccuracy

          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }

          const distance = calculateDistance(userLocation, newLocation)

          if (distance > 0.1) {
            setUserLocation(newLocation)
            updateUserLocationOnMap()

            if (currentQuery && distance > 0.5) {
              showStatus("status.locationFoundAccuracy", "loading", { accuracy: Math.round(newAccuracy) })
              performSearch()
            }
          }

          console.log(`Updated location accuracy: ${newAccuracy} meters`)
        }
      },
      (error) => {
        console.warn("Location watch error:", error)
      },
      {
        ...geoOptions,
        timeout: 30000,
      },
    )
  }

  // Handle geolocation error
  const handleGeolocationError = (error: GeolocationPositionError) => {
    console.error("Geolocation error:", error)
    let errorMessageKey = ""

    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessageKey = "status.locationDenied"
        break
      case error.POSITION_UNAVAILABLE:
        errorMessageKey = "status.locationUnavailable"
        break
      case error.TIMEOUT:
        errorMessageKey = "status.locationTimeout"
        break
      default:
        errorMessageKey = "status.locationUnknownError"
        break
    }

    showStatus(errorMessageKey, "error")
    setTimeout(() => hideStatus(), 6000)
  }

  // Initialize Voice Search
  const initVoiceSearch = useCallback(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    //   const recognition = new SpeechRecognition()
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)() as any;
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = langMap[currentLang as keyof typeof langMap]

      recognition.onstart = () => {
        setIsRecording(true)
        showStatus("status.listening", "loading")
      }

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setSearchInput(transcript)
        showStatus("status.heard", "success", { transcript: transcript })
        setTimeout(() => {
          performSearch(transcript)
        }, 1000)
      }

      recognition.onerror = () => {
        showStatus("status.voiceError", "error")
        setTimeout(hideStatus, 3000)
      }

      recognition.onend = () => {
        setIsRecording(false)
      }

      recognitionRef.current = recognition
    }
  }, [currentLang, showStatus, hideStatus])

  // Function to set the application language
  const setLanguage = (lang: string) => {
    setCurrentLang(lang)
    localStorage.setItem("agrilocator_lang", lang)
    translateUI(lang)
    loadGoogleMapsScript(langMap[lang as keyof typeof langMap])
    initVoiceSearch()
  }

  // Get User Location and Initialize
  useEffect(() => {
    // Load language from localStorage or default to 'en'
    const savedLang = localStorage.getItem("agrilocator_lang") || "en"
    if (savedLang && translations[savedLang as keyof typeof translations]) {
      setCurrentLang(savedLang)
    }

    // Initialize UI translation
    setTimeout(() => translateUI(savedLang), 100)

    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60000,
    }

    if (navigator.geolocation) {
      showStatus("status.gettingLocation", "loading")

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setUserLocation(newLocation)

          const accuracy = position.coords.accuracy
          console.log(`Location accuracy: ${accuracy} meters`)

          // Now that userLocation is known, load the map script
          loadGoogleMapsScript(langMap[savedLang as keyof typeof langMap])

          if (accuracy <= 100) {
            showStatus("status.locationFoundAccuracy", "success", { accuracy: Math.round(accuracy) })
          } else if (accuracy <= 1000) {
            showStatus("status.locationFoundGood", "success", { accuracy: Math.round(accuracy) })
          } else {
            showStatus("status.locationFoundBroad", "error", { accuracy: Math.round(accuracy / 1000) })
          }

          startLocationWatching(geoOptions)
          setTimeout(() => hideStatus(), 4000)
        },
        (error) => {
          handleGeolocationError(error)
          // Even on error, we still want to load the map with default location (Madhavar, Bangalore)
          setUserLocation({ lat: 13.062753, lng: 77.474869 })
          loadGoogleMapsScript(langMap[savedLang as keyof typeof langMap])
        },
        geoOptions,
      )
    } else {
      setUserLocation({ lat: 13.062753, lng: 77.474869 })
      loadGoogleMapsScript(langMap[savedLang as keyof typeof langMap])
      showStatus("status.geolocationNotSupported", "error")
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
    }
  }, [showStatus, hideStatus, loadGoogleMapsScript, initVoiceSearch])

  // Initialize voice search when language changes
  useEffect(() => {
    initVoiceSearch()
  }, [initVoiceSearch])

  // AI Query Interpretation
  const interpretQueryWithGemini = async (query: string): Promise<string[]> => {
    const prompt = `Analyze this farmer's request, which is in ${currentLang} (language code): "${query}"

Return ONLY a JSON object (no markdown, no explanations) with this structure:
{"intent":"buying/selling","products":["product names"],"searchTerms":["business types"],"category":"category"}

IMPORTANT: The "searchTerms" MUST be in English, suitable for a global search API like Google Places.

For SELLING: suggest markets, mandis, mills, collection centers (in English search terms)
For BUYING: suggest supply stores, dealers, equipment rentals (in English search terms)
Include regional terms like "mandi", "krishi kendra" but ensure their English equivalents are used in "searchTerms".

Examples:
"sell rice" (English) → {"intent":"selling","products":["rice"],"searchTerms":["grain market","rice mill","mandi","agricultural market"],"category":"grain market"}
"चावल बेचना है" (Hindi) → {"intent":"selling","products":["rice"],"searchTerms":["grain market","rice mill","mandi","agricultural market"],"category":"grain market"}
"ಭತ್ತ ಮಾರಾಟ" (Kannada) → {"intent":"selling","products":["paddy"],"searchTerms":["paddy market","rice mill","agricultural market"],"category":"grain market"}`

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            topK: 20,
            topP: 0.8,
            maxOutputTokens: 512,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error("Empty response from Gemini API")
      }

      let geminiResponse = data.candidates[0].content.parts[0].text.trim()
      console.log("Raw Gemini response:", geminiResponse)

      if (!geminiResponse || geminiResponse.length < 10) {
        console.warn("Gemini response too short or empty")
        throw new Error("Empty AI response")
      }

      geminiResponse = geminiResponse
        .replace(/`{3,}/g, "")
        .replace(/^[^{]*/, "")
        .replace(/[^}]*$/, "")
        .trim()

      console.log("Cleaned response:", geminiResponse)

      if (!geminiResponse.startsWith("{") || !geminiResponse.endsWith("}")) {
        console.warn("Response does not look like valid JSON")
        throw new Error("Invalid JSON format")
      }

      const parsedResponse = JSON.parse(geminiResponse)

      if (
        !parsedResponse.searchTerms ||
        !Array.isArray(parsedResponse.searchTerms) ||
        parsedResponse.searchTerms.length === 0
      ) {
        console.warn("Invalid response structure:", parsedResponse)
        throw new Error("Invalid AI response structure")
      }

      console.log("Successfully parsed:", parsedResponse)

      showStatus("status.aiAnalysis", "loading", {
        category: parsedResponse.category || translations[currentLang as keyof typeof translations].modal.notSpecified,
        intent: parsedResponse.intent || translations[currentLang as keyof typeof translations].modal.notSpecified,
        products: (parsedResponse.products || []).join(", "),
      })

      return parsedResponse.searchTerms
    } catch (error) {
      console.error("Gemini API processing error:", error)

      const manualTerms = extractSearchTermsManually(query)
      if (manualTerms.length > 0) {
        console.log("Using manual extraction:", manualTerms)
        return manualTerms
      }

      throw error
    }
  }

  // Fallback search term extraction
  const extractSearchTermsManually = (query: string): string[] => {
    const lowerQuery = query.toLowerCase()

    const termMappings = {
      sell: {
        rice: ["grain market", "rice mill", "agricultural market", "mandi"],
        wheat: ["grain market", "flour mill", "agricultural market", "mandi"],
        corn: ["grain market", "feed mill", "agricultural market"],
        vegetable: ["vegetable market", "wholesale market", "mandi"],
        fruit: ["fruit market", "wholesale market"],
        milk: ["dairy", "milk collection center"],
        sugar: ["sugar mill", "cooperative"],
        cotton: ["cotton market", "ginning mill"],
        default: ["agricultural market", "farmers market", "mandi"],
      },
      buy: {
        fertilizer: ["fertilizer dealer", "agricultural supply store", "krishi kendra"],
        pesticide: ["pesticide dealer", "agricultural supply store"],
        seed: ["seed store", "agricultural supply store", "krishi kendra"],
        tractor: ["tractor dealer", "farm equipment dealer"],
        equipment: ["agricultural equipment dealer", "farm machinery"],
        tool: ["agricultural tools", "farm equipment"],
        default: ["agricultural supply store", "krishi kendra"],
      },
    }

    let searchTerms: string[] = []

    let intent = "general"
    if (lowerQuery.includes("sell") || lowerQuery.includes("selling")) {
      intent = "sell"
    } else if (lowerQuery.includes("buy") || lowerQuery.includes("buying") || lowerQuery.includes("need")) {
      intent = "buy"
    }

    if (intent !== "general") {
      const mapping = termMappings[intent as keyof typeof termMappings]

      for (const [product, terms] of Object.entries(mapping)) {
        if (product !== "default" && lowerQuery.includes(product)) {
          searchTerms = terms
          break
        }
      }

      if (searchTerms.length === 0) {
        searchTerms = mapping.default
      }
    } else {
      if (lowerQuery.includes("market")) {
        searchTerms = ["agricultural market", "farmers market", "mandi"]
      } else {
        searchTerms = ["agricultural supply store", "farmers market"]
      }
    }

    return searchTerms
  }

  // Display search results
  const displayResults = useCallback(
    (placesToDisplay: PlaceResult[]) => {
      if (!map) return

      // Create markers first
      const newMarkers: google.maps.Marker[] = []

      placesToDisplay.forEach((place, index) => {
        const marker = new window.google.maps.Marker({
          position: place.geometry.location,
          map: map,
          title: place.name,
        })

        marker.addListener("click", () => {
          if (infoWindowRef.current) {
            infoWindowRef.current.setContent(`
            <div style="padding: 8px; font-weight: 600; color: #1f2937;">
              ${place.name}
            </div>
          `)
            infoWindowRef.current.open(map, marker)
          }
          setSelectedPlaceIndex(index)
          selectPlace(index)
        })

        newMarkers.push(marker)
      })

      setMarkers(newMarkers)

      // Update results container
      const resultsContainer = document.getElementById("results")
      if (resultsContainer) {
        resultsContainer.innerHTML = placesToDisplay
          .map((place, index) => {
            const rating = place.rating
              ? `⭐ ${place.rating}`
              : translations[currentLang as keyof typeof translations].modal.noRating
            const openNow =
              place.business_status === "OPERATIONAL"
                ? `<span style="color: #16a34a;">${translations[currentLang as keyof typeof translations].modal.open}</span>`
                : place.business_status === "CLOSED_TEMPORARILY"
                  ? `<span style="color: #dc2626;">${translations[currentLang as keyof typeof translations].modal.closed}</span>`
                  : ""

            return `
          <div class="result-item" data-place-id="${place.place_id}" data-index="${index}">
            <div class="result-name">${place.name}</div>
            <div class="result-address">${place.vicinity}</div>
            <div class="result-rating">${rating} ${openNow}</div>
            <div class="result-actions">
              <button class="action-btn directions-btn" onclick="window.getDirections(${index})">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-map-pin"><path d="M12 12.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"/><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z"/></svg>
                ${translations[currentLang as keyof typeof translations].buttons.directions}
              </button>
              <button class="action-btn info-btn" onclick="window.showPlaceDetails('${place.place_id}')">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-info"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                ${translations[currentLang as keyof typeof translations].buttons.details}
              </button>
            </div>
          </div>
        `
          })
          .join("")

        // Add click listeners to result items
        document.querySelectorAll(".result-item").forEach((item) => {
          item.addEventListener("click", function (this: HTMLElement) {
            const index = Number.parseInt((this as HTMLElement).dataset.index || "0")
            selectPlace(index)
          })
        })
      }

      // Adjust map bounds to show all markers
      if (newMarkers.length > 0) {
        const bounds = new window.google.maps.LatLngBounds()

        // Include user location
        bounds.extend(new window.google.maps.LatLng(userLocation.lat, userLocation.lng))

        // Include all place markers
        newMarkers.forEach((marker) => {
          bounds.extend(marker.getPosition()!)
        })

        map.fitBounds(bounds)

        // Set a maximum zoom level to avoid zooming too close
        const listener = window.google.maps.event.addListener(map, "idle", () => {
          if (map.getZoom()! > 15) map.setZoom(15)
          window.google.maps.event.removeListener(listener)
        })
      }
    },
    [map, currentLang, userLocation],
  )

  // Search nearby places
  const searchNearbyPlaces = useCallback(
    (searchTerms: string[]) => {
      if (!service) return

      setPlaces([])
      clearMarkers()
      let completedSearches = 0
      const totalSearches = searchTerms.length
      const foundPlaces: PlaceResult[] = []

      console.log("Searching for terms:", searchTerms)

      searchTerms.forEach((term) => {
        const request = {
          location: new window.google.maps.LatLng(userLocation.lat, userLocation.lng),
          radius: 25000,
          keyword: term,
          type: "establishment" as any,
        }

        service.nearbySearch(request, (results, status) => {
          completedSearches++

          if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
            results.forEach((place) => {
              if (!foundPlaces.find((p) => p.place_id === place.place_id)) {
                foundPlaces.push(place as PlaceResult)
              }
            })
          } else {
            console.warn(`Search failed for "${term}":`, status)
          }

          if (completedSearches === totalSearches) {
            if (foundPlaces.length > 0) {
              // Sort by rating first
              const sortedPlaces = [...foundPlaces].sort((a, b) => (b.rating || 0) - (a.rating || 0))
              setPlaces(sortedPlaces)
              displayResults(sortedPlaces)
              showStatus("status.foundLocations", "success", { count: sortedPlaces.length })
              setTimeout(hideStatus, 3000)
            } else {
              showStatus("status.noLocations", "error")
              // Show no results message in results container
              const resultsContainer = document.getElementById("results")
              if (resultsContainer) {
                resultsContainer.innerHTML = `
              <div style="text-align: center; padding: 40px 20px; color: #666;">
                <p style="font-size: 2rem;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-frown"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>
                </p>
                <p style="margin-top: 15px; line-height: 1.5;">${translations[currentLang as keyof typeof translations].status.noResultsForQuery.replace("{query}", currentQuery)}</p>
              </div>
            `
              }
            }
          }
        })
      })
    },
    [service, userLocation, showStatus, hideStatus, clearMarkers, currentQuery, currentLang, displayResults],
  )

  // Select place
  const selectPlace = (index: number) => {
    document.querySelectorAll(".result-item").forEach((item) => {
      item.classList.remove("selected")
    })

    const selectedItem = document.querySelector(`[data-index="${index}"]`)
    if (selectedItem) {
      selectedItem.classList.add("selected")
      selectedItem.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }

    if (places[index] && map) {
      map.setCenter(places[index].geometry.location)
      map.setZoom(15)

      if (markers[index] && infoWindowRef.current) {
        infoWindowRef.current.setContent(`
          <div style="padding: 8px; font-weight: 600; color: #1f2937;">
            ${places[index].name}
          </div>
        `)
        infoWindowRef.current.open(map, markers[index])
      }
    }

    // Close sidebar on mobile after selecting a place
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false)
    }
  }

  // Get directions
  const getDirections = (index: number) => {
    const place = places[index]
    if (place) {
      const destination = `${place.geometry.location.lat()},${place.geometry.location.lng()}`
      const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${destination}`
      window.open(url, "_blank")
    }
  }

  // Show place details
  const showPlaceDetailsModal = (placeId: string) => {
    if (!service) return

    const request = {
      placeId: placeId,
      fields: [
        "name",
        "formatted_address",
        "formatted_phone_number",
        "website",
        "rating",
        "user_ratings_total",
        "opening_hours",
        "price_level",
        "types",
      ],
    }

    service.getDetails(request, (place, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
        setModalPlace(place as PlaceDetails)
        setIsModalOpen(true)
      } else {
        showStatus("status.couldNotLoadDetails", "error")
      }
    })
  }

  // Perform search
  const performSearch = async (query?: string) => {
    const searchQuery = query || searchInput.trim()
    if (!searchQuery) {
      showStatus("status.enterSearchTerm", "error")
      return
    }

    // Close sidebar on mobile after search
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false)
    }

    setCurrentQuery(searchQuery)
    showStatus("status.analyzingAI", "loading")

    try {
      const searchTerms = await interpretQueryWithGemini(searchQuery)
      if (searchTerms && searchTerms.length > 0) {
        searchNearbyPlaces(searchTerms)
      } else {
        throw new Error("No search terms returned from AI")
      }
    } catch (error) {
      console.error("Gemini API error:", error)
      showStatus("status.aiFailedFallback", "loading")

      const fallbackTerms = extractSearchTermsManually(searchQuery)
      searchNearbyPlaces(fallbackTerms)
    }
  }

  // Center on user location
  const centerOnUserLocation = () => {
    if (map && userLocation) {
      map.setCenter(userLocation)
      map.setZoom(12)
    }
  }

  // Toggle voice search
  const toggleVoiceSearch = () => {
    if (!recognitionRef.current) {
      showStatus("status.voiceNotSupported", "error")
      setTimeout(hideStatus, 3000)
      return
    }

    if (isRecording) {
      recognitionRef.current.stop()
    } else {
      recognitionRef.current.start()
    }
  }

  // Refresh search
  const refreshSearch = () => {
    if (currentQuery) {
      performSearch()
    }
  }

  // Make functions globally available for onclick handlers
  useEffect(() => {
    ;(window as any).getDirections = getDirections
    ;(window as any).showPlaceDetails = showPlaceDetailsModal
    ;(window as any).selectPlace = selectPlace
  }, [places, userLocation])

  return (
    <>
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #1e3a8a, #3b82f6);
          height: 100vh;
          overflow: hidden;
        }

        .main-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          padding: 20px;
          gap: 20px;
        }

        .top-section {
          display: flex;
          flex: 1;
          gap: 20px;
          height: calc(100vh - 140px);
        }

        .sidebar {
          width: 380px;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(15px);
          border: 2px solid rgba(0, 0, 0, 0.1);
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          box-shadow: 4px 0 25px rgba(0, 0, 0, 0.15);
          overflow: hidden;
        }

        .header {
          padding: 25px 20px;
          background: linear-gradient(135deg, #dc2626, #ef4444);
          color: white;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .header::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: shimmer 3s ease-in-out infinite;
        }

        @keyframes shimmer {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(180deg); }
        }

        .header h1 {
          font-size: 1.8rem;
          margin-bottom: 8px;
          font-weight: 700;
          position: relative;
          z-index: 1;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .header p {
          font-size: 0.95rem;
          opacity: 0.95;
          position: relative;
          z-index: 1;
        }

        .status-section {
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
          background: linear-gradient(to bottom, #f9fafb, #ffffff);
        }

        .status {
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 14px;
          text-align: center;
          font-weight: 500;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .status.loading {
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          color: #1e40af;
          border: 1px solid #93c5fd;
        }

        .status.error {
          background: linear-gradient(135deg, #fee2e2, #fecaca);
          color: #dc2626;
          border: 1px solid #f87171;
        }

        .status.success {
          background: linear-gradient(135deg, #dcfce7, #bbf7d0);
          color: #16a34a;
          border: 1px solid #4ade80;
        }

        .results {
          flex: 1;
          overflow-y: auto;
          padding: 0 20px 20px;
        }

        .results::-webkit-scrollbar {
          width: 6px;
        }

        .results::-webkit-scrollbar-track {
          background: #f1f5f9;
        }

        .results::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .results::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        .result-item {
          background: white;
          border: 2px solid #f1f5f9;
          border-radius: 16px;
          padding: 18px;
          margin-bottom: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          position: relative;
          overflow: hidden;
        }

        .result-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(220, 38, 38, 0.05), transparent);
          transition: left 0.5s ease;
        }

        .result-item:hover::before {
          left: 100%;
        }

        .result-item:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          border-color: #dc2626;
        }

        .result-item.selected {
          border-color: #dc2626;
          background: linear-gradient(135deg, #fef2f2, #ffffff);
          box-shadow: 0 8px 25px rgba(220, 38, 38, 0.2);
        }

        .result-name {
          font-weight: 700;
          font-size: 17px;
          color: #1f2937;
          margin-bottom: 8px;
          line-height: 1.3;
        }

        .result-address {
          color: #6b7280;
          font-size: 14px;
          margin-bottom: 12px;
          line-height: 1.4;
        }

        .result-rating {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #f59e0b;
          font-weight: 500;
        }

        .result-actions {
          margin-top: 15px;
          display: flex;
          gap: 10px;
        }

        .action-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 20px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 600;
          flex: 1;
        }

        .directions-btn {
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          color: white;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
        }

        .directions-btn:hover {
          background: linear-gradient(135deg, #1d4ed8, #2563eb);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
        }

        .info-btn {
          background: linear-gradient(135deg, #f59e0b, #fbbf24);
          color: white;
          box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
        }

        .info-btn:hover {
          background: linear-gradient(135deg, #d97706, #f59e0b);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
        }

        .map-container {
          flex: 1;
          position: relative;
          background: white;
          border: 2px solid rgba(0, 0, 0, 0.1);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 4px 0 25px rgba(0, 0, 0, 0.15);
        }

        #map {
          width: 100%;
          height: 100%;
          border-radius: 18px;
        }

        .floating-controls {
          position: absolute;
          top: 20px;
          right: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          z-index: 1000;
        }

        .control-btn {
          background: white;
          border: none;
          width: 55px;
          height: 55px;
          border-radius: 50%;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: #374151;
        }

        .control-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
          background: #f9fafb;
        }

        .control-btn:active {
          transform: scale(0.95);
        }

        .bottom-section {
          display: flex;
          gap: 20px;
          height: 80px;
          align-items: center;
        }

        .search-bar {
          flex: 1;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(15px);
          border: 2px solid rgba(0, 0, 0, 0.1);
          border-radius: 40px;
          padding: 0 25px;
          box-shadow: 0 4px 25px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .search-input {
          flex: 1;
          padding: 20px 0;
          border: none;
          font-size: 18px;
          background: transparent;
          color: #1f2937;
          font-weight: 500;
        }

        .search-input:focus {
          outline: none;
        }

        .search-input::placeholder {
          color: #6b7280;
          font-weight: 400;
        }

        .search-btn {
          background: linear-gradient(135deg, #dc2626, #ef4444);
          border: none;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 18px;
          box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .search-btn:hover {
          background: linear-gradient(135deg, #b91c1c, #dc2626);
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
        }

        .search-btn:active {
          transform: scale(0.95);
        }

        .mic-btn {
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(15px);
          border: 2px solid rgba(0, 0, 0, 0.1);
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 25px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: #374151;
        }

        .mic-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 30px rgba(0, 0, 0, 0.2);
          background: #f9fafb;
        }

        .mic-btn:active {
          transform: scale(0.95);
        }

        .mic-btn.recording {
          background: linear-gradient(135deg, #dc2626, #ef4444);
          color: white;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        /* Burger Menu for Mobile */
        .burger-menu {
          display: none;
          position: fixed;
          top: 20px;
          left: 20px;
          z-index: 1001;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(15px);
          border: 2px solid rgba(0, 0, 0, 0.1);
          border-radius: 15px;
          width: 55px;
          height: 55px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }

        .burger-menu:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
          background: #f9fafb;
        }

        .burger-line {
          width: 20px;
          height: 2px;
          background: #374151;
          border-radius: 1px;
          transition: all 0.3s ease;
        }

        .burger-menu.active .burger-line:nth-child(1) {
          transform: rotate(45deg) translate(5px, 5px);
        }

        .burger-menu.active .burger-line:nth-child(2) {
          opacity: 0;
        }

        .burger-menu.active .burger-line:nth-child(3) {
          transform: rotate(-45deg) translate(7px, -6px);
        }

        .modal {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.6);
          z-index: 2000;
          backdrop-filter: blur(8px);
          animation: fadeIn 0.3s ease;
        }

        .modal.show {
          display: block;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          border-radius: 20px;
          padding: 30px;
          max-width: 550px;
          width: 90%;
          max-height: 85vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translate(-50%, -40%); }
          to { opacity: 1; transform: translate(-50%, -50%); }
        }

        .modal-header {
          border-bottom: 2px solid #f1f5f9;
          padding-bottom: 20px;
          margin-bottom: 25px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: #1f2937;
        }

        .close-btn {
          background: #f3f4f6;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #6b7280;
          padding: 0;
          width: 35px;
          height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.3s ease;
        }

        .close-btn:hover {
          background: #e5e7eb;
          color: #374151;
          transform: scale(1.1);
        }

        .modal-body {
          line-height: 1.6;
        }

        .detail-row {
          margin-bottom: 20px;
          padding: 15px;
          background: #f9fafb;
          border-radius: 12px;
          border-left: 4px solid #dc2626;
        }

        .detail-label {
          font-weight: 700;
          color: #374151;
          margin-bottom: 8px;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .detail-value {
          color: #6b7280;
          font-size: 15px;
        }

        .detail-value a {
          color: #dc2626;
          text-decoration: none;
          font-weight: 600;
        }

        .detail-value a:hover {
          text-decoration: underline;
        }

        .hidden {
          display: none;
        }

        /* Language Selector */
        .language-selector {
          position: absolute;
          top: 20px;
          right: 20px;
          z-index: 100;
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          overflow: hidden;
        }

        .language-selector select {
          padding: 8px 12px;
          border: none;
          background: transparent;
          font-size: 14px;
          color: #374151;
          cursor: pointer;
          outline: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          background-image: url('data:image/svg+xml;utf8,<svg fill="%23374151" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>');
          background-repeat: no-repeat;
          background-position: right 8px center;
          background-size: 16px;
          padding-right: 30px;
        }

        /* Mobile Styles */
        @media (max-width: 768px) {
          .main-container {
            padding: 10px;
            gap: 10px;
          }

          .top-section {
            flex-direction: column;
            height: calc(100vh - 120px);
          }

          .sidebar {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            z-index: 1000;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
            border-radius: 0;
            order: 2;
          }

          .sidebar.active {
            transform: translateX(0);
          }

          .map-container {
            height: 100%;
            order: 1;
          }

          .burger-menu {
            display: flex;
          }

          .bottom-section {
            height: 70px;
          }

          .search-input {
            padding: 15px 0;
            font-size: 16px;
          }

          .search-btn {
            width: 45px;
            height: 45px;
            font-size: 16px;
          }

          .mic-btn {
            width: 70px;
            height: 70px;
            font-size: 20px;
          }

          .floating-controls {
            top: 85px;
            right: 15px;
          }

          .control-btn {
            width: 45px;
            height: 45px;
            font-size: 16px;
          }

          .modal-content {
            width: 95%;
            padding: 20px;
            max-height: 90vh;
            border-radius: 15px;
          }

          .result-item {
            padding: 15px;
          }

          .header {
            padding: 20px 15px;
          }

          .header h1 {
            font-size: 1.5rem;
          }

          /* Close sidebar when clicking outside */
          .sidebar-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
            display: none;
          }

          .sidebar-overlay.active {
            display: block;
          }

          .language-selector {
            top: 10px;
            right: 10px;
          }
        }

        @media (max-width: 480px) {
          .header h1 {
            font-size: 1.3rem;
          }

          .search-input {
            font-size: 14px;
          }

          .result-actions {
            flex-direction: column;
            gap: 8px;
          }

          .action-btn {
            padding: 10px 16px;
          }

          .bottom-section {
            height: 60px;
          }

          .mic-btn {
            width: 60px;
            height: 60px;
            font-size: 18px;
          }
        }
      `}</style>

      {/* Language Selector */}
      <div className="language-selector">
        <select id="languageSelect" value={currentLang} onChange={(e) => setLanguage(e.target.value)}>
          <option value="en" data-i18n-key="languages.english">
            {translations[currentLang as keyof typeof translations].languages.english}
          </option>
          <option value="hi" data-i18n-key="languages.hindi">
            {translations[currentLang as keyof typeof translations].languages.hindi}
          </option>
          <option value="kn" data-i18n-key="languages.kannada">
            {translations[currentLang as keyof typeof translations].languages.kannada}
          </option>
        </select>
      </div>

      {/* Burger Menu for Mobile */}
      <div className={`burger-menu ${isSidebarOpen ? "active" : ""}`} onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        <div className="burger-line"></div>
        <div className="burger-line"></div>
        <div className="burger-line"></div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      <div className={`sidebar-overlay ${isSidebarOpen ? "active" : ""}`} onClick={() => setIsSidebarOpen(false)}></div>

      <div className="main-container">
        <div className="top-section">
          <div className={`sidebar ${isSidebarOpen ? "active" : ""}`}>
            <div className="header">
              <h1 data-i18n-key="appTitle">{translations[currentLang as keyof typeof translations].appTitle}</h1>
              <p data-i18n-key="appSubtitle">{translations[currentLang as keyof typeof translations].appSubtitle}</p>
            </div>

            <div className="status-section">
              <div className={`status ${status.visible ? status.type : "hidden"}`}>{status.message}</div>
            </div>

            <div className="results" id="results">
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#666" }}>
                <p style={{ fontSize: "2rem" }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 12.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" />
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z" />
                  </svg>
                </p>
                <p style={{ marginTop: "15px", fontSize: "16px", lineHeight: "1.5" }} data-i18n-key="initialMessage">
                  {translations[currentLang as keyof typeof translations].initialMessage}
                </p>
              </div>
            </div>
          </div>

          <div className="map-container">
            <div ref={mapRef} id="map" style={{ width: "100%", height: "100%" }}></div>
            <div className="floating-controls">
              <button
                className="control-btn"
                onClick={centerOnUserLocation}
                title={translations[currentLang as keyof typeof translations].buttons.myLocation}
                data-i18n-key="buttons.myLocation"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 12h2" />
                  <path d="M12 2v2" />
                  <path d="M20 12h2" />
                  <path d="M12 20v2" />
                  <circle cx="12" cy="12" r="4" />
                </svg>
              </button>
              <button
                className="control-btn"
                onClick={refreshSearch}
                title={translations[currentLang as keyof typeof translations].buttons.refresh}
                data-i18n-key="buttons.refresh"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12a9 9 0 0 0-9-9c-7.27 0-9 7.12-9 9s1.73 9 9 9 9-7.12 9-9" />
                  <path d="M17 12h-5v5" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="bottom-section">
          <div className="search-bar">
            <input
              type="text"
              className="search-input"
              placeholder={translations[currentLang as keyof typeof translations].searchPlaceholder}
              data-i18n-key="searchPlaceholder"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && performSearch()}
            />
            <button className="search-btn" onClick={() => performSearch()}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </button>
          </div>
          <button
            className={`mic-btn ${isRecording ? "recording" : ""}`}
            onClick={toggleVoiceSearch}
            title={translations[currentLang as keyof typeof translations].buttons.voiceSearch}
            data-i18n-key="buttons.voiceSearch"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
          </button>
        </div>
      </div>

      {/* Modal for place details */}
      <div className={`modal ${isModalOpen ? "show" : ""}`}>
        <div className="modal-content">
          <div className="modal-header">
            <h3 className="modal-title" data-i18n-key="modal.placeDetails">
              {modalPlace ? modalPlace.name : translations[currentLang as keyof typeof translations].modal.placeDetails}
            </h3>
            <button
              className="close-btn"
              onClick={() => setIsModalOpen(false)}
              title={translations[currentLang as keyof typeof translations].buttons.close}
              data-i18n-key="buttons.close"
            >
              &times;
            </button>
          </div>
          <div className="modal-body">
            {modalPlace && (
              <>
                {modalPlace.formatted_address && (
                  <div className="detail-row">
                    <div className="detail-label" data-i18n-key="modal.address">
                      {translations[currentLang as keyof typeof translations].modal.address}
                    </div>
                    <div className="detail-value">{modalPlace.formatted_address}</div>
                  </div>
                )}

                {modalPlace.formatted_phone_number && (
                  <div className="detail-row">
                    <div className="detail-label" data-i18n-key="modal.phone">
                      {translations[currentLang as keyof typeof translations].modal.phone}
                    </div>
                    <div className="detail-value">{modalPlace.formatted_phone_number}</div>
                  </div>
                )}

                {modalPlace.website && (
                  <div className="detail-row">
                    <div className="detail-label" data-i18n-key="modal.website">
                      {translations[currentLang as keyof typeof translations].modal.website}
                    </div>
                    <div className="detail-value">
                      <a href={modalPlace.website} target="_blank" rel="noopener noreferrer">
                        {modalPlace.website}
                      </a>
                    </div>
                  </div>
                )}

                <div className="detail-row">
                  <div className="detail-label" data-i18n-key="modal.rating">
                    {translations[currentLang as keyof typeof translations].modal.rating}
                  </div>
                  <div className="detail-value">
                    {modalPlace.rating
                      ? `⭐ ${modalPlace.rating} (${modalPlace.user_ratings_total || 0} reviews)`
                      : translations[currentLang as keyof typeof translations].modal.noRating}
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-label" data-i18n-key="modal.priceLevel">
                    {translations[currentLang as keyof typeof translations].modal.priceLevel}
                  </div>
                  <div className="detail-value">
                    {modalPlace.price_level
                      ? "💰".repeat(modalPlace.price_level)
                      : translations[currentLang as keyof typeof translations].modal.notAvailable}
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-label" data-i18n-key="modal.businessType">
                    {translations[currentLang as keyof typeof translations].modal.businessType}
                  </div>
                  <div className="detail-value">
                    {modalPlace.types?.slice(0, 3).join(", ") ||
                      translations[currentLang as keyof typeof translations].modal.notSpecified}
                  </div>
                </div>

                {modalPlace.opening_hours?.weekday_text && (
                  <div className="detail-row">
                    <div className="detail-label" data-i18n-key="modal.hours">
                      {translations[currentLang as keyof typeof translations].modal.hours}
                    </div>
                    <div className="detail-value">
                      {modalPlace.opening_hours.weekday_text.map((hours, index) => (
                        <div key={index}>{hours}</div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
