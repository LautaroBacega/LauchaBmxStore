// Configuración de API para diferentes entornos
const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:3000',
  },
  production: {
    baseURL: 'https://tu-backend-en-render.onrender.com', // 🔥 CAMBIA ESTO POR TU URL DE BACKEND
  }
}

const environment = import.meta.env.MODE || 'development'
export const API_BASE_URL = API_CONFIG[environment].baseURL

// Helper para construir URLs de API
export const buildApiUrl = (endpoint) => {
  // En desarrollo, usar proxy de Vite
  if (environment === 'development') {
    return endpoint
  }
  // En producción, usar URL completa
  return `${API_BASE_URL}${endpoint}`
}
