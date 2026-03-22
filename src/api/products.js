import { client } from './client'

export const productsApi = {
  list: (params = {}) =>
    client.get('/products', { params }).then(r => r.data),

  get: (id) =>
    client.get(`/products/${id}`).then(r => r.data),

  recommended: (style = '', limit = 4) =>
    client.get('/products/recommended', { params: { style, limit } }).then(r => r.data),
}
