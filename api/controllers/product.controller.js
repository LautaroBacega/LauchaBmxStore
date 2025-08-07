import Product from "../models/product.model.js"
import { errorHandler } from "../utils/error.js"

// Get all products with filtering and pagination
export const getProducts = async (req, res, next) => {
  try {
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
    } = req.query

    // Build filter object
    const filter = { active: true }

    if (category) filter.category = category
    if (brand) filter.brand = new RegExp(brand, "i")
    if (featured) filter.featured = featured === "true"

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = Number(minPrice)
      if (maxPrice) filter.price.$lte = Number(maxPrice)
    }

    // Search filter
    if (search) {
      filter.$text = { $search: search }
    }

    // Build sort object
    const sort = {}
    sort[sortBy] = sortOrder === "asc" ? 1 : -1

    // Execute query with pagination
    const skip = (page - 1) * limit
    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .select("-__v")

    // Get total count for pagination
    const total = await Product.countDocuments(filter)

    res.status(200).json({
      products,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Get single product by ID
export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)

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
    const products = await Product.find({ featured: true, active: true })
      .sort({ createdAt: -1 })
      .limit(8)
      .select("-__v")

    res.status(200).json(products)
  } catch (error) {
    next(error)
  }
}

// Get products by category
export const getProductsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params
    const { limit = 12 } = req.query

    const products = await Product.find({ category, active: true })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .select("-__v")

    res.status(200).json(products)
  } catch (error) {
    next(error)
  }
}

// Get all categories with product counts
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.aggregate([
      { $match: { active: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ])

    const categoryMap = {
      frames: "Cuadros",
      wheels: "Ruedas",
      handlebars: "Manubrios",
      pedals: "Pedales",
      chains: "Cadenas",
      brakes: "Frenos",
      seats: "Asientos",
      grips: "Puños",
      pegs: "Pegs",
      sprockets: "Platos",
      tires: "Cubiertas",
      accessories: "Accesorios",
    }

    const formattedCategories = categories.map((cat) => ({
      id: cat._id,
      name: categoryMap[cat._id] || cat._id,
      count: cat.count,
    }))

    res.status(200).json(formattedCategories)
  } catch (error) {
    next(error)
  }
}

// ADMIN ONLY ROUTES (Development only)

// Create product (Admin only)
export const createProduct = async (req, res, next) => {
  try {
    const product = new Product(req.body)
    await product.save()
    res.status(201).json(product)
  } catch (error) {
    next(error)
  }
}

// Update product (Admin only)
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    if (!product) {
      return next(errorHandler(404, "Producto no encontrado"))
    }

    res.status(200).json(product)
  } catch (error) {
    next(error)
  }
}

// Delete product (Admin only)
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)

    if (!product) {
      return next(errorHandler(404, "Producto no encontrado"))
    }

    res.status(200).json({ message: "Producto eliminado correctamente" })
  } catch (error) {
    next(error)
  }
}

// Get all products for admin (including inactive)
export const getAllProductsAdmin = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      brand,
      active,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query

    const filter = {}
    if (category) filter.category = category
    if (brand) filter.brand = new RegExp(brand, "i")
    if (active !== undefined) filter.active = active === "true"

    const sort = {}
    sort[sortBy] = sortOrder === "asc" ? 1 : -1

    const skip = (page - 1) * limit
    const products = await Product.find(filter).sort(sort).skip(skip).limit(Number(limit))

    const total = await Product.countDocuments(filter)

    res.status(200).json({
      products,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    next(error)
  }
}
