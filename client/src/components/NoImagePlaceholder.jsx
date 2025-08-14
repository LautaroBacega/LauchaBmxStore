const NoImagePlaceholder = ({ className = "", width = 80, height = 80 }) => {
  return (
    <div
      className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center ${className}`}
      style={{ width, height, minWidth: width, minHeight: height }}
    >
      <div className="text-center">
        {/* Two overlapping image icons similar to the attached image */}
        <div className="relative inline-block">
          {/* Background image icon */}
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
            <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="2" />
            <polyline points="21,15 16,10 5,21" strokeWidth="2" />
          </svg>

          {/* Overlapping front image icon */}
          <svg
            className="w-5 h-5 text-gray-500 absolute -top-1 -right-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
            <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="2" />
            <polyline points="21,15 16,10 5,21" strokeWidth="2" />
          </svg>
        </div>

        <p className="text-gray-500 text-xs mt-1">Sin imagen</p>
      </div>
    </div>
  )
}

export default NoImagePlaceholder
