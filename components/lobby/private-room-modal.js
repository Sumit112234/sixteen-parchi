"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useAudio } from "@/hooks/use-audio"

export default function PrivateRoomModal({ onCreatePrivate, onJoinPrivate, onClose }) {
  const [mode, setMode] = useState("join") // "join" or "create"
  const [roomId, setRoomId] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const { playSound } = useAudio()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!roomId.trim()) {
      setError("Room ID is required")
      playSound("error")
      return
    }

    if (!password.trim()) {
      setError("Password is required")
      playSound("error")
      return
    }

    setLoading(true)

    try {
      if (mode === "create") {
        await onCreatePrivate(roomId, password)
      } else {
        await onJoinPrivate(roomId, password)
      }
      playSound("success")
      onClose()
    } catch (error) {
      setError(error.message || "An error occurred")
      playSound("error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
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
          <h2 className="text-2xl font-bold">{mode === "create" ? "Create Private Room" : "Join Private Room"}</h2>
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

        <div className="flex border-b border-gray-700 mb-6">
          <button
            className={`px-4 py-2 ${
              mode === "join" ? "border-b-2 border-purple-500 text-purple-400" : "text-gray-400"
            }`}
            onClick={() => {
              setMode("join")
              playSound("button")
            }}
          >
            Join Room
          </button>
          <button
            className={`px-4 py-2 ${
              mode === "create" ? "border-b-2 border-purple-500 text-purple-400" : "text-gray-400"
            }`}
            onClick={() => {
              setMode("create")
              playSound("button")
            }}
          >
            Create Room
          </button>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-100 px-4 py-2 rounded mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Room ID</label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
              placeholder="Enter room ID"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
              placeholder="Enter password"
              required
            />
          </div>

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
            ) : mode === "create" ? (
              "Create Private Room"
            ) : (
              "Join Private Room"
            )}
          </button>
        </form>
      </motion.div>
    </motion.div>
  )
}
