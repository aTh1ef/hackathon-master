import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { gsap } from "gsap"

interface HandGesture {
  name: string
  leftHand: {
    rotation: { x: number; y: number; z: number }
    forearm: { x: number; y: number; z: number }
  }
  rightHand: {
    rotation: { x: number; y: number; z: number }
    forearm: { x: number; y: number; z: number }
  }
}

export class AnimationManager {
  private avatar: THREE.Group | null = null
  private bones: { [key: string]: THREE.Bone } = {}
  private morphTargets: { [key: string]: { mesh: THREE.Mesh; index: number } } = {}

  // Animation mixers and actions - exactly like the original
  private mixer: THREE.AnimationMixer | null = null
  private speakingAnimation: THREE.AnimationAction | null = null
  private idleMixer: THREE.AnimationMixer | null = null
  private idleAnimation: THREE.AnimationAction | null = null
  private idleAnimationTwo: THREE.AnimationAction | null = null
  private idleAnimationThree: THREE.AnimationAction | null = null
  private idleAnimations: THREE.AnimationAction[] = []
  private currentIdleIndex = 0
  private idleAnimationTimeout: NodeJS.Timeout | null = null

  private isInitialized = false
  private speaking = false
  private thinking = false

  // Natural resting pose for arms - exactly from original
  private readonly restingPose = {
    leftShoulder: { x: 0, y: 0, z: -0.05 },
    rightShoulder: { x: 0, y: 0, z: 0.05 },
    leftArm: { x: 0.1, y: 0, z: -0.05 },
    rightArm: { x: 0.1, y: 0, z: 0.05 },
    leftForearm: { x: 0.15, y: 0, z: 0 },
    rightForearm: { x: 0.15, y: 0, z: 0 },
    leftHand: { x: 0, y: 0, z: -0.1 },
    rightHand: { x: 0, y: 0, z: 0.1 },
  }

  // Hand gesture definitions - exactly from original
  private readonly handGestures: HandGesture[] = [
    {
      name: "pointing",
      leftHand: {
        rotation: { x: -0.3, y: 0, z: 0 },
        forearm: { x: 0.2, y: 0, z: 0 },
      },
      rightHand: {
        rotation: { x: -0.3, y: 0, z: 0 },
        forearm: { x: 0.2, y: 0, z: 0 },
      },
    },
    {
      name: "open_palm",
      leftHand: {
        rotation: { x: -0.4, y: 0, z: -0.1 },
        forearm: { x: 0.3, y: 0, z: 0 },
      },
      rightHand: {
        rotation: { x: -0.4, y: 0, z: 0.1 },
        forearm: { x: 0.3, y: 0, z: 0 },
      },
    },
    {
      name: "emphasis",
      leftHand: {
        rotation: { x: -0.2, y: 0, z: -0.2 },
        forearm: { x: 0.1, y: 0.1, z: -0.1 },
      },
      rightHand: {
        rotation: { x: -0.2, y: 0, z: 0.2 },
        forearm: { x: 0.1, y: -0.1, z: 0.1 },
      },
    },
    {
      name: "thinking",
      leftHand: {
        rotation: { x: 0, y: 0, z: 0 },
        forearm: { x: 0, y: 0, z: 0 },
      },
      rightHand: {
        rotation: { x: 0.8, y: 0, z: 0 },
        forearm: { x: 0.7, y: 0, z: 0 },
      },
    },
  ]

  public initialize(
    avatar: THREE.Group,
    bones: { [key: string]: THREE.Bone },
    morphTargets: { [key: string]: { mesh: THREE.Mesh; index: number } },
  ) {
    this.avatar = avatar
    this.bones = bones
    this.morphTargets = morphTargets

    // Load animations exactly like the original
    this.loadSpeakingAnimation()
    this.loadIdleAnimation()

    // Set initial resting pose
    this.setArmsToRestingPosition()

    this.isInitialized = true
    console.log("AnimationManager initialized")
  }

  // Load speaking animation - exactly from original
  private loadSpeakingAnimation() {
    if (!this.avatar) return

    const animLoader = new GLTFLoader()
    animLoader.load(
      "https://avatar-animations.vercel.app/movements.glb",
      (gltf) => {
        if (gltf.animations && gltf.animations.length > 0) {
          this.mixer = new THREE.AnimationMixer(this.avatar!)
          this.speakingAnimation = this.mixer.clipAction(gltf.animations[0])

          // Configure exactly like original
          this.speakingAnimation.setLoop(THREE.LoopRepeat)
          this.speakingAnimation.clampWhenFinished = true
          this.speakingAnimation.timeScale = 1
          this.speakingAnimation.weight = 0.7
          this.speakingAnimation.enabled = true

          console.log("Speaking animation loaded successfully")
        }
      },
      undefined,
      (error) => {
        console.error("Error loading speaking animation:", error)
      },
    )
  }

  // Load idle animations - exactly from original
  private loadIdleAnimation() {
    if (!this.avatar) return

    let loadedAnimations = 0
    const totalAnimations = 3

    // Create mixer for idle animations
    this.idleMixer = new THREE.AnimationMixer(this.avatar)

    // Load greeting animation (first in loop)
    const animLoaderGreeting = new GLTFLoader()
    animLoaderGreeting.load(
      "https://avatar-animations.vercel.app/greeting.glb",
      (gltf) => {
        if (gltf.animations && gltf.animations.length > 0) {
          this.idleAnimationThree = this.idleMixer!.clipAction(gltf.animations[0])
          this.idleAnimationThree.setLoop(THREE.LoopOnce)
          this.idleAnimationThree.clampWhenFinished = true
          this.idleAnimationThree.timeScale = 1
          this.idleAnimationThree.weight = 1
          this.idleAnimationThree.enabled = true
          this.idleAnimations[0] = this.idleAnimationThree
          console.log("Greeting animation loaded successfully")
          loadedAnimations++
          if (loadedAnimations === totalAnimations && !this.speaking) {
            this.scheduleIdleResume(100)
          }
        }
      },
      undefined,
      (error) => {
        console.error("Error loading greeting animation:", error)
      },
    )

    // Load first idle animation
    const animLoader1 = new GLTFLoader()
    animLoader1.load(
      "https://avatar-animations.vercel.app/idle.glb",
      (gltf) => {
        if (gltf.animations && gltf.animations.length > 0) {
          this.idleAnimation = this.idleMixer!.clipAction(gltf.animations[0])
          this.idleAnimation.setLoop(THREE.LoopOnce)
          this.idleAnimation.clampWhenFinished = true
          this.idleAnimation.timeScale = 1
          this.idleAnimation.weight = 1
          this.idleAnimation.enabled = true
          this.idleAnimations[1] = this.idleAnimation
          console.log("First idle animation loaded successfully")
          loadedAnimations++
          if (loadedAnimations === totalAnimations && !this.speaking) {
            this.scheduleIdleResume(100)
          }
        }
      },
      undefined,
      (error) => {
        console.error("Error loading first idle animation:", error)
      },
    )

    // Load second idle animation
    const animLoader2 = new GLTFLoader()
    animLoader2.load(
      "https://avatar-animations.vercel.app/idletwo.glb",
      (gltf) => {
        if (gltf.animations && gltf.animations.length > 0) {
          this.idleAnimationTwo = this.idleMixer!.clipAction(gltf.animations[0])
          this.idleAnimationTwo.setLoop(THREE.LoopOnce)
          this.idleAnimationTwo.clampWhenFinished = true
          this.idleAnimationTwo.timeScale = 1
          this.idleAnimationTwo.weight = 1
          this.idleAnimationTwo.enabled = true
          this.idleAnimations[2] = this.idleAnimationTwo
          console.log("Second idle animation loaded successfully")
          loadedAnimations++
          if (loadedAnimations === totalAnimations && !this.speaking) {
            this.scheduleIdleResume(100)
          }
        }
      },
      undefined,
      (error) => {
        console.error("Error loading second idle animation:", error)
      },
    )
  }

  // Start idle animation sequence - exactly from original
  public startIdleAnimation() {
    if (this.idleAnimations.length > 0 && !this.speaking && !this.thinking) {
      this.startIdleSequence()
    }
  }

  // Start the idle sequence with the current animation - exactly from original
  private startIdleSequence() {
    if (this.idleAnimations.length === 0 || this.speaking || this.thinking) return

    const currentAnimation = this.idleAnimations[this.currentIdleIndex]
    if (currentAnimation && !currentAnimation.isRunning()) {
      // Stop all idle animations first
      this.idleAnimations.forEach((anim) => {
        if (anim && anim.isRunning()) {
          anim.stop()
        }
      })

      // Start current animation
      currentAnimation.reset()
      currentAnimation.play()
      currentAnimation.setEffectiveWeight(1)

      console.log(`Started idle animation ${this.currentIdleIndex + 1}`)

      // Set up listener for when animation finishes
      this.setupIdleAnimationListener(currentAnimation)
    }
  }

  // Set up listener for seamless transition - exactly from original
  private setupIdleAnimationListener(animation: THREE.AnimationAction) {
    if (!this.idleMixer) return

    // Remove any existing listeners
    this.idleMixer.removeEventListener("finished", this.handleIdleAnimationFinished)

    // Add new listener
    this.idleMixer.addEventListener("finished", this.handleIdleAnimationFinished)
  }

  // Handle transition to next idle animation - exactly from original
  private handleIdleAnimationFinished = (event: any) => {
    if (this.speaking || this.thinking) return

    // Move to next animation in sequence
    this.currentIdleIndex = (this.currentIdleIndex + 1) % this.idleAnimations.length

    console.log(`Transitioning to idle animation ${this.currentIdleIndex + 1}`)

    // Start next animation immediately for seamless transition
    setTimeout(() => {
      if (!this.speaking && !this.thinking) {
        this.startIdleSequence()
      }
    }, 50)
  }

  // Stop idle animations - exactly from original
  public stopIdleAnimation() {
    // Clear any pending idle animation resume
    if (this.idleAnimationTimeout) {
      clearTimeout(this.idleAnimationTimeout)
      this.idleAnimationTimeout = null
    }

    // Stop all idle animations
    this.idleAnimations.forEach((anim, index) => {
      if (anim && anim.isRunning()) {
        anim.paused = true
        anim.setEffectiveWeight(0)
        console.log(`Paused idle animation ${index + 1}`)
      }
    })

    // Remove event listener
    if (this.idleMixer) {
      this.idleMixer.removeEventListener("finished", this.handleIdleAnimationFinished)
    }
  }

  // Resume idle animation sequence - exactly from original
  private resumeIdleAnimation() {
    if (this.idleAnimations.length === 0 || this.speaking || this.thinking) return

    const currentAnimation = this.idleAnimations[this.currentIdleIndex]
    if (currentAnimation) {
      // Resume from current position if paused
      if (currentAnimation.paused) {
        currentAnimation.paused = false
        currentAnimation.setEffectiveWeight(1)
        this.setupIdleAnimationListener(currentAnimation)
        console.log(`Resumed idle animation ${this.currentIdleIndex + 1} from pause`)
      } else if (!currentAnimation.isRunning()) {
        // Start the sequence fresh
        this.startIdleSequence()
      }
    }
  }

  // Schedule idle animation resume - exactly from original
  private scheduleIdleResume(delay = 500) {
    // Clear any existing timeout
    if (this.idleAnimationTimeout) {
      clearTimeout(this.idleAnimationTimeout)
    }

    // Schedule idle animation resume
    this.idleAnimationTimeout = setTimeout(() => {
      if (!this.speaking && !this.thinking) {
        this.resumeIdleAnimation()
      }
      this.idleAnimationTimeout = null
    }, delay)
  }

  // Speaking animation control
  public startSpeakingAnimation() {
    if (!this.isInitialized) return

    this.speaking = true
    this.stopIdleAnimation()

    if (this.speakingAnimation) {
      this.speakingAnimation.reset()
      this.speakingAnimation.play()
      console.log("Started speaking animation")
      // Start lip sync
      this.startLipSync()
    }
  }

  public stopSpeakingAnimation() {
    this.speaking = false

    if (this.speakingAnimation) {
      this.speakingAnimation.stop()
      console.log("Stopped speaking animation")
      // Stop lip sync
      this.stopLipSync()
    }

    // Return to resting position and resume idle
    this.setArmsToRestingPosition()
    this.scheduleIdleResume(1500)
  }

  // Thinking animation control
  public startThinkingAnimation() {
    if (!this.isInitialized) return

    this.thinking = true
    // Keep idle animations running for thinking state
  }

  public stopThinkingAnimation() {
    this.thinking = false
  }

  // Set arms to resting position - exactly from original
  public setArmsToRestingPosition() {
    const bones = [
      { bone: this.bones.leftShoulder, pose: this.restingPose.leftShoulder },
      { bone: this.bones.rightShoulder, pose: this.restingPose.rightShoulder },
      { bone: this.bones.leftArm, pose: this.restingPose.leftArm },
      { bone: this.bones.rightArm, pose: this.restingPose.rightArm },
      { bone: this.bones.leftForearm, pose: this.restingPose.leftForearm },
      { bone: this.bones.rightForearm, pose: this.restingPose.rightForearm },
      { bone: this.bones.leftHand, pose: this.restingPose.leftHand },
      { bone: this.bones.rightHand, pose: this.restingPose.rightHand },
    ]

    bones.forEach(({ bone, pose }) => {
      if (bone) {
        const origRot = (bone as any).userData?.originalRotation || { x: 0, y: 0, z: 0 }
        gsap.to(bone.rotation, {
          x: origRot.x + pose.x,
          y: origRot.y + pose.y,
          z: origRot.z + pose.z,
          duration: 1,
          ease: "power2.inOut",
        })
      }
    })

    // Schedule idle animation resume after arms are in resting position
    this.scheduleIdleResume(1500)
  }

  // Add hand gesture sequence - exactly from original
  public addHandGestureSequence(timeline: gsap.core.Timeline, duration: number) {
    if (!this.bones.leftHand || !this.bones.rightHand) return

    // Create a sequence of gestures throughout the speech
    const gestureCount = Math.max(2, Math.floor(duration / 3))

    // Start with resting position
    timeline.call(
      () => {
        this.setArmsToRestingPosition()
      },
      [],
      0,
    )

    for (let i = 0; i < gestureCount; i++) {
      const startTime = i * 3 + 1
      const gesture = this.handGestures[Math.floor(Math.random() * this.handGestures.length)]

      this.applyGestureToTimeline(timeline, gesture, startTime)
    }
  }

  // Apply gesture to timeline - exactly from original
  private applyGestureToTimeline(timeline: gsap.core.Timeline, gesture: HandGesture, startTime: number) {
    // Apply left hand gesture
    if (this.bones.leftHand && this.bones.leftForearm) {
      const leftHandOrig = this.getOriginalRotation(this.bones.leftHand, "leftHand")
      const leftForearmOrig = this.getOriginalRotation(this.bones.leftForearm, "leftForearm")

      timeline.to(
        this.bones.leftHand.rotation,
        {
          x: leftHandOrig.x + gesture.leftHand.rotation.x,
          y: leftHandOrig.y + gesture.leftHand.rotation.y,
          z: leftHandOrig.z + gesture.leftHand.rotation.z,
          duration: 0.7,
          ease: "power1.out",
        },
        startTime,
      )

      timeline.to(
        this.bones.leftForearm.rotation,
        {
          x: leftForearmOrig.x + gesture.leftHand.forearm.x,
          y: leftForearmOrig.y + gesture.leftHand.forearm.y,
          z: leftForearmOrig.z + gesture.leftHand.forearm.z,
          duration: 0.7,
          ease: "power1.out",
        },
        startTime,
      )
    }

    // Apply right hand gesture
    if (this.bones.rightHand && this.bones.rightForearm) {
      const rightHandOrig = this.getOriginalRotation(this.bones.rightHand, "rightHand")
      const rightForearmOrig = this.getOriginalRotation(this.bones.rightForearm, "rightForearm")

      timeline.to(
        this.bones.rightHand.rotation,
        {
          x: rightHandOrig.x + gesture.rightHand.rotation.x,
          y: rightHandOrig.y + gesture.rightHand.rotation.y,
          z: rightHandOrig.z + gesture.rightHand.rotation.z,
          duration: 0.7,
          ease: "power1.out",
        },
        startTime,
      )

      timeline.to(
        this.bones.rightForearm.rotation,
        {
          x: rightForearmOrig.x + gesture.rightHand.forearm.x,
          y: rightForearmOrig.y + gesture.rightHand.forearm.y,
          z: rightForearmOrig.z + gesture.rightHand.forearm.z,
          duration: 0.7,
          ease: "power1.out",
        },
        startTime,
      )
    }
  }

  // Get original rotation with resting pose - exactly from original
  private getOriginalRotation(bone: THREE.Bone, poseKey: keyof typeof this.restingPose) {
    const original = (bone as any).userData?.originalRotation || { x: 0, y: 0, z: 0 }
    const pose = this.restingPose[poseKey]

    return {
      x: original.x + pose.x,
      y: original.y + pose.y,
      z: original.z + pose.z,
    }
  }

  // Add natural movements - exactly from original
  public addNaturalMovements(timeline: gsap.core.Timeline, duration: number) {
    // Add subtle head movements
    if (this.bones.head) {
      const origRot = (this.bones.head as any).userData?.originalRotation || { x: 0, y: 0, z: 0 }

      // Initial slight tilt
      timeline.to(
        this.bones.head.rotation,
        {
          x: origRot.x + (Math.random() * 0.05 - 0.025),
          y: origRot.y + (Math.random() * 0.1 - 0.05),
          z: origRot.z + (Math.random() * 0.05 - 0.025),
          duration: 0.8,
          ease: "power1.inOut",
        },
        0,
      )

      // Add several subtle movements throughout the speech
      const moveCount = Math.max(3, Math.floor(duration / 2))

      for (let i = 0; i < moveCount; i++) {
        const startTime = (i + 1) * (duration / moveCount)

        timeline.to(
          this.bones.head.rotation,
          {
            x: origRot.x + (Math.random() * 0.1 - 0.05),
            y: origRot.y + (Math.random() * 0.15 - 0.075),
            z: origRot.z + (Math.random() * 0.08 - 0.04),
            duration: 1.2,
            ease: "power1.inOut",
          },
          startTime,
        )
      }

      // Return to original position at the end
      timeline.to(
        this.bones.head.rotation,
        {
          x: origRot.x,
          y: origRot.y,
          z: origRot.z,
          duration: 0.8,
          ease: "power1.inOut",
        },
        duration - 0.5,
      )
    }

    return timeline
  }

  // Enhanced lip sync animation with more mouth opening to show teeth
  public startLipSync(): void {
    if (!this.isInitialized || !this.morphTargets) return

    // Find mouth morph targets
    const mouthTargets = ["mouthOpen", "viseme_aa", "jawOpen", "mouth_open"]
    let activeMouthTarget: { mesh: THREE.Mesh; index: number } | null = null

    // Find the first available mouth morph target
    for (const targetName of mouthTargets) {
      if (this.morphTargets[targetName]) {
        activeMouthTarget = this.morphTargets[targetName]
        break
      }
    }

    if (!activeMouthTarget) {
      console.log("No mouth morph targets found for lip sync")
      return
    }

    // Create enhanced up and down mouth movement with more opening to show teeth
    const lipSyncAnimation = () => {
      if (!this.speaking || !activeMouthTarget) return

      const { mesh, index } = activeMouthTarget
      if (mesh.morphTargetInfluences && mesh.morphTargetInfluences[index] !== undefined) {
        // Increased mouth opening range (0.3 to 0.9) to show teeth more clearly
        const targetValue = 0.3 + Math.random() * 0.6

        // Smooth transition to target value
        gsap.to(mesh.morphTargetInfluences, {
          [index]: targetValue,
          duration: 0.08 + Math.random() * 0.08, // Slightly faster for more dynamic movement
          ease: "power2.inOut",
          onComplete: () => {
            // Close mouth but not completely (0.1 to 0.3) to maintain some teeth visibility
            if (this.speaking && mesh.morphTargetInfluences) {
              gsap.to(mesh.morphTargetInfluences, {
                [index]: 0.1 + Math.random() * 0.2,
                duration: 0.08 + Math.random() * 0.08,
                ease: "power2.inOut",
                onComplete: () => {
                  // Continue the cycle if still speaking
                  if (this.speaking) {
                    setTimeout(lipSyncAnimation, 30 + Math.random() * 60) // Faster cycling
                  }
                },
              })
            }
          },
        })
      }
    }

    // Start the lip sync animation
    lipSyncAnimation()
  }

  public stopLipSync(): void {
    if (!this.isInitialized || !this.morphTargets) return

    // Find and reset mouth morph targets
    const mouthTargets = ["mouthOpen", "viseme_aa", "jawOpen", "mouth_open"]

    for (const targetName of mouthTargets) {
      if (this.morphTargets[targetName]) {
        const { mesh, index } = this.morphTargets[targetName]
        if (mesh.morphTargetInfluences && mesh.morphTargetInfluences[index] !== undefined) {
          // Smoothly close the mouth
          gsap.to(mesh.morphTargetInfluences, {
            [index]: 0,
            duration: 0.3,
            ease: "power2.out",
          })
        }
      }
    }
  }

  // Update mixers - exactly from original
  public update(deltaTime: number) {
    if (!this.isInitialized) return

    // Update speaking mixer when speaking
    if (this.mixer && this.speaking) {
      this.mixer.update(deltaTime)
    }

    // Update idle mixer when not speaking or thinking
    if (this.idleMixer && !this.speaking && !this.thinking) {
      // Check if any idle animation is running
      const hasRunningIdleAnimation = this.idleAnimations.some((anim) => anim && anim.isRunning())
      if (hasRunningIdleAnimation) {
        this.idleMixer.update(deltaTime)
      }
    }
  }

  public cleanup() {
    if (this.idleAnimationTimeout) {
      clearTimeout(this.idleAnimationTimeout)
    }

    if (this.idleMixer) {
      this.idleMixer.removeEventListener("finished", this.handleIdleAnimationFinished)
    }

    this.mixer = null
    this.idleMixer = null
    this.speakingAnimation = null
    this.idleAnimations = []
    this.isInitialized = false
  }
}
