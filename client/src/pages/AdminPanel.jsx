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
  AlertCircle,
  Camera,
} from "lucide-react"
import { getDownloadURL, getStorage, ref, deleteObject, uploadBytesResumable } from "firebase/storage"
import { getAuth, signInAnonymously } from "firebase/auth"
import { app } from "../firebase"
import { productService } from "../services/productService"
import { isDevelopment } from "../utils/envUtils"
import ErrorModal from "../components/ErrorModal"

// Global counter for unique image IDs
let uniqueImageIdCounter = 0

// Función mejorada para eliminar imágenes de Firebase con autenticación anónima
const deleteImageFromFirebase = async (imageUrl) => {
  try {
    if (!imageUrl || !imageUrl.includes("firebase")) {
      return
    }

    // Asegurar autenticación anónima
    const auth = getAuth(app)
    if (!auth.currentUser) {
      await signInAnonymously(auth)
    }

    const storage = getStorage(app)
    // Extraer el path de la URL de Firebase
    const urlParts = imageUrl.split("/o/")[1]
    if (!urlParts) {
      return
    }

    const imagePath = decodeURIComponent(urlParts.split("?")[0])
    const imageRef = ref(storage, imagePath)

    await deleteObject(imageRef)
  } catch (error) {
    if (error.code === "storage/unauthorized") {
      console.warn("Sin permisos para eliminar imagen de Firebase:", imageUrl)
    } else if (error.code === "storage/object-not-found") {
      // La imagen ya no existe, no es un error crítico
    } else {
      console.error("Error eliminando imagen de Firebase:", error)
    }
  }
}

// Función para inicializar autenticación anónima
const initializeFirebaseAuth = async () => {
  try {
    const auth = getAuth(app)
    if (!auth.currentUser) {
      await signInAnonymously(auth)
    }
  } catch (error) {
    console.error("Error en autenticación anónima:", error)
  }
}

const compressImage = (file, maxWidth = 800, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio

      // Draw and compress
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      canvas.toBlob(resolve, "image/jpeg", quality)
    }

    img.src = URL.createObjectURL(file)
  })
}

const AdminPanel = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModalState, setShowModalState] = useState(false)
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
    {
      id: "Bicicletas Completas",
      name: "Bicicletas Completas",
      value: "Bicicletas Completa",
      label: "Bicicletas Completas",
    },
    { id: "Aros", name: "Aros", value: "Aros", label: "Aros" },
    { id: "Asientos", name: "Asientos", value: "Asientos", label: "Asientos" },
    { id: "Cajas", name: "Cajas", value: "Cajas", label: "Cajas" },
    { id: "Cubiertas", name: "Cubiertas", value: "Cubiertas", label: "Cubiertas" },
    { id: "Cuadros", name: "Cuadros", value: "Cuadros", label: "Cuadros" },
    { id: "Frenos", name: "Frenos", value: "brakes", label: "Frenos" },
    { id: "Horquillas", name: "Horquillas", value: "Horquillas", label: "Horquillas" },
    {
      id: "Juegos de Dirección",
      name: "Juegos de Dirección",
      value: "Juegos de Dirección",
      label: "Juegos de Dirección",
    },
    { id: "Mazas Delanteras", name: "Mazas Delanteras", value: "Mazas Delanteras", label: "Mazas Delanteras" },
    { id: "Mazas Traseras", name: "Mazas Traseras", value: "Mazas Traseras", label: "Mazas Traseras" },
    { id: "Manubrios", name: "Manubrios", value: "Manubrios", label: "Manubrios" },
    { id: "Palancas", name: "Palancas", value: "Palancas", label: "Palancas" },
    { id: "Pedales", name: "Pedales", value: "Pedales", label: "Pedales" },
    { id: "Platos", name: "Platos", value: "Platos", label: "Platos" },
    { id: "Postes", name: "Postes", value: "Postes", label: "Postes" },
    { id: "Puños", name: "Puños", value: "Puños", label: "Puños" },
    { id: "Rayos", name: "Rayos", value: "Rayos", label: "Rayos" },
    { id: "Stems", name: "Stems", value: "Stems", label: "Stems" },
  ]

  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "error",
  })

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)

  const openErrorModal = (title, message, type = "error") => {
    setErrorModal({
      isOpen: true,
      title,
      message,
      type,
    })
  }

  const closeModalErrorModal = () => {
    setErrorModal({
      isOpen: false,
      title: "",
      message: "",
      type: "error",
    })
    if (errorModal.type === "success") {
      setShowEditModal(false)
      setShowModalState(false)
      setEditingProduct(null)
      resetForm()
    }
  }

  useEffect(() => {
    if (isDevelopment) {
      // Inicializar autenticación al cargar el componente
      initializeFirebaseAuth()
      fetchProducts()
      fetchStats()
    }
  }, [currentPage, searchTerm, selectedCategory, sortBy, sortOrder])

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
    if (showModalState) {
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
  }, [showModalState])

  const fetchProducts = async (filters = {}) => {
    setLoading(true)
    setError(null)
    try {
      const completeFilters = {
        page: currentPage,
        limit: 12,
        search: searchTerm,
        category: selectedCategory,
        sortBy,
        sortOrder,
        ...filters,
      }

      const data = await productService.getAllProductsAdmin(completeFilters)
      setProducts(data.products)
      setPagination(data.pagination)
    } catch (error) {
      console.error("Error fetching products:", error)
      if (error.message.includes("ECONNREFUSED")) {
        openErrorModal(
          "Error de Conexión",
          "El servidor backend no está corriendo.\nPor favor, inicia el servidor API.",
          "error",
        )
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

    if (file.size > 5 * 1024 * 1024) {
      setFormData((prev) => ({
        ...prev,
        images: prev.images.map((img) =>
          img.id === tempId ? { ...img, error: "La imagen debe ser menor a 5MB" } : img,
        ),
      }))
      return
    }

    try {
      setFormData((prev) => ({
        ...prev,
        images: prev.images.map((img) =>
          img.id === tempId ? { ...img, progress: 5, status: "Comprimiendo..." } : img,
        ),
      }))

      const compressedFile = await compressImage(file)

      setFormData((prev) => ({
        ...prev,
        images: prev.images.map((img) => (img.id === tempId ? { ...img, progress: 10, status: "Subiendo..." } : img)),
      }))

      const storage = getStorage(app)
      const fileName = `products/${Date.now()}_${tempId}_${file.name}`
      const storageRef = ref(storage, fileName)

      const uploadTask = uploadBytesResumable(storageRef, compressedFile)

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          uploadTask.cancel()
          reject(new Error("Upload timeout"))
        }, 30000) // 30 second timeout

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
            setFormData((prev) => ({
              ...prev,
              images: prev.images.map((img) =>
                img.id === tempId ? { ...img, progress, status: `Subiendo... ${progress}%` } : img,
              ),
            }))
          },
          (error) => {
            clearTimeout(timeout)
            console.error("Error uploading image:", error)
            setFormData((prev) => ({
              ...prev,
              images: prev.images.map((img) =>
                img.id === tempId ? { ...img, error: "Error al subir la imagen", status: "Error" } : img,
              ),
            }))
            reject(error)
          },
          async () => {
            clearTimeout(timeout)
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
              setFormData((prev) => ({
                ...prev,
                images: prev.images.map((img) =>
                  img.id === tempId
                    ? { ...img, url: downloadURL, file: null, progress: 100, status: "Completado" }
                    : img,
                ),
              }))
              resolve(downloadURL)
            } catch (error) {
              reject(error)
            }
          },
        )
      })
    } catch (error) {
      console.error("Error uploading image:", error)
      setFormData((prev) => ({
        ...prev,
        images: prev.images.map((img) =>
          img.id === tempId ? { ...img, error: "Error al subir la imagen", status: "Error" } : img,
        ),
      }))
    }
  }

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    if (files.length > 5) {
      alert("Máximo 5 imágenes por vez para mejor rendimiento")
      return
    }

    const newImageObjects = files.map((file) => {
      return {
        id: `img_${uniqueImageIdCounter++}_${Math.random().toString(36).substring(2, 9)}`,
        url: null,
        file: file,
        progress: 0,
        error: null,
        status: "Esperando...",
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

    const uploadInBatches = async (imageObjects, batchSize = 2) => {
      for (let i = 0; i < imageObjects.length; i += batchSize) {
        const batch = imageObjects.slice(i, i + batchSize)
        const batchPromises = batch.map((fileObject) => uploadFileToFirebase(fileObject))

        try {
          await Promise.all(batchPromises)
          // Small delay between batches to prevent overwhelming Firebase
          if (i + batchSize < imageObjects.length) {
            await new Promise((resolve) => setTimeout(resolve, 500))
          }
        } catch (error) {
          console.error("Error uploading batch:", error)
        }
      }
    }

    await uploadInBatches(newImageObjects)
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

  const handleDelete = async (productId) => {
    const product = products.find((p) => p.id === productId)
    setProductToDelete(product)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!productToDelete) return

    try {
      // Eliminar el producto del backend primero
      await productService.deleteProduct(productToDelete.id)

      // Intentar eliminar imágenes de Firebase (sin bloquear si falla)
      if (productToDelete.images) {
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
      setShowDeleteModal(false)
      setProductToDelete(null)
      openErrorModal("Éxito", "Producto eliminado correctamente.", "success")
    } catch (error) {
      console.error("Error deleting product:", error)
      setShowDeleteModal(false)
      setProductToDelete(null)
      if (error.message.includes("ECONNREFUSED")) {
        openErrorModal(
          "Error de Conexión",
          "El servidor backend no está corriendo.\nPor favor, inicia el servidor API.",
          "error",
        )
      } else {
        openErrorModal("Error", "Error al eliminar el producto:\n" + error.message, "error")
      }
    }
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

      resetForm()
      fetchProducts()
      fetchStats()
      openErrorModal("Éxito", "Producto guardado correctamente.", "success")
    } catch (error) {
      console.error("Error saving product:", error)
      if (error.message.includes("ECONNREFUSED")) {
        openErrorModal(
          "Error de Conexión",
          "El servidor backend no está corriendo.\nPor favor, inicia el servidor API.",
          "error",
        )
      } else {
        openErrorModal("Error", "Error al guardar el producto:\n" + error.message, "error")
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
    setShowModalState(true)
    setCurrentImageIndex(0)
  }

  const handleResetData = async () => {
    if (window.confirm("¿Estás seguro de que quieres resetear todos los datos? Esta acción no se puede deshacer.")) {
      try {
        const result = await productService.resetData()
        if (result.success) {
          fetchProducts()
          fetchStats()
          openErrorModal("Éxito", "Datos reseteados correctamente.", "success")
        } else {
          openErrorModal("Error", "Error al resetear los datos", "error")
        }
      } catch (error) {
        console.error("Error resetting data:", error)
        if (error.message.includes("ECONNREFUSED")) {
          openErrorModal(
            "Error de Conexión",
            "El servidor backend no está corriendo.\nPor favor, inicia el servidor API.",
            "error",
          )
        } else {
          openErrorModal("Error", "Error al resetear los datos:\n" + error.message, "error")
        }
      }
    }
  }

  const handleExportData = async () => {
    try {
      await productService.exportData()
      openErrorModal("Éxito", "Datos exportados correctamente.", "success")
    } catch (error) {
      console.error("Error exporting data:", error)
      if (error.message.includes("ECONNREFUSED")) {
        openErrorModal(
          "Error de Conexión",
          "El servidor backend no está corriendo.\nPor favor, inicia el servidor API.",
          "error",
        )
      } else {
        openErrorModal("Error", "Error al exportar los datos:\n" + error.message, "error")
      }
    }
  }

  const handleImportData = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      await productService.importData(file)
      fetchProducts()
      fetchStats()
      openErrorModal("Éxito", "Datos importados correctamente.", "success")
    } catch (error) {
      console.error("Error importing data:", error)
      if (error.message.includes("ECONNREFUSED")) {
        openErrorModal(
          "Error de Conexión",
          "El servidor backend no está corriendo.\nPor favor, inicia el servidor API.",
          "error",
        )
      } else {
        openErrorModal("Error", "Error al importar los datos:\n" + error.message, "error")
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
    setShowModalState(true)
  }

  const closeModal = () => {
    setShowModalState(false)
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
    <div className={`min-h-screen bg-gray-50 py-24 ${showModalState ? "overflow-hidden" : ""}`}>
      {/* Contenido principal con efecto blur cuando el modal está abierto */}
      <div className={`transition-all duration-300 ${showModalState ? "blur-sm" : ""}`}>
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
                  setShowModalState(true)
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
                              src={
                                product.images && product.images.length > 0
                                  ? product.images[0]
                                  : "/no-image-placeholder.png"
                              }
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover"
                              onError={(e) => {
                                e.target.src = "/no-image-placeholder.png"
                              }}
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
                  Mostrando {(currentPage - 1) * 12 + 1} a {Math.min(currentPage * 12, pagination.totalProducts)} de{" "}
                  {pagination.totalProducts} productos
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setCurrentPage(currentPage - 1)
                      setTimeout(() => {
                        const productsTableElement = document.querySelector(
                          ".bg-white.rounded-xl.shadow-lg.p-6.mb-6",
                        )
                        if (productsTableElement) {
                          productsTableElement.scrollIntoView({ behavior: "smooth", block: "start" })
                        }
                      }, 100)
                    }}
                    disabled={!pagination.hasPrev}
                    className="px-3 py-1 bg-white border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => {
                      setCurrentPage(currentPage + 1)
                      setTimeout(() => {
                        const productsTableElement = document.querySelector(
                          ".bg-white.rounded-xl.shadow-lg.p-6.mb-6",
                        )
                        if (productsTableElement) {
                          productsTableElement.scrollIntoView({ behavior: "smooth", block: "start" })
                        }
                      }, 100)
                    }}
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
      {showModalState && (
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
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {formData.images.map((image, index) => (
                            <div key={image.id} className="relative group">
                              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
                                {image.url ? (
                                  <img
                                    src={image.url || "/placeholder.svg"}
                                    alt={`Product ${index + 1}`}
                                    className="w-full h-full object-cover cursor-pointer"
                                    onClick={() => setCurrentImageIndex(index)}
                                    onError={(e) => {
                                      e.target.src = "/no-image-placeholder.png"
                                    }}
                                  />
                                ) : image.file ? (
                                  <div className="w-full h-full flex flex-col items-center justify-center p-4">
                                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                                    <div className="text-xs text-center text-gray-600 mb-1">
                                      {image.status || "Procesando..."}
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${image.progress}%` }}
                                      ></div>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">{image.progress}%</div>
                                  </div>
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Camera className="w-8 h-8 text-gray-400" />
                                  </div>
                                )}
                              </div>

                              {image.error && (
                                <div className="absolute inset-0 bg-red-50 border-2 border-red-300 rounded-lg flex items-center justify-center">
                                  <div className="text-center p-2">
                                    <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-1" />
                                    <p className="text-xs text-red-600">{image.error}</p>
                                  </div>
                                </div>
                              )}

                              {image.url && (
                                <button
                                  type="button"
                                  onClick={() => removeImage(image.id)}
                                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

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
                      setShowModalState(false)
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

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertCircle className="text-red-500 mr-3" size={24} />
              <h3 className="text-lg font-semibold">Confirmar Eliminación</h3>
            </div>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres eliminar el producto "{productToDelete?.name}"? Esta acción no se puede
              deshacer.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setProductToDelete(null)
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={closeModalErrorModal}
        title={errorModal.title}
        message={errorModal.message}
        type={errorModal.type}
      />
    </div>
  )
}

export default AdminPanel
