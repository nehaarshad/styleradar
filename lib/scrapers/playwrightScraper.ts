import { chromium, Browser, BrowserContext } from 'playwright'
import { ScrapedProduct } from './types'
import { scrapeLimelight } from './retailers/limelight'
import { scrapeKhaadi } from './retailers/khaadi'

export class PlaywrightScraper {
  private browser: Browser | null = null
  private context: BrowserContext | null = null

  async initialize(): Promise<void> {
    console.log('🚀 [SCRAPER] Launching browser…')

    this.browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    })

    this.context = await this.browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 900 },
    })

    console.log('✅ [SCRAPER] Browser ready')
  }

  async scrapeAllProducts(): Promise<ScrapedProduct[]> {
    if (!this.browser || !this.context) {
      await this.initialize()
    }

    console.log('\n' + '='.repeat(60))
    console.log('STARTING SCRAPE FOR ALL RETAILERS')
    console.log('='.repeat(60))

    // Limelight is API-only (no browser needed); Khaadi uses the shared context
    const [limelightProducts, khaadiProducts] = await Promise.all([
      scrapeLimelight(),
      scrapeKhaadi(this.context!),
    ])

    const allProducts = [...limelightProducts, ...khaadiProducts]

    console.log('\n' + '='.repeat(60))
    console.log('FINAL SUMMARY')
    console.log('='.repeat(60))
    console.log(`✅ Limelight : ${limelightProducts.length} products`)
    console.log(`✅ Khaadi    : ${khaadiProducts.length} products`)
    console.log(`📦 Total     : ${allProducts.length} products`)
    console.log('='.repeat(60))

    return allProducts
  }

  async close(): Promise<void> {
    await this.context?.close()
    await this.browser?.close()
    console.log('🔒 [SCRAPER] Browser closed')
  }
}