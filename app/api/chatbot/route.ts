import { type NextRequest, NextResponse } from "next/server"

// -----------------------------------------------------------------------------
// Retry helper – tries the request up to `maxRetries` with back-off (0.5 s, 1 s, 2 s)
// -----------------------------------------------------------------------------
async function fetchWithRetry(req: RequestInit, url: string, maxRetries = 3): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch(url, req).catch((e) => {
      // network errors still get retried
      console.error("Gemini network error:", e)
      return undefined
    })

    if (res && res.ok) return res
    const status = res?.status

    // Only retry on 429 / 503 (rate-limit / overloaded) and network failures
    if (attempt < maxRetries && (status === 429 || status === 503 || !res)) {
      const wait = 500 * 2 ** attempt // 0.5 s, 1 s, 2 s
      console.warn(`Gemini ${status ?? "network"} – retrying in ${wait} ms (attempt ${attempt + 1})`)
      await new Promise((r) => setTimeout(r, wait))
      continue
    }

    // All retries exhausted or non-retryable status: return the response (may be undefined)
    return res ?? new Response("Network error", { status: 500 })
  }

  // Should never get here
  return new Response("Unexpected error", { status: 500 })
}

export async function POST(request: NextRequest) {
  try {
    const { message, language = "en", conversationHistory = [] } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 })
    }

    // Check if Gemini API key is available
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      console.log("Gemini API key not found, returning mock response")
      // Return mock response for demo in the requested language
      const mockResponses = {
        en: "I'm here to help with farming! However, AI service needs setup. What specific crop issue can I help with?",
        hi: "मैं कृषि में मदद के लिए यहाँ हूँ! हालांकि, AI सेवा सेटअप की जरूरत है। कौन सी फसल की समस्या में मदद चाहिए?",
        kn: "ನಾನು ಕೃಷಿಯಲ್ಲಿ ಸಹಾಯಕ್ಕಾಗಿ ಇಲ್ಲಿದ್ದೇನೆ! ಆದಾಗ್ಯೂ, AI ಸೇವೆಗೆ ಸೆಟಪ್ ಅಗತ್ಯವಿದೆ. ಯಾವ ಬೆಳೆಯ ಸಮಸ್ಯೆಯಲ್ಲಿ ಸಹಾಯ ಬೇಕು?",
      }

      return NextResponse.json({
        response: mockResponses[language as keyof typeof mockResponses] || mockResponses.en,
      })
    }

    // Create language-specific system prompt for Gemini with memory and conciseness
    const getSystemPrompt = (lang: string) => {
      const prompts = {
        en: `You are an expert agricultural assistant helping farmers. 

        IMPORTANT GUIDELINES:
        - Keep responses SHORT and CONCISE (2-3 sentences max)
        - Be direct and actionable
        - Remember previous conversation context
        - Reference earlier messages when relevant
        - Focus on practical solutions
        - Use simple language
        - No markdown formatting - plain text only
        - If unclear due to speech-to-text errors, ask brief clarifying questions
        
        Respond in English with SHORT, helpful answers.`,

        hi: `आप एक विशेषज्ञ कृषि सहायक हैं जो किसानों की मदद कर रहे हैं।
        
        महत्वपूर्ण दिशानिर्देश:
        - उत्तर छोटे और संक्षिप्त रखें (अधिकतम 2-3 वाक्य)
        - सीधे और कार्यान्वित सलाह दें
        - पिछली बातचीत का संदर्भ याद रखें
        - जब प्रासंगिक हो तो पहले के संदेशों का संदर्भ दें
        - व्यावहारिक समाधान पर ध्यान दें
        - सरल भाषा का उपयोग करें
        - मार्कडाउन फॉर्मेटिंग नहीं - केवल सादा टेक्स्ट
        - यदि speech-to-text त्रुटियों के कारण अस्पष्ट हो तो संक्षिप्त स्पष्टीकरण प्रश्न पूछें
        
        हिंदी में छोटे, सहायक उत्तर दें।`,

        kn: `ನೀವು ರೈತರಿಗೆ ಸಹಾಯ ಮಾಡುವ ತಜ್ಞ ಕೃಷಿ ಸಹಾಯಕರಾಗಿದ್ದೀರಿ.
        
        ಮುಖ್ಯ ಮಾರ್ಗದರ್ಶನಗಳು:
        - ಉತ್ತರಗಳನ್ನು ಚಿಕ್ಕದಾಗಿ ಮತ್ತು ಸಂಕ್ಷಿಪ್ತವಾಗಿ ಇರಿಸಿ (ಗರಿಷ್ಠ 2-3 ವಾಕ್ಯಗಳು)
        - ನೇರ ಮತ್ತು ಕಾರ್ಯಗತಗೊಳಿಸಬಹುದಾದ ಸಲಹೆ ನೀಡಿ
        - ಹಿಂದಿನ ಸಂಭಾಷಣೆಯ ಸಂದರ್ಭವನ್ನು ನೆನಪಿಟ್ಟುಕೊಳ್ಳಿ
        - ಸಂಬಂಧಿತವಾದಾಗ ಹಿಂದಿನ ಸಂದೇಶಗಳನ್ನು ಉಲ್ಲೇಖಿಸಿ
        - ಪ್ರಾಯೋಗಿಕ ಪರಿಹಾರಗಳ ಮೇಲೆ ಗಮನ ಹರಿಸಿ
        - ಸರಳ ಭಾಷೆ ಬಳಸಿ
        - ಮಾರ್ಕ್‌ಡೌನ್ ಫಾರ್ಮ್ಯಾಟಿಂಗ್ ಇಲ್ಲ - ಕೇವಲ ಸರಳ ಪಠ್ಯ
        - Speech-to-text ದೋಷಗಳಿಂದ ಅಸ್ಪಷ್ಟವಾಗಿದ್ದರೆ ಸಂಕ್ಷಿಪ್ತ ಸ್ಪಷ್ಟೀಕರಣ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ
        
        ಕನ್ನಡದಲ್ಲಿ ಚಿಕ್ಕ, ಸಹಾಯಕ ಉತ್ತರಗಳನ್ನು ನೀಡಿ.`,
      }

      return prompts[lang as keyof typeof prompts] || prompts.en
    }

    try {
      // Build conversation context from history
      const conversationContext = conversationHistory
        .map((msg: any) => `${msg.type === "user" ? "User" : "Assistant"}: ${msg.content}`)
        .join("\n")

      const fullPrompt = `${getSystemPrompt(language)}

${conversationContext ? `Previous conversation:\n${conversationContext}\n` : ""}
Current user question: ${message}`

      // --- Gemini call with automatic retries -------------------------------------
      const response = await fetchWithRetry(
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }] }],
            generationConfig: {
              temperature: 0.3,
              topK: 20,
              topP: 0.8,
              maxOutputTokens: 150,
            },
            safetySettings: [
              { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
              { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            ],
          }),
        },
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Gemini API error: ${response.status} ${response.statusText}`, errorText)
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.candidates || data.candidates.length === 0) {
        console.error("No candidates in Gemini response:", data)
        throw new Error("No response generated from Gemini API")
      }

      const botResponse = data.candidates[0]?.content?.parts?.[0]?.text

      if (!botResponse) {
        console.error("No text in Gemini response:", data)
        throw new Error("No text content in Gemini response")
      }

      // Return concise response
      return NextResponse.json({ response: botResponse.trim() })
    } catch (apiError) {
      console.error("Gemini API call failed:", apiError)

      // Enhanced fallback response in the requested language (concise)
      const fallbackResponses = {
        en: "I'm here to help with farming! What specific crop issue do you need help with?",
        hi: "मैं कृषि में मदद के लिए यहाँ हूँ! कौन सी फसल की समस्या में सहायता चाहिए?",
        kn: "ನಾನು ಕೃಷಿಯಲ್ಲಿ ಸಹಾಯಕ್ಕಾಗಿ ಇಲ್ಲಿದ್ದೇನೆ! ಯಾವ ಬೆಳೆಯ ಸಮಸ್ಯೆಯಲ್ಲಿ ಸಹಾಯ ಬೇಕು?",
      }

      return NextResponse.json({
        response: fallbackResponses[language as keyof typeof fallbackResponses] || fallbackResponses.en,
      })
    }
  } catch (error) {
    console.error("Error in chatbot API:", error)

    // Enhanced final fallback response in the requested language (concise)
    const finalFallbackResponses = {
      en: "Sorry, technical issue. What farming question can I help with?",
      hi: "क्षमा करें, तकनीकी समस्या। कौन सा कृषि प्रश्न है?",
      kn: "ಕ್ಷಮಿಸಿ, ತಾಂತ್ರಿಕ ಸಮಸ್ಯೆ. ಯಾವ ಕೃಷಿ ಪ್ರಶ್ನೆ ಇದೆ?",
    }

    try {
      const body = await request.json()
      const { language = "en" } = body
      return NextResponse.json({
        response: finalFallbackResponses[language as keyof typeof finalFallbackResponses] || finalFallbackResponses.en,
      })
    } catch (parseError) {
      return NextResponse.json({ response: finalFallbackResponses.en })
    }
  }
}
