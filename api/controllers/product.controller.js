import { errorHandler } from "../utils/error.js"
import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"

// Obtener la ruta absoluta del archivo products.json
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// Ajusta esta ruta si tu estructura de carpetas es diferente
const productsFilePath = path.join(__dirname, "../../client/public/data/products.json")

// Helper para leer el archivo products.json
const readProductsFile = async () => {
  try {
    const data = await fs.readFile(productsFilePath, "utf8")
    return JSON.parse(data)
  } catch (error) {
    if (error.code === "ENOENT") {
      // Si el archivo no existe, devolver una estructura vacía
      console.warn("products.json no encontrado, creando estructura vacía.")
      return { products: [], categories: [] }
    }
    console.error("Error al leer products.json:", error)
    throw new Error("Error al acceder a los datos de productos.")
  }
}

// Helper para escribir en el archivo products.json
const writeProductsFile = async (data) => {
  try {
    await fs.writeFile(productsFilePath, JSON.stringify(data, null, 2), "utf8")
    console.log("✅ products.json actualizado correctamente.")
  } catch (error) {
    console.error("Error al escribir en products.json:", error)
    throw new Error("Error al guardar los datos de productos.")
  }
}

// Obtener todos los productos con filtrado y paginación
export const getProducts = async (req, res, next) => {
  try {
    const { products } = await readProductsFile()
    const {
      page = 1,
      limit = 12,
      category,
      brand,
      minPrice,
      maxPrice,
      search,
      featured,
      sortBy = "createdAt",
      sortOrder = "desc",
      active, // Permitir filtrar por activo/inactivo en admin
    } = req.query

    let filteredProducts = [...products]

    // Filtrar por estado activo (si se especifica, de lo contrario, incluir todos)
    if (active !== undefined) {
      filteredProducts = filteredProducts.filter((p) => p.active === (active === "true"))
    } else {
      // Por defecto, solo mostrar productos activos para el público
      filteredProducts = filteredProducts.filter((p) => p.active === true)
    }

    if (category) filteredProducts = filteredProducts.filter((p) => p.category === category)
    if (brand) filteredProducts = filteredProducts.filter((p) => p.brand.toLowerCase().includes(brand.toLowerCase()))
    if (featured) filteredProducts = filteredProducts.filter((p) => p.featured === (featured === "true"))

    if (minPrice) filteredProducts = filteredProducts.filter((p) => p.price >= Number(minPrice))
    if (maxPrice) filteredProducts = filteredProducts.filter((p) => p.price <= Number(maxPrice))

    if (search) {
      const searchTermLower = search.toLowerCase()
      filteredProducts = filteredProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTermLower) ||
          p.description.toLowerCase().includes(searchTermLower) ||
          p.brand.toLowerCase().includes(searchTermLower) ||
          (p.tags && p.tags.some((tag) => tag.toLowerCase().includes(searchTermLower))),
      )
    }

    // Ordenar
    filteredProducts.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]

      if (sortBy === "createdAt" || sortBy === "updatedAt") {
        aValue = new Date(aValue)
        bValue = new Date(bValue)
      } else if (typeof aValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortOrder === "desc") {
        return bValue > aValue ? 1 : -1
      } else {
        return aValue > bValue ? 1 : -1
      }
    })

    // Paginación
    const skip = (Number(page) - 1) * Number(limit)
    const paginatedProducts = filteredProducts.slice(skip, skip + Number(limit))
    const total = filteredProducts.length

    res.status(200).json({
      products: paginatedProducts,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalProducts: total,
        hasNext: Number(page) * Number(limit) < total,
        hasPrev: Number(page) > 1,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Get single product by ID
export const getProduct = async (req, res, next) => {
  try {
    const { products } = await readProductsFile()
    const product = products.find((p) => p.id === req.params.id)

    if (!product || !product.active) {
      return next(errorHandler(404, "Producto no encontrado"))
    }

    res.status(200).json(product)
  } catch (error) {
    next(error)
  }
}

// Get featured products
export const getFeaturedProducts = async (req, res, next) => {
  try {
    const { products } = await readProductsFile()
    const featuredProducts = products
      .filter((p) => p.featured === true && p.active === true)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8) // Limit to 8 featured products

    res.status(200).json(featuredProducts)
  } catch (error) {
    next(error)
  }
}

// Get products by category
export const getProductsByCategory = async (req, res, next) => {
  try {
    const { products } = await readProductsFile()
    const { category } = req.params
    const { limit = 12 } = req.query

    const productsInCategory = products
      .filter((p) => p.category === category && p.active === true)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, Number(limit))

    res.status(200).json(productsInCategory)
  } catch (error) {
    next(error)
  }
}

// Get all categories with product counts - CORREGIDO CON DEBUGGING
export const getCategories = async (req, res, next) => {
  try {
    const data = await readProductsFile()
    const { products, categories: predefinedCategories } = data

    // Verificar si tenemos categorías predefinidas
    if (!predefinedCategories || predefinedCategories.length === 0) {
      const defaultCategories = [
        { id: "Bicicletas Completas", name: "Bicicletas Completas"},
        { id: "Aros", name: "Aros" },
        { id: "Asientos", name: "Asientos" },
        { id: "Cajas", name: "Cajas" },
        { id: "Cuadros", name: "Cuadros" },
        { id: "Cubiertas", name: "Cubiertas" },
        { id: "Frenos", name: "Frenos" },
        { id: "Horquillas", name: "Horquillas" },
        { id: "Juegos de Dirección", name: "Juegos de Dirección" },
        { id: "Mazas Delanteras", name: "Mazas Delanteras" },
        { id: "Mazas Traseras", name: "Mazas Traseras" },
        { id: "Manubrios", name: "Manubrios" },
        { id: "Palancas", name: "Palancas" },
        { id: "Pedales", name: "Pedales" },
        { id: "Platos", name: "Platos" },
        { id: "Postes", name: "Postes" },
        { id: "Puños", name: "Puños" },
        { id: "Rayos", name: "Rayos" },
        { id: "Stems", name: "Stems" }
      ]

      const categoryCounts = {}
      products
        .filter((p) => p.active)
        .forEach((p) => {
          categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1
        })

      const formattedCategories = defaultCategories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        count: categoryCounts[cat.id] || 0,
      }))

      res.status(200).json(formattedCategories)
      return
    }

    // Contar productos activos por categoría
    const categoryCounts = {}
    const activeProducts = products.filter((p) => p.active)

    activeProducts.forEach((p) => {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1
    })

    const formattedCategories = predefinedCategories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      count: categoryCounts[cat.id] || 0,
    }))

    res.status(200).json(formattedCategories)
  } catch (error) {
    console.error("❌ Error in getCategories:", error)
    next(error)
  }
}

// Get all unique brands
export const getBrands = async (req, res, next) => {
  try {
    const { products } = await readProductsFile()
    const brands = [...new Set(products.map((p) => p.brand))].sort()
    res.status(200).json(brands)
  } catch (error) {
    next(error)
  }
}

// ADMIN ONLY ROUTES (Now write to JSON file)

// Create product (Admin only)
export const createProduct = async (req, res, next) => {
  try {
    const { products, categories } = await readProductsFile()
    const newProduct = {
      id: Date.now().toString(), // Generar un ID único basado en timestamp
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Asegurar que los campos booleanos tengan valores por defecto si no se envían
      featured: req.body.featured === true,
      active: req.body.active === true,
      tags: req.body.tags || [],
      images: req.body.images || [],
      specifications: req.body.specifications || {},
    }
    products.push(newProduct)
    await writeProductsFile({ products, categories })
    res.status(201).json(newProduct)
  } catch (error) {
    next(errorHandler(500, "Error al crear el producto en el archivo JSON"))
  }
}

// Update product (Admin only)
export const updateProduct = async (req, res, next) => {
  try {
    const { products, categories } = await readProductsFile()
    const productId = req.params.id
    const index = products.findIndex((p) => p.id === productId)

    if (index === -1) {
      return next(errorHandler(404, "Producto no encontrado"))
    }

    // Actualizar el producto con los nuevos datos, manteniendo los existentes si no se proporcionan
    products[index] = {
      ...products[index],
      ...req.body,
      updatedAt: new Date().toISOString(),
      tags: req.body.tags !== undefined ? req.body.tags : products[index].tags,
      images: req.body.images !== undefined ? req.body.images : products[index].images,
      specifications:
        req.body.specifications !== undefined
          ? { ...products[index].specifications, ...req.body.specifications }
          : products[index].specifications,
    }
    await writeProductsFile({ products, categories })
    res.status(200).json(products[index])
  } catch (error) {
    next(errorHandler(500, "Error al actualizar el producto en el archivo JSON"))
  }
}

// Delete product (Admin only)
export const deleteProduct = async (req, res, next) => {
  try {
    const { products, categories } = await readProductsFile()
    const productId = req.params.id
    const initialLength = products.length
    const updatedProducts = products.filter((p) => p.id !== productId)

    if (updatedProducts.length === initialLength) {
      return next(errorHandler(404, "Producto no encontrado"))
    }

    await writeProductsFile({ products: updatedProducts, categories })
    res.status(200).json({ message: "Producto eliminado correctamente del archivo JSON" })
  } catch (error) {
    next(errorHandler(500, "Error al eliminar el producto del archivo JSON"))
  }
}

// Get all products for admin (including inactive)
export const getAllProductsAdmin = async (req, res, next) => {
  try {
    // Reutilizamos getProducts pero forzando active a undefined para que incluya todos
    req.query.active = undefined
    await getProducts(req, res, next)
  } catch (error) {
    next(error)
  }
}

// Export data (for admin)
export const exportData = async (req, res, next) => {
  try {
    const data = await readProductsFile()
    res.setHeader("Content-Type", "application/json")
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=laucha-bmx-products-${new Date().toISOString().split("T")[0]}.json`,
    )
    res.status(200).send(JSON.stringify(data, null, 2))
  } catch (error) {
    next(errorHandler(500, "Error al exportar los datos."))
  }
}

// Import data (for admin)
export const importData = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(errorHandler(400, "No se ha subido ningún archivo."))
    }

    const importedData = JSON.parse(req.file.buffer.toString("utf8"))

    if (!importedData.products || !Array.isArray(importedData.products)) {
      return next(errorHandler(400, "Formato de archivo JSON inválido. Se esperaba un array de productos."))
    }

    // Opcional: Validar la estructura de los productos importados
    // Por ahora, simplemente sobrescribimos
    await writeProductsFile(importedData)
    res.status(200).json({ message: "Datos importados correctamente." })
  } catch (error) {
    console.error("Error en importData:", error)
    next(errorHandler(500, "Error al importar los datos. Asegúrate de que el archivo es un JSON válido."))
  }
}

// Reset data to original (for admin)
export const resetToOriginal = async (req, res, next) => {
  try {
    const originalDataPath = path.join(__dirname, "../../client/public/data/products.json.original") // Asume un archivo original
    let originalData

    try {
      originalData = await fs.readFile(originalDataPath, "utf8")
      originalData = JSON.parse(originalData)
    } catch (readError) {
      // Si no existe el .original, leer del products.json actual como fallback
      console.warn("products.json.original no encontrado, usando products.json actual como base para reset.")
      originalData = await fs.readFile(productsFilePath, "utf8")
      originalData = JSON.parse(originalData)
    }

    await writeProductsFile(originalData)
    res.status(200).json({ message: "Datos reseteados a la versión original." })
  } catch (error) {
    next(errorHandler(500, "Error al resetear los datos a la versión original."))
  }
}
