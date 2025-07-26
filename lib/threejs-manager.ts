declare global {
  interface Window {
    THREE: any
  }
}

export class ThreeJSManager {
  public scene: any
  public camera: any
  public renderer: any
  public controls: any

  constructor(container: HTMLElement) {
    if (!window.THREE) {
      throw new Error("THREE.js not loaded")
    }

    // Scene setup
    this.scene = new window.THREE.Scene()
    this.scene.background = new window.THREE.Color(0xffffff)

    // Camera setup
    this.camera = new window.THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    this.camera.position.set(0, 1.7, 2.5)
    this.camera.lookAt(0, 1.5, 0)

    // Renderer setup
    this.renderer = new window.THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setClearColor(0xffffff)
    this.renderer.shadowMap.enabled = true
    container.appendChild(this.renderer.domElement)

    // Controls setup
    if (window.THREE.OrbitControls) {
      this.controls = new window.THREE.OrbitControls(this.camera, this.renderer.domElement)
      this.controls.enableDamping = true
      this.controls.dampingFactor = 0.05
      this.controls.minDistance = 1.5
      this.controls.maxDistance = 5
      this.controls.maxPolarAngle = Math.PI / 1.5
      this.controls.minPolarAngle = Math.PI / 4
      this.controls.target.set(0, 1.5, 0)
    }

    // Lighting setup
    this.setupLighting()

    // Handle window resize
    this.handleResize = this.handleResize.bind(this)
    window.addEventListener("resize", this.handleResize)
  }

  private setupLighting() {
    // Ambient light
    const ambientLight = new window.THREE.AmbientLight(0xffffff, 0.6)
    this.scene.add(ambientLight)

    // Directional light
    const directionalLight = new window.THREE.DirectionalLight(0xffffff, 1.0)
    directionalLight.position.set(0, 10, 10)
    directionalLight.castShadow = true
    this.scene.add(directionalLight)

    // Front light
    const frontLight = new window.THREE.DirectionalLight(0xffffff, 0.5)
    frontLight.position.set(0, 1, 5)
    this.scene.add(frontLight)

    // Side lights
    const leftLight = new window.THREE.DirectionalLight(0xffffff, 0.3)
    leftLight.position.set(-5, 2, 2)
    this.scene.add(leftLight)

    const rightLight = new window.THREE.DirectionalLight(0xffffff, 0.3)
    rightLight.position.set(5, 2, 2)
    this.scene.add(rightLight)
  }

  private handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  public render() {
    if (this.controls) {
      this.controls.update()
    }
    this.renderer.render(this.scene, this.camera)
  }

  public cleanup() {
    window.removeEventListener("resize", this.handleResize)
    this.renderer.dispose()
  }
}
