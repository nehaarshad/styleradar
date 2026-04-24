/* eslint-disable @typescript-eslint/no-explicit-any */
import { chromium, Browser, BrowserContext, Page } from 'playwright'

export interface ScrapedProduct {
  id: string
  name: string
  brand: string
  price: number
  image_url: string
  product_url: string
  retailer: string
  description: string
  tags: string[]
  style_tags: string[]
  scraped_at: string
}

export class PlaywrightScraper {
  private browser: Browser | null = null
  private context: BrowserContext | null = null

  async initialize(): Promise<void> {
    console.log('🚀 Launching browser...')
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
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      viewport: { width: 1280, height: 900 },
    })
    
    console.log('✅ Browser ready')
  }

  async scrapeAllProducts(): Promise<ScrapedProduct[]> {
    if (!this.browser || !this.context) {
      await this.initialize()
    }

    console.log('\n' + '='.repeat(60))
    console.log('STARTING SCRAPE FOR BOTH RETAILERS')
    console.log('='.repeat(60))

    // Run both retailers in parallel
    const [limelightProducts, khaadiProducts] = await Promise.all([
      this.scrapeLimelightViaAPI(),
      this.scrapeKhaadi(), // Changed to search method
    ])

    const allProducts = [...limelightProducts, ...khaadiProducts]
    
    console.log('\n' + '='.repeat(60))
    console.log('FINAL SUMMARY')
    console.log('='.repeat(60))
    console.log(`✅ Limelight: ${limelightProducts.length} products`)
    console.log(`✅ Khaadi: ${khaadiProducts.length} products`)
    console.log(`📦 Total unique: ${allProducts.length} products`)
    console.log('='.repeat(60))

    return allProducts
  }

  // ============================================
  // LIMELIGHT - Using Shopify JSON API (WORKING)
  // ============================================
  
  private async scrapeLimelightViaAPI(): Promise<ScrapedProduct[]> {
    console.log('\n📱 [LIMELIGHT] Scraping via JSON API...')
    const allProducts: ScrapedProduct[] = []
    let page = 1
    let hasMore = true
    
    while (hasMore && page <= 20) {
      try {
        const url = `https://www.limelight.pk/products.json?limit=250&page=${page}`
        console.log(`   [LIMELIGHT] Page ${page}...`)
        
        const response = await fetch(url, {
          signal: AbortSignal.timeout(15000)
        })
        
        if (!response.ok) {
          console.log(`   [LIMELIGHT] HTTP ${response.status}, stopping`)
          break
        }
        
        const data = await response.json()
        
        if (!data.products || data.products.length === 0) {
          console.log(`   [LIMELIGHT] No more products`)
          hasMore = false
          break
        }
        
        const products = data.products.map((p: any) => {
          let tags: string[] = []
          if (p.tags) {
            if (typeof p.tags === 'string') {
              tags = p.tags.split(',').map((t: string) => t.trim())
            } else if (Array.isArray(p.tags)) {
              tags = p.tags
            }
          }
          
          return {
            id: `limelight-${p.id}`,
            name: (p.title || 'Product').substring(0, 255),
            brand: 'Limelight',
            price: parseFloat(p.variants?.[0]?.price || 0),
            image_url: (p.images?.[0]?.src || '').substring(0, 500),
            product_url: `https://www.limelight.pk/products/${p.handle}`,
            retailer: 'Limelight',
            description: (p.body_html?.replace(/<[^>]*>/g, '') || p.title || '').substring(0, 500),
            tags: tags,
            style_tags: [],
            scraped_at: new Date().toISOString(),
          }
        })
        
        allProducts.push(...products)
        console.log(`   [LIMELIGHT] ✅ ${products.length} products (Total: ${allProducts.length})`)
        page++
        
        await this.delay(500)
        
      } catch (error) {
        console.log(`   [LIMELIGHT] ⚠️ Page ${page} failed:`, error)
        hasMore = false
      }
    }
    
    console.log(`\n📊 [LIMELIGHT] Final total: ${allProducts.length} products\n`)
    return allProducts
  }

  // ============================================
  // KHAADI - Using Search Keywords (WORKING METHOD)
  // ============================================
   
 
  private async scrapeKhaadi(): Promise<ScrapedProduct[]> {
    console.log('\n🔄 Scraping Khaadi...')
    const allProducts: ScrapedProduct[] = []
    
    // Keywords that work with Khaadi search
    const keywords = ['lawn', 'formal', 'casual', 'pret', 'dress', 'kurta', 'shirt', 'embroidered']
    
    // Process keywords in parallel (2 at a time - Khaadi is slower)
    const chunkSize = 2
    for (let i = 0; i < keywords.length; i += chunkSize) {
      const chunk = keywords.slice(i, i + chunkSize)
      const results = await Promise.all(
        chunk.map(keyword => this.searchKhaadi(keyword))
      )
      results.forEach(products => allProducts.push(...products))
      console.log(`   ✅ Processed: ${chunk.join(', ')} - Total so far: ${allProducts.length}`)
      await this.delay(3000) // Wait between chunks
    }
    
    return allProducts
  }

  private async searchKhaadi(keyword: string): Promise<ScrapedProduct[]> {
    let page: Page | null = null
    
    try {
      page = await this.context!.newPage()
      const searchUrl = `https://pk.khaadi.com/search?q=${encodeURIComponent(keyword)}`
      
      console.log(`      🔍 Searching Khaadi for "${keyword}"...`)
      
      await page.goto(searchUrl, { 
        waitUntil: 'domcontentloaded', 
        timeout: 20000 
      })
      
      // Wait for products
      await page.waitForTimeout(5000)
      
      // Scroll to load more
      await this.scrollPage(page)
      
      // Try to get products
      const products = await page.evaluate(() => {
        const results: any[] = []
        
        // Try multiple selectors
        const selectors = ['.product-tile', '.product', '.tile']
        
        let elements: Element[] = []
        for (const selector of selectors) {
          elements = Array.from(document.querySelectorAll(selector))
          if (elements.length > 0) break
        }
        
        elements.forEach((card, idx) => {
          // Name
          const nameSelectors = ['.product-name', '.pdp-link-heading', '.tile-title', 'h2', 'h3']
          let name = ''
          for (const sel of nameSelectors) {
            const el = card.querySelector(sel)
            if (el) {
              name = el.textContent?.trim() || ''
              if (name) break
            }
          }
          
          // Price
          const priceSelectors = ['.price .value', '.sales .value', '.cc-price', '.price']
          let price = 0
          for (const sel of priceSelectors) {
            const el = card.querySelector(sel)
            if (el) {
              const priceText = el.textContent?.trim() || ''
              price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0
              if (price > 0) break
            }
          }
          
          // Image
          const imgEl = card.querySelector('.tile-image, img')
          let imageUrl = imgEl?.getAttribute('src') || imgEl?.getAttribute('data-src') || ''
          if (imageUrl && imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl
          
          // Link
          const linkEl = card.querySelector('a.plpRedirectPdp, a')
          let productUrl = linkEl?.getAttribute('href') || ''
          if (productUrl && !productUrl.startsWith('http')) {
            productUrl = `https://pk.khaadi.com${productUrl}`
          }
          
          if (name && price > 0 && imageUrl) {
            results.push({ name, price, imageUrl, productUrl })
          }
        })
        
        return results
      })
      
      // Add retailer info
     return products.map((p, idx) => ({
  id: `khaadi-${keyword}-${idx}-${Date.now()}`,
  name: p.name.substring(0, 255),
  brand: 'Khaadi',
  price: p.price,
  image_url: p.imageUrl.substring(0, 500),
  product_url: p.productUrl.substring(0, 500),
  retailer: 'Khaadi',
  description: p.name.substring(0, 500),
  tags: [keyword],
  style_tags: [keyword], // Changed from styleTags to style_tags
  scraped_at: new Date().toISOString(),
}))
      
    } catch (error) {
      console.error(`      ❌ Error searching Khaadi for "${keyword}":`, error)
      return []
    } finally {
      if (page) await page.close()
    }
  }

  private async scrollPage(page: Page): Promise<void> {
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0
        const distance = 400
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight
          window.scrollBy(0, distance)
          totalHeight += distance
          if (totalHeight >= Math.min(scrollHeight, 3000)) {
            clearInterval(timer)
            resolve()
          }
        }, 500)
      })
    })
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async close(): Promise<void> {
    if (this.context) await this.context.close()
    if (this.browser) await this.browser.close()
    console.log('🔒 Browser closed')
  }

}