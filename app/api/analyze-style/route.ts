import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { StyleDNAModel } from '@/model/userStyleDNA'
import { supabase } from '@/lib/utils/supabase/client'
import { v4 as uuidv4 } from 'uuid';

const MODEL_CANDIDATES = [
 'models/gemini-2.5-flash',
  'models/gemini-2.0-flash',
]

const SYSTEM_PROMPT = `You are an expert fashion stylist AI. Analyze the provided outfit images and extract the user's unique style DNA.

Return a JSON object with EXACTLY these keys:
{
  "silhouettePrefs": ["string", ...],   // e.g. ["oversized", "bodycon"]
  "colorPalette": ["string", ...],      // e.g. ["earth tones",  "ivory"]
  "fabricTypes": ["string", ...],       // e.g. ["lawn", "cotton", "chiffon"]
  "occasionStyle": "string",            // e.g. "casual", "formal", "streetwear", "semi-formal"
  "aestheticKeywords": ["string", ...], // e.g. ["boho", "minimalist", "classic", "desi-chic"]
  "description": "string"              // 2-3 sentences describing overall style
}

IMPORTANT: 
- Return ONLY the raw JSON object. No markdown, no backticks, no explanation.
- Be specific to South Asian/Pakistani fashion where relevant (lawn, kurta, shalwar kameez, embroidery, etc.)
- Include at least 3 items per array field.`

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

    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      )
    }

    if (images.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 images allowed' },
        { status: 400 }
      )
    }

    console.log(`📸 Analyzing ${images.length} images...`)

    const genAI = new GoogleGenerativeAI(apiKey)

    const imageParts = images.map((img: string) => {
      // Strip data URL prefix if present
      const base64 = img.includes(',') ? img.split(',')[1] : img
      // Detect mime type from data URL prefix
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
        console.log(`🤖 Trying model: ${modelName}`)
        const model = genAI.getGenerativeModel({ model: modelName })
        const result = await model.generateContent([SYSTEM_PROMPT, ...imageParts])
        const text = result.response.text().trim()
        // Strip markdown code fences if model ignores instruction
        const clean = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
        styleDNA = JSON.parse(clean) as StyleDNAModel
        usedModel = modelName
        break
      } catch (err) {
        lastError = (err as Error).message
        console.warn(`⚠️  Model ${modelName} failed: ${lastError}`)
      }
    }

    if (!styleDNA) {
      return NextResponse.json(
        { error: `All models failed. Last error: ${lastError}` },
        { status: 500 }
      )
    }

    console.log(`✅ Style DNA extracted using ${usedModel}`)
    if (styleDNA) {
      const { data: { user } } = await supabase.auth.getUser();

    const { error: profileError } = await supabase
      .from('style_dna')
      .insert({
        id: uuidv4(),
        silhouette_prefs: styleDNA.silhouettePrefs,
        color_palette: styleDNA.colorPalette,
        fabric_types: styleDNA.fabricTypes,
        occasion_style: styleDNA.occasionStyle,
        aestheticKeywords: styleDNA.aestheticKeywords,
        description: styleDNA.description,
        user_id: user?.id ?? 'unknown',
        created_at: new Date().toISOString(),
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
    }
  }
    return NextResponse.json({ styleDNA, modelUsed: usedModel })
  } catch (err) {
    console.error('analyze-style route error:', err)
    return NextResponse.json(
      { error: (err as Error).message ?? 'Internal server error' },
      { status: 500 }
    )
  }
}