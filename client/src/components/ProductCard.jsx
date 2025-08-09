"use client"

import { Link } from "react-router-dom"
import { ShoppingCart, Eye, MessageCircle } from "lucide-react"
import { scrollToTop } from "../hooks/useScrollToTop"

export default function ProductCard({ product, viewMode = "grid" }) {
  const isProduction = import.meta.env.PROD

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price)
  }

  const getCategoryName = (category) => {
    const categoryMap = {
      frames: "Cuadros",
      wheels: "Ruedas",
      handlebars: "Manubrios",
      pedals: "Pedales",
      chains: "Cadenas",
      brakes: "Frenos",
      seats: "Asientos",
      grips: "Puños",
      pegs: "Pegs",
      sprockets: "Platos",
      tires: "Cubiertas",
      accessories: "Accesorios",
    }
    return categoryMap[category] || category
  }

  const handleContactClick = () => {
    const message = `Hola! Me interesa el producto: ${product.name} - ${formatPrice(product.price)}`
    const whatsappUrl = `https://wa.me/5492915092263?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const handleProductClick = () => {
    scrollToTop()
  }

  if (viewMode === "list") {
    return (
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
        <div className="flex">
          {/* Image */}
          <div className="w-48 h-32 flex-shrink-0 relative overflow-hidden bg-gray-50">
            <img
              src={product.images[0] || "/placeholder.svg?height=128&width=192&query=bmx part"}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {product.featured && (
              <div className="absolute top-2 left-2 bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold">
                DESTACADO
              </div>
            )}
            {product.stock === 0 && (
              <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                SIN STOCK
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-4 flex justify-between">
            <div className="flex-1">
              <div className="mb-2">
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  {getCategoryName(product.category)}
                </span>
                <span className="text-xs text-gray-400 ml-2">• {product.brand}</span>
              </div>

              <h3 className="font-bold text-gray-800 mb-2 group-hover:text-yellow-600 transition-colors duration-200">
                {product.name}
              </h3>

              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

              <div className="flex items-center gap-4">
                <span className="text-xl font-bold text-gray-800">{formatPrice(product.price)}</span>
                {!isProduction && (
                  <span className="text-xs text-gray-500">
                    Stock: {product.stock > 0 ? product.stock : "Sin stock"}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 ml-4">
              <Link
                to={`/product/${product.id}`}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-yellow-500 hover:text-black transition-all duration-200 text-sm font-medium text-center"
                onClick={handleProductClick}
              >
                Ver Detalles
              </Link>

              {isProduction ? (
                <button
                  onClick={handleContactClick}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-1"
                >
                  <MessageCircle size={14} />
                  Consultar
                </button>
              ) : (
                <button
                  className="bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-600 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-1"
                  disabled={product.stock === 0}
                >
                  <ShoppingCart size={14} />
                  {product.stock === 0 ? "Sin stock" : "Agregar"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Grid view (default)
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* Image Container */}
      <div className="relative overflow-hidden bg-gray-50">
        <img
          src={product.images[0] || "/placeholder.svg?height=250&width=300&query=bmx part"}
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.featured && (
          <div className="absolute top-3 left-3 bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold">
            DESTACADO
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            SIN STOCK
          </div>
        )}

        {/* Overlay with actions */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
            <Link
              to={`/product/${product.id}`}
              className="bg-white text-gray-800 p-2 rounded-full hover:bg-yellow-500 hover:text-black transition-colors duration-200"
              onClick={handleProductClick}
            >
              <Eye size={20} />
            </Link>

            {isProduction ? (
              <button
                onClick={handleContactClick}
                className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors duration-200"
                title="Consultar por WhatsApp"
              >
                <MessageCircle size={20} />
              </button>
            ) : (
              <button
                className="bg-yellow-500 text-black p-2 rounded-full hover:bg-yellow-600 transition-colors duration-200"
                disabled={product.stock === 0}
              >
                <ShoppingCart size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="mb-2">
          <span className="text-xs text-gray-500 uppercase tracking-wide">{getCategoryName(product.category)}</span>
          <span className="text-xs text-gray-400 ml-2">• {product.brand}</span>
        </div>

        <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-yellow-600 transition-colors duration-200">
          {product.name}
        </h3>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-gray-800">{formatPrice(product.price)}</span>
            {!isProduction && (
              <span className="text-xs text-gray-500">Stock: {product.stock > 0 ? product.stock : "Sin stock"}</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Link
              to={`/product/${product.id}`}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-yellow-500 hover:text-black transition-all duration-200 text-sm font-medium text-center"
              onClick={handleProductClick}
            >
              Ver Detalles
            </Link>

            {isProduction && (
              <button
                onClick={handleContactClick}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-1"
              >
                <MessageCircle size={14} />
                Consultar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
