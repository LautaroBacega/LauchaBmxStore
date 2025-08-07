"use client"

import { useState, useEffect, useRef } from "react"
import { Plus, Edit, Trash2, Search, Upload, X, ImageIcon, Download } from 'lucide-react'
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage"
import { app } from "../firebase"
import { productService } from "../services/productService"

export default function AdminPanel() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [pagination, setPagination] = useState({})
  const [currentPage, setCurrentPage] = useState(1)

  // Estados para manejo de imágenes
  const [uploadingImages, setUploadingImages] = useState({})
  const [imageErrors, setImageErrors] = useState({})
  const fileInputRefs = useRef([])

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    brand: "",
    stock: "",
    images: [""],
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
    fetchProducts()
  }, [currentPage, searchTerm, selectedCategory])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const filters = {
        page: currentPage,
        limit: 20,
        search: searchTerm,
        category: selectedCategory,
      }

      const data = await productService.getProducts(filters)
      setProducts(data.products)
      setPagination(data.pagination)
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  // Función para subir imagen a Firebase
  const handleImageUpload = async (file, imageIndex) => {
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setImageErrors(prev => ({
        ...prev,
        [imageIndex]: 'Solo se permiten archivos de imagen'
      }))
      return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageErrors(prev => ({
        ...prev,
        [imageIndex]: 'La imagen debe ser menor a 5MB'
      }))
      return
    }

    try {
      setUploadingImages(prev => ({ ...prev, [imageIndex]: { progress: 0, uploading: true } }))
      setImageErrors(prev => ({ ...prev, [imageIndex]: null }))

      const storage = getStorage(app)
      const fileName = `products/${Date.now()}_${imageIndex}_${file.name}`
      const storageRef = ref(storage, fileName)
      const uploadTask = uploadBytesResumable(storageRef, file)

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          setUploadingImages(prev => ({
            ...prev,
            [imageIndex]: { progress: Math.round(progress), uploading: true }
          }))
        },
        (error) => {
          console.error("Error uploading image:", error)
          setImageErrors(prev => ({
            ...prev,
            [imageIndex]: 'Error al subir la imagen'
          }))
          setUploadingImages(prev => ({ ...prev, [imageIndex]: null }))
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            const newImages = [...formData.images]
            newImages[imageIndex] = downloadURL
            setFormData({ ...formData, images: newImages })
            setUploadingImages(prev => ({ ...prev, [imageIndex]: null }))
          })
        }
      )
    } catch (error) {
      console.error("Error uploading image:", error)
      setImageErrors(prev => ({
        ...prev,
        [imageIndex]: 'Error al subir la imagen'
      }))
      setUploadingImages(prev => ({ ...prev, [imageIndex]: null }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Verificar que no hay subidas en progreso
    const hasUploading = Object.values(uploadingImages).some(upload => upload?.uploading)
    if (hasUploading) {
      alert("Espera a que terminen de subirse todas las imágenes")
      return
    }

    try {
      const productData = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        tags: formData.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        images: formData.images.filter(Boolean),
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
    } catch (error) {
      console.error("Error saving product:", error)
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      ...product,
      price: product.price.toString(),
      stock: product.stock.toString(),
      tags: product.tags.join(", "),
    })
    setShowModal(true)
  }

  const handleDelete = async (productId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      try {
        await productService.deleteProduct(productId)
        fetchProducts()
      } catch (error) {
        console.error("Error deleting product:", error)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      brand: "",
      stock: "",
      images: [""],
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
    setUploadingImages({})
    setImageErrors({})
    fileInputRefs.current = []
  }

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images]
    newImages[index] = value
    setFormData({ ...formData, images: newImages })
  }

  const addImageField = () => {
    setFormData({ ...formData, images: [...formData.images, ""] })
  }

  const removeImageField = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    setFormData({ ...formData, images: newImages })
    
    // Limpiar estados relacionados con esta imagen
    setUploadingImages(prev => {
      const newState = { ...prev }
      delete newState[index]
      return newState
    })
    setImageErrors(prev => {
      const newState = { ...prev }
      delete newState[index]
      return newState
    })
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-blue-600 text-white rounded-xl p-6 mb-8">
          <h1 className="text-3xl font-bold mb-2">Panel de Administración - Solo Frontend</h1>
          <p className="text-blue-100">✨ Gestión de productos con Firebase Storage y archivos JSON locales</p>
          <div className="mt-4 flex gap-4">
            <button
              onClick={() => productService.saveProducts()}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200 flex items-center gap-2"
            >
              <Download size={16} />
              Descargar JSON actualizado
            </button>
          </div>
        </div>

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
                          className={`text-sm font-medium ${
                            product.stock > 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-1">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              product.active
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
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
                Mostrando {(currentPage - 1) * 20 + 1} a{" "}
                {Math.min(currentPage * 20, pagination.totalProducts)} de {pagination.totalProducts} productos
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

        {/* Modal */}
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

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tags (separados por coma)</label>
                        <input
                          type="text"
                          value={formData.tags}
                          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          placeholder="bmx, freestyle, street"
                        />
                      </div>

                      <div className="flex gap-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.featured}
                            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                            className="mr-2"
                          />
                          Producto destacado
                        </label>

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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Imágenes del Producto
                        </label>
                        <div className="space-y-4">
                          {formData.images.map((image, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-gray-700">
                                  Imagen {index + 1}
                                </span>
                                {formData.images.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeImageField(index)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <X size={16} />
                                  </button>
                                )}
                              </div>

                              {/* Preview de imagen */}
                              {image && (
                                <div className="mb-3">
                                  <img
                                    src={image || "/placeholder.svg"}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-32 object-cover rounded-lg border"
                                  />
                                </div>
                              )}

                              {/* Input file oculto */}
                              <input
                                type="file"
                                ref={(el) => (fileInputRefs.current[index] = el)}
                                hidden
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files[0]
                                  if (file) {
                                    handleImageUpload(file, index)
                                  }
                                }}
                              />

                              {/* Botón de subida o estado */}
                              <div className="space-y-2">
                                {uploadingImages[index]?.uploading ? (
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-blue-600">
                                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                      <span className="text-sm">
                                        Subiendo: {uploadingImages[index].progress}%
                                      </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${uploadingImages[index].progress}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => fileInputRefs.current[index]?.click()}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-yellow-500 hover:text-yellow-600 transition-colors duration-200"
                                  >
                                    <Upload size={20} />
                                    {image ? "Cambiar imagen" : "Subir imagen"}
                                  </button>
                                )}

                                {/* Error de imagen */}
                                {imageErrors[index] && (
                                  <p className="text-red-600 text-sm">{imageErrors[index]}</p>
                                )}

                                {/* Input manual de URL (opcional) */}
                                <div className="text-center text-gray-500 text-xs">o</div>
                                <input
                                  type="url"
                                  value={image}
                                  onChange={(e) => handleImageChange(index, e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                                  placeholder="https://ejemplo.com/imagen.jpg"
                                />
                              </div>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={addImageField}
                            className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 flex items-center justify-center gap-2"
                          >
                            <ImageIcon size={20} />
                            Agregar otra imagen
                          </button>
                        </div>
                      </div>

                      {/* Specifications */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Especificaciones</label>
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Material"
                            value={formData.specifications.material}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                specifications: { ...formData.specifications, material: e.target.value },
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          />
                          <input
                            type="text"
                            placeholder="Peso"
                            value={formData.specifications.weight}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                specifications: { ...formData.specifications, weight: e.target.value },
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          />
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
                          <input
                            type="text"
                            placeholder="Compatibilidad"
                            value={formData.specifications.compatibility}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                specifications: { ...formData.specifications, compatibility: e.target.value },
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
                      disabled={Object.values(uploadingImages).some(upload => upload?.uploading)}
                      className="px-6 py-2 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {Object.values(uploadingImages).some(upload => upload?.uploading) 
                        ? "Subiendo imágenes..." 
                        : editingProduct ? "Actualizar" : "Crear"} Producto
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
