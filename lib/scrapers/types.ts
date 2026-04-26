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

/**
 * Resolve a URL that might be relative, protocol-relative, or absolute.
 * @param href    The raw href/src value from the DOM
 * @param baseUrl The retailer base URL (e.g. "https://pk.khaadi.com")
 */
export function resolveUrl(href: string | null | undefined, baseUrl: string): string {
  if (!href) return ''

  const trimmed = href.trim()

  // Already absolute
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }

  // Protocol-relative  e.g. //cdn.example.com/img.jpg
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`
  }

  // Root-relative  e.g. /products/kurta-1
  if (trimmed.startsWith('/')) {
    return `${baseUrl}${trimmed}`
  }

  // Bare relative – unlikely in scraped pages but handle gracefully
  return `${baseUrl}/${trimmed}`
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}