"use client"

const ErrorModal = ({ isOpen, onClose, title, message, type = "error" }) => {
  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )
      case "warning":
        return (
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
        )
      default:
        return (
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
        )
    }
  }

  const getColors = () => {
    switch (type) {
      case "success":
        return {
          button: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
          border: "border-green-200",
        }
      case "warning":
        return {
          button: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
          border: "border-yellow-200",
        }
      default:
        return {
          button: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
          border: "border-red-200",
        }
    }
  }

  const colors = getColors()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className={`bg-white rounded-lg max-w-md w-full p-6 border-2 ${colors.border}`}>
        <div className="text-center">
          {getIcon()}

          <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>

          <div className="mt-2">
            <p className="text-sm text-gray-500 whitespace-pre-line">{message}</p>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={onClose}
              className={`w-full inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm ${colors.button}`}
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ErrorModal
