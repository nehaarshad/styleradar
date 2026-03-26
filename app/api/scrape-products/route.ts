import { NextResponse } from 'next/server'
import { PlaywrightScraper } from '@/lib/scrapers/playwrightScraper'
import { Retailer } from '@/lib/scrapers/config'
import { ProductModel } from '@/model/product'
import { StyleDNAModel } from '@/model/userStyleDNA'
import { calculateStyleMatch } from '@/lib/styleMatching'

interface CacheEntry {
  products: ProductModel[]
  expiresAt: number
}
const CACHE_TTL = 6 * 60 * 60 * 1000 // 6 hours
const cache = new Map<string, CacheEntry>()
const inFlight = new Map<string, Promise<ProductModel[]>>()

function getCacheKey(retailers: string[], keywords: string[]): string {
  return `${[...retailers].sort().join(',')}::${[...keywords].sort().join(',')}`
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      styleDNA,
      retailers = ['limelight', 'khaadi', 'satrangi'],
    } = body as { styleDNA?: StyleDNAModel; retailers?: Retailer[] }

    if (!styleDNA) {
      return NextResponse.json({ error: 'styleDNA is required' }, { status: 400 })
    }

    const keywords = generateSearchKeywords(styleDNA)
    const cacheKey = getCacheKey(retailers, keywords)

    // 1. Serve from cache
    const cached = cache.get(cacheKey)
    if (cached && Date.now() < cached.expiresAt) {
      console.log('Serving cached products')
      return NextResponse.json({
        products: rankProducts(cached.products, styleDNA),
        cached: true,
        count: cached.products.length,
      })
    }
    let scrapePromise = inFlight.get(cacheKey)
    if (!scrapePromise) {
      scrapePromise = runScrape(retailers, keywords, cacheKey)
      inFlight.set(cacheKey, scrapePromise)
      scrapePromise.finally(() => inFlight.delete(cacheKey))
    }

    const allProducts = await scrapePromise
    const matched = rankProducts(allProducts, styleDNA)

    return NextResponse.json({
      products: matched,
      cached: false,
      count: matched.length,
      totalScraped: allProducts.length,
    })
  } catch (err) {
    console.error('scrape-products error:', err)

    // Fallback to any stale cached data
    for (const [, entry] of cache) {
      if (entry.products.length > 0) {
        return NextResponse.json({
          products: entry.products.slice(0, 50),
          cached: true,
          warning: 'Stale cache — scrape failed',
        })
      }
    }

    return NextResponse.json(
      { error: (err as Error).message ?? 'Scraping failed', products: [] },
      { status: 500 }
    )
  }
}

async function runScrape(
  retailers: Retailer[],
  keywords: string[],
  cacheKey: string
): Promise<ProductModel[]> {
  let scraper: PlaywrightScraper | null = null
  try {
    scraper = new PlaywrightScraper()
    const products = await scraper.searchMultipleRetailers(
      keywords,
      retailers
    )
    cache.set(cacheKey, { products, expiresAt: Date.now() + CACHE_TTL })
    return products
  } finally {
    await scraper?.close()
  }
}

function generateSearchKeywords(dna: StyleDNAModel): string[] {
  const kws = new Set<string>()

  // Prioritise fabric + occasion — most likely to match real product names
  dna.fabricTypes?.slice(0, 2).forEach(f => kws.add(f))
  dna.occasionStyle && kws.add(dna.occasionStyle)
  dna.aestheticKeywords?.slice(0, 3).forEach(k => kws.add(k))
  dna.silhouettePrefs?.slice(0, 1).forEach(s => kws.add(s))
  dna.colorPalette?.slice(0, 2).forEach(c => kws.add(c))

  return [...kws].filter(k => k && k.length > 2).slice(0, 6)
}

function rankProducts(products: ProductModel[], styleDNA: StyleDNAModel): ProductModel[] {
  return products
    .map(p => ({ ...p, matchScore: calculateStyleMatch(p, styleDNA) }))
    .sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0))
    .slice(0, 60)
}