"use client"

import { Link } from "react-router-dom"
import { useUser } from "../hooks/useUser"
import { X } from "lucide-react"
import { scrollToTop } from "../hooks/useScrollToTop"

export default function Header() {
  const { currentUser } = useUser()

  const handleLinkClick = () => {
    scrollToTop()
  }

  return (
    <header className="bg-stone-100 border-b border-stone-200 fixed top-0 left-0 w-full z-50">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-4 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2" onClick={handleLinkClick}>
          <div className="w-6 h-6 bg-teal-600 rounded-sm flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-sm"></div>
          </div>
          <span className="text-stone-800 font-medium text-lg">JB Ropa Usada BB</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            to="/catalogo"
            className="text-stone-700 hover:text-stone-900 font-medium transition-colors duration-200"
            onClick={handleLinkClick}
          >
            Catálogo
          </Link>
          <Link
            to="/valores"
            className="text-stone-700 hover:text-stone-900 font-medium transition-colors duration-200"
            onClick={handleLinkClick}
          >
            Valores
          </Link>
          <Link
            to="/faq"
            className="text-stone-700 hover:text-stone-900 font-medium transition-colors duration-200"
            onClick={handleLinkClick}
          >
            FAQ
          </Link>
          <Link
            to="/vender"
            className="text-stone-700 hover:text-stone-900 font-medium transition-colors duration-200"
            onClick={handleLinkClick}
          >
            Vender mi ropa
          </Link>
        </nav>

        {/* Close button (as shown in the image) */}
        <button className="w-10 h-10 bg-stone-400 hover:bg-stone-500 rounded-full flex items-center justify-center transition-colors duration-200">
          <X className="text-white" size={20} />
        </button>
      </div>
    </header>
  )
}
