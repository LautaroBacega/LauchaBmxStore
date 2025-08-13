const NoImagePlaceholder = ({ className = "", width = 200, height = 200 }) => {
  return (
    <div
      className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center ${className}`}
      style={{ width, height }}
    >
      <div className="text-center">
        {/* Two overlapping image icons similar to the attached image */}
        <div className="relative inline-block">
          {/* Background image icon */}
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
            <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="2" />
            <polyline points="21,15 16,10 5,21" strokeWidth="2" />
          </svg>

          {/* Overlapping front image icon */}
          <svg
            className="w-10 h-10 text-gray-500 absolute -top-2 -right-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
            <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="2" />
            <polyline points="21,15 16,10 5,21" strokeWidth="2" />
          </svg>
        </div>

        <p className="text-gray-500 text-sm mt-2">Sin imagen</p>
      </div>
    </div>
  )
}

export default NoImagePlaceholder
