
import axios from 'axios';
import { useAuthStore } from '../stores/authStore.js';

// Función optimizada para obtener el token desde localStorage o Pinia
function getCurrentToken() {
  try {
    // Primero intentar obtener del store de Pinia
    const authStore = useAuthStore();
    if (authStore.token) {
      console.log('✓ Token obtenido del store Pinia');
      return authStore.token;
    }

    // Si no está en el store, buscar en localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      
      try {
        const parsed = JSON.parse(value);
        if (parsed && parsed.token && typeof parsed.token === 'string') {
          console.log(`✓ Token obtenido de localStorage (clave: ${key})`);
          return parsed.token;
        }
      } catch (e) {
        continue;
      }
    }

    console.warn('⚠️ No se encontró token en Pinia ni en localStorage');
    return '';
    
  } catch (error) {
    console.error('❌ Error al leer el token:', error);
    return '';
  }
}

export const apiClient = axios.create({
    baseURL: 'https://repfora-ep-backend.onrender.com/api',
    timeout: 120000
});

/**
 * INTERCEPTOR DE REQUEST
 */
apiClient.interceptors.request.use((config) => {
  const token = getCurrentToken();
  if (token) {
    config.headers['x-token'] = token;
    console.log('📤 Enviando request con token');
  } else {
    console.warn('⚠️ Request sin token de autenticación');
  }
  return config;
});

/**
 * INTERCEPTOR DE RESPONSE
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el servidor responde con 401 (Unauthorized)
    if (error.response?.status === 401) {
      console.error('❌ Error 401 - Token inválido o expirado');
      
      try {
        const authStore = useAuthStore();
        authStore.clearAuth();
        console.log('Sesión limpiada. Por favor inicia sesión nuevamente.');
      } catch (e) {
        console.error('Error al limpiar auth store:', e);
        localStorage.clear();
      }
    }
    
    return Promise.reject(error);
  }
);
