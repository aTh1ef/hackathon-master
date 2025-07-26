
"use client"
import TypingPromptInput from "@/components/typing-prompt-input"
import FramerSpotlight from "@/components/framer-spotlight"
import CssGridBackground from "@/components/css-grid-background"
import LanguageDropdown from "@/components/language-dropdown"
import { useLanguage } from "@/contexts/language-context"
import GoogleLoginButton from "@/components/GoogleLoginButton"

export default function LandingPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-emerald-950 to-black relative">
      <CssGridBackground />
      <FramerSpotlight />

      {/* Main Content Container - Removed overflow-hidden and improved layout */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header Section */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 md:px-8 py-8 sm:py-12">
          <div className="w-full max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center space-y-6 sm:space-y-8">
              {/* Animation Section */}
              <div className="flex justify-center">
                <div className="relative">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain drop-shadow-2xl"
                  >
                    <source
                      src="https://ofhubh1u0o5vkedk.public.blob.vercel-storage.com/Animation%20-%201751449783387-eANbGUvzlNpOnoBj8MtprTaruUMMUJ.webm"
                      type="video/webm"
                    />
                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full animate-pulse"></div>
                  </video>
                </div>
              </div>

              {/* Badge */}
              <div className="inline-flex items-center rounded-full bg-gray-800/60 border border-gray-600/40 backdrop-blur-sm px-4 py-2 text-sm text-gray-300 font-medium">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                {t("crop.title")}
              </div>

              {/* Main Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight bg-gradient-to-b from-white to-gray-300 bg-clip-text text-transparent max-w-4xl">
                {t("landing.title")}
              </h1>

              {/* Description */}
              <p className="text-lg sm:text-xl md:text-2xl text-gray-400 leading-relaxed max-w-3xl">
                {t("landing.description")}
              </p>

              {/* Typing Input */}
              <div className="w-full max-w-2xl">
                <TypingPromptInput />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Section - Fixed positioning */}
        <div className="relative z-20 pb-8 sm:pb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 max-w-2xl mx-auto">
              <div className="w-full sm:flex-1">
                <GoogleLoginButton />
              </div>
              <div className="w-full sm:w-auto sm:min-w-[240px]">
                <LanguageDropdown />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
