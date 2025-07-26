import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  console.log("[SERVER] 📁 Government Schemes Upload API called")

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const namespace = formData.get("namespace") as string

    console.log("[SERVER] 📝 Upload request details:")
    console.log("[SERVER]   - File name:", file?.name)
    console.log("[SERVER]   - File size:", file?.size)
    console.log("[SERVER]   - File type:", file?.type)
    console.log("[SERVER]   - Target namespace:", namespace)

    if (!file || !namespace) {
      console.log("[SERVER] ❌ Missing file or namespace")
      return NextResponse.json(
        {
          success: false,
          error: "File and namespace are required",
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
          error: "API keys not configured. Please contact administrator.",
        },
        { status: 500 },
      )
    }

    // Check file size (5MB limit for text files)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: "File size exceeds 5MB limit",
        },
        { status: 400 },
      )
    }

    // Check supported file types - only TXT files
    const supportedTypes = ["text/plain"]
    if (!supportedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Only TXT files are supported for document upload.",
        },
        { status: 400 },
      )
    }

    console.log("[SERVER] ✅ File validation passed")

    let extractedText = ""

    try {
      // Convert file to buffer and read as text
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      console.log("[SERVER] 📄 Reading text from TXT file...")

      try {
        // Read text content directly
        extractedText = buffer.toString("utf-8")
        console.log("[SERVER] ✅ Text file read successfully")
        console.log("[SERVER]   - Text length:", extractedText.length)
        console.log("[SERVER]   - Text preview:", extractedText.substring(0, 200) + "...")
      } catch (textError) {
        console.error("[SERVER] ❌ Text reading error:", textError)
        return NextResponse.json(
          {
            success: false,
            error: "Failed to read text file. Please ensure it's a valid UTF-8 encoded text file.",
          },
          { status: 400 },
        )
      }

      if (!extractedText.trim()) {
        return NextResponse.json(
          {
            success: false,
            error: "No text content found in the uploaded file.",
          },
          { status: 400 },
        )
      }

      // Text chunking similar to RecursiveCharacterTextSplitter
      console.log("[SERVER] ✂️ Chunking text...")
      const chunkSize = 1000
      const chunkOverlap = 100
      const chunks = []

      for (let i = 0; i < extractedText.length; i += chunkSize - chunkOverlap) {
        const chunk = extractedText.slice(i, i + chunkSize).trim()
        if (chunk.length > 50) {
          // Minimum chunk size
          chunks.push(chunk)
        }
      }

      if (chunks.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Could not create meaningful chunks from the document.",
          },
          { status: 400 },
        )
      }

      console.log("[SERVER] ✅ Text chunked successfully")
      console.log("[SERVER]   - Total chunks:", chunks.length)
      console.log(
        "[SERVER]   - Average chunk size:",
        Math.round(chunks.reduce((sum, chunk) => sum + chunk.length, 0) / chunks.length),
      )

      // Initialize services
      console.log("[SERVER] 🔧 Initializing AI services...")
      const { Pinecone } = await import("@pinecone-database/pinecone")
      const { GoogleGenerativeAI } = await import("@google/generative-ai")

      const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY!,
      })

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
      const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" })

      console.log("[SERVER] ✅ AI services initialized")

      // Clear existing vectors for this document
      console.log("[SERVER] 🗑️ Clearing existing vectors for this document...")
      const index = pinecone.index("govermentscheme")

      try {
        await index.namespace(namespace).deleteAll()
        console.log("[SERVER] ✅ Existing vectors cleared")
      } catch (deleteError) {
        console.log("[SERVER] ⚠️ No existing vectors to clear or error:", deleteError)
      }

      // Generate embeddings and create vectors
      console.log("[SERVER] 🔍 Generating embeddings...")
      const vectors = []
      const timestamp = Date.now()

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]
        console.log("[SERVER]   - Processing chunk", i + 1, "of", chunks.length)

        try {
          const embeddingResult = await embeddingModel.embedContent(chunk)

          if (!embeddingResult.embedding?.values) {
            console.error("[SERVER] ❌ No embedding values for chunk", i)
            continue
          }

          vectors.push({
            id: `${file.name.replace(/[^a-zA-Z0-9]/g, "_")}_chunk_${i}_${timestamp}`,
            values: embeddingResult.embedding.values,
            metadata: {
              text: chunk,
              source: file.name,
              chunkIndex: i,
              totalChunks: chunks.length,
              uploadedAt: new Date().toISOString(),
              fileType: file.type,
              fileSize: file.size,
            },
          })

          console.log("[SERVER]     ✅ Embedding generated (dimensions:", embeddingResult.embedding.values.length, ")")

          // Rate limiting delay
          await new Promise((resolve) => setTimeout(resolve, 100))
        } catch (embeddingError) {
          console.error("[SERVER] ❌ Error generating embedding for chunk", i, ":", embeddingError)
          continue
        }
      }

      if (vectors.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Failed to generate embeddings for any document chunks.",
          },
          { status: 500 },
        )
      }

      console.log("[SERVER] ✅ All embeddings generated")
      console.log("[SERVER]   - Total vectors:", vectors.length)

      // Store vectors in Pinecone
      console.log("[SERVER] 💾 Storing vectors in Pinecone...")
      try {
        // Upsert in batches
        const batchSize = 100
        for (let i = 0; i < vectors.length; i += batchSize) {
          const batch = vectors.slice(i, i + batchSize)
          console.log(
            "[SERVER]   - Upserting batch",
            Math.floor(i / batchSize) + 1,
            "of",
            Math.ceil(vectors.length / batchSize),
          )

          await index.namespace(namespace).upsert(batch)
        }

        console.log("[SERVER] ✅ All vectors stored successfully in namespace:", namespace)
      } catch (pineconeError) {
        console.error("[SERVER] ❌ Pinecone error:", pineconeError)
        return NextResponse.json(
          {
            success: false,
            error: "Failed to store document in vector database.",
          },
          { status: 500 },
        )
      }

      return NextResponse.json({
        success: true,
        message: `Successfully processed and uploaded ${vectors.length} chunks from "${file.name}".`,
        details: {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          chunksProcessed: vectors.length,
          namespace: namespace,
          textLength: extractedText.length,
        },
      })
    } catch (processingError) {
      console.error("[SERVER] ❌ Processing error:", processingError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to process the document. Please try again.",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("[SERVER] ❌ Upload route error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred while uploading your document.",
      },
      { status: 500 },
    )
  }
}
