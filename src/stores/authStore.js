
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref('')
  const user = ref(null)

  // Computed para isAuthenticated basado en la presencia del token
  const isAuthenticated = computed(() => {
    // Verificar tanto el ref como localStorage directamente
    return !!token.value || !!localStorage.getItem('auth')
  })

  // Computed para información del usuario
  const userRole = computed(() => {
    // Intentar obtener el rol del ref primero
    if (user.value?.role) return user.value.role
    
    // Si no está en el ref, intentar desde localStorage
    try {
      const stored = localStorage.getItem('auth')
      if (stored) {
        const parsed = JSON.parse(stored)
        return parsed.user?.role || null
      }
    } catch (e) {
      console.error('Error parsing stored auth:', e)
    }
    
    return null
  })
  
  const userName = computed(() => user.value?.name || '')

  const setAuth = (tokenValue, userData) => {
    token.value = tokenValue
    user.value = userData
    // Forzar actualización inmediata en localStorage
    localStorage.setItem('auth', JSON.stringify({ token: tokenValue, user: userData }))
  }

  const setUser = (userData) => {
    user.value = userData
  }

  const clearAuth = () => {
    token.value = ''
    user.value = null
    localStorage.removeItem('auth')
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