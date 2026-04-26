'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFeed } from '@/lib/matching/useFeed'
import { MATCH_THRESHOLD } from '@/lib/matching/styleMatching'
import { FeedNav } from '@/lib/components/navFeed'
import { BrandTabs } from'@/lib/components/brandTag'
import { ProductCard } from '@/lib/components/productCard'
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-PK', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function FeedPage() {
  const router = useRouter()
  const feed = useFeed()

  useEffect(() => {
    feed.init()
  }, [])

  // Redirect cases handled by the hook returning error/empty with no DNA
  useEffect(() => {
    if (feed.status === 'error') router.push('/login')
  }, [feed.status])

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (feed.status === 'loading' || feed.status === 'idle') {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-[#6B6B6B]">Matching products to your style…</p>
        </div>
      </div>
    )
  }

  // ── No matching products ─────────────────────────────────────────────────────
  if (feed.status === 'empty' || feed.products.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF8F5]">
        <FeedNav
          userName={feed.userName}
          styleDNA={feed.styleDNA}
          onHistory={() => router.push('/profile')}
          currentDNAId={feed.styleDNA?.id}
          onRefresh={feed.refresh}
          onLogout={async () => { await feed.logout(); router.push('/login') }}
          onReupload={() => router.push('/upload')}
          onLoadHistory={feed.loadHistoryStyle}
          formatDate={formatDate}
        />
        <div className="flex flex-col items-center justify-center py-32 px-4">
          <div className="w-16 h-16 rounded-full bg-[#C9A96E]/10 flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-[#C9A96E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[#1C1C1C] mb-2">No strong matches found</h2>
          <p className="text-[#6B6B6B] text-sm text-center max-w-xs mb-2">
            No products scored above {MATCH_THRESHOLD}% for your current style profile.
          </p>
          <p className="text-[#BABABA] text-xs text-center max-w-xs mb-8">
            Try uploading different outfit photos so we can build a more accurate style DNA.
          </p>
          <button
            onClick={() => router.push('/upload')}
            className="bg-[#1C1C1C] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#2C2C2C] transition"
          >
            Upload New Outfits
          </button>
        </div>
      </div>
    )
  }

  // ── Feed ─────────────────────────────────────────────────────────────────────
  const visibleCount = feed.activeBrand === 'all'
    ? feed.allScoredProducts.length
    : feed.products.length

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <FeedNav
        userName={feed.userName}
        styleDNA={feed.styleDNA}
        onHistory={() => router.push('/profile')}
        currentDNAId={feed.styleDNA?.id}
        onRefresh={feed.refresh}
        onLogout={async () => { await feed.logout(); router.push('/login') }}
        onReupload={() => router.push('/upload')}
        onLoadHistory={feed.loadHistoryStyle}
        formatDate={formatDate}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#1C1C1C]">Your Personalized Feed</h2>
          <p className="text-sm text-[#6B6B6B] mt-1">
            {visibleCount} products matched above {MATCH_THRESHOLD}% for your style
          </p>
          {feed.styleDNA && (
            <div className="mt-3 flex flex-wrap gap-2 items-center">
              <span className="text-xs text-[#6B6B6B]">Matching:</span>
              {feed.styleDNA.aesthetic_keywords?.slice(0, 5).map((kw, i) => (
                <span
                  key={i}
                  className="text-xs bg-[#C9A96E]/10 text-[#B8894A] border border-[#C9A96E]/25 px-2.5 py-0.5 rounded-full"
                >
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Brand Tabs */}
        <BrandTabs brands={feed.brands} onSelect={feed.selectBrand} />

        {/* Product Grid */}
        {feed.products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {feed.products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-[#6B6B6B] text-sm">No products match this filter.</p>
          </div>
        )}

      </main>
    </div>
  )
}