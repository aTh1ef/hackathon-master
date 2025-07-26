
"use client"

import { useRouter } from "next/navigation"
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { setDoc, doc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Zap, ArrowRight, Loader2 } from "lucide-react"
import { auth, db } from "../firebaseConfig"
import { useAuth } from "../contexts/AuthContext"
import { useState } from "react"

export default function GoogleLoginButton() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const login = async () => {
    setIsLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      await setDoc(doc(db, "farmers", user.uid), {
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: new Date().toISOString(),
      })

      router.push("/features")
    } catch (error) {
      let message = "An unknown error occurred."
      if (error instanceof Error) message = error.message
      alert("Error: " + message)
    } finally {
      setIsLoading(false)
    }
  }

  if (user) {
    return (
      <Button
        onClick={() => router.push("/features")}
        disabled={isLoading}
        className="w-full h-14 sm:h-16 px-4 sm:px-6 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 text-sm sm:text-base font-semibold text-white border border-blue-500/20 group"
      >
        <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-200 group-hover:text-white transition-colors" />
        <span>Launch Features</span>
        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-blue-200 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
      </Button>
    )
  }

  return (
    <Button
      onClick={login}
      disabled={isLoading}
      className="w-full h-14 sm:h-16 px-4 sm:px-6 rounded-xl bg-gradient-to-r from-green-600 via-green-600 to-emerald-600 hover:from-green-700 hover:via-green-700 hover:to-emerald-700 shadow-lg shadow-green-600/30 hover:shadow-green-600/40 transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 text-sm sm:text-base font-semibold text-white border border-green-500/20 group relative overflow-hidden"
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-400/0 via-green-400/20 to-green-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

      {isLoading ? (
        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin relative z-10" />
      ) : (
        <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-green-200 group-hover:text-white transition-colors relative z-10" />
      )}

      <div className="flex flex-col leading-tight relative z-10">
        <span className="font-bold">{isLoading ? "Signing in..." : "Get Started"}</span>
        <span className="text-xs text-green-200 group-hover:text-green-100 transition-colors -mt-0.5">
          {isLoading ? "Please wait..." : "Sign in with Google"}
        </span>
      </div>

      {!isLoading && (
        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-green-200 group-hover:text-white group-hover:translate-x-0.5 transition-all relative z-10" />
      )}
    </Button>
  )
}
