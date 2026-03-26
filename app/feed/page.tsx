'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { getUploadedImages } from '@/lib/userUploadedImagesStorage'
import { getStyleAnalysis } from '@/lib/styleAnalyzer'
import { userModel } from '@/model/user'
import { userUploadedImagesModel } from '@/model/userUploadedImages'
import { StyleDNAModel } from '@/model/userStyleDNA'
import { ProductModel } from '@/model/product'
import { ProductCard } from '../components/ui/productCard'
import LogoutButton from '../components/ui/logoutbutton'
import { getCurrentUser } from '@/lib/userStorage'

export default function FeedPage() {
  const router = useRouter()
  const [user, setUser] = useState<userModel | null>(null)
  const [products, setProducts] = useState<ProductModel[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [uploadedImages, setUploadedImages] = useState<userUploadedImagesModel[]>([])
  const [styleDNA, setStyleDNA] = useState<StyleDNAModel | null>(null)
  const [showDNA, setShowDNA] = useState(false)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [usingMock, setUsingMock] = useState(false)

  const loadProducts = useCallback(async (dna: StyleDNAModel) => {
    setLoading(true)
    setLoadError('')
    setUsingMock(false)

    try {
      const res = await fetch('/api/scrape-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          styleDNA: dna,
          retailers: ['limelight', 'khaadi', 'satrangi'],
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load products')

      if (data.products?.length > 0) {
        setProducts(data.products)
      } else {
       
        setUsingMock(true)
      }
    } catch (err) {
      console.error('Feed error:', err)
    
      setUsingMock(true)
      setLoadError('Could not reach retailers — showing curated examples.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const session = getCurrentUser()
    if (!session) { router.push('/login'); return }

    setUser(session)
    setUploadedImages(getUploadedImages(session.id))

    const dna = getStyleAnalysis(session.id)
    setStyleDNA(dna)
    if (dna) loadProducts(dna)
  }, [router, loadProducts])

  const toggleSave = (p: ProductModel) => {
    setSavedIds((prev) => {
      const next = new Set(prev)
      next.has(p.id) ? next.delete(p.id) : next.add(p.id)
      return next
    })
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Nav */}
      <nav className="bg-white border-b border-[#ECEAE6] sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-[#1C1C1C]">
                Style<span className="text-[#C9A96E]">Radar</span>
              </h1>
              <span className="hidden sm:block text-sm text-[#A0A0A0]">Your Daily Feed</span>
            </div>
            <div className="flex items-center gap-3">
              {styleDNA && (
                <button
                  onClick={() => router.push('/profile')}
                  className="text-xs bg-[#F5F1EB] text-[#8B5E3C] px-3 py-1.5 rounded-full hover:bg-[#EDE7DC] transition font-medium"
                >
                  View Style DNA
                </button>
              )}
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Style DNA Panel */}
      {showDNA && styleDNA && (
        <div className="bg-[#1C1C1C] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-[#C9A96E] text-xs font-semibold uppercase tracking-widest mb-2">Your Style DNA</p>
            <p className="text-[#D0CCC8] text-sm mb-5 max-w-2xl">{styleDNA.description}</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
              {[
                { label: 'Aesthetic', values: styleDNA.aestheticKeywords },
                { label: 'Colours', values: styleDNA.colorPalette },
                { label: 'Fabrics', values: styleDNA.fabricTypes },
                { label: 'Silhouettes', values: styleDNA.silhouettePrefs },
                { label: 'Occasion', values: [styleDNA.occasionStyle] },
              ].map(({ label, values }) => (
                <div key={label}>
                  <p className="text-[#8B8884] text-xs uppercase tracking-wide mb-1">{label}</p>
                  <p className="text-white capitalize">{values?.join(', ')}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Uploaded images strip */}
      {uploadedImages.length > 0 && (
        <div className="bg-white border-b border-[#ECEAE6]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#A0A0A0] mb-3">Your Style Inspiration</p>
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
              {uploadedImages.map((img, i) => (
                <div key={img.id} className="flex-shrink-0 w-16 h-16 relative rounded-xl overflow-hidden shadow-sm">
                  <Image src={img.image_url} alt={`Inspiration ${i + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#1C1C1C]">Recommended for You</h2>
            <p className="text-sm text-[#A0A0A0] mt-0.5">
              {loading
                ? 'Finding products that match your style…'
                : usingMock
                ? 'Curated examples while your feed loads'
                : `${products.length} items matched to your Style DNA`}
            </p>
          </div>
          {styleDNA && !loading && (
            <button
            onClick={() => router.push('/upload')}
              className="text-xs font-medium text-[#C9A96E] border border-[#C9A96E]/40 px-3 py-1.5 rounded-full hover:bg-[#FDF9F3] transition"
            >
              Re-upload
            </button>
          )}
        </div>

        {/* Error banner */}
        {loadError && (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-xl mb-6">
            {loadError}
          </div>
        )}

        {/* Skeleton loader */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                <div className="aspect-[3/4] bg-[#F0EDE8]" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-[#F0EDE8] rounded w-1/3" />
                  <div className="h-4 bg-[#F0EDE8] rounded w-3/4" />
                  <div className="h-3 bg-[#F0EDE8] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products grid */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSave={toggleSave}
                saved={savedIds.has(product.id)}
              />
            ))}
          </div>
        )}

        {/* No products */}
        {!loading && products.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[#A0A0A0] text-base mb-4">No products found. Try refreshing or updating your style photos.</p>
            <button
              onClick={() => router.push('/upload')}
              className="bg-[#1C1C1C] text-white px-6 py-3 rounded-xl font-medium text-sm hover:bg-[#2E2E2E] transition"
            >
              Update Style Photos
            </button>
          </div>
        )}

        {/* Saved items count */}
        {savedIds.size > 0 && (
          <div className="fixed bottom-6 right-6 bg-[#1C1C1C] text-white px-4 py-2.5 rounded-full shadow-lg text-sm font-medium flex items-center gap-2 z-30">
            <svg className="w-4 h-4 fill-[#C9A96E]" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {savedIds.size} saved
          </div>
        )}
      </main>
    </div>
  )
}