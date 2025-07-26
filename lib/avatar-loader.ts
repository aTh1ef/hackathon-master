interface AvatarData {
  avatar: any
  bones: { [key: string]: any }
  morphTargets: { [key: string]: { mesh: any; index: number } }
}

export class AvatarLoader {
  private loader: any
  private progressCallback?: (progress: number) => void

  constructor(private scene: any) {
    if (!window.THREE || !window.THREE.GLTFLoader) {
      throw new Error("GLTFLoader not available")
    }
    this.loader = new window.THREE.GLTFLoader()
  }

  public setProgressCallback(callback: (progress: number) => void) {
    this.progressCallback = callback
  }

  public async loadAvatar(modelUrl: string): Promise<AvatarData> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        modelUrl,
        (gltf: any) => {
          try {
            const avatar = gltf.scene

            // Position and scale avatar
            avatar.position.set(0, 0.8, 0)
            avatar.scale.set(1, 1, 1)
            this.scene.add(avatar)

            // Adjust skin tone
            this.adjustSkinTone(avatar)

            // Find bones and morph targets
            const bones = this.findBones(avatar)
            const morphTargets = this.findMorphTargets(avatar)

            // Store original rotations
            this.storeOriginalRotations(avatar)

            const avatarData: AvatarData = {
              avatar,
              bones,
              morphTargets,
            }

            resolve(avatarData)
          } catch (error) {
            reject(error)
          }
        },
        (progress: any) => {
          if (progress.lengthComputable) {
            const percentComplete = Math.round((progress.loaded / progress.total) * 100)
            this.progressCallback?.(percentComplete)
          }
        },
        (error: any) => {
          reject(new Error(`Failed to load avatar: ${error}`))
        },
      )
    })
  }

  private adjustSkinTone(avatar: any) {
    avatar.traverse((child: any) => {
      if (child.isMesh && child.material) {
        const isSkinMaterial =
          child.name.toLowerCase().includes("skin") ||
          (child.material.name && child.material.name.toLowerCase().includes("skin"))

        if (isSkinMaterial || this.isSkinByColor(child.material)) {
          this.makeSkintPale(child.material)
        }
      }
    })
  }

  private isSkinByColor(material: any): boolean {
    if (Array.isArray(material)) {
      return material.some((mat) => this.checkSkinColor(mat))
    }
    return this.checkSkinColor(material)
  }

  private checkSkinColor(material: any): boolean {
    if (!material.color) return false

    const hsl = { h: 0, s: 0, l: 0 }
    material.color.getHSL(hsl)

    return hsl.h >= 0.01 && hsl.h <= 0.12 && hsl.s >= 0.15 && hsl.s <= 0.7 && hsl.l >= 0.3 && hsl.l <= 0.85
  }

  private makeSkintPale(material: any) {
    const materials = Array.isArray(material) ? material : [material]

    materials.forEach((mat) => {
      if (mat.color) {
        const hsl = { h: 0, s: 0, l: 0 }
        mat.color.getHSL(hsl)

        mat.color.setHSL(Math.max(0.05, hsl.h - 0.05), Math.max(0.1, hsl.s * 0.5), Math.min(0.9, hsl.l * 1.3))
      }
    })
  }

  private findBones(avatar: any): { [key: string]: any } {
    const bones: { [key: string]: any } = {}

    avatar.traverse((object: any) => {
      if (object.isBone) {
        const boneName = object.name.toLowerCase()

        if (boneName.includes("head")) bones.head = object
        if (boneName.includes("jaw")) bones.jaw = object
        if (boneName.includes("neck")) bones.neck = object
        if (boneName.includes("spine")) bones.spine = object

        // Eye bones
        if (boneName.includes("eye")) {
          if (boneName.includes("left")) bones.leftEye = object
          if (boneName.includes("right")) bones.rightEye = object
        }

        // Arm and hand bones
        if (boneName.includes("shoulder") || boneName.includes("clavicle")) {
          if (boneName.includes("left")) bones.leftShoulder = object
          if (boneName.includes("right")) bones.rightShoulder = object
        }

        if (boneName.includes("arm") && !boneName.includes("fore")) {
          if (boneName.includes("left")) bones.leftArm = object
          if (boneName.includes("right")) bones.rightArm = object
        }

        if (boneName.includes("forearm") || boneName.includes("elbow")) {
          if (boneName.includes("left")) bones.leftForearm = object
          if (boneName.includes("right")) bones.rightForearm = object
        }

        if (boneName.includes("hand") || boneName.includes("wrist")) {
          if (boneName.includes("left")) bones.leftHand = object
          if (boneName.includes("right")) bones.rightHand = object
        }
      }
    })

    return bones
  }

  private findMorphTargets(avatar: any): { [key: string]: { mesh: any; index: number } } {
    const morphTargets: { [key: string]: { mesh: any; index: number } } = {}

    avatar.traverse((object: any) => {
      if (object.isMesh && object.morphTargetDictionary && object.morphTargetInfluences) {
        for (const [key, value] of Object.entries(object.morphTargetDictionary)) {
          const lowerKey = key.toLowerCase()

          if (
            lowerKey.includes("viseme") ||
            lowerKey.includes("mouth") ||
            lowerKey.includes("jaw") ||
            lowerKey.includes("smile") ||
            lowerKey.includes("frown") ||
            lowerKey.includes("blink") ||
            lowerKey.includes("eye")
          ) {
            morphTargets[key] = {
              mesh: object,
              index: value as number,
            }
          }
        }
      }
    })

    return morphTargets
  }

  private storeOriginalRotations(avatar: any) {
    avatar.traverse((node: any) => {
      if (node.isBone) {
        node.userData = {
          ...node.userData,
          originalRotation: {
            x: node.rotation.x,
            y: node.rotation.y,
            z: node.rotation.z,
          },
        }
      }
    })
  }
}
