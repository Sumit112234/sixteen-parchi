"use client"

import { motion } from "framer-motion"

export function Card({ children, className = "", ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gray-800 rounded-lg border border-gray-700 shadow-lg overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function CardHeader({ children, className = "", ...props }) {
  return (
    <div className={`p-4 border-b border-gray-700 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardContent({ children, className = "", ...props }) {
  return (
    <div className={`p-4 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = "", ...props }) {
  return (
    <div className={`p-4 border-t border-gray-700 ${className}`} {...props}>
      {children}
    </div>
  )
}
