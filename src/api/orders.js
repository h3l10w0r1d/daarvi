import { client } from './client'

export const ordersApi = {
  create: (orderData) =>
    client.post('/orders', orderData).then(r => r.data),

  list: () =>
    client.get('/orders').then(r => r.data),

  get: (id) =>
    client.get(`/orders/${id}`).then(r => r.data),
}
