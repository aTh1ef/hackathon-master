/**
 * Gemini-based batch translation helper for Hindi and Kannada
 */

const languageNames: Record<string, string> = {
  hi: "Hindi",
  kn: "Kannada",
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  if (!text || targetLanguage === "en") return text

  const result = await translateBatch([text], targetLanguage)
  return result[0] || text
}

export async function translateBatch(texts: string[], targetLanguage: string, retries = 3): Promise<string[]> {
  if (!texts.length || targetLanguage === "en") return texts

  const geminiApiKey = process.env.GEMINI_API_KEY
  const targetLangName = languageNames[targetLanguage]

  if (!geminiApiKey || !targetLangName) {
    console.log("Gemini key missing or unsupported language, returning original texts")
    return texts
  }

  // Create a numbered list for batch translation
  const numberedTexts = texts.map((text, index) => `${index + 1}. "${text}"`).join("\n")

  const attempt = async (attemptNo: number): Promise<string[]> => {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are a professional translator specializing in agricultural and technical content. Translate the following numbered English texts to natural, fluent ${targetLangName}. 

IMPORTANT INSTRUCTIONS:
- Provide NATURAL translations, not transliterations
- Use proper ${targetLangName} vocabulary, not English words written in ${targetLangName} script
- For technical terms, use established ${targetLangName} agricultural terminology
- Keep the same numbering format
- Provide ONLY the translations, no explanations

English texts to translate:
${numberedTexts}`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.2,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            },
          }),
        },
      )

      // Rate-limit or model loading → retry
      if ((res.status === 429 || res.status === 503) && attemptNo < retries) {
        const wait = 1000 * 2 ** attemptNo // 1s, 2s, 4s
        console.warn(`Gemini batch translation ${res.status}. Retrying in ${wait} ms (attempt ${attemptNo + 1})`)
        await sleep(wait)
        return attempt(attemptNo + 1)
      }

      if (!res.ok) {
        console.error(`Gemini batch translation API error: ${res.status} ${res.statusText}`)
        return texts
      }

      const data = await res.json()
      const translatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text

      if (!translatedText) {
        console.error("No translation text in Gemini response")
        return texts
      }

      // Parse the numbered response back into array
      const lines = translatedText.split("\n").filter((line) => line.trim())
      const translations: string[] = []

      for (let i = 0; i < texts.length; i++) {
        const expectedPrefix = `${i + 1}.`
        const line = lines.find((l) => l.trim().startsWith(expectedPrefix))

        if (line) {
          // Extract text after number and quotes
          const translated = line
            .replace(/^\d+\.\s*["']?/, "")
            .replace(/["']?\s*$/, "")
            .trim()
          translations.push(translated)
        } else {
          // Fallback to original if parsing fails
          translations.push(texts[i])
        }
      }

      return translations.length === texts.length ? translations : texts
    } catch (err) {
      console.error("Gemini batch translation fetch failed:", err)
      return texts
    }
  }

  return attempt(0)
}
