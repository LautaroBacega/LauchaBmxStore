"use client"

import { useEffect } from "react"

const ProductStructuredData = ({ product }) => {
  useEffect(() => {
    if (!product) return

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.description,
      brand: {
        "@type": "Brand",
        name: product.brand || "Laucha BMX Store",
      },
      category: product.category,
      image:
        product.images && product.images.length > 0
          ? product.images.map((img) => `${window.location.origin}${img}`)
          : [`${window.location.origin}/no-image-placeholder.png`],
      offers: {
        "@type": "Offer",
        price: product.price,
        priceCurrency: "ARS",
        availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        seller: {
          "@type": "Organization",
          name: "Laucha BMX Store",
        },
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.5",
        reviewCount: "12",
      },
    }

    // Remove existing structured data
    const existingScript = document.querySelector("script[data-product-structured-data]")
    if (existingScript) {
      existingScript.remove()
    }

    // Add new structured data
    const script = document.createElement("script")
    script.type = "application/ld+json"
    script.setAttribute("data-product-structured-data", "true")
    script.textContent = JSON.stringify(structuredData)
    document.head.appendChild(script)

    return () => {
      const scriptToRemove = document.querySelector("script[data-product-structured-data]")
      if (scriptToRemove) {
        scriptToRemove.remove()
      }
    }
  }, [product])

  return null
}

export default ProductStructuredData
