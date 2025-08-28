"use client"

import { useState } from "react"
import { Truck, Calculator, MapPin, Package } from "lucide-react"

export default function ShippingCalculator({ product }) {
  const [postalCode, setPostalCode] = useState("")
  const [shippingCost, setShippingCost] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Mock shipping calculation - In production, this would call Andreani API
  const calculateShipping = async () => {
    if (!postalCode || postalCode.length < 4) {
      setError("Por favor ingresa un código postal válido")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock shipping calculation based on postal code
      const baseShipping = 2500
      const distanceMultiplier = getDistanceMultiplier(postalCode)
      const weightMultiplier = getWeightMultiplier(product.category)

      const calculatedCost = Math.round(baseShipping * distanceMultiplier * weightMultiplier)

      setShippingCost({
        cost: calculatedCost,
        estimatedDays: getEstimatedDays(postalCode),
        service: "Andreani Estándar",
      })
    } catch (err) {
      setError("Error al calcular el envío. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const getDistanceMultiplier = (cp) => {
    // Mock distance calculation based on postal code ranges
    const firstDigit = Number.parseInt(cp.charAt(0))
    switch (firstDigit) {
      case 1:
        return 1.0 // CABA/GBA
      case 2:
        return 1.2 // Buenos Aires interior
      case 3:
        return 1.4 // Entre Ríos, Santa Fe, Córdoba
      case 4:
        return 1.6 // Mendoza, San Luis, La Pampa
      case 5:
        return 1.8 // Norte (Salta, Jujuy, etc.)
      case 8:
        return 2.0 // Patagonia
      case 9:
        return 2.2 // Patagonia Sur
      default:
        return 1.3
    }
  }

  const getWeightMultiplier = (category) => {
    // Different categories have different shipping costs
    const weightMap = {
      "complete-bikes": 1.5,
      frames: 1.3,
      rims: 1.2,
      tires: 1.1,
      handlebars: 1.1,
      seats: 1.0,
      pedals: 0.9,
      grips: 0.8,
    }
    return weightMap[category] || 1.0
  }

  const getEstimatedDays = (cp) => {
    const firstDigit = Number.parseInt(cp.charAt(0))
    if (firstDigit === 1) return "1-2 días hábiles"
    if (firstDigit <= 3) return "2-4 días hábiles"
    if (firstDigit <= 5) return "3-5 días hábiles"
    return "4-7 días hábiles"
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price)
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      calculateShipping()
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="text-yellow-500" size={20} />
        <h3 className="text-lg font-bold text-gray-800">Calculá tu envío</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
            Código Postal de destino
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                id="postalCode"
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                onKeyPress={handleKeyPress}
                placeholder="Ej: 1425"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                maxLength={4}
              />
            </div>
            <button
              onClick={calculateShipping}
              disabled={loading || !postalCode}
              className="px-4 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Truck size={16} />
              )}
              {loading ? "Calculando..." : "Calcular"}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {shippingCost && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Package className="text-green-600" size={16} />
              <span className="font-semibold text-green-800">Costo de envío calculado</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Servicio:</span>
                <span className="font-medium text-gray-800">{shippingCost.service}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Costo:</span>
                <span className="font-bold text-green-700 text-lg">{formatPrice(shippingCost.cost)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Tiempo estimado:</span>
                <span className="font-medium text-gray-800">{shippingCost.estimatedDays}</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-green-200">
              <div className="flex justify-between items-center font-bold">
                <span className="text-gray-800">Total (Producto + Envío):</span>
                <span className="text-xl text-gray-900">{formatPrice(product.price + shippingCost.cost)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-blue-700 text-sm">
            Los envíos se realizan a través de Andreani. El cálculo es estimativo y puede
            variar según el peso y dimensiones exactas del producto.
          </p>
        </div>
      </div>
    </div>
  )
}
