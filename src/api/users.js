import { client } from './client'

export const usersApi = {
  me: () =>
    client.get('/users/me').then(r => r.data),

  update: (data) =>
    client.put('/users/me', data).then(r => r.data),

  getDnaProfile: () =>
    client.get('/users/me/dna-profile').then(r => r.data),

  saveDnaProfile: (profile) =>
    client.post('/users/me/dna-profile', profile).then(r => r.data),

  getWishlist: () =>
    client.get('/users/me/wishlist').then(r => r.data),

  addToWishlist: (productId) =>
    client.post(`/users/me/wishlist/${productId}`).then(r => r.data),

  removeFromWishlist: (productId) =>
    client.delete(`/users/me/wishlist/${productId}`).then(r => r.data),
}
