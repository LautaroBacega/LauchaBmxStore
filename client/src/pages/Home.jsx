"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useUser } from "../hooks/useUser"
import { Truck, Grid, List, Search } from "lucide-react"
import ProductCard from "../components/ProductCard"
import CategoryFilter from "../components/CategoryFilter"
import { productService } from "../services/productService"
import { useLocation } from "react-router-dom"
import { scrollToTop } from "../hooks/useScrollToTop"

export default function Home() {
  const { currentUser } = useUser()
  const location = useLocation()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState("grid") // 'grid' or 'list'
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
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [featuredProducts, setFeaturedProducts] = useState([])

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const searchFromUrl = urlParams.get("search")
    const categoryFromUrl = urlParams.get("category")

    if (searchFromUrl && searchFromUrl !== filters.search) {
      setFilters((prev) => ({
        ...prev,
        search: searchFromUrl,
        page: 1,
      }))
    }

    if (categoryFromUrl && categoryFromUrl !== filters.category) {
      setFilters((prev) => ({
        ...prev,
        category: categoryFromUrl,
        page: 1,
      }))
    }
  }, [location.search])

  useEffect(() => {
    const fetchProductsAndFilters = async () => {
      setLoading(true)
      setError(null)
      try {
        const [productData, categoryData, brandData, featuredData] = await Promise.all([
          productService.getProducts(filters),
          productService.getCategories(),
          productService.getBrands(),
          productService.getFeaturedProducts(8),
        ])
        setProducts(productData.products)
        setPagination(productData.pagination)
        setCategories(categoryData)
        setBrands(brandData)
        setFeaturedProducts(featuredData)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load products or filters. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchProductsAndFilters()
  }, [filters])

  const handleFilterChange = (newFilters) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      ...newFilters,
      page: 1, // Reset page when filters change
    }))
  }

  const handleCategoryChange = (category) => {
    handleFilterChange({ category })
  }

  const handleBrandChange = (brand) => {
    handleFilterChange({ brand })
  }

  const handlePageChange = (newPage) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      page: newPage,
    }))
  }

  const clearFilters = () => {
    setFilters({
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
  }

  const hasActiveFilters = filters.category || filters.brand || filters.search || filters.minPrice || filters.maxPrice

  if (loading && products.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl">Cargando productos...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-10">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <img src="/LauchaBmxStore-logosinfondo.png" alt="Laucha BMX Store" className="h-60 mx-auto" />
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-yellow-500">LAUCHA</span> BMX STORE
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">Partes y accesorios para tu BMX.</p>

            {/* Search Bar integrada en el hero */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  className="w-full p-4 pl-12 rounded-lg text-gray-800 text-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  value={filters.search}
                  onChange={(e) => handleFilterChange({ search: e.target.value })}
                />
                <div className="text-gray-400 absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar with Filters */}
          <div className="lg:w-1/4">
            <CategoryFilter
              selectedCategory={filters.category}
              onCategoryChange={handleCategoryChange}
              selectedBrand={filters.brand}
              onBrandChange={handleBrandChange}
            />
          </div>

          {/* Main Products Area */}
          <div className="lg:w-3/4">
            {/* Products Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {hasActiveFilters ? "Productos Filtrados" : "Catálogo"}
                </h2>
                <p className="text-gray-600">
                  {pagination.totalProducts > 0
                    ? `${pagination.totalProducts} productos encontrados`
                    : "No se encontraron productos"}
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4">
                {/* Sort Dropdown */}
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split("-")
                    handleFilterChange({ sortBy, sortOrder })
                  }}
                >
                  <option value="createdAt-desc">Más recientes</option>
                  <option value="createdAt-asc">Más antiguos</option>
                  <option value="price-asc">Precio: menor a mayor</option>
                  <option value="price-desc">Precio: mayor a menor</option>
                  <option value="name-asc">Nombre: A-Z</option>
                  <option value="name-desc">Nombre: Z-A</option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 ${viewMode === "grid" ? "bg-yellow-500 text-black" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                  >
                    <Grid size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 ${viewMode === "list" ? "bg-yellow-500 text-black" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                  >
                    <List size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Content */}
            {error ? (
              <div className="text-center py-12">
                <p className="text-red-500 text-xl mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors duration-200"
                >
                  Reintentar
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-xl mb-4">
                  {hasActiveFilters
                    ? "No se encontraron productos que coincidan con los filtros seleccionados."
                    : "No hay productos disponibles en este momento."}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors duration-200"
                  >
                    Ver Todo el Catálogo
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Products Grid/List */}
                <div
                  className={
                    viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-8" : "space-y-4 mb-8"
                  }
                >
                  {products.map((product) => (
                    <Link key={product.id} to={`/product/${product.id}`} onClick={() => scrollToTop()}>
                      <ProductCard product={product} viewMode={viewMode} />
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-8">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrev}
                      className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-yellow-500 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      Anterior
                    </button>
                    <span className="text-lg font-medium">
                      Página {pagination.currentPage} de {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNext}
                      className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-yellow-500 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1  gap-8">
            <div className="text-center p-6">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="text-red-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Consultá Envíos</h3>
              <p className="text-gray-600">
                Envíos a todo el país al mejor precio a traves Andreani. Consultá costos y tiempos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
