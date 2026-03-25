import Image from 'next/image'
import { ProductModel } from '@/model/product'
import { MatchBadge } from './matchBadge'
const RETAILER_COLORS: Record<string, string> = {
  Khaadi: '#006837',
  Limelight: '#E91E63',
  Satrangi: '#FF6B00',
}


export function ProductCard({ product, onSave, saved }: { product: ProductModel; onSave: (p: ProductModel) => void; saved: boolean }) {
  const brandColor = RETAILER_COLORS[product.brand] ?? '#1C1C1C'
   const normalizedPrice = product.price < 10 ? product.price * 10000 : product.price;
  return (
    <article className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition group flex flex-col">
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F5F2EE]">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition duration-500"
            unoptimized
            onError={(e) => {
              // Hide broken images
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#C0BDB8]">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Save button */}
        <button
          onClick={() => onSave(product)}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition opacity-0 group-hover:opacity-100"
          aria-label={saved ? 'Unsave' : 'Save'}
        >
          <svg className={`w-4 h-4 ${saved ? 'fill-[#C9A96E] stroke-[#C9A96E]' : 'fill-none stroke-[#6B6B6B]'}`} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Retailer badge */}
        <div
          className="absolute bottom-3 left-3 px-2 py-0.5 rounded text-white text-[10px] font-bold"
          style={{ backgroundColor: brandColor }}
        >
          {product.brand}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1 gap-2">
        <p className="text-xs text-[#A0A0A0] font-medium uppercase tracking-wide">{product.brand}</p>
        <h3 className="text-sm font-semibold text-[#1C1C1C] leading-snug line-clamp-2">{product.name}</h3>

        <div className="flex items-center gap-2 flex-wrap mt-auto pt-2">
          <MatchBadge score={product.matchScore} />
          {product.styleTags?.slice(0, 2).map((tag) => (
            <span key={tag} className="text-[10px] text-[#8B8884] bg-[#F5F2EE] px-2 py-0.5 rounded-full capitalize">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#F0EDE8] mt-1">
        

<span className="font-bold text-[#1C1C1C] text-sm">
  {normalizedPrice > 0
    ? new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        minimumFractionDigits: 0,
      }).format(normalizedPrice)
    : '—'}
</span>

          <a
            href={product.productUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-white bg-[#1C1C1C] px-3 py-1.5 rounded-lg hover:bg-[#2E2E2E] transition"
          >
            Shop →
          </a>
        </div>
      </div>
    </article>
  )
}