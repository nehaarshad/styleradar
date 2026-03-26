import { chromium, Browser, BrowserContext, Page } from 'playwright'
import { RETAILERS, Retailer } from './config'
import { RetailerConfig } from '@/model/retailers'
import { ProductModel } from '@/model/product'
import { fetchProduct } from './fetchProduct'

const NAV_TIMEOUT = 30_000
const SELECTOR_TIMEOUT = 8_000


export class PlaywrightScraper {
  private browser: Browser | null = null
  private context: BrowserContext | null = null
  private page: Page | null = null

  async initialize(): Promise<void> {
    this.browser = await chromium.launch({
      headless: true,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--window-size=1280,900',
      ],
    })

    this.context = await this.browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 900 },
      locale: 'en-PK',
      timezoneId: 'Asia/Karachi',
      extraHTTPHeaders: {
        'Accept-Language': 'en-PK,en;q=0.9',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Cache-Control': 'max-age=0',
      },
    })

    await this.context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false })
      // @ts-expect-error missing properties
      window.chrome = { runtime: {} }
    })

    this.page = await this.context.newPage()
    this.page.setDefaultTimeout(NAV_TIMEOUT)
    this.page.setDefaultNavigationTimeout(NAV_TIMEOUT)
  }

  private async ensurePage(): Promise<Page> {
    if (!this.page) await this.initialize()
    return this.page!
  }

  async searchProducts(retailerKey: Retailer, query: string): Promise<ProductModel[]> {
    const config = RETAILERS[retailerKey]
    if (!config) return []

    console.log(`[${config.name}] "${query}"`)

    // 1. Try Shopify JSON API first
    try {
      const products = await fetchProduct(config, query)
      if (products.length > 0) {
        console.log(` [${config.name}] ${products.length} products`)
        return products
      }
    } catch (err) {
      console.warn(`[${config.name}] ${(err as Error).message} — trying HTML`)
    }

    // 2. Playwright HTML fallback
    return this.scrapeHTML(config, query)
  }

// scrapeHTML — respect config.waitUntil
private async scrapeHTML(config: RetailerConfig, query: string): Promise<ProductModel[]> {
  const page = await this.ensurePage()
  try {
    await page.goto(config.searchUrl(query), {
      waitUntil: (config.waitUntil as typeof config.waitUntil) || 'domcontentloaded',
      timeout: NAV_TIMEOUT,
    })
    await this.dismissPopups(page)

    // For Khaadi: wait for product tiles specifically
    try {
      await page.waitForSelector(config.selectors.productContainer, {
        timeout: SELECTOR_TIMEOUT,
      })
    } catch {
      console.warn(`[${config.name}] Selector timeout — continuing`)
    }

    // Extra delay for SFCC dynamic content
    if (config.delayBeforeScrape) {
      await delay(config.delayBeforeScrape)
    }

    await this.softScroll(page)

    // Wait again after scroll for lazy images
    await delay(1500)

    const products = await this.extractFromHTML(page, config, query)
    console.log(`[${config.name}] HTML → ${products.length} products`)
    return products
  } catch (err) {
    console.error(` [${config.name}] HTML error:`, (err as Error).message)
    return []
  }
}

  private async dismissPopups(page: Page): Promise<void> {
    for (const sel of [
      'button[aria-label*="close" i]',
      '[class*="cookie"] button',
      '[class*="popup"] button[class*="close"]',
      '.klaviyo-close-form',
    ]) {
      try {
        const btn = page.locator(sel).first()
        if (await btn.isVisible({ timeout: 1500 })) await btn.click()
      } catch { /* ignore */ }
    }
  }

  private async softScroll(page: Page): Promise<void> {
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let pos = 0
        const id = setInterval(() => {
          window.scrollBy(0, 400)
          pos += 400
          if (pos >= document.body.scrollHeight) { clearInterval(id); resolve() }
        }, 100)
      })
    })
  }

  private async extractFromHTML(
    page: Page,
    config: RetailerConfig,
    query: string
  ): Promise<ProductModel[]> {
    return page.$$eval(
      config.selectors.productContainer,
      (
        elements: Element[],
        params: { selectors: RetailerConfig['selectors']; baseUrl: string; retailerName: string; query: string }
      ): ProductModel[] => {
        const { selectors, baseUrl, retailerName, query } = params

        function abs(url: string): string {
          if (!url) return ''
          if (url.startsWith('http')) return url    
          if (url.startsWith('//')) return `https:${url}`
          if (url.startsWith('/')) return `${baseUrl}${url}`
          return url
        }

        function getText(el: Element, sel: string): string {
          for (const s of sel.split(',')) {
            const t = el.querySelector(s.trim())?.textContent?.trim()
            if (t) return t
          }
          return ''
        }

function getImage(el: Element, sel: string): string {
  for (const s of sel.split(',')) {
    const img = el.querySelector(s.trim()) as HTMLImageElement | null
    if (!img) continue
    const src =
      img.getAttribute('src') ||
      img.getAttribute('data-src') ||
      img.getAttribute('data-medium-0') || // ← Khaadi stores URLs here
      img.getAttribute('data-large-0') ||
      img.getAttribute('data-original') ||
      img.getAttribute('srcset')?.split(',')[0]?.trim().split(' ')[0] ||
      ''
    if (src && !src.includes('blank') && !src.includes('placeholder') && src.length > 10)
      return src
  }
  return ''
}
        function parsePrice(text: string): number {
          const n = parseFloat(text.replace(/[^\d.]/g, ''))
          return isNaN(n) ? 0 : n
        }

        function buildTags(name: string, q: string): string[] {
          const KW = ['casual','formal','elegant','embroidered','printed','lawn','cotton','chiffon','silk','kurta','shirt','dress','suit','minimalist','classic','trendy','desi','festive']
          const s = new Set<string>()
          q.toLowerCase().split(/\s+/).filter(t => t.length > 2).forEach(t => s.add(t))
          const combined = (name + ' ' + q).toLowerCase()
          KW.forEach(kw => { if (combined.includes(kw)) s.add(kw) })
          return Array.from(s)
        }
            function getLink(el: Element, sel: string): string {
              for (const s of sel.split(',')) {
                const a = el.querySelector(s.trim()) as HTMLAnchorElement | null
                const href = a?.getAttribute('href') ?? ''
                if (href && href !== '#' && href.length > 1) return href
              }
              // fallback: first anchor with a real href
              for (const a of Array.from(el.querySelectorAll('a'))) {
                const href = (a as HTMLAnchorElement).getAttribute('href') ?? ''
                if (href && href !== '#' && !href.includes('Wishlist') && href.length > 1) return href
              }
              return ''
            }

        return elements.map((el, idx): ProductModel => {
            const imageUrl = abs(getImage(el, selectors.image))
            const name = getText(el, selectors.name) || el.querySelector('a')?.getAttribute('title') || ''
            const price = parsePrice(getText(el, selectors.price))
           const href = getLink(el, selectors.link)
          const productUrl = abs(href)
            const brand = selectors.brand ? getText(el, selectors.brand) || retailerName : retailerName
            const tags = buildTags(name, query)
            return {
              id: `${retailerName}-${Date.now()}-${idx}`,
              name,
              brand,
              price,
              imageUrl,
              productUrl,
              retailer: retailerName,
              description: name,
              tags,
              styleTags: tags,
            }
          })
          .filter(p => p.imageUrl && p.price > 0 && p.name.length > 0)
      },
      { selectors: config.selectors, baseUrl: config.baseUrl, retailerName: config.name, query }
    )
  }

  async searchMultipleRetailers(
    keywords: string[],
    retailers: Retailer[]
  ): Promise<ProductModel[]> {
    const allProducts: ProductModel[] = []
    const seen = new Set<string>()

    for (const retailer of retailers) {
      for (const keyword of keywords) {
        try {
          const products = await this.searchProducts(retailer, keyword)
          for (const p of products) {
            const key = p.productUrl || `${p.brand}::${p.name}`
            if (!seen.has(key)) {
              seen.add(key)
              allProducts.push(p)
            }
          }
          await delay(1500)
        } catch (err) {
          console.error(`Error ${retailer}/${keyword}:`, (err as Error).message)
        }
      }
    }

    return allProducts
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
      this.context = null
      this.page = null
    }
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
