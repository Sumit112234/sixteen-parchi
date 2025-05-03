"use client"

import { motion } from "framer-motion"
import { useState, useRef } from "react"

export default function AvatarSelector({ selectedAvatar, onSelectAvatar }) {
  // We'll have 8 avatar options
  const avatarCount = 8
  const [customAvatar, setCustomAvatar] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setCustomAvatar(data.url)
        onSelectAvatar(null, data.url) // Pass custom avatar URL to parent
      } else {
        console.error("Failed to upload image:", data.error)
      }
    } catch (err) {
      console.error("Error uploading image:", err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-2">Select Your Avatar</label>
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: avatarCount }).map((_, index) => {
          const avatarId = index + 1
          return (
            <motion.div
              key={avatarId}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                onSelectAvatar(avatarId)
                setCustomAvatar(null)
              }}
              className={`
                cursor-pointer rounded-lg p-1 border-2 
                ${
                  selectedAvatar === avatarId && !customAvatar
                    ? "border-purple-500 bg-purple-900/30"
                    : "border-gray-600 hover:border-gray-400"
                }
              `}
            >
              <div className="w-full aspect-square rounded overflow-hidden">
                <img
                  src={`/avatars/avatar-${avatarId}.jpg`}
                  alt={`Avatar ${avatarId}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          )
        })}

        {/* Custom avatar upload option */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => fileInputRef.current?.click()}
          className={`
            cursor-pointer rounded-lg p-1 border-2 
            ${customAvatar ? "border-purple-500 bg-purple-900/30" : "border-gray-600 hover:border-gray-400"}
          `}
        >
          <div className="w-full aspect-square rounded overflow-hidden bg-gray-700 flex items-center justify-center">
            {uploading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
            ) : customAvatar ? (
              <img
                src={customAvatar || "/placeholder.svg"}
                alt="Custom avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </motion.div>
      </div>
    </div>
  )
}
