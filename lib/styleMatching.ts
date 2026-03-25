import { ProductModel } from '@/model/product'
import { StyleDNAModel } from '@/model/userStyleDNA'

export function calculateStyleMatch(product: ProductModel,styleDNA: StyleDNAModel): number {

  const text = `${product.name} ${product.colors ?? ''} ${product.category ?? ''} ${product.description ?? ''} `.toLowerCase()

  let score = 0

  if (styleDNA.aestheticKeywords?.length) {
    const hits = styleDNA.aestheticKeywords.filter((kw) =>
      text.includes(kw.toLowerCase())
    ).length
    score += (hits / styleDNA.aestheticKeywords.length) * 40
  }

  if (styleDNA.colorPalette?.length) {
    const hits = styleDNA.colorPalette.filter((c) =>
      text.includes(c.toLowerCase())
    ).length
    score += (hits / styleDNA.colorPalette.length) * 20
  }

  if (
    styleDNA.occasionStyle &&
    text.includes(styleDNA.occasionStyle.toLowerCase())
  ) {
    score += 20
  }

  if (styleDNA.fabricTypes?.length) {
    const hits = styleDNA.fabricTypes.filter((f) =>
      text.includes(f.toLowerCase())
    ).length
    score += (hits / styleDNA.fabricTypes.length) * 10
  }

  if (styleDNA.silhouettePrefs?.length) {
    const hits = styleDNA.silhouettePrefs.filter((s) =>
      text.includes(s.toLowerCase())
    ).length
    score += (hits / styleDNA.silhouettePrefs.length) * 10
  }

  return Math.min(Math.round(score), 100)
}