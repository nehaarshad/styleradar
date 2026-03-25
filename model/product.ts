export interface ProductModel {
  id: string
  name: string
  brand: string
  price: number
  imageUrl: string
  productUrl: string
  retailer: string
  description: string
  colors?: string[]
  category?: string
  tags?: string[]
  styleTags: string[]
  matchScore?: number
}