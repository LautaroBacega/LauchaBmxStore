"use client"

import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react'
import { Link } from 'react-router-dom'
import { isProduction } from '../utils/envUtils'

export default function Footer() {
  const handleEmailClick = () => {
    window.open('mailto:info@lauchaBMX.com', '_blank')
  }

  const handleWhatsAppClick = () => {
    const message = "Hola! Me gustaría obtener más información sobre sus productos BMX."
    const whatsappUrl = `https://wa.me/5491112345678?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <footer className="bg-gray-900 text-white">
      {/* Contact Section */}
      <div className="py-16 bg-gray-800">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Contactanos</h2>
            <p className="text-gray-300">
              ¿Tenés alguna consulta sobre nuestros productos? ¡Escribinos!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gray-700 rounded-xl hover:bg-gray-600 transition-colors duration-200">
              <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="text-yellow-600" size={24} />
              </div>
              <h3 className="font-bold text-white mb-2">Email</h3>
              <button
                onClick={handleEmailClick}
                className="text-gray-300 hover:text-yellow-400 transition-colors duration-200"
              >
                info@lauchaBMX.com
              </button>
            </div>

            <div className="text-center p-6 bg-gray-700 rounded-xl hover:bg-gray-600 transition-colors duration-200">
              <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="text-yellow-600" size={24} />
              </div>
              <h3 className="font-bold text-white mb-2">WhatsApp</h3>
              <button
                onClick={handleWhatsAppClick}
                className="text-gray-300 hover:text-yellow-400 transition-colors duration-200"
              >
                +54 9 11 1234-5678
              </button>
            </div>

            <div className="text-center p-6 bg-gray-700 rounded-xl">
              <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="text-yellow-600" size={24} />
              </div>
              <h3 className="font-bold text-white mb-2">Ubicación</h3>
              <p className="text-gray-300">Buenos Aires, Argentina</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="py-12 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <img
                  src="/LauchaBmxStore-logosinfondo.png"
                  alt="Laucha BMX Store"
                  className="w-12 h-12 mr-3"
                />
                <div>
                  <h3 className="text-2xl font-bold">
                    <span className="text-yellow-500">LAUCHA</span> BMX
                  </h3>
                  <p className="text-gray-400 text-sm">Store</p>
                </div>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                {isProduction 
                  ? "Catálogo online de las mejores partes y accesorios BMX. Calidad premium para riders exigentes."
                  : "Tu tienda de confianza para partes y accesorios BMX. Calidad premium para riders que no se conforman con menos."
                }
              </p>
              
              {/* Social Media */}
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="bg-gray-800 p-2 rounded-full hover:bg-yellow-500 hover:text-black transition-all duration-200"
                >
                  <Facebook size={20} />
                </a>
                <a
                  href="#"
                  className="bg-gray-800 p-2 rounded-full hover:bg-yellow-500 hover:text-black transition-all duration-200"
                >
                  <Instagram size={20} />
                </a>
                <a
                  href="#"
                  className="bg-gray-800 p-2 rounded-full hover:bg-yellow-500 hover:text-black transition-all duration-200"
                >
                  <Twitter size={20} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Enlaces Rápidos</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-400 hover:text-yellow-400 transition-colors duration-200">
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link to="/?category=frames" className="text-gray-400 hover:text-yellow-400 transition-colors duration-200">
                    Cuadros
                  </Link>
                </li>
                <li>
                  <Link to="/?category=wheels" className="text-gray-400 hover:text-yellow-400 transition-colors duration-200">
                    Ruedas
                  </Link>
                </li>
                <li>
                  <Link to="/?category=accessories" className="text-gray-400 hover:text-yellow-400 transition-colors duration-200">
                    Accesorios
                  </Link>
                </li>
                {!isProduction && (
                  <li>
                    <Link to="/admin" className="text-gray-400 hover:text-yellow-400 transition-colors duration-200">
                      Admin Panel
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Categorías</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/?category=handlebars" className="text-gray-400 hover:text-yellow-400 transition-colors duration-200">
                    Manubrios
                  </Link>
                </li>
                <li>
                  <Link to="/?category=pedals" className="text-gray-400 hover:text-yellow-400 transition-colors duration-200">
                    Pedales
                  </Link>
                </li>
                <li>
                  <Link to="/?category=brakes" className="text-gray-400 hover:text-yellow-400 transition-colors duration-200">
                    Frenos
                  </Link>
                </li>
                <li>
                  <Link to="/?category=chains" className="text-gray-400 hover:text-yellow-400 transition-colors duration-200">
                    Cadenas
                  </Link>
                </li>
                <li>
                  <Link to="/?category=tires" className="text-gray-400 hover:text-yellow-400 transition-colors duration-200">
                    Cubiertas
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="py-6 bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 Laucha BMX Store. Todos los derechos reservados.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors duration-200">
                Términos y Condiciones
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors duration-200">
                Política de Privacidad
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors duration-200">
                Política de Devoluciones
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
