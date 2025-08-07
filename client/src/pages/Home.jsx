"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useUser } from "../hooks/useUser"
import { Store, Star, Truck, Shield, ArrowRight, Mail, Phone, MapPin } from 'lucide-react'
import ProductCard from "../components/ProductCard"
import { productService } from "../services/productService"
import { isDevelopment, isProduction } from "../utils/envUtils"

export default function Home() {
  const { currentUser } = useUser()
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      // productService ahora maneja si es producción o desarrollo
      const data = await productService.getFeaturedProducts(4)
      setFeaturedProducts(data)
    } catch (error) {
      console.error("Error fetching featured products:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <img
              src="/images/logo-bmx.png"
              alt="Laucha BMX Store"
              className="w-40 h-40 mx-auto mb-8"
            />
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-yellow-500">LAUCHA</span> BMX STORE
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              {isProduction 
                ? "Catálogo online de las mejores partes y accesorios BMX. Descubrí nuestra selección de productos premium."
                : "Las mejores partes y accesorios para tu BMX. Calidad profesional para riders que no se conforman con menos."
              }
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/store"
                className="bg-yellow-500 text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-400 transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <Store size={24} />
                {isProduction ? "Ver Catálogo" : "Explorar Tienda"}
              </Link>
              
              {/* Only show signup in development */}
              {isDevelopment && !currentUser && (
                <Link
                  to="/sign-up"
                  className="border-2 border-yellow-500 text-yellow-500 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-500 hover:text-black transition-all duration-200"
                >
                  Crear Cuenta
                </Link>
              )}

              {/* Contact button for production */}
              {isProduction && (
                <a
                  href="#contacto"
                  className="border-2 border-yellow-500 text-yellow-500 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-500 hover:text-black transition-all duration-200"
                >
                  Contactanos
                </a>
              )}
            </div>
          </div>

          {/* User info - only in development */}
          {isDevelopment && currentUser && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-md mx-auto border border-white/20">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={currentUser.profilePicture || "/placeholder.svg?height=48&width=48"}
                  alt="Profile"
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-yellow-500"
                />
                <div className="text-left">
                  <h3 className="font-semibold text-white">¡Hola, {currentUser.username}!</h3>
                  <p className="text-sm text-gray-300">{currentUser.email}</p>
                </div>
              </div>
              <Link
                to="/profile"
                className="w-full bg-yellow-500 text-black py-2 px-4 rounded-lg font-medium hover:bg-yellow-400 transition-all duration-200 inline-block text-center"
              >
                Ver Perfil
              </Link>
            </div>
          )}

          {/* Production mode banner */}
          {isProduction && (
            <div className="bg-yellow-500/10 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto border border-yellow-500/20">
              <div className="text-center">
                <h3 className="font-bold text-yellow-400 text-lg mb-2">🏪 Catálogo Online</h3>
                <p className="text-gray-300 text-sm">
                  Explorá nuestra selección de productos BMX. Para consultas y pedidos, contactanos directamente.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">¿Por qué elegir Laucha BMX?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Somos riders como vos. Sabemos lo que necesitas para llevar tu BMX al siguiente nivel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="text-yellow-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Calidad Premium</h3>
              <p className="text-gray-600">
                Solo trabajamos con las mejores marcas y productos de máxima calidad para riders exigentes.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {isProduction ? "Consulta Envíos" : "Envío Rápido"}
              </h3>
              <p className="text-gray-600">
                {isProduction 
                  ? "Consultanos por opciones de envío a todo el país. Trabajamos con las mejores empresas de logística."
                  : "Envío gratis en compras mayores a $50.000. Recibí tus partes en tiempo récord."
                }
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Garantía Total</h3>
              <p className="text-gray-600">
                6 meses de garantía en todos nuestros productos. Tu inversión está protegida.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Productos Destacados</h2>
              <p className="text-gray-600">Las partes más populares entre nuestros riders</p>
            </div>
            <Link
              to="/store"
              className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-yellow-500 hover:text-black transition-all duration-200 flex items-center gap-2 font-medium"
            >
              Ver Todo
              <ArrowRight size={18} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg p-4 animate-pulse">
                  <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                  <div className="space-y-2">
                    <div className="bg-gray-300 h-4 rounded w-3/4"></div>
                    <div className="bg-gray-300 h-4 rounded w-1/2"></div>
                    <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No hay productos destacados disponibles.</p>
              <Link
                to="/store"
                className="bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors duration-200"
              >
                Ver Todos los Productos
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Contact Section - Only in production */}
      {isProduction && (
        <div id="contacto" className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Contactanos</h2>
              <p className="text-gray-600">
                ¿Tenés alguna consulta sobre nuestros productos? ¡Escribinos!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="text-yellow-600" size={24} />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Email</h3>
                <p className="text-gray-600">info@lauchaBMX.com</p>
              </div>

              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="text-yellow-600" size={24} />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">WhatsApp</h3>
                <p className="text-gray-600">+54 9 11 1234-5678</p>
              </div>

              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="text-yellow-600" size={24} />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Ubicación</h3>
                <p className="text-gray-600">Buenos Aires, Argentina</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-gray-800 to-black text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {isProduction 
              ? "¿Te interesa algún producto?"
              : "¿Listo para mejorar tu setup?"
            }
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            {isProduction
              ? "Explorá nuestro catálogo completo y contactanos para consultas y pedidos."
              : "Descubrí nuestra colección completa de partes BMX y llevá tu riding al próximo nivel."
            }
          </p>
          <Link
            to="/store"
            className="bg-yellow-500 text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-400 transition-all duration-200 transform hover:scale-105 inline-flex items-center gap-2"
          >
            <Store size={24} />
            {isProduction ? "Ver Catálogo Completo" : "Explorar Catálogo Completo"}
          </Link>
        </div>
      </div>
    </div>
  )
}
