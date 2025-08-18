"use client"

import { useEffect } from "react"

const SEOHead = ({
  title = "Laucha BMX Store - Repuestos y Accesorios BMX Argentina",
  description = "Tienda especializada en repuestos y accesorios BMX en Argentina. Rims, cuadros, asientos, manubrios y más. Envíos a todo el país con Andreani.",
  keywords = "BMX, repuestos BMX, accesorios BMX, rims BMX, cuadros BMX, asientos BMX, manubrios BMX, Argentina, tienda BMX",
  image = "/LauchaBmxStore-logosinfondo.png",
  url = "https://lauchaBMXstore.com",
  type = "website",
}) => {
  useEffect(() => {
    // Update document title
    document.title = title

    // Update meta tags
    const updateMetaTag = (name, content, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`
      let meta = document.querySelector(selector)
      if (!meta) {
        meta = document.createElement("meta")
        if (property) {
          meta.setAttribute("property", name)
        } else {
          meta.setAttribute("name", name)
        }
        document.head.appendChild(meta)
      }
      meta.setAttribute("content", content)
    }

    // Update basic meta tags
    updateMetaTag("description", description)
    updateMetaTag("keywords", keywords)

    // Update Open Graph tags
    updateMetaTag("og:title", title, true)
    updateMetaTag("og:description", description, true)
    updateMetaTag("og:image", `${window.location.origin}${image}`, true)
    updateMetaTag("og:url", url, true)
    updateMetaTag("og:type", type, true)

    // Update Twitter tags
    updateMetaTag("twitter:title", title, true)
    updateMetaTag("twitter:description", description, true)
    updateMetaTag("twitter:image", `${window.location.origin}${image}`, true)
    updateMetaTag("twitter:url", url, true)

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement("link")
      canonical.setAttribute("rel", "canonical")
      document.head.appendChild(canonical)
    }
    canonical.setAttribute("href", url)
  }, [title, description, keywords, image, url, type])

  return null
}

export default SEOHead
