// app/api/list-models/route.ts
import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not set' },
        { status: 500 }
      )
    }

    // Try to list models using the REST API directly
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json(
        { error: `Failed to list models: ${error}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // Filter for models that support generateContent
    const supportedModels = data.models?.filter((model: unknown) => 
      (model as { supportedGenerationMethods?: string[] }).supportedGenerationMethods?.includes('generateContent')
    ) || []

    return NextResponse.json({
      allModels: data.models,
      supportedModels: supportedModels,
      count: data.models?.length || 0,
      supportedCount: supportedModels.length
    })

  } catch (error: Error | unknown) {
    console.error('Error listing models:', (error as Error).message)
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}