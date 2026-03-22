import { client } from './client'

/**
 * Submit a virtual try-on job (CatVTON-Flux — SOTA quality).
 * @param {File}   personFile      - Full-body person photo
 * @param {string} garmentImageUrl - Public garment image URL
 * @returns {{ prediction_id, status }}
 */
export async function startTryOn(personFile, garmentImageUrl) {
  const form = new FormData()
  form.append('person_image', personFile)
  form.append('garment_image_url', garmentImageUrl)

  const { data } = await client.post('/try-on/generate', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60_000,
  })
  return data
}

/**
 * Poll the status of a try-on (image) prediction.
 * @param {string} predictionId
 * @returns {{ status, result_url, error }}
 */
export async function getTryOnStatus(predictionId) {
  const { data } = await client.get(`/try-on/status/${predictionId}`)
  return data
}

/**
 * Submit a rotation video job for a try-on result image (Wan 2.2 i2v).
 * @param {string} imageUrl - The try-on result image URL
 * @returns {{ prediction_id, status }}
 */
export async function startTryOnVideo(imageUrl) {
  const form = new FormData()
  form.append('image_url', imageUrl)

  const { data } = await client.post('/try-on/video', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30_000,
  })
  return data
}

/**
 * Poll the status of a video generation prediction.
 * @param {string} predictionId
 * @returns {{ status, result_url, error }}
 */
export async function getTryOnVideoStatus(predictionId) {
  const { data } = await client.get(`/try-on/video-status/${predictionId}`)
  return data
}
