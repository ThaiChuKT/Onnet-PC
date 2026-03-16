import axios from 'axios'
import type { ApiEnvelope } from '../types/api.ts'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1'
const TOKEN_KEY = 'onnet_token'

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.message
    if (typeof message === 'string' && message.trim().length > 0) {
      return Promise.reject(new Error(message))
    }
    return Promise.reject(error)
  },
)

export function unwrapApi<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.success) {
    throw new Error(envelope.message ?? 'Request failed')
  }
  return envelope.data
}

export const authStorage = {
  key: TOKEN_KEY,
  getToken() {
    return localStorage.getItem(TOKEN_KEY)
  },
  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token)
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY)
  },
}
