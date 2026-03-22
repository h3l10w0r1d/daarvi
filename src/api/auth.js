import { client } from './client'

export const authApi = {
  register: (email, name, password) =>
    client.post('/auth/register', { email, name, password }).then(r => r.data),

  login: (email, password) =>
    client.post('/auth/login', { email, password }).then(r => r.data),

  refresh: (refresh_token) =>
    client.post('/auth/refresh', { refresh_token }).then(r => r.data),

  changePassword: (current_password, new_password) =>
    client.post('/auth/change-password', { current_password, new_password }).then(r => r.data),

  changeEmail: (new_email, password) =>
    client.post('/auth/change-email', { new_email, password }).then(r => r.data),
}
