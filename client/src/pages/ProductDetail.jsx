"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, ShoppingCart, Truck, MessageCircle, X, Copy, CheckCircle, ZoomIn } from "lucide-react"
import { productService } from "../services/productService"
import { isProduction } from "../utils/envUtils"
import { scrollToTop } from "../hooks/useScrollToTop"
import ShippingCalculator from "../components/ShippingCalculator"
import SEOHead from "../components/SEOHead"
import ProductStructuredData from "../components/ProductStructuredData"

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [copiedField, setCopiedField] = useState(null)
  const [showZoomModal, setShowZoomModal] = useState(false)
  const [zoomImageIndex, setZoomImageIndex] = useState(0)

  useEffect(() => {
    fetchProduct()
  }, [id])

  useEffect(() => {
    if (product) {
      fetchRelatedProducts()
    }
  }, [product])

  useEffect(() => {
    if (showPurchaseModal || showZoomModal) {
      const scrollY = window.scrollY
      document.body.style.position = "fixed"
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = "100%"
      document.body.style.overflow = "hidden"
    } else {
      const scrollY = document.body.style.top
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.width = ""
      document.body.style.overflow = ""
      if (scrollY) {
        window.scrollTo(0, Number.parseInt(scrollY || "0") * -1)
      }
    }

    return () => {
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.width = ""
      document.body.style.overflow = ""
    }
  }, [showPurchaseModal, showZoomModal])

  const fetchProduct = async () => {
    try {
      setLoading(true)
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
      const data = await productService.getProductsByCategory(product.category, 4)
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
      "Bicicletas Completas": "Bicicletas Completas",
      Aros: "Aros",
      Asientos: "Asientos",
      Cajas: "Cajas",
      Cubiertas: "Cubiertas",
      Cuadros: "Cuadros",
      Frenos: "Frenos",
      Horquillas: "Horquillas",
      "Juegos de Dirección": "Juegos de Dirección",
      "Mazas Delanteras": "Mazas Delanteras",
      "Mazas Traseras": "Mazas Traseras",
      Manubrios: "Manubrios",
      Palancas: "Palancas",
      Pedales: "Pedales",
      Postes: "Postes",
      Puños: "Puños",
      Rayos: "Rayos",
      Stems: "Stems",
    }
    return categoryMap[category] || category
  }

  const handleWhatsAppContact = () => {
    const message = `Hola! Me interesa el producto: ${product.name} - ${formatPrice(product.price)}.`
    const whatsappUrl = `https://wa.me/5492915092263?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const handleEmailContact = () => {
    const subject = `Consulta sobre: ${product.name}`
    const body = `Hola! Me interesa el producto: ${product.name} - ${formatPrice(product.price)}.`
    const emailUrl = `mailto:info@lauchaBMX.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(emailUrl, "_blank")
  }

  const handleBackToStore = () => {
    scrollToTop()
  }

  const handleBreadcrumbClick = () => {
    scrollToTop()
  }

  const handleCategoryBreadcrumbClick = () => {
    window.location.href = `/?category=${product.category}#main-content`
  }

  const handleRelatedProductClick = () => {
    scrollToTop()
  }

  const copyToClipboard = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(fieldName)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      console.error("Error copying to clipboard:", error)
      const textArea = document.createElement("textarea")
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setCopiedField(fieldName)
      setTimeout(() => setCopiedField(null), 2000)
    }
  }

  const handlePurchaseWhatsApp = () => {
    const message = `Hola! Quiero comprar: ${product.name} - ${formatPrice(product.price)}

He realizado la transferencia. Te envío el comprobante de pago junto con mis datos:

Nombre:
Apellido:
Provincia:
Ciudad:
Dirección:
Código Postal:
Email:
Celular:
DNI:

Por favor, cotizá el envío para proceder con la compra.`

    const whatsappUrl = `https://wa.me/5492915092263?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
    setShowPurchaseModal(false)
  }

  const handleImageZoom = (imageIndex) => {
    setZoomImageIndex(imageIndex)
    setShowZoomModal(true)
  }

  const handleZoomClose = () => {
    setShowZoomModal(false)
  }

  const handleZoomPrevious = () => {
    setZoomImageIndex((prev) => (prev > 0 ? prev - 1 : product.images.length - 1))
  }

  const handleZoomNext = () => {
    setZoomImageIndex((prev) => (prev < product.images.length - 1 ? prev + 1 : 0))
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
            to="/"
            className="bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors duration-200"
            onClick={handleBackToStore}
          >
            Volver a la tienda
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${showPurchaseModal || showZoomModal ? "overflow-hidden" : ""}`}>
      {product && (
        <>
          <SEOHead
            title={`${product.name} - ${product.brand} | Laucha BMX Store`}
            description={`${product.description} - ${formatPrice(product.price)} - Envíos a todo el país con Andreani.`}
            keywords={`${product.name}, ${product.brand}, ${getCategoryName(product.category)}, BMX, repuestos BMX, Argentina`}
            image={product.images && product.images.length > 0 ? product.images[0] : "/no-image-placeholder.png"}
            url={`https://lauchaBMXstore.com/product/${product.id}`}
            type="product"
          />
          <ProductStructuredData product={product} />
        </>
      )}

      <div className={`transition-all duration-300 ${showPurchaseModal || showZoomModal ? "blur-sm" : ""}`}>
        <div className="bg-white border-b pt-20">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Link to="/" className="hover:text-yellow-600" onClick={handleBreadcrumbClick}>
                Inicio
              </Link>
              <span>/</span>
              <button onClick={handleCategoryBreadcrumbClick} className="hover:text-yellow-600 text-left">
                {getCategoryName(product.category)}
              </button>
              <span>/</span>
              <span className="text-gray-800 font-medium">{product.name}</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors duration-200"
            onClick={handleBackToStore}
          >
            <ArrowLeft size={20} />
            Volver a la tienda
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="relative cursor-pointer" onClick={() => handleImageZoom(selectedImage)}>
                  <img
                    src={
                      product.images[selectedImage] ||
                      "/no-image-placeholder.png" ||
                      "/placeholder.svg" ||
                      "/placeholder.svg" ||
                      "/placeholder.svg" ||
                      "/placeholder.svg" ||
                      "/placeholder.svg" ||
                      "/placeholder.svg" ||
                      "/placeholder.svg"
                    }
                    alt={product.name}
                    className="max-w-full h-auto max-h-96 rounded-xl shadow-lg transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      e.target.src = "/no-image-placeholder.png"
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 pointer-events-none">
                    <ZoomIn className="text-white" size={32} />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs pointer-events-none">
                    Toca para ampliar
                  </div>
                </div>
              </div>

              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto justify-center">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all duration-200 ${
                        selectedImage === index ? "ring-2 ring-yellow-500" : "hover:ring-2 hover:ring-gray-300"
                      }`}
                    >
                      <img
                        src={image || "/no-image-placeholder.png"}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "/no-image-placeholder.png"
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

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
                      <div className={`text-sm font-medium ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                        {product.stock > 0 ? `${product.stock} en stock` : "Sin stock"}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={handleWhatsAppContact}
                      className="flex items-center justify-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-all duration-200"
                    >
                      <MessageCircle size={20} />
                      WhatsApp
                    </button>

                    <button
                      onClick={() => setShowPurchaseModal(true)}
                      className="flex items-center justify-center gap-2 bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-all duration-200"
                    >
                      <ShoppingCart size={20} />
                      Comprar
                    </button>
                  </div>
                </div>
              </div>

              <ShippingCalculator product={product} />

              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Especificaciones</h3>
                  <div className="space-y-3">
                    {Object.entries(product.specifications).map(
                      ([key, value]) =>
                        value && (
                          <div key={key} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                            <span className="text-gray-600 capitalize">
                              {key === "size"
                                ? "Medida"
                                : key === "color"
                                  ? "Color"
                                  : key === "material"
                                    ? "Material"
                                    : key === "weight"
                                      ? "Peso"
                                      : key === "compatibility"
                                        ? "Compatibilidad"
                                        : key.replace(/([A-Z])/g, " $1")}
                            </span>
                            <span className="text-gray-800 font-medium">{value}</span>
                          </div>
                        ),
                    )}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  {isProduction ? "Información de contacto" : "Información de envío"}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Truck className="text-yellow-500" size={20} />
                    <span className="text-gray-700">Envíos a todo el país al mejor precio a traves de Andreani.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-gray-800 mb-8">Productos relacionados</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <div key={relatedProduct.id} className="bg-white rounded-xl shadow-lg overflow-hidden group">
                    <Link to={`/product/${relatedProduct.id}`} onClick={handleRelatedProductClick}>
                      <div className="overflow-hidden">
                        <img
                          src={
                            relatedProduct.images[0] ||
                            "/no-image-placeholder.png" ||
                            "/placeholder.svg" ||
                            "/placeholder.svg" ||
                            "/placeholder.svg" ||
                            "/placeholder.svg" ||
                            "/placeholder.svg" ||
                            "/placeholder.svg" ||
                            "/placeholder.svg"
                          }
                          alt={relatedProduct.name}
                          className="w-full h-auto max-h-48 object-contain group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = "/no-image-placeholder.png"
                          }}
                        />
                      </div>
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

      {showZoomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-full max-h-full flex items-center justify-center">
            <button
              onClick={handleZoomClose}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10 bg-black bg-opacity-50 rounded-full p-2"
            >
              <X size={24} />
            </button>

            {product.images.length > 1 && (
              <>
                <button
                  onClick={handleZoomPrevious}
                  className="absolute left-4 text-white hover:text-gray-300 transition-colors z-10 bg-black bg-opacity-50 rounded-full p-2"
                >
                  <ArrowLeft size={24} />
                </button>
                <button
                  onClick={handleZoomNext}
                  className="absolute right-4 text-white hover:text-gray-300 transition-colors z-10 bg-black bg-opacity-50 rounded-full p-2"
                >
                  <ArrowLeft size={24} className="rotate-180" />
                </button>
              </>
            )}

            <img
              src={product.images[zoomImageIndex] || "/no-image-placeholder.png"}
              alt={`${product.name} ampliado`}
              className="max-w-full max-h-full object-contain cursor-zoom-out"
              onClick={handleZoomClose}
              onError={(e) => {
                e.target.src = "/no-image-placeholder.png"
              }}
            />

            {product.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                {zoomImageIndex + 1} / {product.images.length}
              </div>
            )}
          </div>
        </div>
      )}

      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 animate-modal-enter shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Datos de Pago</h2>
                <button
                  onClick={() => setShowPurchaseModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3">Transferencia Bancaria</h3>

                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Nombre:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Lautaro Bacega</span>
                      <button
                        onClick={() => copyToClipboard("Lautaro Bacega", "name")}
                        className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded hover:bg-blue-50"
                      >
                        {copiedField === "name" ? (
                          <CheckCircle size={16} className="text-green-600" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">CVU:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium font-mono text-sm">0000003100025261606583</span>
                      <button
                        onClick={() => copyToClipboard("0000003100025261606583", "cvu")}
                        className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded hover:bg-blue-50"
                      >
                        {copiedField === "cvu" ? (
                          <CheckCircle size={16} className="text-green-600" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Alias:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">lautaro.bacega</span>
                      <button
                        onClick={() => copyToClipboard("lautaro.bacega", "alias")}
                        className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded hover:bg-blue-50"
                      >
                        {copiedField === "alias" ? (
                          <CheckCircle size={16} className="text-green-600" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">CUIT/CUIL:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium font-mono">20434659869</span>
                      <button
                        onClick={() => copyToClipboard("20434659869", "cuit")}
                        className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded hover:bg-blue-50"
                      >
                        {copiedField === "cuit" ? (
                          <CheckCircle size={16} className="text-green-600" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600">Plataforma:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Mercado Pago</span>
                      <button
                        onClick={() => copyToClipboard("Mercado Pago", "platform")}
                        className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded hover:bg-blue-50"
                      >
                        {copiedField === "platform" ? (
                          <CheckCircle size={16} className="text-green-600" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Instrucciones:</h4>
                  <p className="text-yellow-700 text-sm leading-relaxed">
                    Después de realizar la transferencia, enviá el comprobante de pago por WhatsApp junto con los
                    siguientes datos:
                  </p>
                  <ul className="text-yellow-700 text-sm mt-2 space-y-1">
                    <li>• Nombre</li>
                    <li>• Apellido</li>
                    <li>• Provincia</li>
                    <li>• Ciudad</li>
                    <li>• Dirección</li>
                    <li>• Código Postal</li>
                    <li>• Email</li>
                    <li>• Celular</li>
                    <li>• DNI</li>
                  </ul>
                  <p className="text-yellow-700 text-sm mt-2 font-medium">
                    Te cotizaremos el envío para completar tu compra.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handlePurchaseWhatsApp}
                  className="flex items-center justify-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-all duration-200 transform hover:scale-[1.02]"
                >
                  <MessageCircle size={20} />
                  Enviar por WhatsApp
                </button>

                <button
                  onClick={() => setShowPurchaseModal(false)}
                  className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
