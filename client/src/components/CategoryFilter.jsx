"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { productService } from "../services/productService"

export default function CategoryFilter({ selectedCategory, onCategoryChange }) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(true)

  // Mapeo de categorías para mostrar nombres legibles
  const categoryNames = {
    "complete-bikes": "Bicicletas Completas",
    rims: "Aros",
    seats: "Asientos",
    "bottom-brackets": "Cajas",
    tires: "Cubiertas",
    frames: "Cuadros",
    brakes: "Frenos",
    forks: "Horquillas",
    headsets: "Juegos de Dirección",
    "front-hubs": "Mazas Delanteras",
    "rear-hubs": "Mazas Traseras",
    handlebars: "Manubrios",
    levers: "Palancas",
    pedals: "Pedales",
    posts: "Postes",
    grips: "Puños",
    spokes: "Rayos",
    stems: "Stems",
  }

  // Orden deseado de las categorías
  const categoryOrder = [
    "complete-bikes",
    "rims",
    "seats",
    "bottom-brackets",
    "tires",
    "frames",
    "brakes",
    "forks",
    "headsets",
    "front-hubs",
    "rear-hubs",
    "handlebars",
    "levers",
    "pedals",
    "posts",
    "grips",
    "spokes",
    "stems",
  ]

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const categoryData = await productService.getCategories()

        // Ordenar categorías según el orden deseado
        const orderedCategories = categoryOrder
          .map((categoryKey) => {
            const found = categoryData.find((cat) => cat.category === categoryKey)
            return found ? found : null
          })
          .filter(Boolean) // Remover nulls

        // Agregar categorías que no están en el orden pero existen en los datos
        const remainingCategories = categoryData.filter((cat) => !categoryOrder.includes(cat.category))

        setCategories([...orderedCategories, ...remainingCategories])
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
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded mb-4 w-32"></div>
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
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
            <span className="text-sm text-gray-500">{categories.reduce((total, cat) => total + cat.count, 0)}</span>
          </button>

          {/* Lista de categorías */}
          {categories.map((category) => (
            <button
              key={category.category}
              onClick={() => handleCategoryClick(category.category)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 flex items-center justify-between ${
                selectedCategory === category.category
                  ? "bg-yellow-100 text-yellow-800 font-semibold"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span>{categoryNames[category.category] || category.category}</span>
              <span className="text-sm text-gray-500">{category.count}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
