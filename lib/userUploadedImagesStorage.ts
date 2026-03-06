import { v4 as uuidv4 } from 'uuid'
import { userModel } from '../model/user'
import { userUploadedImagesModel } from '../model/userUploadedImages'
import { StyleProfile } from '../model/userStyleprofile'

export const getStyleProfile = (userId: string): StyleProfile | undefined => {
  const profiles = localStorage.getItem('styleProfiles')
  const allProfiles = profiles ? JSON.parse(profiles) : []
  return allProfiles.find((p: StyleProfile) => p.userId === userId)
}

export const saveStyleProfile = (userId: string, images: userUploadedImagesModel[]) => {
  const profiles = localStorage.getItem('styleProfiles')
  const allProfiles = profiles ? JSON.parse(profiles) : []
  
  const existingIndex = allProfiles.findIndex((p: StyleProfile) => p.userId === userId)
  
  const newProfile: StyleProfile = {
    id: uuidv4(),
    userId,
    uploadedImages: images,
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

export const saveUploadedImages = (userId: string, images: userUploadedImagesModel[]) => {
  const key = `user_images_${userId}`
  localStorage.setItem(key, JSON.stringify(images))
}

export const getUploadedImages = (userId: string): userUploadedImagesModel[] => {
  const key = `user_images_${userId}`
  const images = localStorage.getItem(key)
  return images ? JSON.parse(images) : []
}