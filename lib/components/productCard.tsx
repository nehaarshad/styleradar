'use client'

import { Product, normalizeBrand } from '@/lib/matching/styleMatching'

// Score badge color: green ≥ 70, amber ≥ 45, default gold
function scoreBadgeClass(score: number): string {
  if (score >= 70) return 'bg-emerald-500'
  if (score >= 45) return 'bg-amber-500'
  return 'bg-[#C9A96E]'
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const score = product.match_score ?? 0
  const brand = normalizeBrand(product.brand || product.retailer)

  return (
    <a
      href={product.product_url}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
    >
      <div className="aspect-square relative bg-[#F5F3F0]">
        {product.image_url && (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        <div className={`absolute top-2 right-2 ${scoreBadgeClass(score)} text-white text-xs px-2 py-0.5 rounded-full font-medium`}>
          {score}%
        </div>
      </div>
      <div className="p-3">
        <p className="text-xs text-[#C9A96E] font-medium mb-0.5">{brand}</p>
        <h3 className="text-sm font-medium text-[#1C1C1C] line-clamp-2 mb-1.5 leading-snug">
          {product.name}
        </h3>
        <p className="text-sm font-bold text-[#1C1C1C]">Rs. {product.price.toLocaleString()}</p>
      </div>
    </a>
  )
}