"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Scan, MessageCircle, TrendingUp, Map, ArrowLeft, Lock, Sparkles, Leaf } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/AuthContext" // Import your auth context
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/firebaseConfig" // Your firebase config
import CssGridBackground from "@/components/css-grid-background"
import FramerSpotlight from "@/components/framer-spotlight"

export default function FeaturesPage() {
  const { t } = useLanguage()
  const { user } = useAuth() // Get authenticated user
  const [userName, setUserName] = useState<string>("")
  const [loading, setLoading] = useState(true)

  // Fetch user name from Firebase on component mount
  useEffect(() => {
    async function fetchUserName() {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const docRef = doc(db, "farmers", user.uid)
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          const data = docSnap.data()
          // Priority: Firestore name > Auth displayName > fallback
          setUserName(data.name || user.displayName || "Farmer")
        } else {
          // If no Firestore doc, use auth displayName or fallback
          setUserName(user.displayName || "Farmer")
        }
      } catch (error) {
        console.error("Error fetching user name:", error)
        setUserName(user.displayName || "Farmer")
      } finally {
        setLoading(false)
      }
    }

    fetchUserName()
  }, [user])

  const features = [
    {
      id: "crop-analysis",
      title: "Crop Analysis",
      description:
        "Analyze your crops using AI-powered image recognition technology for instant disease detection and treatment recommendations",
      icon: Scan,
      href: "/crop-doctor",
      available: true,
      gradient: "from-emerald-500 to-green-600",
      bgGradient: "from-emerald-500/10 to-green-600/10",
      borderColor: "border-emerald-500/20 hover:border-emerald-400/40",
      features: ["AI Disease Detection", "Instant Results", "Treatment Plans"],
    },
    {
      id: "chatbot",
      title: "AI Assistant",
      description:
        "Get personalized farming advice and expert guidance from our intelligent chatbot with multi-language support",
      icon: MessageCircle,
      href: "/chatbot",
      available: true,
      gradient: "from-blue-500 to-cyan-600",
      bgGradient: "from-blue-500/10 to-cyan-600/10",
      borderColor: "border-blue-500/20 hover:border-blue-400/40",
      features: ["24/7 Support", "Voice Recognition", "Multi-Language"],
    },
    {
      id: "soil-analysis",
      title: "Soil Analysis & Crop Suggestion",
      description:
        "Upload a photo of your soil and let our system analyze it along with your farm's location to suggest the best crops to grow. Multilingual support included.",
      icon: Leaf,
      href: "/soil-analysis",
      available: true,
      gradient: "from-yellow-500 to-green-600",
      bgGradient: "from-yellow-500/10 to-green-600/10",
      borderColor: "border-yellow-500/20 hover:border-green-400/40",
      features: ["Soil Image Detection", "Location-Based Crop Advice", "Multi-Language"],
    },
    // {
    //   id: "my-farm",
    //   title: "My Farm",
    //   description:
    //     "Manage your farm details, get personalized AI advice for your crops, and track your farming progress",
    //   icon: Leaf,
    //   href: "/my-farm",
    //   available: true,
    //   gradient: "from-green-500 to-emerald-600",
    //   bgGradient: "from-green-500/10 to-emerald-600/10",
    //   borderColor: "border-green-500/20 hover:border-emerald-400/40",
    //   features: ["Crop Management", "AI Advice", "Progress Tracking"],
    // },
    {
      id: "market-analysis",
      title: "Market Analysis",
      description:
        "Access real-time market trends, pricing insights, and crop demand forecasting tools for better decisions",
      icon: TrendingUp,
      href: "#",
      available: false,
      gradient: "from-purple-500 to-pink-600",
      bgGradient: "from-gray-500/5 to-gray-600/5",
      borderColor: "border-gray-600/20",
      features: ["Price Trends", "Demand Forecast", "Market Insights"],
    },
    {
      id: "maps",
      title: "Smart Maps",
      description: "Explore agricultural mapping, weather patterns, soil analysis, and location-based farming insights",
      icon: Map,
      href: "#",
      available: false,
      gradient: "from-orange-500 to-red-600",
      bgGradient: "from-gray-500/5 to-gray-600/5",
      borderColor: "border-gray-600/20",
      features: ["Weather Data", "Soil Analysis", "Location Insights"],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-emerald-950 to-black text-white relative overflow-hidden">
      <CssGridBackground />
      <FramerSpotlight />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <Link href="/landing">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
              <video autoPlay loop muted playsInline className="w-8 h-8 object-contain">
                <source
                  src="https://ofhubh1u0o5vkedk.public.blob.vercel-storage.com/Animation%20-%201751449783387-eANbGUvzlNpOnoBj8MtprTaruUMMUJ.webm"
                  type="video/webm"
                />
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg animate-pulse"></div>
              </video>
            </div>
            <span className="text-xl font-bold tracking-tight">{t("crop.title") || "AI Crop Doctor"}</span>
          </div>
        </div>

        {/* Hero Section with Dynamic Welcome */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl blur opacity-20"></div>
            </div>
          </div>

          {/* Dynamic Welcome Message */}
          {!loading && userName && (
            <div className="mb-4">
              <h2 className="text-2xl md:text-3xl font-semibold text-emerald-300 mb-2">
                Hey, welcome {userName}! 👋
              </h2>
            </div>
          )}

          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-emerald-200 to-green-300 bg-clip-text text-transparent">
            Features
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Discover our comprehensive suite of AI-powered agricultural tools designed to revolutionize your farming
            experience
          </p>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature) => {
              const IconComponent = feature.icon

              return (
                <div key={feature.id} className="group relative">
                  {/* Background Glow Effect */}
                  {feature.available && (
                    <div
                      className={`absolute -inset-1 bg-gradient-to-r ${feature.gradient} rounded-3xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
                    ></div>
                  )}

                  {/* Card Container - Fixed Height */}
                  <Card
                    className={`relative h-96 bg-gradient-to-br ${feature.bgGradient} backdrop-blur-sm border ${feature.borderColor} rounded-3xl transition-all duration-300 ${
                      feature.available ? "hover:scale-[1.02] cursor-pointer" : "cursor-not-allowed opacity-60"
                    }`}
                  >
                    <CardContent className="p-8 h-full flex flex-col">
                      {/* Icon Section */}
                      <div className="flex items-center justify-center mb-6">
                        <div
                          className={`relative w-20 h-20 rounded-2xl flex items-center justify-center ${
                            feature.available
                              ? `bg-gradient-to-br ${feature.gradient} group-hover:scale-110 shadow-lg`
                              : "bg-gray-600"
                          } transition-all duration-300`}
                        >
                          <IconComponent className="w-10 h-10 text-white" />
                          {!feature.available && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center border-2 border-gray-600">
                              <Lock className="w-3 h-3 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="text-center flex-1 flex flex-col">
                        <h3 className={`text-2xl font-bold mb-4 ${feature.available ? "text-black" : "text-gray-400"}`}>
                          {feature.title}
                        </h3>
                        <p
                          className={`leading-relaxed mb-6 flex-1 ${feature.available ? "text-gray-600" : "text-gray-500"}`}
                        >
                          {feature.description}
                        </p>

                        {/* Feature Tags */}
                        <div className="flex flex-wrap justify-center gap-2 mb-6">
                          {feature.features.map((item, index) => (
                            <span
                              key={index}
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                feature.available
                                  ? "bg-white/10 text-gray-800 border border-white/20"
                                  : "bg-gray-700/30 text-gray-500 border border-gray-600/30"
                              }`}
                            >
                              {item}
                            </span>
                          ))}
                        </div>

                        {/* Action Button */}
                        <div className="mt-auto">
                          {feature.available ? (
                            <Link href={feature.href}>
                              <Button
                                className={`w-full bg-gradient-to-r ${feature.gradient} hover:opacity-90 text-white py-3 rounded-xl font-semibold transition-all duration-300 group-hover:scale-105 shadow-lg hover:shadow-xl`}
                              >
                                Get Started
                              </Button>
                            </Link>
                          ) : (
                            <Button
                              disabled
                              className="w-full bg-gray-700/50 text-gray-400 py-3 rounded-xl font-semibold cursor-not-allowed border border-gray-600/30"
                            >
                              Coming Soon
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Available Feature Link Wrapper */}
                  {feature.available && <Link href={feature.href} className="absolute inset-0 z-10 rounded-3xl" />}
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom CTA Section */}
        <div className="text-center mt-20">
          <div className="bg-gradient-to-r from-emerald-900/20 to-green-900/20 backdrop-blur-sm border border-emerald-700/20 rounded-3xl p-8 max-w-4xl mx-auto">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center">
                <Sparkles className=" w-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">More Features Coming Soon</h3>
            <p className="text-gray-300 mb-6 leading-relaxed max-w-2xl mx-auto">
              We're constantly working to bring you more innovative agricultural tools. Stay tuned for market analysis,
              smart mapping, weather forecasting, and much more!
            </p>
            <div className="flex justify-center">
              <div className="flex items-center gap-3 bg-emerald-900/30 px-4 py-2 rounded-full border border-emerald-700/30">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-emerald-300">Development in Progress</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}