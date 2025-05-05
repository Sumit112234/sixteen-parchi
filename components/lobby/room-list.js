"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../custom/button"

export default function RoomList({ rooms, onJoinRoom, playerInfo }) {
  if (rooms.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8 text-gray-400">
        <motion.p initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          No game rooms available. Create one to get started!
        </motion.p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {rooms.map((room, index) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors border border-gray-600"
            whileHover={{ scale: 1.01, borderColor: "#9333ea" }}
          >
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h3 className="font-bold text-lg">{room.name}</h3>
                <div className="flex flex-wrap gap-2 text-sm text-gray-300">
                  <span>
                    Players: {room.players.length}/{room.maxPlayers}
                  </span>
                  <span>• Turn Duration: {room.turnDuration || 30}s</span>
                  <span>• Created by: {room.createdBy.name}</span>
                  {room.gameStarted && <span className="text-yellow-400">• Game in progress</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => onJoinRoom(room.id)}
                  disabled={
                    room.players.length >= room.maxPlayers ||
                    room.players.some((p) => p.id === playerInfo.id) ||
                    room.gameStarted
                  }
                  variant={
                    room.gameStarted
                      ? "secondary"
                      : room.players.length >= room.maxPlayers
                        ? "outline"
                        : room.players.some((p) => p.id === playerInfo.id)
                          ? "outline"
                          : "primary"
                  }
                >
                  {room.gameStarted
                    ? "Game in Progress"
                    : room.players.length >= room.maxPlayers
                      ? "Room Full"
                      : room.players.some((p) => p.id === playerInfo.id)
                        ? "Already Joined"
                        : "Join Room"}
                </Button>

                {room.gameStarted && (
                  <Button
                    onClick={() => onJoinRoom(room.id, true)}
                    disabled={room.spectators && room.spectators.some((s) => s.id === playerInfo.id)}
                    variant="secondary"
                  >
                    {room.spectators && room.spectators.some((s) => s.id === playerInfo.id)
                      ? "Already Spectating"
                      : "Spectate"}
                  </Button>
                )}
              </div>
            </div>

            {room.players.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-2"
              >
                <p className="text-xs text-gray-400 mb-1">Players:</p>
                <div className="flex flex-wrap gap-2">
                  {room.players.map((player) => (
                    <motion.div
                      key={player.id}
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center bg-gray-800 rounded-full px-2 py-1"
                      title={player.name}
                    >
                      <div className="w-6 h-6 rounded-full bg-gray-800 border-2 border-gray-600 flex items-center justify-center overflow-hidden mr-1">
                        <img
                          src={`/avatars/avatar-${player.avatarId}.png`}
                          alt={player.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-xs">{player.name}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {room.spectators && room.spectators.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-2"
              >
                <p className="text-xs text-gray-400 mb-1">Spectators: {room.spectators.length}</p>
                <div className="flex -space-x-2">
                  {room.spectators.map((spectator) => (
                    <motion.div
                      key={spectator.id}
                      whileHover={{ scale: 1.1, zIndex: 10 }}
                      className="w-6 h-6 rounded-full bg-gray-800 border-2 border-gray-600 flex items-center justify-center overflow-hidden"
                      title={spectator.name}
                    >
                      <img
                        src={`/avatars/avatar-${spectator.avatarId}.png`}
                        alt={spectator.name}
                        className="w-full h-full object-cover opacity-70"
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
