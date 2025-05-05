"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useAudio } from "@/hooks/use-audio"

const themes = [
  {
    id: "default",
    name: "Default",
    colors: {
      primary: "from-purple-600 to-pink-600",
      secondary: "bg-gray-800",
      accent: "bg-purple-500",
    },
    preview: "/themes/default.png",
  },
  {
    id: "dark",
    name: "Dark Mode",
    colors: {
      primary: "from-blue-600 to-indigo-600",
      secondary: "bg-gray-900",
      accent: "bg-blue-500",
    },
    preview: "/themes/dark.png",
  },
  {
    id: "light",
    name: "Light Mode",
    colors: {
      primary: "from-pink-500 to-orange-400",
      secondary: "bg-white",
      accent: "bg-pink-500",
    },
    preview: "/themes/light.png",
  },
  {
    id: "superhero",
    name: "Superhero",
    colors: {
      primary: "from-red-600 to-yellow-500",
      secondary: "bg-blue-900",
      accent: "bg-red-500",
    },
    preview: "/themes/superhero.png",
  },
  {
    id: "neon",
    name: "Neon",
    colors: {
      primary: "from-green-400 to-cyan-500",
      secondary: "bg-gray-900",
      accent: "bg-green-500",
    },
    preview: "/themes/neon.png",
  },
  {
    id: "retro",
    name: "Retro",
    colors: {
      primary: "from-amber-500 to-red-500",
      secondary: "bg-slate-800",
      accent: "bg-amber-500",
    },
    preview: "/themes/retro.png",
  },
]

export default function ThemeSelector({ currentTheme, onSelectTheme, onClose }) {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme || "default")
  const { playSound } = useAudio()

  const handleSelectTheme = (themeId) => {
    setSelectedTheme(themeId)
    playSound("button")
  }

  const handleApplyTheme = async () => {
    onSelectTheme(selectedTheme)
    playSound("success")
    onClose()
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full p-6"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Select Theme</h2>
          <button
            onClick={() => {
              playSound("button")
              onClose()
            }}
            className="text-gray-400 hover:text-white"
          >
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
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {themes.map((theme) => (
            <div
              key={theme.id}
              onClick={() => handleSelectTheme(theme.id)}
              className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                selectedTheme === theme.id ? "border-purple-500 scale-105" : "border-gray-700 hover:border-gray-500"
              }`}
            >
              <div className="aspect-video bg-gray-700 flex items-center justify-center overflow-hidden">
                <img
                  src={theme.preview || "/placeholder.svg?height=150&width=300"}
                  alt={theme.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-2 flex justify-between items-center">
                <span className="font-medium">{theme.name}</span>
                {selectedTheme === theme.id && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-purple-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={() => {
              playSound("button")
              onClose()
            }}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApplyTheme}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Apply Theme
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
