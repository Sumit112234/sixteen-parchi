"use client"

import { useState, useEffect } from "react"
import { io } from "socket.io-client"
import PlayerHand from "./player-hand"
import GameStatus from "./game-status"

let socket

export default function GameBoard() {
  const [gameState, setGameState] = useState({
    players: [],
    currentPlayer: null,
    winner: null,
    gameStarted: false,
    playerId: null,
    playerName: "",
    isConnected: false,
  })

  useEffect(() => {
    // Initialize socket connection
    socketInitializer()

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [])

  const socketInitializer = async () => {
    await fetch("/api/socket")

    socket = io()

    socket.on("connect", () => {
      console.log("Connected to socket server")
      setGameState((prev) => ({ ...prev, isConnected: true }))
    })

    socket.on("disconnect", () => {
      console.log("Disconnected from socket server")
      setGameState((prev) => ({ ...prev, isConnected: false }))
    })

    socket.on("gameState", (state) => {
      setGameState((prev) => ({ ...prev, ...state }))
    })

    socket.on("playerAssigned", ({ playerId, playerName, hand }) => {
      setGameState((prev) => ({
        ...prev,
        playerId,
        playerName,
        hand,
      }))
    })

    socket.on("gameStarted", (state) => {
      setGameState((prev) => ({ ...prev, ...state, gameStarted: true }))
    })

    socket.on("cardPassed", (state) => {
      setGameState((prev) => ({ ...prev, ...state }))
    })

    socket.on("gameWon", ({ winner }) => {
      setGameState((prev) => ({ ...prev, winner }))
    })
  }

  const joinGame = () => {
    const name = prompt("Enter your name:")
    if (name) {
      socket.emit("joinGame", { playerName: name })
    }
  }

  const startGame = () => {
    socket.emit("startGame")
  }

  const passCard = (cardIndex) => {
    if (gameState.currentPlayer === gameState.playerId) {
      socket.emit("passCard", { cardIndex })
    }
  }

  const resetGame = () => {
    socket.emit("resetGame")
  }

  if (!gameState.isConnected) {
    return <div className="text-center mt-10">Connecting to server...</div>
  }

  if (!gameState.playerId) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-2xl mb-4">Welcome to Superhero Card Game!</h2>
        <button
          onClick={joinGame}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Join Game
        </button>
      </div>
    )
  }

  return (
    <div className="w-full">
      <GameStatus gameState={gameState} startGame={startGame} resetGame={resetGame} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        {gameState.players.map((player, index) => (
          <PlayerHand
            key={player.id}
            player={player}
            isCurrentPlayer={gameState.currentPlayer === player.id}
            isLocalPlayer={gameState.playerId === player.id}
            onCardSelect={passCard}
            gameStarted={gameState.gameStarted}
            winner={gameState.winner}
          />
        ))}
      </div>
    </div>
  )
}
