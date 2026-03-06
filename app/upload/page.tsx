
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { getSession } from '@/services/auth'
import { saveUploadedImages } from '@/lib/userUploadedImagesStorage'
import {  saveStyleProfile, saveStyleAnalysis } from '@/lib/styleAnalyzer'
import { userUploadedImagesModel } from '@/model/userUploadedImages'
import { v4 as uuidv4 } from 'uuid'
import { userModel } from '@/model/user'

export default function UploadPage() {
  const router = useRouter()
  const [user, setUser] = useState<userModel | null>(null)
  const [images, setImages] = useState<userUploadedImagesModel[]>([])
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisStep, setAnalysisStep] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const session = getSession()
    if (!session) {
      router.push('/login')
    } else {
      setUser(session)
    }
  }, [router])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    // Limit to 5 images
    if (images.length + files.length > 5) {
      alert('You can only upload up to 5 images')
      return
    }

    setLoading(true)
    setError('')

    Array.from(files).forEach(file => {
      // Check file size (limit to 4MB per image for Gemini)
      if (file.size > 4 * 1024 * 1024) {
        alert('Please upload images smaller than 4MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const newImage: userUploadedImagesModel = {
          id: uuidv4(),
          image_url: event.target?.result as string,

        }
        setImages(prev => [...prev, newImage])
      }
      reader.readAsDataURL(file)
    })

    setLoading(false)
  }

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id))
    setError('')
  }

  const analyzeWithGemini = async () => {
    if (images.length !== 5) {
      alert('Please upload exactly 5 images')
      return
    }

    setAnalyzing(true)
    setError('')
    setAnalysisStep('Preparing images...')

    try {
      // Save images to storage first
      saveUploadedImages(user?.id ?? "", images)
      
      setAnalysisStep('Analyzing your style with Gemini AI...')
      
      // Call our API route
      const response = await fetch('/api/analyze-style', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images: images.map(img => img.image_url)
        }),
      })

      console.log('API response status:', response.status)
      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const data = await response.json()
      
      setAnalysisStep('Saving your style profile...')
      
      // Save the style analysis
      saveStyleAnalysis(user?.id ?? "", data.styleDNA)
      
      // Update style profile with DNA
      saveStyleProfile(user?.id ?? "", images, data.styleDNA)
      
      setAnalysisStep('Complete! Redirecting to your feed...')
      
      // Redirect to feed
      setTimeout(() => {
        router.push('/feed')
      }, 1000)
      
    } catch (error) {
      console.error('Analysis error:', error)
      setError('Failed to analyze style. Please try again.')
      setAnalyzing(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-indigo-600">StyleRadar</h1>
            <span className="text-sm text-gray-600">Welcome, {user.username}</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Upload 5 Outfits You Love</h2>
          <p className="text-gray-600 mt-2">
            From Instagram, Pinterest, or your camera roll. Gemini AI will analyze your style.
          </p>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {images.map((image, index) => (
              <div key={image.id} className="relative aspect-square group">
                <Image
                  src={image.image_url}
                  alt={`Upload ${index + 1}`}
                  fill
                  className="object-cover rounded-lg"
                />
                <button
                  onClick={() => removeImage(image.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 opacity-0 group-hover:opacity-100 transition"
                  disabled={analyzing}
                >
                  ×
                </button>
                <div className="absolute top-2 left-2 bg-indigo-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {index + 1}
                </div>
              </div>
            ))}
            
            {images.length < 5 && (
              <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={loading || analyzing}
                />
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="text-xs text-gray-500 mt-1">Add Image</span>
              </label>
            )}
          </div>

          <p className="text-sm text-gray-500 text-center mb-4">
            {images.length}/5 images uploaded
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {analyzing && (
            <div className="bg-indigo-50 p-4 rounded-lg mb-4">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                <p className="text-indigo-700 text-sm">{analysisStep}</p>
              </div>
            </div>
          )}

          <button
            onClick={analyzeWithGemini}
            disabled={images.length !== 5 || analyzing}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {analyzing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {analysisStep}
              </span>
            ) : (
              'Analyze My Style with Gemini AI →'
            )}
          </button>
        </div>

        {/* Tips */}
        <div className="bg-indigo-50 rounded-lg p-4">
          <h3 className="font-medium text-indigo-900 mb-2">✨ Gemini AI Style Analysis Tips:</h3>
          <ul className="text-sm text-indigo-700 space-y-1">
            <li>• Choose clear, well-lit photos</li>
            <li>• Include full outfit shots when possible</li>
            <li>• Mix different style categories</li>
            <li>• Images should be under 4MB each</li>
          </ul>
        </div>
      </main>
    </div>
  )
}