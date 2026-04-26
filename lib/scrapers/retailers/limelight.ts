/* eslint-disable @typescript-eslint/no-explicit-any */
import { ScrapedProduct, stripHtml } from '../types'

const BASE_URL = 'https://www.limelight.pk'
const MAX_PAGES = 20
const PAGE_SIZE = 250
const REQUEST_DELAY_MS = 500
const TIMEOUT_MS = 15_000

/**
 * Scrape all Limelight products via their public Shopify JSON API.
 * No browser required – pure fetch.
 */
export async function scrapeLimelight(): Promise<ScrapedProduct[]> {
  console.log('\n📱 [LIMELIGHT] Scraping via Shopify JSON API...')
  const allProducts: ScrapedProduct[] = []
  let page = 1

  while (page <= MAX_PAGES) {
    const url = `${BASE_URL}/products.json?limit=${PAGE_SIZE}&page=${page}`
    console.log(`   [LIMELIGHT] Fetching page ${page}…`)

    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })

      if (!response.ok) {
        console.log(`   [LIMELIGHT] HTTP ${response.status} – stopping pagination`)
        break
      }

      const data = await response.json()

      if (!data.products?.length) {
        console.log('   [LIMELIGHT] No more products found')
        break
      }

      const mapped = data.products.map((p: any): ScrapedProduct => {
        const tags: string[] = Array.isArray(p.tags)
          ? p.tags
          : typeof p.tags === 'string'
          ? p.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
          : []

        return {
          id: `limelight-${p.id}`,
          name: (p.title ?? 'Product').substring(0, 255),
          brand: 'Limelight',
          price: parseFloat(p.variants?.[0]?.price ?? '0') || 0,
          image_url: (p.images?.[0]?.src ?? '').substring(0, 500),
          product_url: `${BASE_URL}/products/${p.handle}`,
          retailer: 'Limelight',
          description: stripHtml(p.body_html ?? p.title ?? '').substring(0, 500),
          tags,
          style_tags: [],
          scraped_at: new Date().toISOString(),
        }
      })

      allProducts.push(...mapped)
      console.log(
        `   [LIMELIGHT] ✅ Page ${page}: ${mapped.length} products (running total: ${allProducts.length})`
      )

      page++
      await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY_MS))
    } catch (err) {
      console.error(`   [LIMELIGHT] ⚠️  Page ${page} failed:`, err)
      break
    }
  }

  console.log(`\n📊 [LIMELIGHT] Done – ${allProducts.length} products total\n`)
  return allProducts
}