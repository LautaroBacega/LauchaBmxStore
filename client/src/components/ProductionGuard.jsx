"use client"

import { AlertTriangle, Home, Store } from 'lucide-react'
import { Link } from "react-router-dom"
import { isProduction } from "../utils/envUtils"

export default function ProductionGuard({ children }) {
  if (isProduction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-6">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Función no disponible
          </h1>
          
          <p className="text-gray-600 mb-6">
            Esta función está disponible solo en modo desarrollo. 
            Explorá nuestro catálogo de productos BMX.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/"
              className="flex items-center justify-center gap-2 bg-gray-800 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              <Home size={18} />
              Inicio
            </Link>
            <Link
              to="/"
              className="flex items-center justify-center gap-2 bg-yellow-500 text-black px-4 py-3 rounded-lg hover:bg-yellow-600 transition-colors duration-200"
            >
              <Store size={18} />
              Ver Catálogo
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-yellow-600">LAUCHA BMX STORE</span>
              <br />
              Catálogo online de partes BMX
            </p>
          </div>
        </div>
      </div>
    )
  }

  return children
}
