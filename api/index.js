import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import userRoutes from "./routes/user.route.js"
import authRoutes from "./routes/auth.route.js"
import productRoutes from "./routes/product.route.js" // Mantener importación
import cookieParser from "cookie-parser"
import path from "path"
import { fileURLToPath } from "url"
import cors from "cors"

dotenv.config()

// Conexión a MongoDB (solo si aún necesitas la base de datos para usuarios/autenticación)
// Si tu intención es que NADA use MongoDB, puedes eliminar esta sección.
// Pero como el auth.controller y user.model aún lo usan, lo mantendremos.
mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("Connected to MongoDB")
  })
  .catch((err) => {
    console.log(err)
  })

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Determine if we're in development or production
const isDevelopment = process.env.NODE_ENV !== "production"

// CORS configuration - ACTUALIZADO para Netlify
const corsOptions = {
  origin: (origin, callback) => {
    // Lista de orígenes permitidos - AGREGA TU DOMINIO DE NETLIFY
    const allowedOrigins = [
      "http://localhost:5173", // Vite dev server
      "http://localhost:3000", // Backend local
      "http://127.0.0.1:5173",
      "http://127.0.0.1:3000",
      "https://your-netlify-app.netlify.app", // 🔥 CAMBIA ESTO POR TU URL DE NETLIFY
      "https://autenticationsystem.netlify.app", // Tu dominio actual
      process.env.FRONTEND_URL, // Variable de entorno para flexibilidad
    ].filter(Boolean)

    // En producción, ser más permisivo para solicitudes sin origin (mismo dominio)
    if (!origin) return callback(null, true)

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      console.log("❌ CORS blocked origin:", origin)
      callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 200,
}

// Aplicar CORS
app.use(cors(corsOptions))

// Middleware para parsear JSON y cookies
app.use(express.json())
app.use(cookieParser())

// Logging middleware para debug
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.get("Origin")}`)
  next()
})

// Servir archivos estáticos desde la carpeta 'client/public'
// Esto es crucial para que el backend pueda acceder al products.json
app.use(express.static(path.join(__dirname, "../client/public")))

// API routes
app.use("/api/user", userRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ 
    message: "Laucha BMX Store API is running!", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  })
})

// Error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500
  const message = err.message || "Internal Server Error"
  console.error(`❌ Error ${statusCode}: ${message}`)
  return res.status(statusCode).json({
    success: false,
    message,
    statusCode,
  })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`)
  console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`)
  console.log(`🔗 CORS enabled for production origins`)
})
