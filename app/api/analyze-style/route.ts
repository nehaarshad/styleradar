import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { StyleDNAModel } from '@/model/userStyleDNA'
import { SYSTEM_PROMPT } from '@/lib/utils/const/systemPrompt'
import { v4 as uuidv4 } from 'uuid';
import { createServerSupabase } from '@/lib//utils/supabase/server'


const MODEL_CANDIDATES = [
 'models/gemini-2.5-flash',
  'models/gemini-2.0-flash',
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

    console.log(`Analyzing ${images.length} images...`)

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

    if (styleDNA) {

      const supabase = await createServerSupabase()

  const { data: { user } } = await supabase.auth.getUser()

if (!user) {
  return NextResponse.json(
    { error: 'Unauthorized - user not logged in' },
    { status: 401 }
  )
}
  
  console.log('User from storage:', user);
    const { error: profileError } = await supabase
      .from('style_dna')
      .insert({
        id: uuidv4(),
        silhouettePrefs: styleDNA.silhouettePrefs,
        colorPalette: styleDNA.colorPalette,
        fabricTypes: styleDNA.fabricTypes,
        occasionStyle: styleDNA.occasionStyle,
        aestheticKeywords: styleDNA.aestheticKeywords,
        description: styleDNA.description,
        user_id: user?.id ,
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