import axios from 'axios'

const runtimeConfig = globalThis as typeof globalThis & {
  __AI_SHALA_API_URL__?: string
}

const API_URL = runtimeConfig.__AI_SHALA_API_URL__ || '/api'

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ai_shala_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ai_shala_token')
      localStorage.removeItem('ai_shala_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

// Typed helpers
export const authApi = {
  register: (data: { email: string; password: string; name: string; phone?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  updateProfile: (data: Partial<{ name: string; phone: string; avatar_url: string }>) =>
    api.patch('/auth/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', data),
}

export const chatApi = {
  getConversations: () => api.get('/chat/conversations'),
  createConversation: (data: { title?: string; model?: string; system_prompt?: string }) =>
    api.post('/chat/conversations', data),
  updateConversation: (id: string, data: Partial<{ title: string; model: string; pinned: boolean }>) =>
    api.patch(`/chat/conversations/${id}`, data),
  deleteConversation: (id: string) => api.delete(`/chat/conversations/${id}`),
  getMessages: (id: string) => api.get(`/chat/conversations/${id}/messages`),
  sendMessage: (id: string, data: { content: string; model?: string }) =>
    api.post(`/chat/conversations/${id}/messages`, data),
}

export const imageApi = {
  generate: (data: { prompt: string; style?: string; width?: number; height?: number; seed?: number }) =>
    api.post('/image/generate', data),
  getHistory: () => api.get('/image/history'),
  getStyles: () => api.get('/image/styles'),
}

export const toolsApi = {
  getTools: () => api.get('/tools'),
  runTool: (toolId: string, data: { input: string; options?: Record<string, unknown>; model?: string }) =>
    api.post(`/tools/${toolId}/run`, data),
  getHistory: () => api.get('/tools/history'),
}

export const modelsApi = {
  getAll: (params?: { free?: boolean; category?: string }) =>
    api.get('/models', { params }),
}

export const subscriptionApi = {
  getPlans: () => api.get('/subscriptions/plans'),
  getPaymentMethods: () => api.get('/subscriptions/payment-methods'),
  submitPayment: (data: {
    plan_id: string
    payment_method: string
    transaction_id: string
    amount: number
    sender_number?: string
  }) => api.post('/subscriptions/payment-request', data),
  getMyPayments: () => api.get('/subscriptions/my-payments'),
}

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getPayments: (params?: { status?: string; page?: number }) =>
    api.get('/admin/payments', { params }),
  approvePayment: (id: string, note?: string) =>
    api.post(`/admin/payments/${id}/approve`, { note }),
  rejectPayment: (id: string, reason?: string) =>
    api.post(`/admin/payments/${id}/reject`, { reason }),
  getUsers: (params?: { search?: string; subscription?: string; page?: number }) =>
    api.get('/admin/users', { params }),
  updateUserSubscription: (id: string, data: { subscription: string; days?: number }) =>
    api.patch(`/admin/users/${id}/subscription`, data),
  getAnalytics: (days?: number) =>
    api.get('/admin/analytics', { params: { days } }),
}
