"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../custom/button"
import { Input } from "../custom/input"
import { Select } from "../custom/select"
import { Checkbox } from "../custom/checkbox"

export default function CreateRoomForm({ onCreateRoom }) {
  const [roomName, setRoomName] = useState("")
  const [maxPlayers, setMaxPlayers] = useState("4")
  const [turnDuration, setTurnDuration] = useState("30")
  const [includeAI, setIncludeAI] = useState(false)
  const [aiDifficulty, setAiDifficulty] = useState("medium")
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (roomName.trim()) {
      onCreateRoom(roomName, maxPlayers, turnDuration, includeAI, aiDifficulty)
      setRoomName("")
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
        <label className="block text-sm font-medium mb-1">Room Name</label>
        <Input
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="Enter room name"
        />
      </motion.div>

      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
        <label className="block text-sm font-medium mb-1">Max Players</label>
        <Select value={maxPlayers} onChange={(e) => setMaxPlayers(e.target.value)}>
          <option value="2">2 Players</option>
          <option value="3">3 Players</option>
          <option value="4">4 Players</option>
        </Select>
      </motion.div>

      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
        <Checkbox
          id="showAdvanced"
          checked={showAdvanced}
          onChange={() => setShowAdvanced(!showAdvanced)}
          label="Show advanced options"
        />
      </motion.div>

      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-4 overflow-hidden"
          >
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
              <label className="block text-sm font-medium mb-1">Turn Duration (seconds)</label>
              <Select value={turnDuration} onChange={(e) => setTurnDuration(e.target.value)}>
                <option value="15">15 seconds</option>
                <option value="30">30 seconds</option>
                <option value="45">45 seconds</option>
                <option value="60">60 seconds</option>
              </Select>
            </motion.div>

            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
              <Checkbox
                id="includeAI"
                checked={includeAI}
                onChange={() => setIncludeAI(!includeAI)}
                label="Include AI opponent"
              />
            </motion.div>

            <AnimatePresence>
              {includeAI && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <label className="block text-sm font-medium mb-1">AI Difficulty</label>
                  <Select value={aiDifficulty} onChange={(e) => setAiDifficulty(e.target.value)}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </Select>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
        <Button type="submit" disabled={!roomName.trim()} className="w-full">
          Create Room
        </Button>
      </motion.div>
    </motion.form>
  )
}
