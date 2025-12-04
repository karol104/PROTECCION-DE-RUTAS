
import axios from 'axios';

// Función optimizada para obtener el token desde localStorage
function getCurrentToken() {
  try {
    // Buscar en todas las claves posibles del localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      
      try {
        const parsed = JSON.parse(value);
        // Si encontramos un objeto que tenga token, usarlo
        if (parsed && parsed.token && typeof parsed.token === 'string') {
          return parsed.token;
        }
      } catch (e) {
        // Ignorar errores de parsing
        continue;
      }
    }
    
    return '';
    
  } catch (error) {
    console.error('Error al leer el token desde localStorage:', error);
    return '';
  }
}

export const apiClient = axios.create({
    baseURL: 'https://backend-dekn.onrender.com/api',
    timeout: 120000 // 2 minutos por defecto
});

/**
 * INTERCEPTOR DE REQUEST - Se ejecuta ANTES de cada petición HTTP
 * Propósito: Agregar automáticamente el token de autenticación a todas las requests
 * 
 * ¿Por qué es necesario?
 * - Evita tener que pasar el token manualmente en cada llamada API
 * - Garantiza que siempre se envíe el token más actualizado
 * - Centraliza la lógica de autenticación en un solo lugar
 * 
 * Uso automático: Se ejecuta en TODAS las llamadas (getData, postData, putData, deleteData)
 */
apiClient.interceptors.request.use((config) => {
  const token = getCurrentToken();
  if (token) {
    config.headers['x-token'] = token; // Agrega el header de autenticación
  }
  return config;
});

/**
 * INTERCEPTOR DE RESPONSE - Se ejecuta DESPUÉS de recibir respuesta del servidor
 * Propósito: Manejar errores de autenticación de forma global
 * 
 * ¿Por qué es necesario?
 * - Detecta cuando el token ha expirado (error 401)
 * - Limpia automáticamente la sesión del usuario
 * - Redirige al login sin necesidad de código en cada componente
 * - Evita que el usuario quede en estado inconsistente
 * 
 * Uso automático: Se ejecuta en TODAS las respuestas de API
 */
// apiClient.interceptors.response.use(
//   (response) => response, // Si la respuesta es exitosa, la devuelve tal como está
//   (error) => {
//     // Si el servidor responde con 401 (Unauthorized/Token expirado)
//     if (error.response?.status === 401) {
//       localStorage.removeItem('auth'); // Limpia la sesión del navegador
//       window.location.href = '/login';  // Redirige automáticamente al login
//     }
//     return Promise.reject(error); // Propaga el error para manejo específico si es necesario
//   }
// );