// app/profile/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { getSession } from '@/services/auth'
import { getUploadedImages } from '@/lib/userUploadedImagesStorage'
import {  getStyleAnalysis } from '@/lib/styleAnalyzer'
import { userModel } from '@/model/user'
import { userUploadedImagesModel } from '@/model/userUploadedImages'
import { StyleDNAModel } from '@/model/userStyleDNA'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<userModel | null>(null)
  const [styleDNA, setStyleDNA] = useState<StyleDNAModel | null>(null)
  const [uploadedImages, setUploadedImages] = useState<userUploadedImagesModel[]>([])

  useEffect(() => {
    const createSession =() => {
        const session = getSession()
    if (!session) {
      router.push('/login')
    } else {
      setUser(session)
      const dna = getStyleAnalysis(session.id)
      setStyleDNA(dna)
      const images = getUploadedImages(session.id)
      setUploadedImages(images)
    }
}
createSession()
  }, [router])

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-indigo-600">StyleRadar</h1>
            <button
              onClick={() => router.push('/feed')}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Back to Feed
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-600 px-6 py-8 text-white">
            <h2 className="text-2xl font-bold">Your Style Profile</h2>
            <p className="text-indigo-100 mt-1">Analyzed by Gemini AI</p>
          </div>

          {/* Style DNA */}
          {styleDNA ? (
            <div className="p-6">
              {/* Style Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Style Summary</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                  {styleDNA.description}
                </p>
              </div>

              {/* Style Attributes */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Silhouette Preferences</h3>
                  <div className="flex flex-wrap gap-2">
                    {styleDNA.silhouettePrefs?.map((item: string) => (
                      <span key={item} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Color Palette</h3>
                  <div className="flex flex-wrap gap-2">
                    {styleDNA.colorPalette?.map((color: string) => (
                      <span key={color} className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm">
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Fabric Types</h3>
                  <div className="flex flex-wrap gap-2">
                    {styleDNA.fabricTypes?.map((fabric: string) => (
                      <span key={fabric} className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
                        {fabric}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Style Aesthetics</h3>
                  <div className="flex flex-wrap gap-2">
                    {styleDNA.aestheticKeywords?.map((keyword: string) => (
                      <span key={keyword} className="bg-pink-50 text-pink-700 px-3 py-1 rounded-full text-sm">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Uploaded Images */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Your Inspiration Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {uploadedImages.map((img, idx) => (
                    <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden">
                      <Image
                        src={img.image_url}
                        alt={`Inspiration ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-gray-500 mb-4">{`You haven't analyzed your style yet`}</p>
              <button
                onClick={() => router.push('/upload')}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
              >
                Analyze Your Style
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}