"use client"

import { motion, AnimatePresence } from "framer-motion"

export function Modal({ isOpen, onClose, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function ModalHeader({ children, onClose }) {
  return (
    <div className="p-4 border-b border-gray-700 flex justify-between items-center">
      <h2 className="text-xl font-bold">{children}</h2>
      {onClose && (
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}

export function ModalContent({ children }) {
  return <div className="p-4">{children}</div>
}

export function ModalFooter({ children }) {
  return <div className="p-4 border-t border-gray-700 flex justify-end space-x-2">{children}</div>
}
