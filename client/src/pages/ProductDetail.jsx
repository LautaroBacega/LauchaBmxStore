"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, MessageCircle, Phone } from 'lucide-react'
import { productService } from "../services/productService"
import { isProduction } from "../utils/envUtils" // Importar isProduction

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [relatedProducts, setRelatedProducts] = useState([])

  useEffect(() => {
    fetchProduct()
  }, [id])

  useEffect(() => {
    if (product) {
      fetchRelatedProducts()
    }
  }, [product])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      // productService ahora maneja si es producción o desarrollo
      const data = await productService.getProduct(id)
      setProduct(data)
    } catch (error) {
      console.error("Error fetching product:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedProducts = async () => {
    try {
      // productService ahora maneja si es producción o desarrollo
      const data = await productService.getProductsByCategory(product.category, 4)
      // Filter out current product
      setRelatedProducts(data.filter((p) => p.id !== product.id))
    } catch (error) {
      console.error("Error fetching related products:", error)
    }
  }

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

  const handleWhatsAppContact = () => {
    const message = `Hola! Me interesa el producto: ${product.name} - ${formatPrice(product.price)}. ¿Podrías darme más información?`
    const whatsappUrl = `https://wa.me/5491112345678?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleEmailContact = () => {
    const subject = `Consulta sobre: ${product.name}`
    const body = `Hola! Me interesa el producto: ${product.name} - ${formatPrice(product.price)}. ¿Podrían darme más información sobre disponibilidad y formas de pago?`
    const emailUrl = `mailto:info@lauchaBMX.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(emailUrl, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando producto...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Producto no encontrado</h2>
          <p className="text-gray-600 mb-6">El producto que buscas no existe o ha sido eliminado.</p>
          <Link
            to="/store"
            className="bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors duration-200"
          >
            Volver a la tienda
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-yellow-600">
              Inicio
            </Link>
            <span>/</span>
            <Link to="/store" className="hover:text-yellow-600">
              {isProduction ? "Catálogo" : "Tienda"}
            </Link>
            <span>/</span>
            <Link to={`/store?category=${product.category}`} className="hover:text-yellow-600">
              {getCategoryName(product.category)}
            </Link>
            <span>/</span>
            <span className="text-gray-800 font-medium">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          to="/store"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors duration-200"
        >
          <ArrowLeft size={20} />
          Volver al {isProduction ? "catálogo" : "tienda"}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <img
                src={
                  product.images[selectedImage] ||
                  "/placeholder.svg?height=500&width=500&query=bmx part"
                 || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            </div>

            {/* Image Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      selectedImage === index ? "border-yellow-500" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img src={image || "/placeholder.svg"} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-500 uppercase tracking-wide">
                  {getCategoryName(product.category)}
                </span>
                <span className="text-sm text-gray-400">•</span>
                <span className="text-sm text-gray-500">{product.brand}</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>
              <p className="text-gray-600 text-lg leading-relaxed">{product.description}</p>
            </div>

            {/* Price and Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-3xl font-bold text-gray-800">{formatPrice(product.price)}</span>
                  {product.featured && (
                    <span className="ml-3 bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold">
                      DESTACADO
                    </span>
                  )}
                </div>
                {!isProduction && (
                  <div className="text-right">
                    <div
                      className={`text-sm font-medium ${
                        product.stock > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {product.stock > 0 ? `${product.stock} en stock` : "Sin stock"}
                    </div>
                  </div>
                )}
              </div>

              {isProduction ? (
                /* Production Mode - Contact Buttons */
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-yellow-800 text-sm font-medium">
                      💬 Para consultas sobre disponibilidad, precios y formas de pago, contactanos directamente:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={handleWhatsAppContact}
                      className="flex items-center justify-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-all duration-200"
                    >
                      <MessageCircle size={20} />
                      WhatsApp
                    </button>
                    <button
                      onClick={handleEmailContact}
                      className="flex items-center justify-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-all duration-200"
                    >
                      <Phone size={20} />
                      Email
                    </button>
                  </div>

                  <div className="text-center pt-4 border-t border-gray-200">
                    <p className="text-gray-600 text-sm">
                      📞 También podés llamarnos: <span className="font-semibold">+54 9 11 1234-5678</span>
                    </p>
                  </div>
                </div>
              ) : (
                /* Development Mode - Shopping Cart */
                <>
                  <div className="flex gap-4 mb-6">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-2 text-gray-600 hover:text-gray-800"
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="px-3 py-2 text-gray-600 hover:text-gray-800"
                        disabled={quantity >= product.stock}
                      >
                        +
                      </button>
                    </div>

                    <button
                      disabled={product.stock === 0}
                      className="flex-1 bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={20} />
                      {product.stock === 0 ? "Sin stock" : "Agregar al carrito"}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Especificaciones</h3>
                <div className="space-y-3">
                  {Object.entries(product.specifications).map(
                    ([key, value]) =>
                      value && (
                        <div key={key} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                          <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                          <span className="text-gray-800 font-medium">{value}</span>
                        </div>
                      ),
                  )}
                </div>
              </div>
            )}

            {/* Shipping/Contact Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                {isProduction ? "Información de contacto" : "Información de envío"}
              </h3>
              <div className="space-y-3">
                {isProduction ? (
                  <>
                    <div className="flex items-center gap-3">
                      <MessageCircle className="text-green-500" size={20} />
                      <span className="text-gray-700">Consultá disponibilidad por WhatsApp</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="text-blue-500" size={20} />
                      <span className="text-gray-700">Atención personalizada por teléfono</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="text-green-500" size={20} />
                      <span className="text-gray-700">Garantía de 6 meses en todos los productos</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <Truck className="text-yellow-500" size={20} />
                      <span className="text-gray-700">Envío gratis en compras mayores a $50.000</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="text-green-500" size={20} />
                      <span className="text-gray-700">Garantía de 6 meses</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <RotateCcw className="text-blue-500" size={20} />
                      <span className="text-gray-700">Devoluciones hasta 30 días</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">Productos relacionados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct.id} className="bg-white rounded-xl shadow-lg overflow-hidden group">
                  <Link to={`/products/${relatedProduct.id}`}>
                    <img
                      src={
                        relatedProduct.images[0] ||
                        "/placeholder.svg?height=200&width=250&query=bmx part"
                       || "/placeholder.svg"}
                      alt={relatedProduct.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-yellow-600 transition-colors duration-200">
                        {relatedProduct.name}
                      </h3>
                      <p className="text-lg font-bold text-gray-800">{formatPrice(relatedProduct.price)}</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
