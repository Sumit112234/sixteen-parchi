"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../custom/button"

export default function GameStatus({ gameState, startGame, resetGame, isRoomCreator, isSpectator }) {
  const { players, gameStarted, winner, currentPlayer } = gameState

  return (
    <motion.div
      className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex justify-between items-center">
        <motion.h2
          className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text"
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          Game Status
        </motion.h2>

        {!gameStarted && players.length >= 2 && isRoomCreator && !isSpectator && (
          <Button onClick={startGame} variant="success">
            Start Game ({players.length}/{Math.max(...players.map((p) => p.roomMaxPlayers || 4))} players)
          </Button>
        )}

        {winner && isRoomCreator && !isSpectator && (
          <Button onClick={resetGame} variant="primary">
            Play Again
          </Button>
        )}
      </div>

      {isSpectator && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-2 bg-blue-900/30 border border-blue-700 rounded-lg p-2 text-blue-300"
        >
          <p>You are spectating this game</p>
        </motion.div>
      )}

      {!gameStarted && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-2">
          {players.length < 2 ? (
            <p className="text-yellow-400">Waiting for more players to join... ({players.length}/2 minimum)</p>
          ) : isRoomCreator && !isSpectator ? (
            <p className="text-green-400">Ready to start the game!</p>
          ) : (
            <p className="text-blue-400">Waiting for room creator to start the game...</p>
          )}
        </motion.div>
      )}

      {gameStarted && !winner && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-2">
          <p>
            Current turn:
            <motion.span
              className="font-bold text-green-400 ml-1"
              animate={{
                color: ["#4ade80", "#22c55e", "#4ade80"],
              }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              {players.find((p) => p.id === currentPlayer)?.name || "..."}
            </motion.span>
          </p>
        </motion.div>
      )}

      <AnimatePresence>
        {winner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mt-4 p-4 bg-gradient-to-r from-yellow-500 to-amber-600 border border-yellow-400 rounded-lg text-white"
          >
            <motion.p
              className="text-xl font-bold text-center"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
            >
              {winner.name} wins with 4 {winner.winningHero} cards!
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
