"use client"

import { useState, useEffect, useRef } from "react"
import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  ImageIcon,
  Download,
  RotateCcw,
  BarChart3,
  FileUp,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage"
import { app } from "../firebase"
import { productService } from "../services/productService"
import { isDevelopment } from "../utils/envUtils" // Importar isDevelopment

// Global counter for unique image IDs
let uniqueImageIdCounter = 0

// Utility function for image compression
const compressImage = (file, maxWidth = 1280, maxHeight = 1280, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target.result
      img.onload = () => {
        const canvas = document.createElement("canvas")
        let width = img.width
        let height = img.height

        // Calculate new dimensions to fit within maxWidth/maxHeight while maintaining aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height
          if (width > height) {
            width = maxWidth
            height = width / aspectRatio
          } else {
            height = maxHeight
            width = height * aspectRatio
          }
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext("2d")
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Create a new File object from the blob, preserving original name and type
              const compressedFile = new File([blob], file.name, { type: file.type, lastModified: Date.now() })
              resolve(compressedFile)
            } else {
              reject(new Error("Canvas toBlob failed"))
            }
          },
          file.type, // Use original file type for blob
          quality,
        )
      }
      img.onerror = (error) => reject(error)
    }
    reader.onerror = (error) => reject(error)
  })
}

export default function AdminPanel() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [pagination, setPagination] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [stats, setStats] = useState({})
  const [showStats, setShowStats] = useState(false)

  // Estados para manejo de imágenes
  const fileInputRef = useRef(null) // Single ref for multi-file input
  const importFileRef = useRef(null) // Declare importFileRef here
  const [currentImageIndex, setCurrentImageIndex] = useState(0) // Nuevo estado para el carrusel

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    brand: "",
    stock: "",
    images: [], // Now an array of objects: { id, url, file, progress, error }
    specifications: {
      material: "",
      weight: "",
      size: "",
      color: "",
      compatibility: "",
    },
    featured: false,
    active: true,
    tags: "",
  })

  const categories = [
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

  useEffect(() => {
    if (isDevelopment) {
      // Solo cargar productos y estadísticas en desarrollo
      fetchProducts()
      fetchStats()
    }
  }, [currentPage, searchTerm, selectedCategory])

  // Effect to clean up object URLs when images are removed or component unmounts
  useEffect(() => {
    const currentImageFiles = formData.images.filter((img) => img.file && img.url === null)

    return () => {
      currentImageFiles.forEach((img) => {
        if (img.file) {
          URL.revokeObjectURL(img.file)
        }
      })
    }
  }, [formData.images])

  const fetchProducts = async () => {
    try {
      setLoading(true)

      const filters = {
        page: currentPage,
        limit: 20,
        search: searchTerm,
        category: selectedCategory,
        active: undefined, // Para admin, queremos ver todos los productos (activos/inactivos)
      }

      const data = await productService.getAllProductsAdmin(filters) // Usar getAllProductsAdmin
      setProducts(data.products)
      setPagination(data.pagination)
    } catch (error) {
      console.error("Error fetching products:", error)
      alert("Error al cargar productos: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const statsData = await productService.getStats()
      setStats(statsData)
    } catch (error) {
      console.error("Error fetching stats:", error)
      alert("Error al cargar estadísticas: " + error.message)
    }
  }

  // Function to upload a single image to Firebase
  const uploadFileToFirebase = (fileObject) => {
    const file = fileObject.file
    const tempId = fileObject.id

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      setFormData((prev) => ({
        ...prev,
        images: prev.images.map((img) =>
          img.id === tempId ? { ...img, error: "Solo se permiten archivos de imagen" } : img,
        ),
      }))
      return
    }

    // Validar tamaño (máximo 5MB) - This check is less critical now with client-side compression
    if (file.size > 5 * 1024 * 1024) {
      setFormData((prev) => ({
        ...prev,
        images: prev.images.map((img) =>
          img.id === tempId ? { ...img, error: "La imagen debe ser menor a 5MB" } : img,
        ),
      }))
      return
    }

    const storage = getStorage(app)
    const fileName = `products/${Date.now()}_${tempId}_${file.name}`
    const storageRef = ref(storage, fileName)
    const uploadTask = uploadBytesResumable(storageRef, file)

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        setFormData((prev) => ({
          ...prev,
          images: prev.images.map((img) => (img.id === tempId ? { ...img, progress: Math.round(progress) } : img)),
        }))
      },
      (error) => {
        console.error("Error uploading image:", error)
        setFormData((prev) => ({
          ...prev,
          images: prev.images.map((img) => (img.id === tempId ? { ...img, error: "Error al subir la imagen" } : img)),
        }))
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFormData((prev) => ({
            ...prev,
            images: prev.images.map((img) =>
              img.id === tempId ? { ...img, url: downloadURL, file: null, progress: 100 } : img,
            ),
          }))
        })
      },
    )
  }

  // Handle multiple file selection
  const handleFileSelect = async (e) => {
    // Make it async
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    const newImageObjectsPromises = files.map(async (file) => {
      // Map to promises
      try {
        const compressedFile = await compressImage(file) // Compress the image
        return {
          id: `img_${uniqueImageIdCounter++}_${Math.random().toString(36).substring(2, 9)}`,
          url: null,
          file: compressedFile, // Use the compressed file
          progress: 0,
          error: null,
        }
      } catch (error) {
        console.error("Error compressing image:", error)
        return {
          id: `img_${uniqueImageIdCounter++}_${Math.random().toString(36).substring(2, 9)}`,
          url: null,
          file: file, // Fallback to original file if compression fails
          progress: 0,
          error: "Error al procesar la imagen para subirla.",
        }
      }
    })

    const newImageObjects = await Promise.all(newImageObjectsPromises) // Wait for all compressions

    setFormData((prev) => {
      const updatedImages = [...prev.images, ...newImageObjects]
      // Set the current image to the first newly added image
      setCurrentImageIndex(updatedImages.length - 1) // Update index based on final array length
      return {
        ...prev,
        images: updatedImages,
      }
    })

    newImageObjects.forEach((fileObject) => {
      if (!fileObject.error) {
        // Only upload if no compression error
        uploadFileToFirebase(fileObject)
      }
    })

    e.target.value = ""
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Verificar que no hay subidas en progreso o con error
    const hasPendingUploads = formData.images.some((img) => img.progress < 100 && img.error === null)
    const hasUploadErrors = formData.images.some((img) => img.error !== null)

    if (hasPendingUploads) {
      alert("Espera a que terminen de subirse todas las imágenes.")
      return
    }
    if (hasUploadErrors) {
      alert("Hay errores en la subida de imágenes. Por favor, corregilos o eliminá las imágenes con error.")
      return
    }

    try {
      const productData = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        images: formData.images.map((img) => img.url).filter(Boolean), // Send only URLs
      }

      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, productData)
      } else {
        await productService.addProduct(productData)
      }

      setShowModal(false)
      setEditingProduct(null)
      resetForm()
      fetchProducts()
      fetchStats()
      alert("Producto guardado correctamente.")
    } catch (error) {
      console.error("Error saving product:", error)
      alert("Error al guardar el producto: " + error.message)
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      ...product,
      price: product.price.toString(),
      stock: product.stock.toString(),
      tags: product.tags.join(", "),
      // Convert existing image URLs to the new object format for editing
      images: product.images.map((url) => ({
        id: `img_${uniqueImageIdCounter++}_${Math.random().toString(36).substring(2, 9)}`, // Generate a new ID for existing images
        url: url,
        file: null,
        progress: 100, // Already uploaded
        error: null,
      })),
    })
    setShowModal(true)
    setCurrentImageIndex(0) // Reset carousel to first image when editing
  }

  const handleDelete = async (productId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      try {
        await productService.deleteProduct(productId)
        fetchProducts()
        fetchStats()
        alert("Producto eliminado correctamente. ")
      } catch (error) {
        console.error("Error deleting product:", error)
        alert("Error al eliminar el producto: " + error.message)
      }
    }
  }

  const handleResetData = async () => {
    if (
      window.confirm(
        "¿Estás seguro de que quieres resetear todos los datos a los originales del JSON? Esto eliminará todos los cambios realizados.",
      )
    ) {
      try {
        const success = await productService.resetToOriginal()
        if (success) {
          fetchProducts()
          fetchStats()
          alert("Datos reseteados correctamente.")
        } else {
          alert("Error al resetear los datos")
        }
      } catch (error) {
        console.error("Error resetting data:", error)
        alert("Error al resetear los datos: " + error.message)
      }
    }
  }

  const handleExportData = async () => {
    try {
      await productService.exportData()
      alert("Datos exportados correctamente.")
    } catch (error) {
      console.error("Error exporting data:", error)
      alert("Error al exportar los datos: " + error.message)
    }
  }

  const handleImportData = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (
      window.confirm(
        "¿Estás seguro de que quieres importar estos datos? Esto reemplazará todos los productos actuales.",
      )
    ) {
      try {
        await productService.importData(file)
        fetchProducts()
        fetchStats()
        alert("Datos importados correctamente.")
      } catch (error) {
        console.error("Error importing data:", error)
        alert("Error al importar los datos: " + error.message)
      }
    }

    // Reset file input
    e.target.value = ""
  }

  const resetForm = () => {
    // Revoke any remaining object URLs from the current session before resetting
    formData.images.forEach((img) => {
      if (img.file && img.url === null) {
        URL.revokeObjectURL(img.file)
      }
    })

    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      brand: "",
      stock: "",
      images: [], // Reset to empty array
      specifications: {
        material: "",
        weight: "",
        size: "",
        color: "",
        compatibility: "",
      },
      featured: false,
      active: true,
      tags: "",
    })
    setCurrentImageIndex(0) // Reset carousel index
  }

  const removeImage = (idToRemove) => {
    setFormData((prev) => {
      const updatedImages = prev.images.filter((img) => img.id !== idToRemove)
      // Revoke object URL if it was a local file not yet uploaded
      const removedImage = prev.images.find((img) => img.id === idToRemove)
      if (removedImage && removedImage.file && removedImage.url === null) {
        URL.revokeObjectURL(removedImage.file)
      }

      // Adjust currentImageIndex if the removed image was the current one,
      // or if the index is now out of bounds.
      let newIndex = currentImageIndex
      if (updatedImages.length === 0) {
        newIndex = 0 // No images left
      } else if (currentImageIndex >= updatedImages.length) {
        newIndex = Math.max(0, updatedImages.length - 1) // If last image was removed or index out of bounds
      }
      setCurrentImageIndex(newIndex) // Update the state for current image index

      return {
        ...prev,
        images: updatedImages,
      }
    })
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price)
  }

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? formData.images.length - 1 : prevIndex - 1))
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex === formData.images.length - 1 ? 0 : prevIndex + 1))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-blue-600 text-white rounded-xl p-6 mb-8">
          <h1 className="text-3xl font-bold mb-2">Panel de Administración - Persistencia en JSON</h1>

          <div className="mt-4 flex flex-wrap gap-4">
            <button
              onClick={handleExportData}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200 flex items-center gap-2"
            >
              <Download size={16} />
              Exportar Datos
            </button>

            <button
              onClick={() => importFileRef.current?.click()}
              className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors duration-200 flex items-center gap-2"
            >
              <FileUp size={16} />
              Importar Datos
            </button>

            <button
              onClick={handleResetData}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors duration-200 flex items-center gap-2"
            >
              <RotateCcw size={16} />
              Resetear a Original
            </button>

            <button
              onClick={() => setShowStats(!showStats)}
              className="bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-600 transition-colors duration-200 flex items-center gap-2"
            >
              <BarChart3 size={16} />
              {showStats ? "Ocultar" : "Ver"} Estadísticas
            </button>
          </div>

          {/* Hidden file input for import */}
          <input type="file" ref={importFileRef} hidden accept=".json" onChange={handleImportData} />
        </div>

        {/* Stats Panel */}
        {showStats && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Estadísticas del Inventario</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalProducts}</div>
                <div className="text-sm text-gray-600">Total Productos</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{stats.activeProducts}</div>
                <div className="text-sm text-gray-600">Activos</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.featuredProducts}</div>
                <div className="text-sm text-gray-600">Destacados</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
                <div className="text-sm text-gray-600">Sin Stock</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.categories}</div>
                <div className="text-sm text-gray-600">Categorías</div>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-indigo-600">{stats.brands}</div>
                <div className="text-sm text-gray-600">Marcas</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-600">{formatPrice(stats.totalValue)}</div>
                <div className="text-sm text-gray-600">Valor Total</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <div className="text-xs font-bold text-orange-600">Última Act.</div>
                <div className="text-xs text-gray-600">{stats.lastUpdated}</div>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">Todas las categorías</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                resetForm()
                setEditingProduct(null)
                setShowModal(true)
              }}
              className="bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition-colors duration-200 flex items-center gap-2"
            >
              <Plus size={20} />
              Nuevo Producto
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gray-300 rounded-lg animate-pulse"></div>
                          <div className="ml-4">
                            <div className="h-4 bg-gray-300 rounded w-32 animate-pulse mb-2"></div>
                            <div className="h-3 bg-gray-300 rounded w-24 animate-pulse"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-300 rounded w-16 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-300 rounded w-12 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-6 bg-gray-300 rounded w-16 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <div className="h-8 w-8 bg-gray-300 rounded animate-pulse"></div>
                          <div className="h-8 w-8 bg-gray-300 rounded animate-pulse"></div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : !products || products.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No se encontraron productos
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={product.images[0] || "/placeholder.svg?height=48&width=48&query=bmx part"}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.brand}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {categories.find((cat) => cat.id === product.category)?.name || product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{formatPrice(product.price)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-sm font-medium ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-1">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              product.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {product.active ? "Activo" : "Inactivo"}
                          </span>
                          {product.featured && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Destacado
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-3 flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Mostrando {(currentPage - 1) * 20 + 1} a {Math.min(currentPage * 20, pagination.totalProducts)} de{" "}
                {pagination.totalProducts} productos
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="px-3 py-1 bg-white border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="px-3 py-1 bg-white border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal - Same as before but with better error handling */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  {editingProduct ? "Editar Producto" : "Nuevo Producto"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Marca</label>
                        <input
                          type="text"
                          value={formData.brand}
                          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          required
                        >
                          <option value="">Seleccionar categoría</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Precio</label>
                          <input
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            required
                            min="0"
                            step="0.01"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                          <input
                            type="number"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            required
                            min="0"
                          />
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.active}
                            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                            className="mr-2"
                          />
                          Producto activo
                        </label>
                      </div>
                    </div>

                    {/* Images and Specs */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Imágenes del Producto</label>
                        <div className="space-y-4">
                          {formData.images.length > 0 ? (
                            <div className="relative border border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center">
                              {/* Carousel Navigation */}
                              {formData.images.length > 1 && (
                                <>
                                  <button
                                    type="button"
                                    onClick={handlePrevImage}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 z-10"
                                  >
                                    <ChevronLeft size={20} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleNextImage}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 z-10"
                                  >
                                    <ChevronRight size={20} />
                                  </button>
                                </>
                              )}

                              {/* Current Image Display */}
                              {formData.images[currentImageIndex] && (
                                <div className="space-y-4 w-full">
                                  <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-medium text-gray-700">
                                      Imagen {currentImageIndex + 1} de {formData.images.length}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => removeImage(formData.images[currentImageIndex].id)}
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      <X size={16} />
                                    </button>
                                  </div>

                                  {/* Preview de imagen */}
                                  <div className="mb-3 flex items-center justify-center w-full max-h-64 overflow-hidden">
                                    <img
                                      src={
                                        formData.images[currentImageIndex].url ||
                                        (formData.images[currentImageIndex].file
                                          ? URL.createObjectURL(formData.images[currentImageIndex].file)
                                          : "/placeholder.svg")
                                      }
                                      alt={`Preview ${currentImageIndex + 1}`}
                                      className="max-h-64 w-auto object-contain rounded-lg border"
                                    />
                                  </div>

                                  {/* Botón de subida o estado */}
                                  <div className="space-y-2">
                                    {formData.images[currentImageIndex].progress !== null &&
                                    formData.images[currentImageIndex].progress < 100 &&
                                    !formData.images[currentImageIndex].error ? (
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-blue-600">
                                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                          <span className="text-sm">
                                            Subiendo: {formData.images[currentImageIndex].progress}%
                                          </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                          <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${formData.images[currentImageIndex].progress}%` }}
                                          ></div>
                                        </div>
                                      </div>
                                    ) : formData.images[currentImageIndex].error ? (
                                      <div className="flex items-center gap-2 text-red-600">
                                        <AlertCircle size={16} />
                                        <span className="text-sm">{formData.images[currentImageIndex].error}</span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2 text-green-600">
                                        <CheckCircle size={16} />
                                        <span className="text-sm">Subida completa</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Carousel Indicators */}
                              {formData.images.length > 1 && (
                                <div className="flex justify-center gap-2 mt-4">
                                  {formData.images.map((_, idx) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => setCurrentImageIndex(idx)}
                                      className={`w-2 h-2 rounded-full ${
                                        idx === currentImageIndex ? "bg-yellow-500" : "bg-gray-300"
                                      }`}
                                      aria-label={`Go to image ${idx + 1}`}
                                    ></button>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="border border-gray-200 rounded-lg p-4 text-center text-gray-500">
                              No hay imágenes seleccionadas.
                            </div>
                          )}

                          {/* Hidden file input for multiple selection */}
                          <input
                            type="file"
                            ref={fileInputRef}
                            hidden
                            accept="image/*"
                            multiple // Allow multiple file selection
                            onChange={handleFileSelect}
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-yellow-500 hover:text-yellow-600 flex items-center justify-center gap-2"
                          >
                            <ImageIcon size={20} />
                            Subir Imágenes
                          </button>
                        </div>
                      </div>

                      {/* Specifications */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Especificaciones</label>
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Tamaño"
                            value={formData.specifications.size}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                specifications: { ...formData.specifications, size: e.target.value },
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          />
                          <input
                            type="text"
                            placeholder="Color"
                            value={formData.specifications.color}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                specifications: { ...formData.specifications, color: e.target.value },
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-4 pt-6 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false)
                        setEditingProduct(null)
                        resetForm()
                      }}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={formData.images.some((img) => img.progress < 100 && img.error === null)}
                      className="px-6 py-2 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {formData.images.some((img) => img.progress < 100 && img.error === null)
                        ? "Subiendo imágenes..."
                        : editingProduct
                          ? "Actualizar"
                          : "Crear"}{" "}
                      Producto
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
