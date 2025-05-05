export function Select({ className = "", children, ...props }) {
    return (
      <select
        className={`w-full p-2 bg-gray-700 rounded border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${className}`}
        {...props}
      >
        {children}
      </select>
    )
  }
  