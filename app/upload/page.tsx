'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { getSession } from '@/services/auth'
import { saveUploadedImages } from '@/lib/userUploadedImagesStorage'
import { saveStyleProfile, saveStyleAnalysis } from '@/lib/styleAnalyzer'
import { userUploadedImagesModel } from '@/model/userUploadedImages'
import { userModel } from '@/model/user'
import { v4 as uuidv4 } from 'uuid'

const MAX_IMAGES = 5
const MAX_SIZE_MB = 4

const STEPS = [
  'Preparing your images…',
  'Reading colour palette…',
  'Detecting silhouettes & fabrics…',
  'Building your Style DNA…',
  'Almost ready — personalising your feed…',
]

export default function UploadPage() {
  const router = useRouter()
  const [user, setUser] = useState<userModel | null>(null)
  const [images, setImages] = useState<userUploadedImagesModel[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const session = getSession()
    if (!session) router.push('/login')
    else setUser(session)
  }, [router])

  // Cycle through analysis steps
  useEffect(() => {
    if (!analyzing) return
    const id = setInterval(() => {
      setStepIndex((prev) => (prev + 1 < STEPS.length ? prev + 1 : prev))
    }, 1800)
    return () => clearInterval(id)
  }, [analyzing])

  const processFiles = useCallback(
    (files: FileList | File[]) => {
      setError('')
      const remaining = MAX_IMAGES - images.length
      if (remaining <= 0) return

      const newFiles = Array.from(files).slice(0, remaining)

      newFiles.forEach((file) => {
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          setError(`"${file.name}" exceeds ${MAX_SIZE_MB}MB — please choose a smaller image.`)
          return
        }
        if (!file.type.startsWith('image/')) return

        const reader = new FileReader()
        reader.onload = (e) => {
          setImages((prev) =>
            prev.length < MAX_IMAGES
              ? [...prev, { id: uuidv4(), image_url: e.target?.result as string }]
              : prev
          )
        }
        reader.readAsDataURL(file)
      })
    },
    [images.length]
  )

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files) processFiles(e.dataTransfer.files)
  }

  const removeImage = (id: string) => {
    if (analyzing) return
    setImages((prev) => prev.filter((img) => img.id !== id))
    setError('')
  }

  const analyse = async () => {
    if (images.length !== MAX_IMAGES || !user) return
    setAnalyzing(true)
    setStepIndex(0)
    setError('')

    try {
      saveUploadedImages(user.id, images)

      const res = await fetch('/api/analyze-style', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: images.map((i) => i.image_url) }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Analysis failed')

      saveStyleAnalysis(user.id, data.styleDNA)
      saveStyleProfile(user.id, images, data.styleDNA)

      router.push('/feed')
    } catch (err) {
      setError((err as Error).message || 'Failed to analyse style. Please try again.')
      setAnalyzing(false)
    }
  }

  if (!user) return null

  const slots = Array.from({ length: MAX_IMAGES })

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Nav */}
      <nav className="bg-white border-b border-[#ECEAE6] px-6 py-4 flex justify-between items-center sticky top-0 z-20">
        <h1 className="text-xl font-bold text-[#1C1C1C]">
          Style<span className="text-[#C9A96E]">Radar</span>
        </h1>
        <span className="text-sm text-[#6B6B6B]">Welcome, {user.username}</span>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#C9A96E] mb-3">
            Step 1 of 1
          </p>
          <h2 className="text-4xl font-bold text-[#1C1C1C] leading-tight mb-3">
            Upload 5 Outfits<br />You Already Love
          </h2>
          <p className="text-[#6B6B6B] text-base max-w-md mx-auto">
            Screenshots from Instagram, Pinterest saves, photos from your camera roll — anything goes.
            Gemini AI will decode your Style DNA in seconds.
          </p>
        </div>

        {/* Upload zone */}
        <div
          className={`bg-white rounded-2xl border-2 ${
            isDragging ? 'border-[#C9A96E] bg-[#FDF9F3]' : 'border-[#E8E5E0]'
          } p-6 mb-6 transition-colors`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <div className="grid grid-cols-5 gap-3 mb-4">
            {slots.map((_, idx) => {
              const img = images[idx]
              if (img) {
                return (
                  <div key={img.id} className="relative aspect-square group rounded-xl overflow-hidden shadow-sm">
                    <Image src={img.image_url} alt={`Outfit ${idx + 1}`} fill className="object-cover" />
                    <button
                      onClick={() => removeImage(img.id)}
                      disabled={analyzing}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/70 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-black"
                    >
                      ×
                    </button>
                    <div className="absolute bottom-1.5 left-1.5 w-5 h-5 bg-[#C9A96E] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {idx + 1}
                    </div>
                  </div>
                )
              }
              return (
                <label
                  key={idx}
                  className={`aspect-square rounded-xl border-2 border-dashed ${
                    isDragging ? 'border-[#C9A96E]' : 'border-[#D8D4CE]'
                  } flex flex-col items-center justify-center cursor-pointer hover:border-[#C9A96E] hover:bg-[#FDF9F3] transition`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileInput}
                    className="hidden"
                    disabled={analyzing}
                  />
                  <svg className="w-6 h-6 text-[#C0BDB8] mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-[10px] text-[#B0ADA8] font-medium">Photo {idx + 1}</span>
                </label>
              )
            })}
          </div>

          <p className="text-center text-xs text-[#A0A0A0]">
            {images.length}/{MAX_IMAGES} photos · Drag & drop or click to add
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {/* Analysis progress */}
        {analyzing && (
          <div className="bg-[#1C1C1C] rounded-xl px-6 py-4 mb-4 flex items-center gap-4">
            <div className="w-5 h-5 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <p className="text-white text-sm font-medium">{STEPS[stepIndex]}</p>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={analyse}
          disabled={images.length !== MAX_IMAGES || analyzing}
          className="w-full bg-[#1C1C1C] text-white py-4 rounded-xl font-semibold text-base hover:bg-[#2E2E2E] transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {analyzing ? 'Analysing your style…' : 'Analyse My Style with Gemini AI →'}
        </button>

        {/* Tips */}
        <div className="mt-8 bg-[#F5F1EB] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[#1C1C1C] mb-3">✨ Tips for best results</h3>
          <ul className="space-y-1.5 text-sm text-[#6B6B6B]">
            <li>• Choose clear, well-lit full-body shots</li>
            <li>• Mix different occasions — casual, formal, festive</li>
            <li>• Include Pakistani or South Asian outfits for localised matches</li>
            <li>• Keep images under 4 MB each</li>
          </ul>
        </div>
      </main>
    </div>
  )
}