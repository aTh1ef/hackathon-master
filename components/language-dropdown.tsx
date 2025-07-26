
"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, Globe, Check } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface LanguageDropdownProps {
  className?: string
}

export default function LanguageDropdown({ className }: LanguageDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { language, setLanguage, t } = useLanguage()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const languages = [
    { code: "en" as const, name: t("lang.english"), flag: "🇺🇸" },
    { code: "hi" as const, name: t("lang.hindi"), flag: "🇮🇳" },
    { code: "kn" as const, name: t("lang.kannada"), flag: "🇮🇳" },
  ]

  const currentLanguage = languages.find((lang) => lang.code === language)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      return () => document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen])

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-14 sm:h-16 px-4 sm:px-6 rounded-xl border-2 border-gray-600/50 bg-gray-800/60 hover:bg-gray-700/70 backdrop-blur-sm text-sm sm:text-base font-medium text-gray-300 hover:text-white transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:border-gray-500/50 group"
        type="button"
      >
        <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-white transition-colors" />
        <span className="text-lg">{currentLanguage?.flag}</span>
        <span className="truncate font-medium">{t("landing.selectLanguage")}</span>
        <ChevronDown
          className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-white transition-all duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </Button>

      {/* Enhanced Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={() => setIsOpen(false)} />

          {/* Dropdown Menu */}
          <div className="absolute top-full mt-3 left-0 right-0 sm:left-auto sm:right-0 sm:w-72 bg-gray-800/95 backdrop-blur-md border border-gray-600/50 rounded-xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
            <div className="p-2">
              {languages.map((lang, index) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code)
                    setIsOpen(false)
                  }}
                  className={`w-full px-4 py-3.5 text-left rounded-lg transition-all duration-200 flex items-center gap-3 text-sm sm:text-base group ${
                    language === lang.code
                      ? "bg-green-600/20 text-white border border-green-500/30"
                      : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span className="font-medium truncate flex-1">{lang.name}</span>
                  {language === lang.code && <Check className="w-4 h-4 text-green-400 flex-shrink-0" />}
                </button>
              ))}
            </div>

            {/* Dropdown footer */}
            <div className="px-4 py-2 border-t border-gray-700/50 bg-gray-900/50">
              <p className="text-xs text-gray-500 text-center">Choose your preferred language</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
