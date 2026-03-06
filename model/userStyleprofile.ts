import { StyleDNAModel } from "./userStyleDNA"
import { userUploadedImagesModel } from "./userUploadedImages"

export interface StyleProfile {
  id: string
  userId: string
  uploadedImages: userUploadedImagesModel[],
  styleDNA?: StyleDNAModel,
  createdAt: number
}