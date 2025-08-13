// Utilidad para detectar el entorno de manera más confiable
export const getEnvironment = () => {
  // Verificar múltiples formas de detectar producción
  const isViteProd = import.meta.env.PROD
  const isNodeProd = import.meta.env.VITE_NODE_ENV === "production"
  const isModeProd = import.meta.env.MODE === "production"

  // También podemos usar una variable personalizada
  const isCustomProd = import.meta.env.VITE_IS_PRODUCTION === "true"

  console.log("🔍 Environment check:", {
    isViteProd,
    isNodeProd,
    isModeProd,
    isCustomProd,
    MODE: import.meta.env.MODE,
    NODE_ENV: import.meta.env.VITE_NODE_ENV,
    IS_PRODUCTION: import.meta.env.VITE_IS_PRODUCTION,
    // Agregar más información de debugging
    href: window.location.href,
    hostname: window.location.hostname,
    port: window.location.port,
  })

  return {
    isDevelopment: !isViteProd && !isNodeProd && !isModeProd && !isCustomProd,
    isProduction: isViteProd || isNodeProd || isModeProd || isCustomProd,
    mode: import.meta.env.MODE || "development",
  }
}

export const { isDevelopment, isProduction } = getEnvironment()

// Log adicional para debugging
console.log("🌍 Environment detected:", { isDevelopment, isProduction })
