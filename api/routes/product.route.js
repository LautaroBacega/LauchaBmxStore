import express from "express"
import {
  getProducts,
  getProduct,
  getFeaturedProducts,
  getProductsByCategory,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProductsAdmin,
} from "../controllers/product.controller.js"
import { verifyToken } from "../utils/verifyUser.js"
import { verifyAdmin } from "../utils/verifyAdmin.js"

const router = express.Router()

// Public routes
router.get("/", getProducts)
router.get("/featured", getFeaturedProducts)
router.get("/categories", getCategories)
router.get("/category/:category", getProductsByCategory)
router.get("/:id", getProduct)

// Admin routes (only available in development)
if (process.env.NODE_ENV !== "production") {
  router.post("/", verifyToken, verifyAdmin, createProduct)
  router.put("/:id", verifyToken, verifyAdmin, updateProduct)
  router.delete("/:id", verifyToken, verifyAdmin, deleteProduct)
  router.get("/admin/all", verifyToken, verifyAdmin, getAllProductsAdmin)
}

export default router
