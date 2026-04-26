// ─── Types ─────────────────────────────────────────────────────────────────────

export interface Product {
  id: string
  name: string
  brand: string
  price: number
  image_url: string
  product_url: string
  retailer: string
  description: string
  tags: string[]
  match_score?: number
}

export interface StyleDNA {
  id: string
  silhouette_prefs: string[]
  color_palette: string[]
  fabric_types: string[]
  occasion_style: string
  aesthetic_keywords: string[]
  description: string
  created_at: string
}

export interface BrandWithCount {
  name: string
  count: number
  active: boolean
}

export interface FeedState {
  allScoredProducts: Product[]
  brands: BrandWithCount[]
}

// ─── Constants ─────────────────────────────────────────────────────────────────

// Minimum score a product must reach to appear in the feed at all.
// Score breakdown: aesthetic(40) + colors(20) + occasion(20) + fabric(10) + silhouette(10) = 100
// A threshold of 25 means the product must match at least one major category meaningfully.
export const MATCH_THRESHOLD = 25

// Max products shown per brand tab (prevents infinite scroll while keeping variety)
export const MAX_PER_BRAND = 80

// How many products to show in the "All" tab across all brands combined
export const MAX_ALL = 120

const SYNONYM_MAP: Record<string, string[]> = {
  // Aesthetic
  'graceful':         ['elegant', 'refined', 'delicate', 'embroidered', 'embroidery', 'floral', 'lace', 'chiffon', 'organza'],
  'feminine':         ['floral', 'soft', 'delicate', 'pastel', 'lace', 'frill', 'ruffle', 'pink', 'blush', 'bow'],
  'traditional-chic': ['ethnic', 'cultural', 'pakistani', 'desi', 'embroidered', 'handwork', 'mirror', 'thread', 'gota', 'kari', 'zardozi'],
  'minimalist':       ['simple', 'clean', 'plain', 'solid', 'basic', 'classic', 'understated', 'subtle', 'unstitched'],
  'bohemian':         ['boho', 'free', 'printed', 'patchwork', 'tie-dye', 'block print'],
  'casual':           ['everyday', 'relaxed', 'comfortable', 'easy', 'lounge', 'basic'],
  'formal':           ['formal', 'occasion', 'party', 'festive', 'eid', 'wedding', 'event', 'function', 'luxury'],
  // Occasion
  'semi-formal':      ['everyday', 'relaxed', 'comfortable', 'easy', 'lounge', 'basic', 'unstitched','occasion', 'party', 'festive', 'eid', 'wedding', 'event', 'function', 'formal', 'luxury'],
 
  // Silhouette
  'straight-cut':     ['straight', 'regular', 'shirt', 'kurti', 'kurta', 'kameez', 'tunic'],
  'a-line':           ['flared', 'a-line', 'frock', 'gown', 'swing', 'umbrella'],
  'relaxed fit':      ['loose', 'comfort', 'relaxed', 'casual', 'easy', 'oversized', 'wide'],
  'fitted':           ['fitted', 'slim', 'tailored', 'bodycon', 'structured'],
  // Fabrics
  'lawn':             ['lawn', 'summer', 'cotton lawn', 'printed lawn', 'digital lawn'],
  'cotton':           ['cotton', 'khaddar', 'khadar', 'slub', 'cambric', 'karandi'],
  'silk':             ['silk', 'chiffon', 'organza', 'net', 'georgette', 'velvet', 'jacquard', 'crepe', 'satin'],
  'linen':            ['linen', 'linen blend', 'cotton linen'],
  // Colors
  'pastel pink':      ['pink', 'blush', 'rose', 'peach', 'salmon', 'light pink', 'baby pink', 'dusty rose'],
  'off-white':        ['white', 'off-white', 'cream', 'ivory', 'ecru', 'off white', 'pearl'],
  'deep blue':        ['blue', 'navy', 'teal', 'cobalt', 'midnight', 'royal blue', 'indigo', 'turquoise'],
  'black':            ['black', 'noir', 'onyx', 'charcoal', 'dark'],
  'green':            ['green', 'olive', 'sage', 'forest', 'emerald', 'mint', 'hunter'],
  'red':              ['red', 'maroon', 'crimson', 'burgundy', 'wine', 'rust'],
  'yellow':           ['yellow', 'mustard', 'gold', 'saffron', 'amber', 'lemon'],
  'purple':           ['purple', 'lilac', 'lavender', 'violet', 'plum', 'mauve'],
  'grey':             ['grey', 'gray', 'silver', 'ash', 'slate'],
  'brown':            ['brown', 'tan', 'camel', 'beige', 'nude', 'taupe', 'khaki'],
}

// ─── Core Scoring ──────────────────────────────────────────────────────────────

function buildSearchText(product: Product): string {
  return `${product.name} ${product.description || ''} ${(product.tags || []).join(' ')}`.toLowerCase()
}

function matchTerms(text: string, terms: string[]): number {
  let hits = 0
  for (const term of terms) {
    const tl = term.toLowerCase()
    // Direct substring match
    if (text.includes(tl)) { hits++; continue }
    // Partial root match (e.g. "embroid" matches "embroidered")
    if (tl.length > 4) {
      const root = tl.slice(0, 5)
      const words = text.split(/\s+/)
      if (words.some(w => w.startsWith(root) || tl.startsWith(w.slice(0, 5)))) {
        hits += 0.5; continue
      }
    }
    // Synonym match
    const synonyms = SYNONYM_MAP[tl] || []
    if (synonyms.some(s => text.includes(s))) hits += 0.7
  }
  return hits
}

export function calculateMatchScore(product: Product, dna: StyleDNA): number {
  const text = buildSearchText(product)
  let score = 0

  // 1. Aesthetic keywords — 40 pts
  if (dna.aesthetic_keywords?.length) {
    const allTerms = dna.aesthetic_keywords.flatMap(kw => [kw, ...(SYNONYM_MAP[kw.toLowerCase()] || [])])
    const directHits = matchTerms(text, dna.aesthetic_keywords)
    const allHits    = matchTerms(text, allTerms)
    const synonymHits = Math.max(allHits - directHits, 0)
    score += Math.min(((directHits + synonymHits * 0.6) / dna.aesthetic_keywords.length) * 40, 40)
  }

  // 2. Color palette — 20 pts
  if (dna.color_palette?.length) {
    const allColors = dna.color_palette.flatMap(c => [c, ...(SYNONYM_MAP[c.toLowerCase()] || [])])
    const hits = matchTerms(text, allColors)
    score += Math.min((hits / (dna.color_palette.length * 2)) * 20, 20)
  }

  // 3. Occasion style — 20 pts
  if (dna.occasion_style) {
    const occasionTerms = [dna.occasion_style, ...(SYNONYM_MAP[dna.occasion_style.toLowerCase()] || [])]
    if (occasionTerms.some(t => text.includes(t.toLowerCase()))) {
      score += 20
    } else if (occasionTerms.some(t => text.split(/\s+/).some(w => w.startsWith(t.slice(0, 4))))) {
      score += 10
    }
  }

  // 4. Fabric types — 10 pts
  if (dna.fabric_types?.length) {
    const allFabrics = dna.fabric_types.flatMap(f => [f, ...(SYNONYM_MAP[f.toLowerCase()] || [])])
    const hits = matchTerms(text, allFabrics)
    score += Math.min((hits / (dna.fabric_types.length * 2)) * 10, 10)
  }

  // 5. Silhouette prefs — 10 pts
  if (dna.silhouette_prefs?.length) {
    const allSils = dna.silhouette_prefs.flatMap(s => [s, ...(SYNONYM_MAP[s.toLowerCase()] || [])])
    const hits = matchTerms(text, allSils)
    score += Math.min((hits / (dna.silhouette_prefs.length * 2)) * 10, 10)
  }

  return Math.min(Math.round(score), 100)
}

// ─── Brand Normalizer ──────────────────────────────────────────────────────────

export function normalizeBrand(raw: string): string {
  return (raw || 'Unknown')
    .trim()
    .toLowerCase()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// ─── Feed Builder ──────────────────────────────────────────────────────────────

/**
 * Given all DB products and a StyleDNA, returns:
 * - allScoredProducts: only products that meet MATCH_THRESHOLD, sorted by score desc
 * - brands: tab list with per-brand counts (capped at MAX_PER_BRAND each)
 *
 * The "all" tab shows the top MAX_ALL products across all brands.
 * Each brand tab shows only that brand's matching products (up to MAX_PER_BRAND).
 * Products below MATCH_THRESHOLD are completely excluded.
 */
export function buildFeedState(rawProducts: Product[], dna: StyleDNA): FeedState {
  // Score every product
  const scored = rawProducts.map(p => ({
    ...p,
    match_score: calculateMatchScore(p, dna),
  }))

  // Filter to only genuinely matching products
  const matching = scored
    .filter(p => (p.match_score ?? 0) >= MATCH_THRESHOLD)
    .sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0))

  // Build per-brand counts from ALL matching products (not just the visible slice)
  const brandMap = new Map<string, number>()
  matching.forEach(p => {
    const brand = normalizeBrand(p.brand || p.retailer)
    brandMap.set(brand, (brandMap.get(brand) || 0) + 1)
  })

  const brandList: BrandWithCount[] = Array.from(brandMap.entries())
    .map(([name, count]) => ({ name, count, active: false }))
    .sort((a, b) => b.count - a.count)

  const brands: BrandWithCount[] = [
    { name: 'all', count: matching.length, active: true },
    ...brandList,
  ]

  return { allScoredProducts: matching, brands }
}

/**
 * Returns the visible product slice for a given brand tab.
 */
export function getProductsForBrand(allScoredProducts: Product[], brandName: string): Product[] {
  if (brandName === 'all') {
    return allScoredProducts.slice(0, MAX_ALL)
  }
  const normalize = (s: string) => s.trim().toLowerCase()
  return allScoredProducts
    .filter(p => normalize(normalizeBrand(p.brand || p.retailer)) === normalize(brandName))
    .slice(0, MAX_PER_BRAND)
}