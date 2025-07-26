import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  console.log("[SERVER] 💬 Government Schemes Chat API called")

  try {
    const body = await request.json()
    const { message, namespace, conversationHistory = [] } = body

    console.log("[SERVER] 📝 Chat request details:")
    console.log("[SERVER]   - Message:", message)
    console.log("[SERVER]   - Namespace:", namespace)
    console.log("[SERVER]   - History length:", conversationHistory.length)

    if (!message || !namespace) {
      console.log("[SERVER] ❌ Missing message or namespace")
      return NextResponse.json(
        {
          success: false,
          error: "Message and namespace are required",
        },
        { status: 400 },
      )
    }

    // Check if API keys are available
    if (!process.env.PINECONE_API_KEY || !process.env.GEMINI_API_KEY) {
      console.log("[SERVER] ❌ Missing API keys")
      return NextResponse.json(
        {
          success: false,
          error: "API keys not configured",
        },
        { status: 500 },
      )
    }

    // Initialize services
    console.log("[SERVER] 🔧 Initializing AI services...")
    const { Pinecone } = await import("@pinecone-database/pinecone")
    const { GoogleGenerativeAI } = await import("@google/generative-ai")

    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    })

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" })
    const chatModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    console.log("[SERVER] ✅ AI services initialized")

    // Generate embedding for the user's question
    console.log("[SERVER] 🔍 Generating query embedding...")
    const queryEmbedding = await embeddingModel.embedContent(message)

    if (!queryEmbedding.embedding?.values) {
      console.error("[SERVER] ❌ Failed to generate query embedding")
      return NextResponse.json(
        {
          success: false,
          error: "Failed to process your question",
        },
        { status: 500 },
      )
    }

    console.log("[SERVER] ✅ Query embedding generated")

    // Search for relevant chunks in Pinecone
    console.log("[SERVER] 🔎 Searching for relevant scheme information...")
    const index = pinecone.index("govermentscheme")

    try {
      const searchResults = await index.namespace(namespace).query({
        vector: queryEmbedding.embedding.values,
        topK: 5,
        includeMetadata: true,
      })

      console.log("[SERVER] ✅ Search completed")
      console.log("[SERVER]   - Results found:", searchResults.matches?.length || 0)

      if (!searchResults.matches || searchResults.matches.length === 0) {
        console.log("[SERVER] ⚠️ No relevant content found")
        return NextResponse.json({
          success: true,
          response:
            "I couldn't find specific information about that in our government scheme database. Please try asking about eligibility criteria, benefits, application process, or other general aspects of the scheme.",
        })
      }

      // Extract relevant text chunks
      const relevantChunks = searchResults.matches
        .filter((match) => match.metadata && match.metadata.text)
        .map((match, index) => {
          const metadata = match.metadata as any
          return {
            text: metadata.text,
            score: match.score || 0,
            source: metadata.source || "Government Scheme Document",
            chunkIndex: metadata.chunkIndex || index,
          }
        })

      console.log("[SERVER] 📄 Retrieved chunks:")
      relevantChunks.forEach((chunk, i) => {
        console.log(`[SERVER]   - Chunk ${i + 1}: Score ${chunk.score?.toFixed(3)}, Length ${chunk.text.length}`)
      })

      // Build conversation context
      let conversationContext = ""
      if (conversationHistory.length > 0) {
        conversationContext = "\n\nPrevious conversation:\n"
        conversationHistory.slice(-6).forEach((msg: any) => {
          conversationContext += `${msg.type === "user" ? "User" : "Assistant"}: ${msg.content}\n`
        })
      }

      // Create context from relevant chunks
      const context = relevantChunks.map((chunk) => chunk.text).join("\n\n")

      // Generate response using Gemini
      console.log("[SERVER] 🤖 Generating response with Gemini...")
      const prompt = `You are an AI assistant helping users understand Indian government schemes for farmers and agriculture. Based on the relevant information from government scheme documents, provide a helpful and accurate response to the user's question.

Government Scheme Information (most relevant sections):
${context}

${conversationContext}

Current User Question: ${message}

Instructions:
- Answer based on the government scheme information provided above
- Be specific about eligibility criteria, benefits, application processes, and requirements
- Provide practical guidance for farmers
- If the information doesn't fully answer the question, provide what you can and suggest contacting relevant authorities
- Keep your response helpful and accessible to farmers
- Focus on actionable information

Response:`

      const result = await chatModel.generateContent(prompt)
      const response = result.response.text()

      console.log("[SERVER] ✅ Response generated")
      console.log("[SERVER]   - Response length:", response.length)
      console.log("[SERVER]   - Response preview:", response.substring(0, 150) + "...")

      return NextResponse.json({
        success: true,
        response: response,
        sources: relevantChunks.map((chunk) => ({
          text: chunk.text.substring(0, 200) + "...",
          score: chunk.score,
          source: chunk.source,
        })),
      })
    } catch (searchError) {
      console.error("[SERVER] ❌ Search error:", searchError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to search scheme information",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("[SERVER] ❌ Government schemes chat error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "An error occurred while processing your request",
      },
      { status: 500 },
    )
  }
}
