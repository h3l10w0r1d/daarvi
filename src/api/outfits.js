import { client } from './client'

export const outfitsApi = {
  list: (scope) =>
    client.get('/outfits', { params: scope ? { scope } : {} }).then(r => r.data),

  get: (id) =>
    client.get(`/outfits/${id}`).then(r => r.data),

  generate: ({ style, budget, occasion, scope }) =>
    client.post('/outfits/generate', { style, budget, occasion, scope }).then(r => r.data),
}
