"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useUser } from "../hooks/useUser"
import { Store, Star, Truck, Shield, ArrowRight, Mail, Phone, MapPin } from 'lucide-react'
import ProductCard from "../components/ProductCard"
import { productService } from "../services/productService"
import { isDevelopment, isProduction } from "../utils/envUtils"
import logo from "../../public/LauchaBmxStore-logosinfondo.png"

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
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <img
              src={logo}
              alt="Laucha BMX Store"
              className=" h-60 mx-auto"
            />
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-yellow-500">LAUCHA</span> BMX STORE
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Las mejores partes y accesorios para tu BMX. Calidad profesional para riders que no se conforman con menos.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/store"
                className="bg-yellow-500 text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-400 transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <Store size={24} />
                 Ver Catálogo
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
              
                <a
                  href="#contacto"
                  className="border-2 border-yellow-500 text-yellow-500 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-500 hover:text-black transition-all duration-200"
                >
                  Contactanos
                </a>
              
            </div>
          </div>


          
          
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
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
                Envío Rápido
              </h3>
              <p className="text-gray-600">
                Consultanos por opciones de envío a todo el país. Trabajamos con las mejores empresas de logística.
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

      

      {/* Contact Section - Only in production */}
      
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
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="text-green-600" size={24} />
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
      


    </div>
  )
}
