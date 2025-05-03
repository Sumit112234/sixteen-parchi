"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { useAudio } from "@/hooks/use-audio"
import AvatarSelector from "../lobby/avatar-selector"

export default function AuthModal({ onLogin, onRegister, onClose }) {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    avatarId: 1,
    customAvatar: null,
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [useCustomAvatar, setUseCustomAvatar] = useState(false)
  const fileInputRef = useRef(null)

  const { playSound } = useAudio()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAvatarSelect = (avatarId) => {
    setFormData((prev) => ({ ...prev, avatarId }))
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setFormData((prev) => ({ ...prev, customAvatar: data.url }))
      } else {
        setError(data.error || "Failed to upload image")
        playSound("error")
      }
    } catch (err) {
      setError("Error uploading image")
      playSound("error")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (isLogin) {
        // Login logic
        const response = await fetch(`/api/users?email=${encodeURIComponent(formData.email)}`)
        const data = await response.json()

        if (response.ok && data.user) {
          if (data.user.password === formData.password) {
            // In a real app, use proper password comparison
            playSound("success")
            onLogin(data.user)
          } else {
            setError("Invalid password")
            playSound("error")
          }
        } else {
          setError("User not found")
          playSound("error")
        }
      } else {
        // Register logic
        const response = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            avatarId: useCustomAvatar ? null : formData.avatarId,
          }),
        })

        const data = await response.json()

        if (response.ok) {
          // Get the newly created user
          const userResponse = await fetch(`/api/users/${data.userId}`)
          const userData = await userResponse.json()

          playSound("success")
          onRegister(userData.user)
        } else {
          setError(data.error || "Registration failed")
          playSound("error")
        }
      }
    } catch (err) {
      setError(err.message || "An error occurred")
      playSound("error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{isLogin ? "Login" : "Register"}</h2>
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

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-100 px-4 py-2 rounded mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
              required
            />
          </div>

          {!isLogin && (
            <>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="useCustomAvatar"
                  checked={useCustomAvatar}
                  onChange={() => setUseCustomAvatar(!useCustomAvatar)}
                  className="rounded text-purple-500 focus:ring-purple-500"
                />
                <label htmlFor="useCustomAvatar" className="text-sm">
                  Upload custom avatar
                </label>
              </div>

              {useCustomAvatar ? (
                <div>
                  <label className="block text-sm font-medium mb-1">Custom Avatar</label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                    >
                      Choose File
                    </button>
                    <span className="text-sm text-gray-400">
                      {formData.customAvatar ? "Image selected" : "No file chosen"}
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                  {formData.customAvatar && (
                    <div className="mt-2 flex justify-center">
                      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-purple-500">
                        <img
                          src={formData.customAvatar || "/placeholder.svg"}
                          alt="Custom avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <AvatarSelector selectedAvatar={formData.avatarId} onSelectAvatar={handleAvatarSelect} />
              )}
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : isLogin ? (
              "Login"
            ) : (
              "Register"
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin)
              playSound("button")
            }}
            className="text-purple-400 hover:text-purple-300 text-sm"
          >
            {isLogin ? "Need an account? Register" : "Already have an account? Login"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
