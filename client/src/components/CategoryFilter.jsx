"use client"

import { useState, useEffect } from "react"
import { Filter } from 'lucide-react'

export default function CategoryFilter({ selectedCategory, onCategoryChange, selectedBrand, onBrandChange }) {
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    fetchCategories()
    fetchBrands()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/products/categories")
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchBrands = async () => {
    try {
      const response = await fetch("/api/products")
      const data = await response.json()
      const uniqueBrands = [...new Set(data.products.map((product) => product.brand))].sort()
      setBrands(uniqueBrands)
    } catch (error) {
      console.error("Error fetching brands:", error)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Filter size={20} />
          Filtros
        </h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden bg-gray-100 p-2 rounded-lg"
        >
          <Filter size={16} />
        </button>
      </div>

      <div className={`space-y-6 ${isOpen ? "block" : "hidden md:block"}`}>
        {/* Categories */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-3">Categorías</h4>
          <div className="space-y-2">
            <button
              onClick={() => onCategoryChange("")}
              className={`block w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 ${
                selectedCategory === ""
                  ? "bg-yellow-500 text-black font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Todas las categorías
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`block w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 ${
                  selectedCategory === category.id
                    ? "bg-yellow-500 text-black font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Brands */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-3">Marcas</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            <button
              onClick={() => onBrandChange("")}
              className={`block w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 ${
                selectedBrand === ""
                  ? "bg-yellow-500 text-black font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Todas las marcas
            </button>
            {brands.map((brand) => (
              <button
                key={brand}
                onClick={() => onBrandChange(brand)}
                className={`block w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 ${
                  selectedBrand === brand
                    ? "bg-yellow-500 text-black font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>

        {/* Clear Filters */}
        {(selectedCategory || selectedBrand) && (
          <button
            onClick={() => {
              onCategoryChange("")
              onBrandChange("")
            }}
            className="w-full bg-gray-800 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors duration-200"
          >
            Limpiar Filtros
          </button>
        )}
      </div>
    </div>
  )
}
