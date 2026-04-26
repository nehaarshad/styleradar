export interface RetailerConfig {
  name: string
  baseUrl: string
  searchUrl: (query: string) => string
  jsonSearchUrl?: (query: string) => string
  selectors: {
    productContainer: string
    image: string
    name: string
    price: string
    link: string
    brand?: string
  }
  waitFor: number
  waitUntil: 'load' | 'domcontentloaded' | 'networkidle'
  delayBeforeScrape?: number
  ignoreHTTPSErrors?: boolean
}