"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import PlayerHand from "./player-hand"
import GameStatus from "./game-status"
import ChatBox from "./chat-box"
import { useAudio } from "@/hooks/use-audio"
import GameTimer from "./game-timer"
import SpectatorList from "./spectator-list"
import { Button } from "../custom/button"

export default function GameBoard({ socket, room, playerInfo, onLeaveRoom, user }) {
  const [gameState, setGameState] = useState({
    players: room.players,
    spectators: room.spectators || [],
    currentPlayer: null,
    winner: null,
    gameStarted: room.gameStarted || false,
    hand: [],
    messages: [],
    turnDuration: room.turnDuration || 30,
    turnStartTime: null,
  })

  const { playSound } = useAudio()

  useEffect(() => {
    if (!socket) return

    socket.on("gameState", (state) => {
      setGameState((prev) => ({ ...prev, ...state }))
    })

    socket.on("gameStarted", (state) => {
      setGameState((prev) => ({ ...prev, ...state, gameStarted: true }))
      playSound("gameStart")
    })

    socket.on("cardPassed", (state) => {
      setGameState((prev) => ({ ...prev, ...state }))
      playSound("cardPass")
    })

    socket.on("gameWon", ({ winner }) => {
      setGameState((prev) => ({ ...prev, winner }))
      playSound("victory")
    })

    socket.on("chatMessage", (message) => {
      setGameState((prev) => ({
        ...prev,
        messages: [...prev.messages, message],
      }))
      playSound("message")
    })

    socket.on("playerJoined", (updatedPlayers) => {
      setGameState((prev) => ({
        ...prev,
        players: updatedPlayers,
      }))
      playSound("playerJoin")
    })

    socket.on("playerLeft", (updatedPlayers) => {
      setGameState((prev) => ({
        ...prev,
        players: updatedPlayers,
      }))
      playSound("playerLeave")
    })

    socket.on("spectatorJoined", (updatedSpectators) => {
      setGameState((prev) => ({
        ...prev,
        spectators: updatedSpectators,
      }))
      playSound("playerJoin")
    })

    socket.on("spectatorLeft", (updatedSpectators) => {
      setGameState((prev) => ({
        ...prev,
        spectators: updatedSpectators,
      }))
      playSound("playerLeave")
    })

    socket.on("playerUpdated", (updatedPlayer) => {
      setGameState((prev) => ({
        ...prev,
        players: prev.players.map((p) => (p.id === updatedPlayer.id ? { ...p, ...updatedPlayer } : p)),
      }))
    })

    // Add error handling
    socket.on("error", ({ message }) => {
      // Display error message
      setGameState((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            senderId: "system",
            senderName: "System",
            senderAvatar: 1,
            text: `Error: ${message}`,
            timestamp: Date.now(),
            isError: true,
          },
        ],
      }))
      playSound("error")
    })

    // Cleanup
    return () => {
      socket.off("gameState")
      socket.off("gameStarted")
      socket.off("cardPassed")
      socket.off("gameWon")
      socket.off("chatMessage")
      socket.off("playerJoined")
      socket.off("playerLeft")
      socket.off("spectatorJoined")
      socket.off("spectatorLeft")
      socket.off("playerUpdated")
      socket.off("error")
    }
  }, [socket, playSound])

  const startGame = () => {
    socket.emit("startGame", { roomId: room.id })
  }

  const resetGame = () => {
    socket.emit("resetGame", { roomId: room.id })
  }

  const passCard = (cardIndex) => {
    if (gameState.currentPlayer === playerInfo.id) {
      socket.emit("passCard", { cardIndex, roomId: room.id })
    }
  }

  const handleTimeUp = () => {
    if (gameState.currentPlayer === playerInfo.id) {
      socket.emit("autoPassCard", { roomId: room.id })
    }
  }

  const sendMessage = (message) => {
    if (message.trim()) {
      socket.emit("sendMessage", {
        roomId: room.id,
        message,
      })
    }
  }

  // Check if the current player is a spectator
  const isSpectator = room.spectators && room.spectators.some((s) => s.id === playerInfo.id)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-4"
      >
        <motion.h2
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text"
        >
          Room: {room.name}
        </motion.h2>
        <Button onClick={onLeaveRoom} variant="danger" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          Leave Room
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <GameStatus
            gameState={gameState}
            startGame={startGame}
            resetGame={resetGame}
            isRoomCreator={room.createdBy.id === playerInfo.id}
            isSpectator={isSpectator}
          />

          {gameState.gameStarted && gameState.currentPlayer && !gameState.winner && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 mb-2"
            >
              <GameTimer
                isActive={gameState.currentPlayer === playerInfo.id}
                duration={gameState.turnDuration}
                onTimeUp={handleTimeUp}
              />
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <AnimatePresence>
              {gameState.players.map((player) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <PlayerHand
                    player={player}
                    isCurrentPlayer={gameState.currentPlayer === player.id}
                    isLocalPlayer={playerInfo.id === player.id}
                    onCardSelect={passCard}
                    gameStarted={gameState.gameStarted}
                    winner={gameState.winner}
                    hand={player.id === playerInfo.id ? gameState.hand : null}
                    isSpectator={isSpectator}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {gameState.spectators && gameState.spectators.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-4"
            >
              <SpectatorList spectators={gameState.spectators} />
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1"
        >
          <ChatBox
            messages={gameState.messages}
            onSendMessage={sendMessage}
            playerInfo={playerInfo}
            isSpectator={isSpectator}
          />
        </motion.div>
      </div>
    </motion.div>
  )
}
