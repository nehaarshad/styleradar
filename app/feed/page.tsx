// app/feed/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { getSession, logout } from '@/services/auth'
import { getUploadedImages } from '@/lib/userUploadedImagesStorage'
import {  getStyleAnalysis, } from '@/lib/styleAnalyzer'
import { userModel } from '@/model/user'
import { userUploadedImagesModel } from '@/model/userUploadedImages'
import { StyleDNAModel } from '@/model/userStyleDNA'

// Mock product data (in real app, this would be filtered based on style DNA)
const MOCK_PRODUCTS = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400',
    brand: 'Zara',
    price: 89,
    description: 'Elegant Floral Dress',
    styleTags: ['feminine', 'floral', 'dress']
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400',
    brand: 'H&M',
    price: 49,
    description: 'Classic White T-Shirt',
    styleTags: ['basics', 'minimalist', 'casual']
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    brand: 'Nike',
    price: 120,
    description: 'Air Max 270',
    styleTags: ['sneakers', 'sporty', 'streetwear']
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400',
    brand: 'Levi\'s',
    price: 79,
    description: 'High-Waist Jeans',
    styleTags: ['denim', 'casual', 'basics']
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=400',
    brand: 'Mango',
    price: 59,
    description: 'Leather Jacket',
    styleTags: ['edgy', 'outerwear', 'statement']
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1584670747417-594a9412fba5?w=400',
    brand: 'Adidas',
    price: 85,
    description: 'Ultraboost Shoes',
    styleTags: ['sneakers', 'sporty', 'comfort']
  }
]

export default function FeedPage() {
  const router = useRouter()
  const [user, setUser] = useState<userModel | null>(null)
  const [uploadedImages, setUploadedImages] = useState<userUploadedImagesModel[]>([])
  const [styleDNA, setStyleDNA] = useState<StyleDNAModel | null>(null)
  const [savedItems, setSavedItems] = useState<unknown[]>([])
  const [showStyleInsights, setShowStyleInsights] = useState(false)

  useEffect(() => {
    const createSession =() => {
        const session = getSession()
    if (!session) {
      router.push('/login')
    } else {
      setUser(session)
      const images = getUploadedImages(session.id)
      setUploadedImages(images)
      
      const dna = getStyleAnalysis(session.id)
      setStyleDNA(dna)
      

    }
    }
    
    createSession()
  }, [router])


  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-indigo-600">StyleRadar</h1>
              <span className="text-sm text-gray-500">Your Daily Style Feed</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowStyleInsights(!showStyleInsights)}
                className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full hover:bg-indigo-100"
              >
                {showStyleInsights ? 'Hide' : 'Show'} Style DNA
              </button>
              <button
                onClick={() => {
                  logout()
                  router.push('/login')
                }}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Style DNA Insights Panel */}
      {showStyleInsights && styleDNA && (
        <div className="bg-indigo-600 text-white">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h2 className="text-lg font-semibold mb-3">✨ Your Style DNA (Analyzed by Gemini AI)</h2>
            <p className="text-indigo-100 mb-4">{styleDNA.description}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div>
                <div className="font-medium text-indigo-200">Silhouettes</div>
                <div className="text-white">{styleDNA.silhouettePrefs?.join(', ')}</div>
              </div>
              <div>
                <div className="font-medium text-indigo-200">Colors</div>
                <div className="text-white">{styleDNA.colorPalette?.join(', ')}</div>
              </div>
              <div>
                <div className="font-medium text-indigo-200">Fabrics</div>
                <div className="text-white">{styleDNA.fabricTypes?.join(', ')}</div>
              </div>
              <div>
                <div className="font-medium text-indigo-200">Occasion</div>
                <div className="text-white">{styleDNA.occasionStyle}</div>
              </div>
              <div>
                <div className="font-medium text-indigo-200">Aesthetic</div>
                <div className="text-white">{styleDNA.aestheticKeywords?.join(', ')}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Your Style Preview */}
      {uploadedImages.length > 0 && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Your Style Inspiration</h2>
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {uploadedImages.map((img, idx) => (
                <div key={img.id} className="flex-shrink-0 w-20 h-20 relative rounded-lg overflow-hidden">
                  <Image
                    src={img.image_url}
                    alt={`Style ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Feed */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Style Match Badge */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Recommended for You</h2>
          <span className="text-sm text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            Based on your style DNA
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_PRODUCTS.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
              <div className="relative h-64">
                <Image
                  src={product.image}
                  alt={product.description}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{product.brand}</h3>
                    <p className="text-sm text-gray-600">{product.description}</p>
                  </div>
                  <span className="font-bold text-indigo-600">${product.price}</span>
                </div>
                
                {/* Style match indicator */}
                {styleDNA && (
                  <div className="flex items-center space-x-1 mb-3">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      95% Match
                    </span>
                    {product.styleTags.map(tag => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex space-x-2 mt-4">
                  
                  <button className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition text-sm font-medium">
                    Shop Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <button className="bg-white text-indigo-600 border border-indigo-600 px-6 py-2 rounded-lg hover:bg-indigo-50 transition font-medium">
            Load More
          </button>
        </div>
      </main>
    </div>
  )
}