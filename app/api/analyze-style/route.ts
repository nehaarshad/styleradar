// app/api/analyze-style/route.ts
import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// List of possible model names to try
const MODEL_CANDIDATES = [
  'models/gemini-2.5-flash',
  'models/gemini-2.0-flash',
  'models/gemini-2.5-pro',
  'models/gemini-flash-latest'
]

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { images } = body
    
    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      )
    }

    console.log(`Processing ${images.length} images for style analysis`)

    // Try each model until one works
    let lastError = null
    let successfulModel = null
    let styleDNA = null

    for (const modelName of MODEL_CANDIDATES) {
      try {
        console.log(`Trying model: ${modelName}`)
        
        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: modelName })

        // Prepare images
        const imageParts = images.map((img: string) => ({
          inlineData: {
            data: img.split(',')[1],
            mimeType: 'image/jpeg'
          }
        }))

        const prompt = `You are a fashion expert AI. Analyze these 5 outfit images and extract the user's style DNA.
        
        Return a JSON object with:
        1. silhouettePrefs: array of preferred silhouettes (e.g., ["A-line", "bodycon", "oversized"])
        2. colorPalette: array of dominant colors (e.g., ["earth tones", "pastels", "monochrome"])
        3. fabricTypes: array of preferred fabrics (e.g., ["cotton", "denim", "silk"])
        4. occasionStyle: primary occasion (e.g., "casual", "formal", "streetwear")
        5. aestheticKeywords: array of style aesthetics (e.g., ["minimalist", "boho", "edgy"])
        6. description: a short paragraph describing their overall style

        IMPORTANT: Return ONLY the JSON object, no other text, no markdown formatting.`

        const result = await model.generateContent([prompt, ...imageParts])
        const response = await result.response
        const text = response.text()
        
        const cleanText = text.replace(/```json\n?|\n?```/g, '').trim()
        styleDNA = JSON.parse(cleanText)
        successfulModel = modelName
        break // Exit loop if successful
        
      } catch (error: Error | unknown) {
        console.log(`Model ${modelName} failed:`, (error as Error).message)
        lastError = error
        // Continue to next model
      }
    }

    if (!styleDNA) {
      console.error('All models failed')
      return NextResponse.json(
        { error: 'Failed to analyze with any available model. Please check your API key and model access.' },
        { status: 500 }
      )
    }

    console.log(`Successfully used model: ${successfulModel}`)
    return NextResponse.json({ styleDNA, modelUsed: successfulModel })

  } catch (error: Error | unknown) {
    console.error('Gemini API error:', {
      message: (error as Error).message,
      stack: (error as Error).stack
    })
    
    return NextResponse.json(
      { error: `Failed to analyze style: ${ (error as Error).message }` },
      { status: 500 }
    )
  }
}