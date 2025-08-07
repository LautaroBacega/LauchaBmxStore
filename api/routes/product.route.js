import express from "express"
import {
  getProducts,
  getProduct,
  getFeaturedProducts,
  getProductsByCategory,
  getCategories,
  getBrands, // Nueva función para obtener marcas
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProductsAdmin,
  exportData, // Nueva ruta para exportar
  importData, // Nueva ruta para importar
  resetToOriginal, // Nueva ruta para resetear
} from "../controllers/product.controller.js"
import { verifyToken } from "../utils/verifyUser.js"
import { verifyAdmin } from "../utils/verifyAdmin.js"
import multer from "multer" // Para manejar la subida de archivos (importar JSON)

const upload = multer() // Configurar multer para manejar archivos en memoria

const router = express.Router()

// Public routes (read-only, will be used by client in production)
router.get("/", getProducts)
router.get("/featured", getFeaturedProducts)
router.get("/categories", getCategories)
router.get("/brands", getBrands) // Nueva ruta para marcas
router.get("/category/:category", getProductsByCategory)
router.get("/:id", getProduct)

// Admin routes (for local development to modify JSON file)
// Estas rutas ahora siempre están disponibles en el backend,
// la lógica de "solo en desarrollo" se maneja en el frontend.
router.post("/", verifyToken, verifyAdmin, createProduct)
router.put("/:id", verifyToken, verifyAdmin, updateProduct)
router.delete("/:id", verifyToken, verifyAdmin, deleteProduct)
router.get("/admin/all", verifyToken, verifyAdmin, getAllProductsAdmin)

// Rutas de gestión de datos (exportar/importar/resetear)
router.get("/admin/export", verifyToken, verifyAdmin, exportData)
router.post("/admin/import", verifyToken, verifyAdmin, upload.single("file"), importData) // 'file' es el nombre del campo en el formulario
router.post("/admin/reset-original", verifyToken, verifyAdmin, resetToOriginal)

export default router
