import { defineStore } from 'pinia'
import http from '@/api/http'

type User = { id?: number; email?: string }
type LoginPayload = { email: string; password: string }

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    user: JSON.parse(localStorage.getItem('user') || 'null') as User | null
  }),
  getters: {
    isAuthed: (s) => !!s.token
  },
  actions: {
    async login(payload: LoginPayload) {
      // 用 reqres 的演示登录接口来演示：成功返回 { token: '...' }
      // 文档：https://reqres.in/ -> /api/login
      const { data } = await http.post<{ token: string }>('/login', payload)
      this.token = data.token
      // 这里我们顺便保存一下邮箱当“用户”
      this.user = { email: payload.email }
      localStorage.setItem('token', this.token)
      localStorage.setItem('user', JSON.stringify(this.user))
    },
    logout() {
      this.token = ''
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }
})
