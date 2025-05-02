"use client"

import { motion } from "framer-motion"

export default function RoomList({ rooms, onJoinRoom, playerInfo }) {
  if (rooms.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>No game rooms available. Create one to get started!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {rooms.map((room, index) => (
        <motion.div
          key={room.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
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
              <button
                onClick={() => onJoinRoom(room.id)}
                disabled={
                  room.players.length >= room.maxPlayers ||
                  room.players.some((p) => p.id === playerInfo.id) ||
                  room.gameStarted
                }
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {room.gameStarted
                  ? "Game in Progress"
                  : room.players.length >= room.maxPlayers
                    ? "Room Full"
                    : room.players.some((p) => p.id === playerInfo.id)
                      ? "Already Joined"
                      : "Join Room"}
              </button>

              {room.gameStarted && (
                <button
                  onClick={() => onJoinRoom(room.id, true)}
                  disabled={room.spectators && room.spectators.some((s) => s.id === playerInfo.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {room.spectators && room.spectators.some((s) => s.id === playerInfo.id)
                    ? "Already Spectating"
                    : "Spectate"}
                </button>
              )}
            </div>
          </div>

          {room.players.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-400 mb-1">Players:</p>
              <div className="flex flex-wrap gap-2">
                {room.players.map((player) => (
                  <div
                    key={player.id}
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
                  </div>
                ))}
              </div>
            </div>
          )}

          {room.spectators && room.spectators.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-400 mb-1">Spectators: {room.spectators.length}</p>
              <div className="flex -space-x-2">
                {room.spectators.map((spectator) => (
                  <div
                    key={spectator.id}
                    className="w-6 h-6 rounded-full bg-gray-800 border-2 border-gray-600 flex items-center justify-center overflow-hidden"
                    title={spectator.name}
                  >
                    <img
                      src={`/avatars/avatar-${spectator.avatarId}.png`}
                      alt={spectator.name}
                      className="w-full h-full object-cover opacity-70"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}
