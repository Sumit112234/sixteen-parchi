"use client"

import { motion, AnimatePresence } from "framer-motion"

export default function GameStatus({ gameState, startGame, resetGame, isRoomCreator, isSpectator }) {
  const { players, gameStarted, winner, currentPlayer } = gameState

  return (
    <motion.div
      className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Game Status</h2>

        {!gameStarted && players.length >= 2 && isRoomCreator && !isSpectator && (
          <motion.button
            onClick={startGame}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-md hover:from-green-700 hover:to-teal-700 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Game ({players.length}/{Math.max(...players.map((p) => p.roomMaxPlayers || 4))} players)
          </motion.button>
        )}

        {winner && isRoomCreator && !isSpectator && (
          <motion.button
            onClick={resetGame}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md hover:from-blue-700 hover:to-indigo-700 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Play Again
          </motion.button>
        )}
      </div>

      {isSpectator && (
        <div className="mt-2 bg-blue-900/30 border border-blue-700 rounded-lg p-2 text-blue-300">
          <p>You are spectating this game</p>
        </div>
      )}

      {!gameStarted && (
        <div className="mt-2">
          {players.length < 2 ? (
            <p className="text-yellow-400">Waiting for more players to join... ({players.length}/2 minimum)</p>
          ) : isRoomCreator && !isSpectator ? (
            <p className="text-green-400">Ready to start the game!</p>
          ) : (
            <p className="text-blue-400">Waiting for room creator to start the game...</p>
          )}
        </div>
      )}

      {gameStarted && !winner && (
        <div className="mt-2">
          <p>
            Current turn:
            <span className="font-bold text-green-400 ml-1">
              {players.find((p) => p.id === currentPlayer)?.name || "..."}
            </span>
          </p>
        </div>
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
