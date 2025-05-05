"use client"

import { motion, AnimatePresence } from "framer-motion"
import Card from "./card"

export default function PlayerHand({
  player,
  isCurrentPlayer,
  isLocalPlayer,
  onCardSelect,
  gameStarted,
  winner,
  hand,
  isSpectator,
}) {
  if (!player) return null

  return (
    <motion.div
      className={`p-4 rounded-lg border-2 bg-gray-800 ${isCurrentPlayer ? "border-green-500" : "border-gray-700"}`}
      animate={{
        boxShadow: isCurrentPlayer ? "0 0 15px rgba(72, 187, 120, 0.5)" : "0 0 0px rgba(0, 0, 0, 0)",
      }}
      transition={{ duration: 0.5, repeat: isCurrentPlayer ? Number.POSITIVE_INFINITY : 0, repeatType: "reverse" }}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-2">
          <motion.div
            className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden"
            whileHover={{ scale: 1.1 }}
          >
            <img
              src={`/avatars/avatar-${player.avatarId}.png`}
              alt={player.name}
              className="w-full h-full object-cover"
            />
          </motion.div>
          <h3 className="text-xl font-bold">
            {player.name} {isLocalPlayer && "(You)"}
          </h3>
        </div>
        {isCurrentPlayer && !winner && (
          <motion.span
            className="text-green-500 font-bold"
            initial={{ opacity: 0.5, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
          >
            Your turn!
          </motion.span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <AnimatePresence>
          {(isLocalPlayer || isSpectator) && hand
            ? hand.map((card, index) => (
                <motion.div
                  key={`${card.hero}-${card.points}-${index}`}
                  initial={{ opacity: 0, y: 20, rotateY: 180 }}
                  animate={{ opacity: 1, y: 0, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.5, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={
                    isLocalPlayer && isCurrentPlayer && gameStarted && !winner && !isSpectator
                      ? { y: -10, scale: 1.05 }
                      : {}
                  }
                >
                  <Card
                    card={card}
                    onClick={() =>
                      isLocalPlayer && isCurrentPlayer && gameStarted && !winner && !isSpectator
                        ? onCardSelect(index)
                        : null
                    }
                    selectable={isLocalPlayer && isCurrentPlayer && gameStarted && !winner && !isSpectator}
                    customDesign={player.customCardDesign}
                  />
                </motion.div>
              ))
            : // Show card backs for other players
              Array(player.handSize || 0)
                .fill()
                .map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <motion.div
                      className="bg-gradient-to-br from-blue-800 to-purple-800 rounded-lg h-32 flex items-center justify-center text-white shadow-md border border-blue-700"
                      whileHover={{ scale: 1.03 }}
                    >
                      <motion.div
                        className="transform rotate-45 text-xl font-bold text-blue-300 opacity-50"
                        animate={{
                          rotate: [45, 50, 45, 40, 45],
                          scale: [1, 1.05, 1, 0.95, 1],
                        }}
                        transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                      >
                        S
                      </motion.div>
                    </motion.div>
                  </motion.div>
                ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
