"use client"

import { ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

export default function Footer() {
  const [expandedFaq, setExpandedFaq] = useState(null)

  const faqData = [
    {
      question: "¿Cómo sé el estado de las prendas?",
      answer:
        "Todas nuestras prendas son cuidadosamente inspeccionadas y clasificadas según su estado. Proporcionamos descripciones detalladas y fotos de cualquier imperfección.",
    },
    {
      question: "¿Hacen envíos?",
      answer: "Sí, realizamos envíos a todo el país. Los costos y tiempos de entrega varían según la ubicación.",
    },
    {
      question: "¿Puedo vender mi ropa?",
      answer: "¡Claro! Evaluamos tus prendas y si encajan con el estilo, las publicamos y te pagamos cuando se vendan.",
    },
  ]

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index)
  }

  return (
    <footer className="bg-stone-100">
      {/* FAQ Section */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-serif text-stone-800 mb-12">Preguntas frecuentes</h2>

          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <div key={index} className="border-b border-stone-300">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full py-6 flex items-center justify-between text-left hover:bg-stone-50 transition-colors duration-200"
                >
                  <span className="text-stone-800 font-medium text-lg">{faq.question}</span>
                  {expandedFaq === index ? (
                    <ChevronUp className="text-stone-600" size={20} />
                  ) : (
                    <ChevronDown className="text-stone-600" size={20} />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="pb-6 px-4">
                    <p className="text-stone-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="py-8 border-t border-stone-300">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-stone-600 text-sm mb-4 md:mb-0">
              © 2025 JB Ropa Usada BB. Todos los derechos reservados.
            </div>
            <div className="flex space-x-8 text-sm">
              <a href="#" className="text-stone-600 hover:text-stone-800 transition-colors duration-200">
                Catálogo
              </a>
              <a href="#" className="text-stone-600 hover:text-stone-800 transition-colors duration-200">
                Valores
              </a>
              <a href="#" className="text-stone-600 hover:text-stone-800 transition-colors duration-200">
                FAQ
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
