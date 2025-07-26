"use client"

import { useEffect, useRef } from "react"
import { useAvatar } from "@/contexts/avatar-context"
import { ThreeJSManager } from "@/lib/threejs-manager"
import { AvatarLoader } from "@/lib/avatar-loader"
import { AnimationManager } from "@/lib/animation-manager"

export default function Avatar3D() {
  const containerRef = useRef<HTMLDivElement>(null)
  const threeManagerRef = useRef<ThreeJSManager | null>(null)
  const avatarLoaderRef = useRef<AvatarLoader | null>(null)
  const animationManagerRef = useRef<AnimationManager | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  const { setLoading, setReady, setStatus, setError, setAvatar, setBones, setMorphTargets, state } = useAvatar()

  useEffect(() => {
    if (!containerRef.current) return

    const initializeAvatar = async () => {
      try {
        // Wait for Three.js to be loaded
        if (!window.THREE) {
          setStatus("Loading 3D libraries...")
          await loadThreeJS()
        }

        // Initialize Three.js scene
        const threeManager = new ThreeJSManager(containerRef.current!)
        threeManagerRef.current = threeManager

        // Initialize avatar loader
        const avatarLoader = new AvatarLoader(threeManager.scene)
        avatarLoaderRef.current = avatarLoader

        // Initialize animation manager
        const animationManager = new AnimationManager()
        animationManagerRef.current = animationManager

        // Set up progress callback
        avatarLoader.setProgressCallback((progress) => {
          setStatus(`Loading avatar... ${Math.round(progress)}%`)
        })

        // Load the avatar
        const modelUrl = "https://models.readyplayer.me/687dfb279761f9c1c601880c.glb"

        const avatarData = await avatarLoader.loadAvatar(modelUrl)

        setAvatar(avatarData.avatar)
        setBones(avatarData.bones)
        setMorphTargets(avatarData.morphTargets)

        // Initialize animations
        animationManager.initialize(avatarData.avatar, avatarData.bones, avatarData.morphTargets)

        setLoading(false)
        setReady(true)
        setStatus("Avatar loaded! Type something to make it speak.")

        // Start idle animations
        animationManager.startIdleAnimation()

        // Start render loop with animation updates
        const animate = () => {
          animationFrameRef.current = requestAnimationFrame(animate)

          // Update animations
          if (animationManagerRef.current) {
            animationManagerRef.current.update(0.016)
          }

          // Update Three.js
          threeManager.render()
        }
        animate()
      } catch (error) {
        console.error("Failed to initialize avatar:", error)
        setError(`Failed to load avatar: ${error}`)
        setLoading(false)
      }
    }

    initializeAvatar()

    return () => {
      // Cleanup
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (threeManagerRef.current) {
        threeManagerRef.current.cleanup()
      }
      if (animationManagerRef.current) {
        animationManagerRef.current.cleanup()
      }
    }
  }, [setLoading, setReady, setStatus, setError, setAvatar, setBones, setMorphTargets])

  // Update animation state based on context
  useEffect(() => {
    if (animationManagerRef.current) {
      if (state.isSpeaking) {
        animationManagerRef.current.startSpeakingAnimation()
      } else if (state.isThinking) {
        animationManagerRef.current.startThinkingAnimation()
      } else if (!state.isSpeaking && !state.isThinking) {
        animationManagerRef.current.stopSpeakingAnimation()
        animationManagerRef.current.stopThinkingAnimation()
        animationManagerRef.current.startIdleAnimation()
      }
    }
  }, [state.isSpeaking, state.isThinking])

  const loadThreeJS = async (): Promise<void> => {
    const scripts = [
      "https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js",
      "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js",
      "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js",
      "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.4/gsap.min.js",
    ]

    for (const src of scripts) {
      await loadScript(src)
    }
  }

  const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve()
        return
      }

      const script = document.createElement("script")
      script.src = src
      script.onload = () => resolve()
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
      document.head.appendChild(script)
    })
  }

  return (
    <div id="scene-container" ref={containerRef} className="absolute inset-0 flex items-center justify-center z-10" />
  )
}
