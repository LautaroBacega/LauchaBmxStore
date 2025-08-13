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
import { getDownloadURL, getStorage, ref, uploadBytes, deleteObject } from "firebase/storage"
import { getAuth, signInAnonymously } from "firebase/auth"
import { app } from "../firebase"
import { productService } from "../services/productService"
import { isDevelopment } from "../utils/envUtils"

// Global counter for unique image IDs
let uniqueImageIdCounter = 0

// Función mejorada para eliminar imágenes de Firebase con autenticación anónima
const deleteImageFromFirebase = async (imageUrl) => {
  try {
    if (!imageUrl || !imageUrl.includes("firebase")) {
      console.log("⚠️ URL no válida o no es de Firebase:", imageUrl)
      return
    }

    // Asegurar autenticación anónima
    const auth = getAuth(app)
    if (!auth.currentUser) {
      console.log("🔐 Autenticando anónimamente para eliminar imagen...")
      await signInAnonymously(auth)
    }

    console.log("✅ Usuario autenticado:", auth.currentUser.uid)

    const storage = getStorage(app)
    // Extraer el path de la URL de Firebase
    const urlParts = imageUrl.split("/o/")[1]
    if (!urlParts) {
      console.log("⚠️ No se pudo extraer el path de la URL:", imageUrl)
      return
    }

    const imagePath = decodeURIComponent(urlParts.split("?")[0])
    const imageRef = ref(storage, imagePath)

    await deleteObject(imageRef)
    console.log("✅ Imagen eliminada de Firebase:", imagePath)
  } catch (error) {
    if (error.code === "storage/unauthorized") {
      console.warn("⚠️ Sin permisos para eliminar imagen de Firebase:", imageUrl)
      console.warn("💡 Verifica las reglas de Firebase Storage")
    } else if (error.code === "storage/object-not-found") {
      console.log("ℹ️ La imagen ya no existe en Firebase:", imageUrl)
    } else {
      console.error("❌ Error eliminando imagen de Firebase:", error)
    }
  }
}

// Función para inicializar autenticación anónima
const initializeFirebaseAuth = async () => {
  try {
    const auth = getAuth(app)
    if (!auth.currentUser) {
      console.log("🔐 Iniciando autenticación anónima...")
      await signInAnonymously(auth)
      console.log("✅ Autenticación anónima exitosa:", auth.currentUser.uid)
    } else {
      console.log("✅ Usuario ya autenticado:", auth.currentUser.uid)
    }
  } catch (error) {
    console.error("❌ Error en autenticación anónima:", error)
  }
}

export default function AdminPanel() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [pagination, setPagination] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [stats, setStats] = useState({})
  const [showStats, setShowStats] = useState(false)
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")

  // Estados para manejo de imágenes
  const fileInputRef = useRef(null)
  const importFileRef = useRef(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    brand: "",
    stock: "",
    images: [],
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

  // Estados para especificaciones dinámicas
  const [customSpecs, setCustomSpecs] = useState([])
  const [newSpecName, setNewSpecName] = useState("")
  const [newSpecValue, setNewSpecValue] = useState("")

  const [dynamicSpecs, setDynamicSpecs] = useState([])

  const categories = [
    { id: "complete-bikes", name: "Bicicletas Completas", value: "complete-bikes", label: "Bicicletas Completas" },
    { id: "rims", name: "Aros", value: "rims", label: "Aros" },
    { id: "seats", name: "Asientos", value: "seats", label: "Asientos" },
    { id: "bottom-brackets", name: "Cajas", value: "bottom-brackets", label: "Cajas" },
    { id: "tires", name: "Cubiertas", value: "tires", label: "Cubiertas" },
    { id: "frames", name: "Cuadros", value: "frames", label: "Cuadros" },
    { id: "brakes", name: "Frenos", value: "brakes", label: "Frenos" },
    { id: "forks", name: "Horquillas", value: "forks", label: "Horquillas" },
    { id: "headsets", name: "Juegos de Dirección", value: "headsets", label: "Juegos de Dirección" },
    { id: "front-hubs", name: "Mazas Delanteras", value: "front-hubs", label: "Mazas Delanteras" },
    { id: "rear-hubs", name: "Mazas Traseras", value: "rear-hubs", label: "Mazas Traseras" },
    { id: "handlebars", name: "Manubrios", value: "handlebars", label: "Manubrios" },
    { id: "levers", name: "Palancas", value: "levers", label: "Palancas" },
    { id: "pedals", name: "Pedales", value: "pedals", label: "Pedales" },
    { id: "posts", name: "Postes", value: "posts", label: "Postes" },
    { id: "grips", name: "Puños", value: "grips", label: "Puños" },
    { id: "spokes", name: "Rayos", value: "spokes", label: "Rayos" },
    { id: "stems", name: "Stems", value: "stems", label: "Stems" },
  ]

  useEffect(() => {
    if (isDevelopment) {
      // Inicializar autenticación al cargar el componente
      initializeFirebaseAuth()
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

  // Bloquear scroll cuando el modal está abierto
  useEffect(() => {
    if (showModal) {
      // Guardar la posición actual del scroll
      const scrollY = window.scrollY
      document.body.style.position = "fixed"
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = "100%"
      document.body.style.overflow = "hidden"
    } else {
      // Restaurar el scroll
      const scrollY = document.body.style.top
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.width = ""
      document.body.style.overflow = ""
      if (scrollY) {
        window.scrollTo(0, Number.parseInt(scrollY || "0") * -1)
      }
    }

    // Cleanup al desmontar el componente
    return () => {
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.width = ""
      document.body.style.overflow = ""
    }
  }, [showModal])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      const filters = {
        page: currentPage,
        limit: 20,
        search: searchTerm,
        category: selectedCategory,
        active: undefined,
      }

      const data = await productService.getAllProductsAdmin(filters)
      setProducts(data.products)
      setPagination(data.pagination)
    } catch (error) {
      console.error("Error fetching products:", error)
      // Mostrar un mensaje más específico según el tipo de error
      if (error.message.includes("ECONNREFUSED")) {
        alert("Error: El servidor backend no está corriendo. Por favor, inicia el servidor API.")
      } else {
        setError("Error al cargar productos: " + error.message)
      }
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
      // No mostrar alert para estadísticas, solo log
      setStats({
        totalProducts: 0,
        activeProducts: 0,
        featuredProducts: 0,
        outOfStock: 0,
        categories: 0,
        brands: 0,
        totalValue: 0,
        lastUpdated: "Error",
      })
    }
  }

  // Function to upload a single image to Firebase - OPTIMIZADA
  const uploadFileToFirebase = async (fileObject) => {
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

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setFormData((prev) => ({
        ...prev,
        images: prev.images.map((img) =>
          img.id === tempId ? { ...img, error: "La imagen debe ser menor a 10MB" } : img,
        ),
      }))
      return
    }

    try {
      // Asegurar autenticación antes de subir
      await initializeFirebaseAuth()

      // Mostrar progreso inmediatamente
      setFormData((prev) => ({
        ...prev,
        images: prev.images.map((img) => (img.id === tempId ? { ...img, progress: 10 } : img)),
      }))

      const storage = getStorage(app)
      const fileName = `products/${Date.now()}_${tempId}_${file.name}`
      const storageRef = ref(storage, fileName)

      // Usar uploadBytes en lugar de uploadBytesResumable para mayor velocidad
      setFormData((prev) => ({
        ...prev,
        images: prev.images.map((img) => (img.id === tempId ? { ...img, progress: 50 } : img)),
      }))

      await uploadBytes(storageRef, file)

      setFormData((prev) => ({
        ...prev,
        images: prev.images.map((img) => (img.id === tempId ? { ...img, progress: 80 } : img)),
      }))

      const downloadURL = await getDownloadURL(storageRef)

      setFormData((prev) => ({
        ...prev,
        images: prev.images.map((img) =>
          img.id === tempId ? { ...img, url: downloadURL, file: null, progress: 100 } : img,
        ),
      }))
    } catch (error) {
      console.error("Error uploading image:", error)
      setFormData((prev) => ({
        ...prev,
        images: prev.images.map((img) => (img.id === tempId ? { ...img, error: "Error al subir la imagen" } : img)),
      }))
    }
  }

  // Handle multiple file selection - OPTIMIZADO
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    const newImageObjects = files.map((file) => {
      return {
        id: `img_${uniqueImageIdCounter++}_${Math.random().toString(36).substring(2, 9)}`,
        url: null,
        file: file,
        progress: 0,
        error: null,
      }
    })

    setFormData((prev) => {
      const updatedImages = [...prev.images, ...newImageObjects]
      setCurrentImageIndex(updatedImages.length - 1)
      return {
        ...prev,
        images: updatedImages,
      }
    })

    // Subir todas las imágenes en paralelo para mayor velocidad
    const uploadPromises = newImageObjects.map((fileObject) => uploadFileToFirebase(fileObject))

    try {
      await Promise.all(uploadPromises)
    } catch (error) {
      console.error("Error uploading some images:", error)
    }

    e.target.value = ""
  }

  const addSpecification = () => {
    setDynamicSpecs([...dynamicSpecs, { key: "", value: "", id: Date.now() + Math.random() }])
  }

  const updateSpecification = (id, field, value) => {
    setDynamicSpecs(dynamicSpecs.map((spec) => (spec.id === id ? { ...spec, [field]: value } : spec)))
  }

  const removeSpecification = (id) => {
    setDynamicSpecs(dynamicSpecs.filter((spec) => spec.id !== id))
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
      // Convertir especificaciones dinámicas a objeto
      const specifications = {}
      dynamicSpecs.forEach((spec) => {
        if (spec.key.trim() && spec.value.trim()) {
          specifications[spec.key.trim()] = spec.value.trim()
        }
      })

      const productData = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        images: formData.images.map((img) => img.url).filter(Boolean),
        specifications, // Usar especificaciones dinámicas
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
      if (error.message.includes("ECONNREFUSED")) {
        alert("Error: El servidor backend no está corriendo. Por favor, inicia el servidor API.")
      } else {
        alert("Error al guardar el producto: " + error.message)
      }
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)

    // Convertir especificaciones a formato dinámico
    const specs = Object.entries(product.specifications || {})
      .filter(([key, value]) => value && value.trim() !== "")
      .map(([key, value]) => ({ key, value, id: Date.now() + Math.random() }))

    setDynamicSpecs(specs)

    setFormData({
      ...product,
      price: product.price.toString(),
      stock: product.stock.toString(),
      tags: product.tags.join(", "),
      images: product.images.map((url) => ({
        id: `img_${uniqueImageIdCounter++}_${Math.random().toString(36).substring(2, 9)}`,
        url: url,
        file: null,
        progress: 100,
        error: null,
      })),
      specifications: {}, // Limpiar especificaciones fijas
    })
    setShowModal(true)
    setCurrentImageIndex(0)
  }

  const handleDelete = async (productId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      try {
        // Encontrar el producto para obtener sus imágenes
        const productToDelete = products.find((p) => p.id === productId)

        // Eliminar el producto del backend primero
        await productService.deleteProduct(productId)

        // Intentar eliminar imágenes de Firebase (sin bloquear si falla)
        if (productToDelete && productToDelete.images) {
          // Ejecutar eliminación de imágenes en paralelo sin esperar
          productToDelete.images.forEach((imageUrl) => {
            deleteImageFromFirebase(imageUrl).catch((error) => {
              // Error ya manejado en la función deleteImageFromFirebase
            })
          })
        }

        // Actualizar la UI inmediatamente
        fetchProducts()
        fetchStats()
        alert("Producto eliminado correctamente.")
      } catch (error) {
        console.error("Error deleting product:", error)
        if (error.message.includes("ECONNREFUSED")) {
          alert("Error: El servidor backend no está corriendo. Por favor, inicia el servidor API.")
        } else {
          alert("Error al eliminar el producto: " + error.message)
        }
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
        if (error.message.includes("ECONNREFUSED")) {
          alert("Error: El servidor backend no está corriendo. Por favor, inicia el servidor API.")
        } else {
          alert("Error al resetear los datos: " + error.message)
        }
      }
    }
  }

  const handleExportData = async () => {
    try {
      await productService.exportData()
      alert("Datos exportados correctamente.")
    } catch (error) {
      console.error("Error exporting data:", error)
      if (error.message.includes("ECONNREFUSED")) {
        alert("Error: El servidor backend no está corriendo. Por favor, inicia el servidor API.")
      } else {
        alert("Error al exportar los datos: " + error.message)
      }
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
        if (error.message.includes("ECONNREFUSED")) {
          alert("Error: El servidor backend no está corriendo. Por favor, inicia el servidor API.")
        } else {
          alert("Error al importar los datos: " + error.message)
        }
      }
    }

    e.target.value = ""
  }

  const resetForm = () => {
    // Eliminar imágenes de Firebase que no se guardaron (sin bloquear)
    formData.images.forEach((img) => {
      if (img.url && img.file) {
        deleteImageFromFirebase(img.url).catch(() => {})
      }
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
      images: [],
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
    setCurrentImageIndex(0)
    setDynamicSpecs([])
  }

  const removeImage = async (idToRemove) => {
    setFormData((prev) => {
      const imageToRemove = prev.images.find((img) => img.id === idToRemove)
      const updatedImages = prev.images.filter((img) => img.id !== idToRemove)

      // Eliminar de Firebase si ya se subió (sin bloquear)
      if (imageToRemove && imageToRemove.url) {
        deleteImageFromFirebase(imageToRemove.url).catch(() => {})
      }

      // Revoke object URL if it was a local file not yet uploaded
      if (imageToRemove && imageToRemove.file && imageToRemove.url === null) {
        URL.revokeObjectURL(imageToRemove.file)
      }

      // Adjust currentImageIndex
      let newIndex = currentImageIndex
      if (updatedImages.length === 0) {
        newIndex = 0
      } else if (currentImageIndex >= updatedImages.length) {
        newIndex = Math.max(0, updatedImages.length - 1)
      }
      setCurrentImageIndex(newIndex)

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

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        category: product.category || "",
        brand: product.brand || "",
        stock: product.stock?.toString() || "",
        featured: product.featured || false,
        images: product.images || [],
        specifications: product.specifications || {},
        tags: product.tags || [],
      })

      // Convertir especificaciones a formato editable
      const specs = Object.entries(product.specifications || {}).map(([name, value]) => ({
        name,
        value,
        id: Math.random().toString(36).substr(2, 9),
      }))
      setCustomSpecs(specs)
    } else {
      resetForm()
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    resetForm()
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images]
    newImages[index] = value
    setFormData((prev) => ({ ...prev, images: newImages }))
  }

  const addImage = () => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ""],
    }))
  }

  const removeImage2 = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    setFormData((prev) => ({ ...prev, images: newImages }))
  }

  const addCustomSpec = () => {
    if (newSpecName.trim() && newSpecValue.trim()) {
      const newSpec = {
        name: newSpecName.trim(),
        value: newSpecValue.trim(),
        id: Math.random().toString(36).substr(2, 9),
      }
      setCustomSpecs((prev) => [...prev, newSpec])
      setNewSpecName("")
      setNewSpecValue("")
    }
  }

  const removeCustomSpec = (id) => {
    setCustomSpecs((prev) => prev.filter((spec) => spec.id !== id))
  }

  const updateCustomSpec = (id, field, value) => {
    setCustomSpecs((prev) => prev.map((spec) => (spec.id === id ? { ...spec, [field]: value } : spec)))
  }

  const handleTagsChange = (e) => {
    const tags = e.target.value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag)
    setFormData((prev) => ({ ...prev, tags }))
  }

  const handleSubmit2 = async (e) => {
    e.preventDefault()

    try {
      // Convertir especificaciones personalizadas a objeto
      const specifications = {}
      customSpecs.forEach((spec) => {
        if (spec.name.trim() && spec.value.trim()) {
          specifications[spec.name.trim()] = spec.value.trim()
        }
      })

      const productData = {
        ...formData,
        price: Number.parseFloat(formData.price),
        stock: Number.parseInt(formData.stock),
        images: formData.images.filter((img) => img.trim()),
        specifications,
      }

      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, productData)
      } else {
        await productService.createProduct(productData)
      }

      await fetchProducts()
      closeModal()
    } catch (error) {
      console.error("Error saving product:", error)
      setError("Error al guardar producto: " + error.message)
    }
  }

  const handleDelete2 = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      try {
        await productService.deleteProduct(id)
        await fetchProducts()
      } catch (error) {
        console.error("Error deleting product:", error)
        setError("Error al eliminar producto: " + error.message)
      }
    }
  }

  const handleExport = async () => {
    try {
      const blob = await productService.exportProducts()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "products.json"
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error exporting products:", error)
      setError("Error al exportar productos: " + error.message)
    }
  }

  const handleImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      await productService.importProducts(file)
      await fetchProducts()
      e.target.value = ""
    } catch (error) {
      console.error("Error importing products:", error)
      setError("Error al importar productos: " + error.message)
    }
  }

  const handleReset = async () => {
    if (
      window.confirm("¿Estás seguro de que quieres resetear todos los productos? Esta acción no se puede deshacer.")
    ) {
      try {
        await productService.resetProducts()
        await fetchProducts()
      } catch (error) {
        console.error("Error resetting products:", error)
        setError("Error al resetear productos: " + error.message)
      }
    }
  }

  const formatPrice2 = (price) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price)
  }

  const getCategoryLabel = (categoryValue) => {
    const category = categories.find((cat) => cat.value === categoryValue)
    return category ? category.label : categoryValue
  }

  // Filtrar y ordenar productos
  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = !selectedCategory || product.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]

      if (sortBy === "price") {
        aValue = Number.parseFloat(aValue)
        bValue = Number.parseFloat(bValue)
      } else if (sortBy === "name") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  // Mostrar mensaje si no está en desarrollo
  if (!isDevelopment) {
    return (
      <div className="min-h-screen bg-gray-50 py-24 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Panel de Administración</h1>
            <p className="text-gray-600 mb-6">El panel de administración solo está disponible en modo desarrollo.</p>
            <p className="text-sm text-gray-500">
              Para acceder, ejecuta la aplicación en modo desarrollo con el servidor backend corriendo.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gray-50 py-24 ${showModal ? "overflow-hidden" : ""}`}>
      {/* Contenido principal con efecto blur cuando el modal está abierto */}
      <div className={`transition-all duration-300 ${showModal ? "blur-sm" : ""}`}>
        {/* Todo el contenido existente va aquí */}
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="bg-blue-600 text-white rounded-xl p-6 mb-8">
            <h1 className="text-3xl font-bold mb-2">Panel de Administración - Persistencia en JSON</h1>
            <p className="text-blue-100 mb-4">
              Asegúrate de que el servidor backend esté corriendo en el puerto configurado.
            </p>

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

              <button
                onClick={initializeFirebaseAuth}
                className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors duration-200 flex items-center gap-2"
              >
                🔐 Inicializar Auth
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
                  <div className="text-2xl font-bold text-blue-600">{stats.totalProducts || 0}</div>
                  <div className="text-sm text-gray-600">Total Productos</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.activeProducts || 0}</div>
                  <div className="text-sm text-gray-600">Activos</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.featuredProducts || 0}</div>
                  <div className="text-sm text-gray-600">Destacados</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.outOfStock || 0}</div>
                  <div className="text-sm text-gray-600">Sin Stock</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.categories || 0}</div>
                  <div className="text-sm text-gray-600">Categorías</div>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-indigo-600">{stats.brands || 0}</div>
                  <div className="text-sm text-gray-600">Marcas</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-600">{formatPrice(stats.totalValue || 0)}</div>
                  <div className="text-sm text-gray-600">Valor Total</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <div className="text-xs font-bold text-orange-600">Última Act.</div>
                  <div className="text-xs text-gray-600">{stats.lastUpdated || "N/A"}</div>
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
        </div>
      </div>

      {/* Modal permanece fuera del div con blur */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
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
                          multiple
                          onChange={handleFileSelect}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-yellow-500 hover:text-yellow-600 flex items-center justify-center gap-2"
                        >
                          <ImageIcon size={20} />
                          Subir Imágenes (Optimizado)
                        </button>
                      </div>
                    </div>

                    {/* Specifications - Dinámicas */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Especificaciones</label>
                      <div className="space-y-3">
                        {dynamicSpecs.map((spec) => (
                          <div key={spec.id} className="flex gap-2 items-center">
                            <input
                              type="text"
                              placeholder="Nombre (ej: Color)"
                              value={spec.key}
                              onChange={(e) => updateSpecification(spec.id, "key", e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            />
                            <input
                              type="text"
                              placeholder="Valor (ej: Negro)"
                              value={spec.value}
                              onChange={(e) => updateSpecification(spec.id, "value", e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            />
                            <button
                              type="button"
                              onClick={() => removeSpecification(spec.id)}
                              className="text-red-600 hover:text-red-800 p-2"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addSpecification}
                          className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-yellow-500 hover:text-yellow-600 flex items-center justify-center gap-2"
                        >
                          <Plus size={16} />
                          Agregar Especificación
                        </button>
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
  )
}
