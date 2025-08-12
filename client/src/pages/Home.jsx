"use client"

import { useState, useEffect } from "react"
import { useUser } from "../hooks/useUser"
import { ChevronDown, ChevronUp, Recycle, Hand, Truck } from "lucide-react"
import { productService } from "../services/productService"
import { useLocation } from "react-router-dom"

export default function Home() {
  const { currentUser } = useUser()
  const location = useLocation()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState("grid")
  const [filters, setFilters] = useState({
    category: "",
    brand: "",
    search: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "createdAt",
    sortOrder: "desc",
    page: 1,
    limit: 12,
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
  })
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [expandedFaq, setExpandedFaq] = useState(null)

  useEffect(() => {
    const fetchProductsAndFilters = async () => {
      setLoading(true)
      setError(null)
      try {
        const [productData, featuredData] = await Promise.all([
          productService.getProducts(filters),
          productService.getFeaturedProducts(3),
        ])
        setProducts(productData.products)
        setPagination(productData.pagination)
        setFeaturedProducts(featuredData)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load products. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchProductsAndFilters()
  }, [filters])

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price)
  }

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index)
  }

  const faqData = [
    {
      question: "¿Cómo sé el estado de las prendas?",
      answer:
        "Todas nuestras prendas son cuidadosamente inspeccionadas y clasificadas según su estado. Proporcionamos descripciones detalladas y fotos de cualquier imperfección.",
    },
    {
      question: "¿Hacen envíos?",
      answer:
        "Sí, realizamos envíos a todo el país. Los costos y tiempos de entrega varían según la ubicación. Puedes consultar las opciones disponibles durante el proceso de compra.",
    },
    {
      question: "¿Puedo vender mi ropa?",
      answer: "¡Claro! Evaluamos tus prendas y si encajan con el estilo, las publicamos y te pagamos cuando se vendan.",
    },
  ]

  return (
    <div className="min-h-screen bg-stone-100">
      {/* Hero Section */}
      <div className="bg-stone-100 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div>
                <p className="text-stone-600 text-sm font-medium tracking-wider uppercase mb-4">MODA CIRCULAR</p>
                <h1 className="text-5xl lg:text-6xl font-serif text-stone-800 leading-tight mb-6">
                  Moda vintage con historia
                </h1>
                <p className="text-stone-600 text-lg leading-relaxed mb-8">
                  Descubre ropa de segunda mano cuidadosamente seleccionada. Piezas únicas, en excelentes condiciones,
                  listas para una nueva vida.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200">
                  Ver catálogo
                </button>
                <button className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200">
                  Vender mi ropa
                </button>
              </div>

              {/* Features */}
              <div className="flex flex-col sm:flex-row gap-8 pt-8">
                <div className="flex items-center gap-3">
                  <Recycle className="text-red-600" size={20} />
                  <span className="text-stone-700 font-medium">Sostenible</span>
                </div>
                <div className="flex items-center gap-3">
                  <Hand className="text-red-600" size={20} />
                  <span className="text-stone-700 font-medium">Curado a mano</span>
                </div>
                <div className="flex items-center gap-3">
                  <Truck className="text-red-600" size={20} />
                  <span className="text-stone-700 font-medium">Envíos nacionales</span>
                </div>
              </div>
            </div>

            {/* Right Content - Product Images */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-stone-200 rounded-lg overflow-hidden aspect-square">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Captura%20de%20pantalla%202025-08-11%20212820-Ta1GnwJ0yGZHkIKkpky0aoUsIb0KRZ.png"
                    alt="Campera denim vintage"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="bg-stone-200 rounded-lg overflow-hidden aspect-square">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Captura%20de%20pantalla%202025-08-11%20212820-Ta1GnwJ0yGZHkIKkpky0aoUsIb0KRZ.png"
                    alt="Vestido floral"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="pt-8">
                <div className="bg-stone-200 rounded-lg overflow-hidden aspect-[4/5]">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Captura%20de%20pantalla%202025-08-11%20212820-Ta1GnwJ0yGZHkIKkpky0aoUsIb0KRZ.png"
                    alt="Botas de cuero clásicas"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="bg-stone-100 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-serif text-stone-800 mb-12">Piezas destacadas</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Product 1 */}
            <div className="bg-stone-200 rounded-lg overflow-hidden">
              <div className="aspect-square bg-stone-300">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Captura%20de%20pantalla%202025-08-11%20212838-aEhP8MzWsgonutTxWYOe4eaa54Ngn0.png"
                  alt="Campera denim vintage"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-stone-800 font-medium mb-2">Campera denim vintage</h3>
                <p className="text-stone-600 mb-4">$18.900</p>
                <button className="text-stone-700 hover:text-stone-900 font-medium">Ver más</button>
              </div>
            </div>

            {/* Product 2 */}
            <div className="bg-stone-200 rounded-lg overflow-hidden">
              <div className="aspect-square bg-stone-300">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Captura%20de%20pantalla%202025-08-11%20212838-aEhP8MzWsgonutTxWYOe4eaa54Ngn0.png"
                  alt="Vestido floral 90s"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-stone-800 font-medium mb-2">Vestido floral 90s</h3>
                <p className="text-stone-600 mb-4">$15.500</p>
                <button className="text-stone-700 hover:text-stone-900 font-medium">Ver más</button>
              </div>
            </div>

            {/* Product 3 */}
            <div className="bg-stone-200 rounded-lg overflow-hidden">
              <div className="aspect-square bg-stone-300">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Captura%20de%20pantalla%202025-08-11%20212838-aEhP8MzWsgonutTxWYOe4eaa54Ngn0.png"
                  alt="Botas de cuero clásicas"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-stone-800 font-medium mb-2">Botas de cuero clásicas</h3>
                <p className="text-stone-600 mb-4">$22.400</p>
                <button className="text-stone-700 hover:text-stone-900 font-medium">Ver más</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-stone-100 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-serif text-stone-800 mb-12">Nuestros valores</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Value 1 */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Recycle className="text-red-600" size={24} />
                <h3 className="text-stone-800 font-medium text-lg">Economía circular</h3>
              </div>
              <p className="text-stone-600 leading-relaxed">
                Extendemos la vida útil de prendas hermosas y reducimos residuos.
              </p>
            </div>

            {/* Value 2 */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Hand className="text-red-600" size={24} />
                <h3 className="text-stone-800 font-medium text-lg">Curaduría cuidada</h3>
              </div>
              <p className="text-stone-600 leading-relaxed">
                Seleccionamos cada prenda con criterios de calidad y estilo.
              </p>
            </div>

            {/* Value 3 */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <h3 className="text-stone-800 font-medium text-lg">Impacto positivo</h3>
              </div>
              <p className="text-stone-600 leading-relaxed">
                Compras conscientes para un armario con historia y carácter.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-stone-100 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-serif text-stone-800 mb-12">Preguntas frecuentes</h2>

          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <div key={index} className="border-b border-stone-300">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full py-6 flex items-center justify-between text-left"
                >
                  <span className="text-stone-800 font-medium text-lg">{faq.question}</span>
                  {expandedFaq === index ? (
                    <ChevronUp className="text-stone-600" size={20} />
                  ) : (
                    <ChevronDown className="text-stone-600" size={20} />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="pb-6">
                    <p className="text-stone-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-stone-100 py-8 border-t border-stone-300">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-stone-600 text-sm mb-4 md:mb-0">
              © 2025 JB Ropa Usada BB. Todos los derechos reservados.
            </div>
            <div className="flex space-x-8 text-sm">
              <a href="#" className="text-stone-600 hover:text-stone-800 transition-colors">
                Catálogo
              </a>
              <a href="#" className="text-stone-600 hover:text-stone-800 transition-colors">
                Valores
              </a>
              <a href="#" className="text-stone-600 hover:text-stone-800 transition-colors">
                FAQ
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
