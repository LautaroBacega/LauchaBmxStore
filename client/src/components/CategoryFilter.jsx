"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { productService } from "../services/productService"

export default function CategoryFilter({ selectedCategory, onCategoryChange }) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)

  // Mapeo de categorías para mostrar nombres legibles - CORREGIDO para coincidir con el JSON
  const categoryNames = {
    "Bicicletas Completas": "Bicicletas Completas",
    Aros: "Aros",
    Asientos: "Asientos",
    Cajas: "Cajas",
    Cuadros: "Cuadros",
    Cubiertas: "Cubiertas",
    Frenos: "Frenos",
    Horquillas: "Horquillas",
    "Juegos de Dirección": "Juegos de Dirección",
    "Mazas Delanteras": "Mazas Delanteras",
    "Mazas Traseras": "Mazas Traseras",
    Manubrios: "Manubrios",
    Palancas: "Palancas",
    Pedales: "Pedales",
    Platos: "Platos",
    Postes: "Postes",
    Puños: "Puños",
    Rayos: "Rayos",
    Stems: "Stems",
  }

  // Orden deseado de las categorías - CORREGIDO
  const categoryOrder = [
    "Bicicletas Completas",
    "Aros",
    "Asientos",
    "Cajas",
    "Cubiertas",
    "Cuadros",
    "Frenos",
    "Horquillas",
    "Juegos de Dirección",
    "Mazas Delanteras",
    "Mazas Traseras",
    "Manubrios",
    "Palancas",
    "Pedales",
    "Platos",
    "Postes",
    "Puños",
    "Rayos",
    "Stems",
  ]

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const categoryData = await productService.getCategories()

        // Filtrar solo categorías que tienen productos (count > 0)
        const availableCategories = categoryData.filter((cat) => cat.count > 0)

        // Ordenar categorías según el orden deseado
        const orderedCategories = categoryOrder
          .map((categoryKey) => {
            const found = availableCategories.find((cat) => cat.id === categoryKey)
            return found ? found : null
          })
          .filter(Boolean) // Remover nulls

        // Agregar categorías que no están en el orden pero existen en los datos
        const remainingCategories = availableCategories.filter((cat) => !categoryOrder.includes(cat.id))

        const finalCategories = [...orderedCategories, ...remainingCategories]

        setCategories(finalCategories)
      } catch (error) {
        console.error("Error fetching categories:", error)
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const handleCategoryClick = (category) => {
    onCategoryChange(category === selectedCategory ? "" : category)
    setIsExpanded(false)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded mb-4 w-32"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 bg-gray-300 rounded w-24"></div>
                <div className="h-4 bg-gray-300 rounded w-6"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const totalProducts = categories.reduce((total, cat) => total + cat.count, 0)

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="text-lg font-bold text-gray-800">Categorías</h3>
          <div className="lg:hidden">{isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div>
        </button>

        <div className={`mt-4 space-y-2 ${isExpanded ? "block" : "hidden lg:block"}`}>
          {/* Opción "Todas las categorías" */}
          <button
            onClick={() => handleCategoryClick("")}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 flex items-center justify-between ${
              !selectedCategory ? "bg-yellow-100 text-yellow-800 font-semibold" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span>Todas las categorías</span>
            <span className="text-sm text-gray-500">{totalProducts}</span>
          </button>

          {/* Lista de categorías disponibles */}
          {categories.length > 0 ? (
            categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 flex items-center justify-between ${
                  selectedCategory === category.id
                    ? "bg-yellow-100 text-yellow-800 font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span>{categoryNames[category.id] || category.name || category.id}</span>
                <span className="text-sm text-gray-500">{category.count}</span>
              </button>
            ))
          ) : (
            <div className="text-center text-gray-500 py-4">
              <p className="text-sm">No hay productos disponibles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
