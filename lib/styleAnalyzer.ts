import { StyleDNAModel } from '@/model/userStyleDNA'
import { StyleProfile } from '@/model/userStyleprofile'
import { userUploadedImagesModel } from '@/model/userUploadedImages'
import { v4 as uuidv4 } from 'uuid'

const dnaKey = (userId: string) => `style_dna_${userId}`
const profilesKey = 'styleProfiles'

export function saveStyleAnalysis(userId: string, styleDNA: StyleDNAModel): void {

  localStorage.setItem(
    dnaKey(userId),
    JSON.stringify({ ...styleDNA, analyzedAt: Date.now() })
  )
}

export function getStyleAnalysis(userId: string): StyleDNAModel | null {
  try {
    const raw = localStorage.getItem(dnaKey(userId))
    return raw ? (JSON.parse(raw) as StyleDNAModel) : null
  } catch {
    return null
  }
}



export function saveStyleProfile(
  userId: string,
  images: userUploadedImagesModel[],
  styleDNA?: StyleDNAModel
): StyleProfile {
  if (typeof window === 'undefined') throw new Error('Server-side call')

  const allProfiles: StyleProfile[] = (() => {
    try {
      return JSON.parse(localStorage.getItem(profilesKey) ?? '[]')
    } catch {
      return []
    }
  })()

  const existingIdx = allProfiles.findIndex((p) => p.userId === userId)

  const profile: StyleProfile = {
    id: existingIdx >= 0 ? allProfiles[existingIdx].id : uuidv4(),
    userId,
    uploadedImages: images,
    styleDNA,
    createdAt: Date.now(),
  }

  if (existingIdx >= 0) {
    allProfiles[existingIdx] = profile
  } else {
    allProfiles.push(profile)
  }

  localStorage.setItem(profilesKey, JSON.stringify(allProfiles))
  return profile
}

export function getStyleProfile(userId: string): StyleProfile | null {
  if (typeof window === 'undefined') return null
  try {
    const allProfiles: StyleProfile[] = JSON.parse(
      localStorage.getItem(profilesKey) ?? '[]'
    )
    return allProfiles.find((p) => p.userId === userId) ?? null
  } catch {
    return null
  }
}