import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { StyleDNAModel } from '@/model/userStyleDNA'
import { v4 as uuidv4 } from 'uuid'
import { createServerClient } from '@/lib/supabase/server'

export const SYSTEM_PROMPT = `You are an expert fashion stylist AI. Analyze the provided outfit images and extract the user's unique style DNA.

Return a JSON object with EXACTLY these keys:
{
  "silhouettePrefs": ["string", ...],
  "colorPalette": ["string", ...],
  "fabricTypes": ["string", ...],
  "occasionStyle": "string",
  "aestheticKeywords": ["string", ...],
  "description": "string"
}

IMPORTANT: 
- Return ONLY the raw JSON object. No markdown, no backticks, no explanation.
- Be specific to South Asian/Pakistani fashion where relevant.
- Include at least 3 items per array field.`

const MODEL_CANDIDATES = [
  'models/gemini-2.0-flash',
  'models/gemini-2.5-pro',
  'models/gemini-flash-lite-latest'
]

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { images } = body as { images?: string[] }

    if (!Array.isArray(images) || images.length !== 5) {
      return NextResponse.json(
        { error: 'Exactly 5 images are required' },
        { status: 400 }
      )
    }

    console.log(`Analyzing ${images.length} images...`)

    // Check authentication
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - user not logged in' },
        { status: 401 }
      )
    }

    console.log('User:', user.email)

    const genAI = new GoogleGenerativeAI(apiKey)

    const imageParts = images.map((img: string) => {
      const base64 = img.includes(',') ? img.split(',')[1] : img
      const mimeType = img.startsWith('data:image/png')
        ? 'image/png'
        : img.startsWith('data:image/webp')
        ? 'image/webp'
        : 'image/jpeg'
      return { inlineData: { data: base64, mimeType } }
    })

    let styleDNA: StyleDNAModel | null = null
    let usedModel: string | null = null
    let lastError: string = ''

    for (const modelName of MODEL_CANDIDATES) {
      try {
        console.log(`Trying model: ${modelName}`)
        const model = genAI.getGenerativeModel({ model: modelName })
        const result = await model.generateContent([SYSTEM_PROMPT, ...imageParts])
        const text = result.response.text().trim()
        const clean = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
        styleDNA = JSON.parse(clean) as StyleDNAModel
        usedModel = modelName
        console.log(`✅ Success with model: ${modelName}`)
        break
      } catch (err) {
        lastError = (err as Error).message
        console.warn(`⚠️ Model ${modelName} failed: ${lastError}`)
      }
    }

    if (!styleDNA) {
      return NextResponse.json(
        { error: `All models failed. Last error: ${lastError}` },
        { status: 500 }
      )
    }

    // ✅ INSERT new record (don't update, always create new)
    const { error: dbError } = await supabase
      .from('style_dna')
      .insert({
        id: uuidv4(),
        user_id: user.id,
        silhouette_prefs: styleDNA. silhouette_prefs,
        color_palette: styleDNA.color_palette,
        fabric_types: styleDNA.fabric_types,
        occasion_style: styleDNA.occasion_style,
        aesthetic_keywords: styleDNA.aesthetic_keywords,
        description: styleDNA.description,
        created_at: new Date().toISOString(),
      })

    if (dbError) {
      console.error('Error saving style DNA:', dbError)
      return NextResponse.json(
        { error: 'Failed to save style DNA' },
        { status: 500 }
      )
    }

    console.log('✅ New style DNA record saved')

    return NextResponse.json({ 
      styleDNA, 
      modelUsed: usedModel,
      message: 'Style analysis complete!'
    })
    
  } catch (err) {
    console.error('analyze-style route error:', err)
    return NextResponse.json(
      { error: (err as Error).message ?? 'Internal server error' },
      { status: 500 }
    )
  }
}
