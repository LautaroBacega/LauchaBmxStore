import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import userRoutes from "./routes/user.route.js"
import authRoutes from "./routes/auth.route.js"
import productRoutes from "./routes/product.route.js"
import cookieParser from "cookie-parser"
import path from "path"
import { fileURLToPath } from "url"
import cors from "cors"

dotenv.config()

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

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:3000",
      "https://autenticationsystem.netlify.app",
      process.env.FRONTEND_URL,
    ].filter(Boolean)

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

app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.get("Origin")}`)
  next()
})

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
    environment: process.env.NODE_ENV || "development",
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
