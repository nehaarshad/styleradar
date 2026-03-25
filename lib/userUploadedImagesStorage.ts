import { userUploadedImagesModel } from '@/model/userUploadedImages'

const storageKey = (userId: string) => `uploaded_images_${userId}`

export function saveUploadedImages(
  userId: string,
  images: userUploadedImagesModel[]
): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(storageKey(userId), JSON.stringify(images))
}

export function getUploadedImages(userId: string): userUploadedImagesModel[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(storageKey(userId)) ?? '[]')
  } catch {
    return []
  }
}

export function clearUploadedImages(userId: string): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(storageKey(userId))
}