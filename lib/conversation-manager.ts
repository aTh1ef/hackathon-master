interface ConversationCallbacks {
  onThinkingStart: () => void
  onSpeakingStart: (text: string) => void
  onSpeakingEnd: () => void
  onError: (error: string) => void
  onMessageAdd: (message: { type: "user" | "bot"; content: string }) => void // Add this line
}

export class ConversationManager {
  constructor(
    private callbacks: ConversationCallbacks,
    private language: "en" | "hi" | "kn" = "en",
    private conversationHistory: Array<{ type: "user" | "bot"; content: string }> = [], // Add this line
  ) {}

  public async handleConversation(userInput: string): Promise<void> {
    try {
      // Add user message to conversation history
      const userMessage = { type: "user" as const, content: userInput }
      this.callbacks.onMessageAdd(userMessage)

      // Start thinking
      this.callbacks.onThinkingStart()

      // Get AI response using existing API with language support and conversation history
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userInput,
          language: this.language,
          conversationHistory: this.conversationHistory, // Use the conversation history
        }),
      })

      const data = await response.json()
      const aiResponse = data.response || "I'm here to help with farming questions!"

      if (!aiResponse) {
        throw new Error("No response from AI")
      }

      // Add bot message to conversation history
      const botMessage = { type: "bot" as const, content: aiResponse }
      this.callbacks.onMessageAdd(botMessage)

      // Generate speech using Google TTS with language-specific voice
      const audioBlob = await this.generateSpeech(aiResponse)

      // Start speaking
      this.callbacks.onSpeakingStart(aiResponse)

      // Play audio
      await this.playAudio(audioBlob)

      // End speaking
      this.callbacks.onSpeakingEnd()
    } catch (error) {
      console.error("Conversation error:", error)
      this.callbacks.onError(`Conversation failed: ${error}`)
    }
  }

  // Update generateSpeech to use language-specific voices
  private async generateSpeech(text: string): Promise<Blob> {
    // Check if API key is available from environment
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_TTS_API_KEY
    if (!apiKey) {
      throw new Error("Google TTS API key not configured")
    }

    const cleanedText = this.cleanTextForSpeech(text)

    // Define language-specific voice configurations
    const voiceConfigs = {
      en: {
        languageCode: "en-IN",
        name: "en-IN-Standard-C",
        ssmlGender: "MALE",
      },
      hi: {
        languageCode: "hi-IN",
        name: "hi-IN-Standard-F",
        ssmlGender: "FEMALE",
      },
      kn: {
        languageCode: "kn-IN",
        name: "kn-IN-Standard-D",
        ssmlGender: "MALE",
      },
    }

    const voiceConfig = voiceConfigs[this.language]

    const requestBody = {
      input: { text: cleanedText },
      voice: voiceConfig,
      audioConfig: {
        audioEncoding: "MP3",
        speakingRate: 1.0,
        pitch: 0.0,
        volumeGainDb: 0.0,
      },
    }

    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error(`Google TTS API error: ${response.status}`)
    }

    const responseData = await response.json()
    const audioContent = responseData.audioContent

    // Convert base64 to blob
    const binaryString = atob(audioContent)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    return new Blob([bytes], { type: "audio/mpeg" })
  }

  private cleanTextForSpeech(text: string): string {
    return text
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/_/g, "")
      .replace(/`/g, "")
      .replace(/\[([^\]]+)\]$$[^)]+$$/g, "$1")
      .replace(/#{1,6}\s/g, "")
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  }

  private async playAudio(audioBlob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)

      audio.addEventListener("ended", () => {
        URL.revokeObjectURL(audioUrl)
        resolve()
      })

      audio.addEventListener("error", (e) => {
        URL.revokeObjectURL(audioUrl)
        reject(new Error("Audio playback failed"))
      })

      audio.play().catch((error) => {
        URL.revokeObjectURL(audioUrl)
        reject(new Error(`Failed to play audio: ${error.message}`))
      })
    })
  }

  // Add method to update language
  public updateLanguage(language: "en" | "hi" | "kn") {
    this.language = language
  }

  // Add method to update conversation history
  public updateConversationHistory(history: Array<{ type: "user" | "bot"; content: string }>) {
    this.conversationHistory = history
  }
}
