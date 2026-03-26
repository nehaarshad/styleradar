import { RetailerConfig } from '@/model/retailers'
import { ProductModel } from '@/model/product'

export async function fetchProduct(
  config: RetailerConfig,
  query: string
): Promise<ProductModel[]> {
  if (!config.jsonSearchUrl) return []

  const url = config.jsonSearchUrl(query)
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      Accept: 'application/json, text/html, */*',
    },
    signal: AbortSignal.timeout(15_000),
  })

  if (!res.ok) throw new Error(`JSON API ${res.status} for ${config.name}`)

  const text = await res.text()

  // If response is HTML, theme does not support ?view=json
  if (text.trim().startsWith('<')) {
    throw new Error(`${config.name} returned HTML — theme lacks JSON view`)
  }

  let products: ProductModel[] = []
  try {
    const data = JSON.parse(text)
    products = data.results ?? data.products ?? (Array.isArray(data) ? data : [])
  } catch {
    throw new Error(`JSON parse failed for ${config.name}`)
  }

  return products.map((p, idx): ProductModel => {
      const imageUrl = p.imageUrl
        ? p.imageUrl.startsWith('//')
          ? `https:${p.imageUrl}`
          : p.imageUrl
        : ''

      const price = p.price ? Math.round(p.price / 100) : 0
      const productUrl = p.productUrl
        ? p.productUrl.startsWith('http') || p.productUrl.startsWith('https') || p.productUrl.startsWith('//')
          ? p.productUrl
          : `${config.baseUrl}${p.productUrl}`
        : `${config.baseUrl}/products/${p.productUrl}`

      const tags = buildStyleTags(p.name ?? '', p.tags ?? [], query)
      return {
        id: `${config.name}-${p.id ?? idx}-${Date.now()}`,
        name: p.name ?? 'Product',
        brand: p.brand ?? config.name,
        price,
        imageUrl,
        productUrl,
        retailer: config.name,
        description: p.description ?? '',
        tags,
        styleTags: tags,
      }
    })
    .filter((p) => p.imageUrl && p.price > 0)
}


function buildStyleTags(name: string, tags: string[], query: string): string[] {
  const KW = ['casual','formal','elegant','embroidered','printed','lawn','cotton','chiffon','silk','kurta','shirt','dress','suit','minimalist','classic','trendy','desi','festive']
  const s = new Set<string>()
  query.toLowerCase().split(/\s+/).filter(t => t.length > 2).forEach(t => s.add(t))
  const combined = (name + ' ' + tags.join(' ')).toLowerCase()
  KW.forEach(kw => { if (combined.includes(kw)) s.add(kw) })
  tags.forEach(t => s.add(t.toLowerCase()))
  return Array.from(s)
}