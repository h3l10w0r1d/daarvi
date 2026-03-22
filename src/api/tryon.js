import { client } from './client'

/**
 * Submit a virtual try-on job.
 * @param {File}   personFile       - Full-body person photo file
 * @param {string} garmentImageUrl  - Public URL of the garment image
 * @param {string} garmentDescription - Short garment description
 * @returns {{ prediction_id: string, status: string }}
 */
export async function startTryOn(personFile, garmentImageUrl, garmentDescription = 'fashion garment') {
  const form = new FormData()
  form.append('person_image', personFile)
  form.append('garment_image_url', garmentImageUrl)
  form.append('garment_description', garmentDescription)

  const { data } = await client.post('/try-on/generate', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60_000,
  })
  return data
}

/**
 * Poll the status of a try-on prediction.
 * @param {string} predictionId
 * @returns {{ status: string, result_url: string|null, error: string|null }}
 */
export async function getTryOnStatus(predictionId) {
  const { data } = await client.get(`/try-on/status/${predictionId}`)
  return data
}
