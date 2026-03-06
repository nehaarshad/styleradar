import { StyleDNAModel } from '@/model/userStyleDNA'
import { StyleProfile } from '@/model/userStyleprofile'
import { v4 as uuidv4 } from 'uuid'
import { userUploadedImagesModel } from '../model/userUploadedImages'

export const saveStyleAnalysis = (userId: string, styleDNA: StyleDNAModel) => {
  const key = `style_dna_${userId}`
  localStorage.setItem(key, JSON.stringify({
    ...styleDNA,
    analyzedAt: Date.now()
  }))
}

export const getStyleAnalysis = (userId: string): StyleDNAModel | null => {
  const key = `style_dna_${userId}`
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : null
}

export const saveStyleProfile = (userId: string, images: userUploadedImagesModel[], styleDNA?: StyleDNAModel) => {
  const profiles = localStorage.getItem('styleProfiles')
  const allProfiles = profiles ? JSON.parse(profiles) : []
  
  const existingIndex = allProfiles.findIndex((p: StyleProfile) => p.userId === userId)
  
  const newProfile: StyleProfile = {
    id: uuidv4(),
    userId,
    uploadedImages: images,
    styleDNA: styleDNA || undefined,
    createdAt: Date.now()
  }
  
  if (existingIndex >= 0) {
    allProfiles[existingIndex] = { ...allProfiles[existingIndex], ...newProfile }
  } else {
    allProfiles.push(newProfile)
  }
  
  localStorage.setItem('styleProfiles', JSON.stringify(allProfiles))
  return newProfile
}
