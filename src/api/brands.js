import { client } from './client'

export const brandsApi = {
  list: () =>
    client.get('/brands').then(r => r.data),

  get: (idOrSlug) =>
    client.get(`/brands/${idOrSlug}`).then(r => r.data),
}
