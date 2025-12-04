

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref('')
  const user = ref(null)

  // Computed para isAuthenticated basado en la presencia del token
  const isAuthenticated = computed(() => !!token.value)

  // Computed para información del usuario
  const userRole = computed(() => user.value?.role || null)
  const userName = computed(() => user.value?.name || '')

  const setAuth = (tokenValue, userData) => {
    token.value = tokenValue
    user.value = userData
  }

  const setUser = (userData) => {
    user.value = userData
  }

  const clearAuth = () => {
    token.value = ''
    user.value = null
  }

  // Método helper para verificar si el usuario tiene un rol específico
  const hasRole = (role) => userRole.value === role

  return {
    // State
    token,
    user,
    
    // Getters
    isAuthenticated,
    userRole,
    userName,
    
    // Actions
    setAuth,
    setUser,
    clearAuth,
    hasRole
  }
}, {
  persist: true
})