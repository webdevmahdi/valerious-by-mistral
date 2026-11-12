import { env } from '../config/env'

export const cloudinary = {
  isConfigured(): boolean {
    return Boolean(env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret)
  },

  uploadUrl(publicId: string, transformation = 'f_auto,q_auto,w_1200'): string {
    if (!this.isConfigured()) return ''
    return `https://res.cloudinary.com/${env.cloudinary.cloudName}/image/upload/${transformation}/${publicId}`
  },

  signedUploadParams(publicId: string): { url: string; timestamp: number; folder: string } {
    return {
      url: `https://api.cloudinary.com/v1_1/${env.cloudinary.cloudName}/image/upload`,
      timestamp: Date.now(),
      folder: `valerius/${publicId}`,
    }
  },
}
