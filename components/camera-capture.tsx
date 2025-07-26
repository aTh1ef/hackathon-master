"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Camera, X, RotateCcw, Check } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface CameraCaptureProps {
  onCapture: (file: File) => void
  onClose: () => void
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const { t } = useLanguage()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment")

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [facingMode])

  const startCamera = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }

      setIsLoading(false)
    } catch (err) {
      console.error("Error accessing camera:", err)
      setError("Unable to access camera. Please check permissions.")
      setIsLoading(false)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Get the image data URL
    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.8)
    setCapturedImage(imageDataUrl)
  }

  const retakePhoto = () => {
    setCapturedImage(null)
  }

  const confirmPhoto = () => {
    if (!capturedImage || !canvasRef.current) return

    // Convert canvas to blob and then to file
    canvasRef.current.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `crop-photo-${Date.now()}.jpg`, {
            type: "image/jpeg",
          })
          onCapture(file)
          stopCamera()
          onClose()
        }
      },
      "image/jpeg",
      0.8,
    )
  }

  const switchCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"))
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 max-w-xs sm:max-w-md mx-auto text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <X className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Camera Error</h3>
          <p className="text-gray-300 mb-4 text-sm sm:text-base">{error}</p>
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header - Responsive */}
      <div className="flex items-center justify-between p-3 sm:p-4 bg-black/50">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/20 w-8 h-8 sm:w-10 sm:h-10"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </Button>
        <h2 className="text-white font-semibold text-sm sm:text-base">Take Photo</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={switchCamera}
          className="text-white hover:bg-white/20 w-8 h-8 sm:w-10 sm:h-10"
        >
          <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
        </Button>
      </div>

      {/* Camera View - Responsive */}
      <div className="flex-1 relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-white text-center">
              <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm sm:text-base">Starting camera...</p>
            </div>
          </div>
        )}

        {capturedImage ? (
          <img src={capturedImage || "/placeholder.svg"} alt="Captured" className="w-full h-full object-cover" />
        ) : (
          <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
        )}

        <canvas ref={canvasRef} className="hidden" />

        {/* Camera overlay guide - Responsive */}
        {!capturedImage && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
            <div className="w-64 h-48 sm:w-80 sm:h-60 border-2 border-white/50 rounded-lg relative">
              <div className="absolute -top-1 -left-1 w-4 h-4 sm:w-6 sm:h-6 border-t-2 border-l-2 border-white"></div>
              <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 border-t-2 border-r-2 border-white"></div>
              <div className="absolute -bottom-1 -left-1 w-4 h-4 sm:w-6 sm:h-6 border-b-2 border-l-2 border-white"></div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 border-b-2 border-r-2 border-white"></div>
              <div className="absolute -bottom-8 sm:-bottom-10 left-1/2 transform -translate-x-1/2 text-white text-xs sm:text-sm text-center">
                Position crop within frame
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls - Responsive */}
      <div className="p-4 sm:p-6 bg-black/50">
        {capturedImage ? (
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <Button
              variant="outline"
              onClick={retakePhoto}
              className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 text-sm sm:text-base px-4 sm:px-6"
            >
              <RotateCcw className="w-4 h-4" />
              Retake
            </Button>
            <Button
              onClick={confirmPhoto}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 sm:px-8 text-sm sm:text-base"
            >
              <Check className="w-4 h-4" />
              Use Photo
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <Button
              onClick={capturePhoto}
              disabled={isLoading}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white hover:bg-gray-200 text-black p-0 shadow-lg"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-4 border-black flex items-center justify-center">
                <Camera className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
