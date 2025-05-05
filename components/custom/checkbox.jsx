export function Checkbox({ label, id, className = "", ...props }) {
    return (
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id={id}
          className={`rounded text-purple-500 focus:ring-purple-500 bg-gray-700 border-gray-600 ${className}`}
          {...props}
        />
        {label && (
          <label htmlFor={id} className="text-sm">
            {label}
          </label>
        )}
      </div>
    )
  }
  