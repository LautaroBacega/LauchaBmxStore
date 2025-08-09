"use client"

import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, MessageCircle  } from 'lucide-react'

export default function Footer() {
  const handleWhatsAppClick = () => {
    const message = "Hola! Me gustaría obtener más información sobre las partes disponbles ."
    const whatsappUrl = `https://wa.me/5492915092263?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <footer className="bg-gray-900 text-white">
      {/* Contact Section */}
      <div className="py-16 bg-gray-800">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Contactar</h2>
            <p className="text-gray-300">
              ¿Tenés alguna consulta sobre los productos? ¡Escribime!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gray-700 rounded-xl hover:bg-gray-600 transition-colors duration-200">
              <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle  className="text-green-600" size={24} />
              </div>
              <h3 className="font-bold text-white mb-2">WhatsApp</h3>
              <button
                onClick={handleWhatsAppClick}
                className="text-gray-300 hover:text-yellow-400 transition-colors duration-200"
              >
                +54 9 291 509-2263
              </button>
            </div>

            <div className="text-center p-6 bg-gray-700 rounded-xl hover:bg-gray-600 ">
              <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Instagram className="text-red-600" size={24} />
              </div>
              <h3 className="font-bold text-white mb-2">Instragram</h3>
              <a className="text-gray-300 hover:text-yellow-400" href="https://www.instagram.com/lauchabmxstore/">@lauchabmxstore</a>
            </div>

            <div className="text-center p-6 bg-gray-700 rounded-xl hover:bg-gray-600 ">
              <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="text-yellow-600" size={24} />
              </div>
              <h3 className="font-bold text-white mb-2">Ubicación</h3>
              <p className="text-gray-300">Bahía Blanca, Buenos Aires, Argentina</p>
            </div>
          </div>
        </div>
      </div>      

      {/* Bottom Bar */}
      <div className="py-6 bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 Laucha BMX Store. Todos los derechos reservados.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="https://bacegalautaro.netlify.app/" className="text-gray-400  transition-colors duration-200">
                Desarrollado por  <span className='font-bold  hover:text-yellow-400'>Lautaro Bacega</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
