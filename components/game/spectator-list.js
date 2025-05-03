"use client"

import { motion } from "framer-motion"

export default function SpectatorList({ spectators }) {
  if (!spectators || spectators.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 p-3 rounded-lg border border-gray-700"
    >
      <h3 className="text-sm font-medium mb-2">Spectators ({spectators.length})</h3>
      <div className="flex flex-wrap gap-2">
        {spectators.map((spectator) => (
          <div
            key={spectator.id}
            className="flex items-center bg-blue-900/30 rounded-full px-2 py-1"
            title={spectator.name}
          >
            <div className="w-5 h-5 rounded-full bg-gray-800 border border-blue-700 flex items-center justify-center overflow-hidden mr-1">
              <img
                src={`/avatars/avatar-${spectator.avatarId}.jpg`}
                alt={spectator.name}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xs text-blue-300">{spectator.name}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
