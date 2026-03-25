import { NextResponse } from 'next/server'
import { StyleDNAModel } from '@/model/userStyleDNA'

export async function POST(request: Request) {
  try {
    const { styleDNA } = await request.json() as { userId?: string; styleDNA?: StyleDNAModel }

    if (!styleDNA) {
      return NextResponse.json(
        { error: 'styleDNA is required' },
        { status: 400 }
      )
    }

    // Delegate to scrape-products — reuse its caching logic
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

    const response = await fetch(`${baseUrl}/api/scrape-products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        styleDNA,
        retailers: ['limelight', 'khaadi', 'satrangi'],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('update-feed error:', err)
    return NextResponse.json(
      { error: (err as Error).message ?? 'Update failed' },
      { status: 500 }
    )
  }
}