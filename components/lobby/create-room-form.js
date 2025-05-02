"use client"

import { useState } from "react"

export default function CreateRoomForm({ onCreateRoom }) {
  const [roomName, setRoomName] = useState("")
  const [maxPlayers, setMaxPlayers] = useState("4")
  const [turnDuration, setTurnDuration] = useState("30")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (roomName.trim()) {
      onCreateRoom(roomName, maxPlayers, turnDuration)
      setRoomName("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Room Name</label>
        <input
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
          placeholder="Enter room name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Max Players</label>
        <select
          value={maxPlayers}
          onChange={(e) => setMaxPlayers(e.target.value)}
          className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
        >
          <option value="2">2 Players</option>
          <option value="3">3 Players</option>
          <option value="4">4 Players</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Turn Duration (seconds)</label>
        <select
          value={turnDuration}
          onChange={(e) => setTurnDuration(e.target.value)}
          className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
        >
          <option value="15">15 seconds</option>
          <option value="30">30 seconds</option>
          <option value="45">45 seconds</option>
          <option value="60">60 seconds</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={!roomName.trim()}
        className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Create Room
      </button>
    </form>
  )
}
