import { client } from './client'

export const outfitsApi = {
  list: (scope) =>
    client.get('/outfits', { params: scope ? { scope } : {} }).then(r => r.data),

  get: (id) =>
    client.get(`/outfits/${id}`).then(r => r.data),

  generate: ({ style, budget, occasion, scope }) =>
    client.post('/outfits/generate', { style, budget, occasion, scope }).then(r => r.data),

  // Swap alternatives — products of the same role from the DB
  alternatives: ({ role, scope, excludeId, limit = 6 }) =>
    client.get('/outfits/alternatives', {
      params: { role, scope, exclude: excludeId, limit },
    }).then(r => r.data),

  // Save / unsave (requires auth)
  save: (id) =>
    client.post(`/outfits/${id}/save`).then(r => r.data),

  unsave: (id) =>
    client.delete(`/outfits/${id}/save`).then(r => r.data),

  // IDs only — fast check on load
  getSavedIds: () =>
    client.get('/outfits/saved/ids').then(r => r.data),

  // Full saved outfits
  getSaved: () =>
    client.get('/outfits/saved').then(r => r.data),

  // Rate an outfit ("up" | "down")
  rate: (id, rating) =>
    client.post(`/outfits/${id}/rate`, { rating }).then(r => r.data),
}
