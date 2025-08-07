import { isDevelopment, isProduction } from "../utils/envUtils"
import { apiInterceptor } from "../utils/apiInterceptor"
import { buildApiUrl } from "../config/api"

// Servicio para manejar productos desde JSON local (en producción) o API (en desarrollo)
class ProductService {
  constructor() {
    this.productsCache = []
    this.categoriesCache = []
    this.brandsCache = []
    this.lastLoadTime = 0 // Para controlar la recarga en producción
    this.CACHE_DURATION = 5 * 60 * 1000 // 5 minutos de caché para producción

    // Predefinir categorías si no se cargan del JSON
    this.defaultCategories = [
      { id: "frames", name: "Cuadros" },
      { id: "wheels", name: "Ruedas" },
      { id: "handlebars", name: "Manubrios" },
      { id: "pedals", name: "Pedales" },
      { id: "chains", name: "Cadenas" },
      { id: "brakes", name: "Frenos" },
      { id: "seats", name: "Asientos" },
      { id: "grips", name: "Puños" },
      { id: "pegs", name: "Pegs" },
      { id: "sprockets", name: "Platos" },
      { id: "tires", name: "Cubiertas" },
      { id: "accessories", name: "Accesorios" },
    ]
  }

  // Cargar productos desde el JSON estático (solo en producción)
  async loadStaticProducts() {
    // Recargar solo si ha pasado el tiempo de caché o si no se ha cargado nunca
    if (this.productsCache.length > 0 && Date.now() - this.lastLoadTime < this.CACHE_DURATION) {
      return
    }

    try {
      console.log("📁 Cargando productos desde /data/products.json...")
      const response = await fetch("/data/products.json")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()

      this.productsCache = data.products || []
      this.categoriesCache = data.categories || this.defaultCategories
      this.brandsCache = [...new Set(this.productsCache.map((p) => p.brand))].sort()
      this.lastLoadTime = Date.now()
      console.log("✅ Productos estáticos cargados:", this.productsCache.length)
    } catch (error) {
      console.error("❌ Error cargando productos estáticos:", error)
      this.productsCache = []
      this.categoriesCache = this.defaultCategories
      this.brandsCache = []
    }
  }

  // Obtener todos los productos con filtros
  async getProducts(filters = {}) {
    if (isProduction) {
      await this.loadStaticProducts()
      let filteredProducts = [...this.productsCache]

      // Aplicar filtros de cliente-side para el modo producción
      if (filters.category) {
        filteredProducts = filteredProducts.filter((p) => p.category === filters.category)
      }
      if (filters.brand) {
        filteredProducts = filteredProducts.filter((p) =>
          p.brand.toLowerCase().includes(filters.brand.toLowerCase()),
        )
      }
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        filteredProducts = filteredProducts.filter(
          (p) =>
            p.name.toLowerCase().includes(searchTerm) ||
            p.description.toLowerCase().includes(searchTerm) ||
            p.brand.toLowerCase().includes(searchTerm) ||
            (p.tags && p.tags.some((tag) => tag.toLowerCase().includes(searchTerm))),
        )
      }
      // Filtrar solo activos para el público
      filteredProducts = filteredProducts.filter((p) => p.active === true)

      // Ordenar
      if (filters.sortBy) {
        filteredProducts.sort((a, b) => {
          let aValue = a[filters.sortBy]
          let bValue = b[filters.sortBy]

          if (filters.sortBy === "createdAt" || filters.sortBy === "updatedAt") {
            aValue = new Date(aValue)
            bValue = new Date(bValue)
          } else if (typeof aValue === "string") {
            aValue = aValue.toLowerCase()
            bValue = bValue.toLowerCase()
          }

          if (filters.sortOrder === "desc") {
            return bValue > aValue ? 1 : -1
          } else {
            return aValue > bValue ? 1 : -1
          }
        })
      }

      // Paginación
      const page = filters.page || 1
      const limit = filters.limit || 12
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit

      const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

      return {
        products: paginatedProducts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(filteredProducts.length / limit),
          totalProducts: filteredProducts.length,
          hasNext: endIndex < filteredProducts.length,
          hasPrev: page > 1,
        },
      }
    } else {
      // Modo desarrollo: llamar al backend
      const queryParams = new URLSearchParams(filters).toString()
      const res = await apiInterceptor.fetchWithAuth(
        buildApiUrl(`/api/products?${queryParams}`),
      )
      if (!res.ok) throw new Error("Failed to fetch products from API")
      return res.json()
    }
  }

  // Obtener producto por ID
  async getProduct(id) {
    if (isProduction) {
      await this.loadStaticProducts()
      const product = this.productsCache.find((p) => p.id === id)
      if (!product || !product.active) {
        throw new Error("Producto no encontrado o inactivo.")
      }
      return product
    } else {
      const res = await apiInterceptor.fetchWithAuth(buildApiUrl(`/api/products/${id}`))
      if (!res.ok) throw new Error("Failed to fetch product from API")
      return res.json()
    }
  }

  // Obtener productos destacados
  async getFeaturedProducts(limit = 8) {
    if (isProduction) {
      await this.loadStaticProducts()
      return this.productsCache
        .filter((p) => p.featured && p.active)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit)
    } else {
      const res = await apiInterceptor.fetchWithAuth(
        buildApiUrl(`/api/products/featured?limit=${limit}`),
      )
      if (!res.ok) throw new Error("Failed to fetch featured products from API")
      return res.json()
    }
  }

  // Obtener productos por categoría
  async getProductsByCategory(category, limit = 12) {
    if (isProduction) {
      await this.loadStaticProducts()
      return this.productsCache
        .filter((p) => p.category === category && p.active)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit)
    } else {
      const res = await apiInterceptor.fetchWithAuth(
        buildApiUrl(`/api/products/category/${category}?limit=${limit}`),
      )
      if (!res.ok) throw new Error("Failed to fetch products by category from API")
      return res.json()
    }
  }

  // Obtener categorías con conteo
  async getCategories() {
    if (isProduction) {
      await this.loadStaticProducts()
      const categoryCounts = {}
      this.productsCache.filter((p) => p.active).forEach((p) => {
        categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1
      })

      return this.categoriesCache.map((cat) => ({
        ...cat,
        count: categoryCounts[cat.id] || 0,
      }))
    } else {
      const res = await apiInterceptor.fetchWithAuth(buildApiUrl("/api/products/categories"))
      if (!res.ok) throw new Error("Failed to fetch categories from API")
      return res.json()
    }
  }

  // Obtener marcas únicas
  async getBrands() {
    if (isProduction) {
      await this.loadStaticProducts()
      return this.brandsCache
    } else {
      const res = await apiInterceptor.fetchWithAuth(buildApiUrl("/api/products/brands"))
      if (!res.ok) throw new Error("Failed to fetch brands from API")
      return res.json()
    }
  }

  // Métodos de administración (solo en desarrollo, llaman al backend)
  async addProduct(productData) {
    if (isProduction) throw new Error("Operación no permitida en modo producción.")
    const res = await apiInterceptor.fetchWithAuth(buildApiUrl("/api/products"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    })
    if (!res.ok) throw new Error("Failed to add product via API")
    return res.json()
  }

  async updateProduct(id, productData) {
    if (isProduction) throw new Error("Operación no permitida en modo producción.")
    const res = await apiInterceptor.fetchWithAuth(buildApiUrl(`/api/products/${id}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    })
    if (!res.ok) throw new Error("Failed to update product via API")
    return res.json()
  }

  async deleteProduct(id) {
    if (isProduction) throw new Error("Operación no permitida en modo producción.")
    const res = await apiInterceptor.fetchWithAuth(buildApiUrl(`/api/products/${id}`), {
      method: "DELETE",
    })
    if (!res.ok) throw new Error("Failed to delete product via API")
    return res.json()
  }

  async getAllProductsAdmin(filters = {}) {
    if (isProduction) throw new Error("Operación no permitida en modo producción.")
    const queryParams = new URLSearchParams(filters).toString()
    const res = await apiInterceptor.fetchWithAuth(
      buildApiUrl(`/api/products/admin/all?${queryParams}`),
    )
    if (!res.ok) throw new Error("Failed to fetch all products for admin via API")
    return res.json()
  }

  async exportData() {
    if (isProduction) throw new Error("Operación no permitida en modo producción.")
    const res = await apiInterceptor.fetchWithAuth(buildApiUrl("/api/products/admin/export"))
    if (!res.ok) throw new Error("Failed to export data via API")
    // Descargar el archivo
    const blob = await res.blob()
    const disposition = res.headers.get('Content-Disposition');
    let filename = 'laucha-bmx-products.json';
    if (disposition && disposition.indexOf('attachment') !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
        }
    }
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    return true
  }

  async importData(file) {
    if (isProduction) throw new Error("Operación no permitida en modo producción.")
    const formData = new FormData()
    formData.append("file", file)

    const res = await apiInterceptor.fetchWithAuth(buildApiUrl("/api/products/admin/import"), {
      method: "POST",
      body: formData, // Multer espera FormData
    })
    if (!res.ok) throw new Error("Failed to import data via API")
    return res.json()
  }

  async resetToOriginal() {
    if (isProduction) throw new Error("Operación no permitida en modo producción.")
    const res = await apiInterceptor.fetchWithAuth(
      buildApiUrl("/api/products/admin/reset-original"),
      {
        method: "POST",
      },
    )
    if (!res.ok) throw new Error("Failed to reset data via API")
    return res.json()
  }

  // Obtener estadísticas (solo en desarrollo)
  async getStats() {
    if (isProduction) {
      await this.loadStaticProducts()
      const stats = {
        totalProducts: this.productsCache.length,
        activeProducts: this.productsCache.filter(p => p.active).length,
        featuredProducts: this.productsCache.filter(p => p.featured).length,
        outOfStock: this.productsCache.filter(p => p.stock === 0).length,
        categories: this.categoriesCache.length,
        brands: this.brandsCache.length,
        totalValue: this.productsCache.reduce((sum, p) => sum + (p.price * p.stock), 0),
        lastUpdated: new Date(this.lastLoadTime).toLocaleDateString()
      }
      return stats
    } else {
      // En desarrollo, podemos obtener estadísticas más detalladas si el backend las proporciona
      // Por ahora, simulamos con los datos cargados por getProducts
      const { products } = await this.getProducts({ active: undefined, limit: 9999 }) // Obtener todos los productos
      const brands = [...new Set(products.map(p => p.brand))].length
      const categories = [...new Set(products.map(p => p.category))].length

      const stats = {
        totalProducts: products.length,
        activeProducts: products.filter(p => p.active).length,
        featuredProducts: products.filter(p => p.featured).length,
        outOfStock: products.filter(p => p.stock === 0).length,
        categories: categories,
        brands: brands,
        totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0),
        lastUpdated: new Date().toLocaleDateString() // O la fecha de la última modificación del archivo
      }
      return stats
    }
  }
}

export const productService = new ProductService()
