/* eslint-disable @typescript-eslint/no-explicit-any */
import { BrowserContext, Page } from 'playwright'
import { ScrapedProduct, resolveUrl, delay } from '../types'
import { RETAILERS } from '../retailersConfig/config'

const CONFIG = RETAILERS.khaadi
const BASE_URL = CONFIG.baseUrl

// Keywords that return results on Khaadi's search
const SEARCH_KEYWORDS = [
  'lawn',
  'formal',
  'casual',
  'pret',
  'dress',
  'kurta',
  'shirt',
  'embroidered',
]

// How many keyword searches run simultaneously
const CONCURRENCY = 2
const BETWEEN_CHUNK_DELAY_MS = 3_000
const PAGE_SETTLE_MS = 5_000
const SCROLL_STEP_PX = 400
const SCROLL_MAX_PX = 3_000
const SCROLL_INTERVAL_MS = 500

// ─── Public entry point ───────────────────────────────────────────────────────

/**
 * Scrape Khaadi by searching a predefined keyword list.
 * Requires a live Playwright BrowserContext to be passed in.
 */
export async function scrapeKhaadi(context: BrowserContext): Promise<ScrapedProduct[]> {
  console.log('\n🔄 [KHAADI] Starting keyword scrape…')
  const allProducts: ScrapedProduct[] = []

  // Process keywords in fixed-size chunks to limit concurrency
  for (let i = 0; i < SEARCH_KEYWORDS.length; i += CONCURRENCY) {
    const chunk = SEARCH_KEYWORDS.slice(i, i + CONCURRENCY)

    const results = await Promise.all(
      chunk.map(keyword => searchKhaadi(context, keyword))
    )

    results.forEach(products => allProducts.push(...products))

    console.log(
      `   [KHAADI] ✅ Processed keywords [${chunk.join(', ')}] – running total: ${allProducts.length}`
    )

    // Pause between chunks to be kind to the server
    if (i + CONCURRENCY < SEARCH_KEYWORDS.length) {
      await delay(BETWEEN_CHUNK_DELAY_MS)
    }
  }

  console.log(`\n📊 [KHAADI] Done – ${allProducts.length} products total\n`)
  return allProducts
}

// ─── Per-keyword search ───────────────────────────────────────────────────────

async function searchKhaadi(
  context: BrowserContext,
  keyword: string
): Promise<ScrapedProduct[]> {
  let page: Page | null = null

  try {
    page = await context.newPage()
    const searchUrl = `${BASE_URL}/search?q=${encodeURIComponent(keyword)}`

    console.log(`      🔍 [KHAADI] Searching for "${keyword}"…`)

    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 20_000 })
    await page.waitForTimeout(PAGE_SETTLE_MS)
    await scrollPage(page)

    const raw = await extractProducts(page)

    // Hydrate raw results with retailer metadata
    return raw.map((p, idx): ScrapedProduct => ({
      id: `khaadi-${keyword}-${idx}-${Date.now()}`,
      name: p.name.substring(0, 255),
      brand: 'Khaadi',
      price: p.price,
      image_url: p.imageUrl.substring(0, 500),
      product_url: p.productUrl.substring(0, 500),
      retailer: 'Khaadi',
      description: p.name.substring(0, 500),
      tags: [keyword],
      style_tags: [keyword],
      scraped_at: new Date().toISOString(),
    }))
  } catch (err) {
    console.error(`      ❌ [KHAADI] Error for keyword "${keyword}":`, err)
    return []
  } finally {
    await page?.close()
  }
}

// ─── DOM extraction (runs inside the browser) ─────────────────────────────────

interface RawProduct {
  name: string
  price: number
  imageUrl: string
  productUrl: string
}

/**
 * Extract product data from the current page using the selector config.
 * URL resolution is done in Node context (not inside page.evaluate) so we
 * can use the resolveUrl helper reliably.
 */
async function extractProducts(page: Page): Promise<RawProduct[]> {
  // Pull raw strings out of the DOM
  const raw = await page.evaluate(
    ({ containerSel, nameSels, priceSels, imageSels, linkSels }) => {
      const firstText = (el: Element, selectors: string): string => {
        for (const sel of selectors.split(',').map(s => s.trim())) {
          const found = el.querySelector(sel)
          const text = found?.textContent?.trim()
          if (text) return text
        }
        return ''
      }

      const firstAttr = (el: Element, selectors: string, attr: string): string => {
        for (const sel of selectors.split(',').map(s => s.trim())) {
          const found = el.querySelector(sel)
          const value =
            found?.getAttribute(attr) ??
            found?.getAttribute('data-src') ??
            ''
          if (value) return value
        }
        return ''
      }

      const cards = Array.from(document.querySelectorAll(containerSel))

      return cards.map(card => ({
        name: firstText(card, nameSels),
        priceText: firstText(card, priceSels),
        imageHref: firstAttr(card, imageSels, 'src'),
        linkHref: firstAttr(card, linkSels, 'href'),
      }))
    },
    {
      containerSel: CONFIG.selectors.productContainer,
      nameSels: CONFIG.selectors.name,
      priceSels: CONFIG.selectors.price,
      imageSels: CONFIG.selectors.image,
      linkSels: CONFIG.selectors.link,
    }
  )

  // Resolve URLs and parse prices in Node context
  return raw
    .map(r => ({
      name: r.name,
      price: parseFloat(r.priceText.replace(/[^0-9.]/g, '')) || 0,
      imageUrl: resolveUrl(r.imageHref, BASE_URL),
      productUrl: resolveUrl(r.linkHref, BASE_URL),
    }))
    .filter(p => p.name && p.price > 0 && p.imageUrl && p.productUrl)
}

// ─── Scroll helper ────────────────────────────────────────────────────────────

async function scrollPage(page: Page): Promise<void> {
  await page.evaluate(
    ({ step, max, interval }) =>
      new Promise<void>(resolve => {
        let scrolled = 0
        const timer = setInterval(() => {
          window.scrollBy(0, step)
          scrolled += step
          if (scrolled >= Math.min(document.body.scrollHeight, max)) {
            clearInterval(timer)
            resolve()
          }
        }, interval)
      }),
    { step: SCROLL_STEP_PX, max: SCROLL_MAX_PX, interval: SCROLL_INTERVAL_MS }
  )
}