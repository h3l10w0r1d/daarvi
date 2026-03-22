import { client } from './client'

export const storesApi = {
  list: (mode) =>
    client.get('/stores', { params: mode ? { mode } : {} }).then(r => r.data),
}
