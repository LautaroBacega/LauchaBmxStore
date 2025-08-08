"use client"

import { Link } from "react-router-dom"
import { useUser } from "../hooks/useUser"
import { User, Home, Store, Settings } from 'lucide-react'
import { isDevelopment, isProduction } from "../utils/envUtils"
import logo from "../../public/LauchaBmxStore-logosinfondo.png"

export default function Header() {
  const { currentUser } = useUser()

  return (
    <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-black shadow-lg border-b border-gray-700">
      <div className="flex justify-between items-center max-w-7xl mx-auto p-4">
        <Link to="/" className="group flex items-center gap-3">
          <img
            src={logo}
            alt="Laucha BMX Store"
            className="w-10 h-10 group-hover:scale-110 transition-transform duration-200"
          />
          <div>
            <h1 className="font-bold text-xl bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent group-hover:from-yellow-300 group-hover:to-yellow-400 transition-all duration-300">
              LAUCHA BMX
            </h1>
            <p className="text-xs text-gray-400 -mt-1">STORE</p>
          </div>
        </Link>

        <nav>
          <ul className="flex gap-6 items-center">
            <Link
              to="/"
              className="group flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-200"
            >
              <Home size={18} className="group-hover:scale-110 transition-transform duration-200" />
              <span className="hidden sm:block font-medium">Inicio</span>
            </Link>

            {/* Admin Panel - Only in development */}
            {isDevelopment && currentUser && (
              <Link
                to="/admin"
                className="group flex items-center gap-2 text-gray-300 hover:text-red-400 transition-colors duration-200"
              >
                <Settings size={18} className="group-hover:scale-110 transition-transform duration-200" />
                <span className="hidden sm:block font-medium">Admin</span>
              </Link>
            )}

            {/* Authentication - Only show in development OR if user is already logged in */}
            {(isDevelopment || currentUser) && (
              <Link to="/profile" className="group flex items-center gap-2">
                {currentUser ? (
                  <div className="flex items-center gap-2">
                    <img
                      src={currentUser.profilePicture || "/placeholder.svg"}
                      alt="profile"
                      className="h-8 w-8 rounded-full object-cover ring-2 ring-yellow-500 group-hover:ring-yellow-400 transition-all duration-200"
                    />
                    <span className="hidden sm:block text-gray-300 group-hover:text-white font-medium transition-colors duration-200">
                      Perfil
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-200">
                    <User size={18} className="group-hover:scale-110 transition-transform duration-200" />
                    <span className="font-medium">Iniciar Sesión</span>
                  </div>
                )}
              </Link>
            )}

            {/* Production mode indicator */}
            {isProduction && (
              <div className="hidden md:flex items-center gap-2 text-gray-400 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Catálogo Online</span>
              </div>
            )}

            {/* Development mode indicator */}
            {/* {isDevelopment && (
              <div className="hidden md:flex items-center gap-2 text-blue-400 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Desarrollo</span>
              </div>
            )} */}
          </ul>
        </nav>
      </div>
    </header>
  )
}
