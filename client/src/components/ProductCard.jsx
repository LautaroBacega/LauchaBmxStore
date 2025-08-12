"use client"

import { Link } from "react-router-dom"
import { MessageCircle } from "lucide-react"
import { scrollToTop } from "../hooks/useScrollToTop"

export default function ProductCard({ product, viewMode = "grid" }) {
  const isProduction = import.meta.env.PROD

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price)
  }

  const handleContactClick = () => {
    const message = `Hola! Me interesa el producto: ${product.name} - ${formatPrice(product.price)}`
    const whatsappUrl = `https://wa.me/5492915092263?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const handleProductClick = () => {
    scrollToTop()
  }

  return (
    <div className="bg-stone-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Image Container */}
      <div className="relative overflow-hidden bg-stone-300">
        <img
          src={product.images[0] || "/placeholder.svg?height=300&width=300&query=vintage clothing"}
          alt={product.name}
          className="w-full aspect-square object-cover hover:scale-105 transition-transform duration-300"
        />
        {product.featured && (
          <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
            DESTACADO
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-6">
        <h3 className="text-stone-800 font-medium mb-2 line-clamp-2">{product.name}</h3>

        <p className="text-stone-600 mb-4">{formatPrice(product.price)}</p>

        <div className="flex items-center justify-between">
          <Link
            to={`/product/${product.id}`}
            className="text-stone-700 hover:text-stone-900 font-medium transition-colors duration-200"
            onClick={handleProductClick}
          >
            Ver más
          </Link>

          <button
            onClick={handleContactClick}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors duration-200 flex items-center gap-2"
          >
            <MessageCircle size={16} />
            Consultar
          </button>
        </div>
      </div>
    </div>
  )
}
