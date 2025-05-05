"use client"

import { motion } from "framer-motion"

export function Button({ children, onClick, disabled, variant = "primary", size = "md", className = "", ...props }) {
  const baseStyles = "rounded-md font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2"

  const variants = {
    primary:
      "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 focus:ring-purple-500",
    secondary: "bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    outline: "bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-700 focus:ring-gray-500",
  }

  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
    icon: "p-2",
  }

  const disabledStyles = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.03 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabledStyles} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}
