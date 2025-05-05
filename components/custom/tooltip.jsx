"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

export function Tooltip({ children, content, position = "top" }) {
  const [isVisible, setIsVisible] = useState(false)

  const positions = {
    top: "bottom-full mb-2",
    bottom: "top-full mt-2",
    left: "right-full mr-2",
    right: "left-full ml-2",
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`absolute z-50 ${positions[position]} px-2 py-1 text-xs bg-gray-900 text-white rounded whitespace-nowrap`}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
