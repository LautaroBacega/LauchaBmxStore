"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X } from "lucide-react"
import { productService } from "../services/productService"
import { Link } from "react-router-dom"

export default function SearchBar({ className = "" }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const searchRef = useRef(null)
  const debounceRef = useRef(null)

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Buscar productos con debounce
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (searchTerm.trim().length >= 2) {
      debounceRef.current = setTimeout(async () => {
        try {
          setLoading(true)
          const data = await productService.getProducts({
            search: searchTerm,
            limit: 5,
          })
          setSuggestions(data.products)
          setShowSuggestions(true)
        } catch (error) {
          console.error("Error searching products:", error)
          setSuggestions([])
        } finally {
          setLoading(false)
        }
      }, 300)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [searchTerm])

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price)
  }

  const handleClear = () => {
    setSearchTerm("")
    setSuggestions([])
    setShowSuggestions(false)
  }

  const handleSuggestionClick = () => {
    setShowSuggestions(false)
    setSearchTerm("")
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Sugerencias */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="inline-block w-4 h-4 border-2 border-gray-300 border-t-yellow-500 rounded-full animate-spin mr-2"></div>
              Buscando...
            </div>
          ) : suggestions.length > 0 ? (
            <>
              {suggestions.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  onClick={handleSuggestionClick}
                  className="flex items-center p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <img
                    src={product.images[0] || "/placeholder.svg?height=40&width=40&query=bmx part"}
                    alt={product.name}
                    className="w-10 h-10 rounded-lg object-cover mr-3"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{product.name}</h4>
                    <p className="text-xs text-gray-500 truncate">{product.brand}</p>
                  </div>
                  <div className="text-sm font-semibold text-yellow-600 ml-2">{formatPrice(product.price)}</div>
                </Link>
              ))}
              {suggestions.length === 5 && (
                <div className="p-3 text-center text-sm text-gray-500 bg-gray-50">
                  Mostrando los primeros 5 resultados. Refina tu búsqueda para ver más.
                </div>
              )}
            </>
          ) : searchTerm.trim().length >= 2 ? (
            <div className="p-4 text-center text-gray-500">No se encontraron productos para "{searchTerm}"</div>
          ) : null}
        </div>
      )}
    </div>
  )
}
