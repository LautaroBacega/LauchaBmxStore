"use client"

import { useEffect } from "react"
import { useLocation } from "react-router-dom"

// Hook para scroll automático al cambiar de ruta
export const useScrollToTop = () => {
  const location = useLocation()

  useEffect(() => {
    // Scroll suave hacia la parte superior
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    })
  }, [location.pathname, location.search])
}

// Función utilitaria para scroll manual
export const scrollToTop = (behavior = "smooth") => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior,
  })
}
