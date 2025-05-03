"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { useAudio } from "@/hooks/use-audio"
import AvatarSelector from "../lobby/avatar-selector"

export default function UserProfileModal({ user, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    username: user.username || "",
    avatarId: user.avatarId || 1,
    customAvatar: user.customAvatar || null,
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [useCustomAvatar, setUseCustomAvatar] = useState(!!user.customAvatar)
  const fileInputRef = useRef(null)
  const { playSound } = useAudio()

  useEffect(() => {
    setFormData({
      username: user.username || "",
      avatarId: user.avatarId || 1,
      customAvatar: user.customAvatar || null,
    })
    setUseCustomAvatar(!!user.customAvatar)
  }, [user])

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
      setLoading(true)
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setFormData((prev) => ({ ...prev, customAvatar: data.url }))
        playSound("success")
      } else {
        setError(data.error || "Failed to upload image")
        playSound("error")
      }
    } catch (err) {
      setError("Error uploading image")
      playSound("error")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const profileData = {
        username: formData.username,
      }

      if (useCustomAvatar) {
        profileData.customAvatar = formData.customAvatar
        profileData.avatarId = null
      } else {
        profileData.avatarId = formData.avatarId
        profileData.customAvatar = null
      }

      const response = await fetch(`/api/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: profileData }),
      })

      if (response.ok) {
        setSuccess("Profile updated successfully!")
        playSound("success")

        // Get updated user data
        const userResponse = await fetch(`/api/users/${user._id}`)
        const userData = await userResponse.json()

        if (userResponse.ok && onUpdate) {
          onUpdate(userData.user)
        }
      } else {
        const data = await response.json()
        setError(data.error || "Failed to update profile")
        playSound("error")
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
          <h2 className="text-2xl font-bold">User Profile</h2>
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

        {success && (
          <div className="bg-green-900/50 border border-green-500 text-green-100 px-4 py-2 rounded mb-4">{success}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={user.email}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white opacity-70"
              disabled
            />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="useCustomAvatar"
              checked={useCustomAvatar}
              onChange={() => setUseCustomAvatar(!useCustomAvatar)}
              className="rounded text-purple-500 focus:ring-purple-500"
            />
            <label htmlFor="useCustomAvatar" className="text-sm">
              Use custom avatar
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
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
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

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                playSound("button")
                onClose()
              }}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 border-t border-gray-700 pt-4">
          <h3 className="text-lg font-semibold mb-2">Game Statistics</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-700 p-2 rounded">
              <p className="text-sm text-gray-400">Games Played</p>
              <p className="text-xl font-bold">{user.stats?.gamesPlayed || 0}</p>
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <p className="text-sm text-gray-400">Wins</p>
              <p className="text-xl font-bold">{user.stats?.wins || 0}</p>
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <p className="text-sm text-gray-400">Win Rate</p>
              <p className="text-xl font-bold">
                {user.stats?.gamesPlayed ? `${Math.round((user.stats.wins / user.stats.gamesPlayed) * 100)}%` : "0%"}
              </p>
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <p className="text-sm text-gray-400">Favorite Hero</p>
              <p className="text-xl font-bold">{user.stats?.favoriteHero || "None"}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
