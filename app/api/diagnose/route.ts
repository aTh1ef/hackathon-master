import { type NextRequest, NextResponse } from "next/server"
import { translateBatch } from "@/lib/translate"
import { jsonrepair } from "jsonrepair"

// ------------------------------------------------------------------------------------
// 1. Helper – robustly extract / repair JSON from an LLM response
// ------------------------------------------------------------------------------------
function extractJson(raw: string): any {
  // a. direct parse
  try {
    return JSON.parse(raw)
  } catch {
    /* ignore */
  }

  // b. remove \`\`\`json fences
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1])
    } catch {
      /* ignore */
    }
  }

  // c. jsonrepair the whole thing
  try {
    return JSON.parse(jsonrepair(raw))
  } catch {
    /* ignore */
  }

  // d. slice between first '{' and last '}' then repair
  const start = raw.indexOf("{")
  const end = raw.lastIndexOf("}")
  if (start !== -1 && end !== -1 && end > start) {
    const slice = raw.slice(start, end + 1)
    try {
      return JSON.parse(slice)
    } catch {
      /* ignore */
    }
    try {
      return JSON.parse(jsonrepair(slice))
    } catch {
      /* ignore */
    }
  }

  throw new Error("Unable to parse JSON from LLM response")
}

// ------------------------------------------------------------------------------------
// 2. Mock data (English always) – handy for demo / fallback
// ------------------------------------------------------------------------------------
const mockDiagnosis = {
  diseaseName: "Late Blight",
  scientificName: "Phytophthora infestans",
  affectedCrops: ["Tomato", "Potato", "Eggplant", "Pepper"],
  symptoms: [
    "Dark brown to black lesions on leaves",
    "White fuzzy growth on leaf undersides",
    "Rapid wilting and death of plant tissue",
    "Brown spots on fruits",
  ],
  diseaseDescription:
    "Late Blight is a devastating fungal disease that affects tomatoes and potatoes. It thrives in cool, wet conditions and can destroy entire crops within days if left untreated.",
  remedies: {
    cultural: [
      "Improve air circulation by spacing plants properly and pruning lower branches to reduce humidity around plants",
      "Use drip irrigation or soaker hoses instead of overhead sprinklers to keep foliage dry",
      "Remove and destroy infected plant debris immediately to prevent spore spread",
      "Rotate crops with non-host plants for 3-4 years to break the disease cycle",
    ],
    biological: [
      "Apply Bacillus subtilis–based fungicides like Serenade Garden every 7-14 days",
      "Use compost tea (1:10 ratio, 24-h steep) and spray early morning",
      "Apply Trichoderma-based soil inoculant monthly around the root zone",
    ],
    chemical: [
      "Spray copper fungicide (e.g. Bonide Copper) every 7-10 days; avoid hot sunny hours",
      "For severe cases, rotate systemic fungicides such as chlorothalonil following label",
    ],
  },
}

// ------------------------------------------------------------------------------------
// 3. Translation helper for entire diagnosis object in ONE batch
// ------------------------------------------------------------------------------------
async function translateDiagnosis(d: any, lang: string) {
  if (lang === "en") return d

  const texts = [
    d.diseaseName,
    ...d.affectedCrops,
    d.diseaseDescription,
    ...d.symptoms,
    ...d.remedies.cultural,
    ...d.remedies.biological,
    ...d.remedies.chemical,
  ]

  const tr = await translateBatch(texts, lang)

  let i = 0
  return {
    ...d,
    diseaseName: tr[i++],
    affectedCrops: d.affectedCrops.map(() => tr[i++]),
    diseaseDescription: tr[i++],
    symptoms: d.symptoms.map(() => tr[i++]),
    remedies: {
      cultural: d.remedies.cultural.map(() => tr[i++]),
      biological: d.remedies.biological.map(() => tr[i++]),
      chemical: d.remedies.chemical.map(() => tr[i++]),
    },
  }
}

// ------------------------------------------------------------------------------------
// 4. POST handler
// ------------------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  const { image, language = "en" } = await req.json()

  if (!image) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 })
  }

  // 4a. If no OPENAI_API_KEY ⇒ return mock
  if (!process.env.OPENAI_API_KEY) {
    const demo = await translateDiagnosis(mockDiagnosis, language)
    return NextResponse.json({
      ...demo,
      isDemo: true,
      message: "OPENAI_API_KEY missing – returning demo data",
    })
  }

  // 4b. Build a SUPER-strict prompt about JSON
  const prompt = String.raw`You are an agronomist AI. Analyse the crop image and respond with ONLY valid minified JSON in EXACTLY this schema (no markdown, no commentary):

{
"diseaseName":        string,
"scientificName":     string,
"affectedCrops":      string[],
"symptoms":           string[],
"diseaseDescription": string,
"remedies": {
  "cultural":   string[],
  "biological": string[],
  "chemical":   string[]
}
}

IMPORTANT: For "affectedCrops", list ALL crop types that can be affected by this disease (not just the one in the image). Include 3-6 common crops that are susceptible to this disease.

If the plant is healthy, set "diseaseName": "Healthy Crop" and leave other fields empty arrays / empty strings where appropriate.`

  // 4c. Call OpenAI Vision
  const { generateText } = await import("ai")
  const { openai } = await import("@ai-sdk/openai")

  const { text } = await generateText({
    model: openai("gpt-4o"),
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image", image },
        ],
      },
    ],
  })

  // 4d. Parse & repair JSON
  let diagnosis
  try {
    diagnosis = extractJson(text)
  } catch (err) {
    console.error("JSON parse fail, raw LLM text:\n", text)
    return NextResponse.json(
      {
        error: "AI_JSON_PARSE_ERROR",
        message: "Failed to parse JSON from LLM",
        raw: text.slice(0, 5000), // help debug
      },
      { status: 500 },
    )
  }

  // 4e. Translate if needed
  const finalDiag = await translateDiagnosis(diagnosis, language)
  return NextResponse.json(finalDiag)
}
