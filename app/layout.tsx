import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { LanguageProvider } from "@/contexts/language-context"
import { AuthProvider } from "@/contexts/AuthContext"
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI Crop Doctor",
  description: "AI-powered crop disease detection and treatment recommendations",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
         <AuthProvider>
        <LanguageProvider>{children}</LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

































