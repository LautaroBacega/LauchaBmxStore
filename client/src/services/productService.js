// Servicio para manejar productos desde JSON local
class ProductService {
  constructor() {
    this.products = []
    this.categories = []
    this.loaded = false
  }

  // Cargar productos desde JSON
  async loadProducts() {
    if (this.loaded) return

    try {
      const response = await fetch('/data/products.json')
      const data = await response.json()
      
      this.products = data.products || []
      this.categories = data.categories || []
      this.loaded = true
      
      console.log('✅ Productos cargados:', this.products.length)
    } catch (error) {
      console.error('❌ Error cargando productos:', error)
      this.products = []
      this.categories = []
    }
  }

  // Obtener todos los productos con filtros
  async getProducts(filters = {}) {
    await this.loadProducts()

    let filteredProducts = [...this.products]

    // Filtrar por categoría
    if (filters.category) {
      filteredProducts = filteredProducts.filter(p => p.category === filters.category)
    }

    // Filtrar por marca
    if (filters.brand) {
      filteredProducts = filteredProducts.filter(p => 
        p.brand.toLowerCase().includes(filters.brand.toLowerCase())
      )
    }

    // Filtrar por búsqueda
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm) ||
        p.brand.toLowerCase().includes(searchTerm) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      )
    }

    // Filtrar por precio
    if (filters.minPrice) {
      filteredProducts = filteredProducts.filter(p => p.price >= filters.minPrice)
    }
    if (filters.maxPrice) {
      filteredProducts = filteredProducts.filter(p => p.price <= filters.maxPrice)
    }

    // Filtrar por destacados
    if (filters.featured) {
      filteredProducts = filteredProducts.filter(p => p.featured === true)
    }

    // Filtrar solo activos
    filteredProducts = filteredProducts.filter(p => p.active === true)

    // Ordenar
    if (filters.sortBy) {
      filteredProducts.sort((a, b) => {
        let aValue = a[filters.sortBy]
        let bValue = b[filters.sortBy]

        // Manejar fechas
        if (filters.sortBy === 'createdAt' || filters.sortBy === 'updatedAt') {
          aValue = new Date(aValue)
          bValue = new Date(bValue)
        }

        // Manejar strings
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase()
          bValue = bValue.toLowerCase()
        }

        if (filters.sortOrder === 'desc') {
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
        hasPrev: page > 1
      }
    }
  }

  // Obtener producto por ID
  async getProduct(id) {
    await this.loadProducts()
    return this.products.find(p => p.id === id)
  }

  // Obtener productos destacados
  async getFeaturedProducts(limit = 8) {
    await this.loadProducts()
    return this.products
      .filter(p => p.featured && p.active)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit)
  }

  // Obtener productos por categoría
  async getProductsByCategory(category, limit = 12) {
    await this.loadProducts()
    return this.products
      .filter(p => p.category === category && p.active)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit)
  }

  // Obtener categorías con conteo
  async getCategories() {
    await this.loadProducts()
    
    const categoryCounts = {}
    this.products
      .filter(p => p.active)
      .forEach(p => {
        categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1
      })

    return this.categories.map(cat => ({
      ...cat,
      count: categoryCounts[cat.id] || 0
    }))
  }

  // Obtener marcas únicas
  async getBrands() {
    await this.loadProducts()
    const brands = [...new Set(this.products.map(p => p.brand))].sort()
    return brands
  }

  // Agregar nuevo producto (para el admin)
  async addProduct(productData) {
    await this.loadProducts()
    
    const newProduct = {
      ...productData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    this.products.push(newProduct)
    await this.saveProducts()
    return newProduct
  }

  // Actualizar producto
  async updateProduct(id, productData) {
    await this.loadProducts()
    
    const index = this.products.findIndex(p => p.id === id)
    if (index === -1) throw new Error('Producto no encontrado')

    this.products[index] = {
      ...this.products[index],
      ...productData,
      updatedAt: new Date().toISOString()
    }

    await this.saveProducts()
    return this.products[index]
  }

  // Eliminar producto
  async deleteProduct(id) {
    await this.loadProducts()
    
    const index = this.products.findIndex(p => p.id === id)
    if (index === -1) throw new Error('Producto no encontrado')

    this.products.splice(index, 1)
    await this.saveProducts()
    return true
  }

  // Guardar productos (solo funciona en desarrollo)
  async saveProducts() {
    // En producción, esto no funcionará ya que no puedes escribir archivos
    // En desarrollo, podrías implementar una función para descargar el JSON actualizado
    console.log('💾 Productos actualizados:', this.products.length)
    
    // Crear un blob para descargar
    const dataToSave = {
      products: this.products,
      categories: this.categories
    }
    
    const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    // Crear enlace de descarga
    const a = document.createElement('a')
    a.href = url
    a.download = 'products.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}

export const productService = new ProductService()
