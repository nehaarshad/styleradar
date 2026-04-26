'use client'

import { BrandWithCount } from '@/lib/matching/styleMatching'

interface BrandTabsProps {
  brands: BrandWithCount[]
  onSelect: (name: string) => void
}

export function BrandTabs({ brands, onSelect }: BrandTabsProps) {
  if (brands.length <= 1) return null

  return (
    <div className="mb-6 border-b border-[#ECEAE6] overflow-x-auto">
      <div className="flex min-w-max">
        {brands.map(brand => (
          <button
            key={brand.name}
            onClick={() => onSelect(brand.name)}
            className={`px-4 py-2.5 text-sm font-medium transition-all duration-150 border-b-2 whitespace-nowrap ${
              brand.active
                ? 'border-[#C9A96E] text-[#C9A96E]'
                : 'border-transparent text-[#6B6B6B] hover:text-[#1C1C1C]'
            }`}
          >
            {brand.name === 'all' ? 'All Matches' : brand.name}
            <span className={`ml-1.5 text-xs ${brand.active ? 'text-[#C9A96E]' : 'text-[#BABABA]'}`}>
              ({brand.count})
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}