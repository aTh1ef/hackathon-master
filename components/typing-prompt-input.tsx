"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export default function TypingPromptInput() {
  const { t, language } = useLanguage()

  // Define prompts with fallbacks
  const getPrompts = () => {
    return [
      t("prompts.tomato") || "My tomato plants have brown spots on the leaves...",
      t("prompts.cucumber") || "White powdery substance on cucumber leaves...",
      t("prompts.pepper") || "Yellow wilting leaves on my pepper plants...",
      t("prompts.corn") || "Small holes in corn leaves with brown edges...",
      t("prompts.potato") || "Black spots appearing on potato plant stems...",
    ]
  }

  const [displayText, setDisplayText] = useState("")
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const [currentCharIndex, setCurrentCharIndex] = useState(0)
  const [prompts, setPrompts] = useState(getPrompts())

  // Controls the typing speed
  const typingSpeed = 50 // milliseconds per character
  const deletingSpeed = 20 // milliseconds per character
  const pauseBeforeDelete = 2000 // pause before deleting
  const pauseBeforeNextPrompt = 500 // pause before typing next prompt

  // Update prompts when language changes
  useEffect(() => {
    const newPrompts = getPrompts()
    setPrompts(newPrompts)
    setDisplayText("")
    setCurrentPromptIndex(0)
    setCurrentCharIndex(0)
    setIsTyping(true)
  }, [language])

  useEffect(() => {
    let timeout: NodeJS.Timeout

    if (prompts.length === 0) return

    if (isTyping) {
      // Typing animation
      if (currentCharIndex < prompts[currentPromptIndex].length) {
        timeout = setTimeout(() => {
          setDisplayText(prompts[currentPromptIndex].substring(0, currentCharIndex + 1))
          setCurrentCharIndex(currentCharIndex + 1)
        }, typingSpeed)
      } else {
        // Finished typing, pause before deleting
        timeout = setTimeout(() => {
          setIsTyping(false)
        }, pauseBeforeDelete)
      }
    } else {
      // Deleting animation
      if (currentCharIndex > 0) {
        timeout = setTimeout(() => {
          setDisplayText(prompts[currentPromptIndex].substring(0, currentCharIndex - 1))
          setCurrentCharIndex(currentCharIndex - 1)
        }, deletingSpeed)
      } else {
        // Finished deleting, move to next prompt
        timeout = setTimeout(() => {
          setCurrentPromptIndex((currentPromptIndex + 1) % prompts.length)
          setIsTyping(true)
        }, pauseBeforeNextPrompt)
      }
    }

    return () => clearTimeout(timeout)
  }, [currentCharIndex, currentPromptIndex, isTyping, prompts])

  return (
    <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl mx-auto">
      <div className="relative group">
        {/* Outer glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600/30 to-green-600/30 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>

        <div className="relative">
          <Input
            className="pr-12 sm:pr-20 py-4 sm:py-6 text-sm sm:text-base rounded-xl backdrop-blur-md border-2 focus-visible:ring-0 focus-visible:ring-offset-0 
            bg-gray-800/50 border-gray-600/50 text-white placeholder:text-gray-400
            shadow-[0_4px_20px_rgba(34,197,94,0.1)] focus:border-green-500/50"
            placeholder=""
            value={displayText}
            readOnly
          />
          <Button
            size="icon"
            className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 
            bg-green-600 hover:bg-green-700 backdrop-blur-md shadow-md"
            aria-label="Send message"
          >
            <Send className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
