"use client"

import { useState, useEffect } from "react"
import { io } from "socket.io-client"
import { motion } from "framer-motion"
import GameBoard from "../game/game-board"
import RoomList from "./room-list"
import CreateRoomForm from "./create-room-form"
import AvatarSelector from "./avatar-selector"
import { useAudio } from "@/hooks/use-audio"
import { ThemeProvider } from "@/components/ui/theme-provider"
import AuthModal from "../auth/auth-modal"
import StatsDashboard from "../stats/stats-dashboard"
import CardDesigner from "../card-designer/card-designer"
import UserProfileModal from "../profile/user-profile-modal"

let socket

export default function LobbyScreen() {
  const [connected, setConnected] = useState(false)
  const [playerInfo, setPlayerInfo] = useState(null)
  const [rooms, setRooms] = useState([])
  const [currentRoom, setCurrentRoom] = useState(null)
  const [showAvatarSelector, setShowAvatarSelector] = useState(false)
  const [playerName, setPlayerName] = useState("")
  const [selectedAvatar, setSelectedAvatar] = useState(1)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [user, setUser] = useState(null)
  const [showStats, setShowStats] = useState(false)
  const [showCardDesigner, setShowCardDesigner] = useState(false)
  const [customCardDesign, setCustomCardDesign] = useState(null)
  const [showUserProfile, setShowUserProfile] = useState(false)

  const { playSound } = useAudio()

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
      setConnected(true)
      playSound("connect")
    })

    socket.on("disconnect", () => {
      console.log("Disconnected from socket server")
      setConnected(false)
      setCurrentRoom(null)
    })

    socket.on("roomList", (roomList) => {
      setRooms(roomList)
    })

    socket.on("joinedRoom", (room) => {
      setCurrentRoom(room)
      playSound("join")
    })

    socket.on("leftRoom", () => {
      setCurrentRoom(null)
      playSound("leave")
    })

    socket.on("playerInfo", (info) => {
      setPlayerInfo(info)
    })
  }

  const handleCreateRoom = (roomName, maxPlayers, turnDuration) => {
    if (!playerInfo) return

    socket.emit("createRoom", {
      roomName,
      maxPlayers: Number.parseInt(maxPlayers),
      turnDuration: Number.parseInt(turnDuration),
      createdBy: playerInfo.id,
    })
    playSound("button")
  }

  const handleJoinRoom = (roomId, asSpectator = false) => {
    if (!playerInfo) return

    socket.emit("joinRoom", { roomId, asSpectator })
    playSound("button")
  }

  const handleLeaveRoom = () => {
    socket.emit("leaveRoom")
    playSound("button")
  }

  const handleSetPlayerInfo = () => {
    if (!playerName.trim()) return

    socket.emit("setPlayerInfo", {
      name: playerName,
      avatarId: selectedAvatar,
      userId: user?._id,
      customCardDesign,
    })

    setShowAvatarSelector(false)
    playSound("success")
  }

  const handleLogin = (userData) => {
    setUser(userData)
    setShowAuthModal(false)

    // If player info already exists, update it with user data
    if (playerInfo) {
      socket.emit("setPlayerInfo", {
        name: userData.username,
        avatarId: userData.avatarId,
        userId: userData._id,
        customAvatar: userData.customAvatar,
        customCardDesign,
      })
    } else {
      setPlayerName(userData.username)
      setSelectedAvatar(userData.avatarId)
    }
  }

  const handleRegister = (userData) => {
    setUser(userData)
    setShowAuthModal(false)

    // If player info already exists, update it with user data
    if (playerInfo) {
      socket.emit("setPlayerInfo", {
        name: userData.username,
        avatarId: userData.avatarId,
        userId: userData._id,
        customAvatar: userData.customAvatar,
        customCardDesign,
      })
    } else {
      setPlayerName(userData.username)
      setSelectedAvatar(userData.avatarId)
    }
  }

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser)

    // Update player info with new user data
    if (playerInfo) {
      socket.emit("setPlayerInfo", {
        name: updatedUser.username,
        avatarId: updatedUser.avatarId,
        userId: updatedUser._id,
        customAvatar: updatedUser.customAvatar,
        customCardDesign,
      })
    }
  }

  const handleSaveCardDesign = (name, design) => {
    setCustomCardDesign(design)

    // Update player info with custom card design
    if (playerInfo) {
      socket.emit("setPlayerInfo", {
        name: playerInfo.name,
        avatarId: playerInfo.avatarId,
        userId: user?._id,
        customAvatar: user?.customAvatar,
        customCardDesign: design,
      })
    }
  }

  if (!connected) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Connecting to server...</p>
        </motion.div>
      </div>
    )
  }

  if (!playerInfo || showAvatarSelector) {
    return (
      <ThemeProvider>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto bg-gray-800 p-6 rounded-lg shadow-lg"
        >
          <h2 className="text-2xl font-bold mb-4 text-center">Join the Game</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Your Name</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
              placeholder="Enter your name"
            />
          </div>

          <AvatarSelector selectedAvatar={selectedAvatar} onSelectAvatar={setSelectedAvatar} />

          <button
            onClick={handleSetPlayerInfo}
            disabled={!playerName.trim()}
            className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enter Lobby
          </button>

          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setShowAuthModal(true)
                playSound("button")
              }}
              className="text-purple-400 hover:text-purple-300 text-sm"
            >
              Login or Register to save your stats
            </button>
          </div>
        </motion.div>

        {showAuthModal && (
          <AuthModal onLogin={handleLogin} onRegister={handleRegister} onClose={() => setShowAuthModal(false)} />
        )}
      </ThemeProvider>
    )
  }

  if (currentRoom) {
    return (
      <GameBoard socket={socket} room={currentRoom} playerInfo={playerInfo} onLeaveRoom={handleLeaveRoom} user={user} />
    )
  }

  return (
    <ThemeProvider>
      {showAuthModal && (
        <AuthModal onLogin={handleLogin} onRegister={handleRegister} onClose={() => setShowAuthModal(false)} />
      )}

      {showCardDesigner && user && (
        <CardDesigner userId={user._id} onSave={handleSaveCardDesign} onClose={() => setShowCardDesigner(false)} />
      )}

      {showUserProfile && user && (
        <UserProfileModal user={user} onClose={() => setShowUserProfile(false)} onUpdate={handleUpdateUser} />
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col md:flex-row gap-6">
        <motion.div
          className="md:w-3/4 bg-gray-800 rounded-lg shadow-lg p-6"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Game Rooms</h2>
            <div className="flex items-center space-x-4">
              <div
                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-700 p-2 rounded-lg transition-colors"
                onClick={() => {
                  if (user) {
                    setShowUserProfile(true)
                    playSound("button")
                  } else {
                    setShowAuthModal(true)
                    playSound("button")
                  }
                }}
              >
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                  {playerInfo.customAvatar || user?.customAvatar ? (
                    <img
                      src={playerInfo.customAvatar || user?.customAvatar}
                      alt="Your avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={`/avatars/avatar-${playerInfo.avatarId}.jpg`}
                      alt="Your avatar"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <span>{playerInfo.name}</span>
              </div>

              <div className="flex space-x-2">
                {user ? (
                  <>
                    <button
                      onClick={() => {
                        setShowStats(!showStats)
                        playSound("button")
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                    >
                      {showStats ? "Hide Stats" : "Show Stats"}
                    </button>
                    <button
                      onClick={() => {
                        setShowCardDesigner(true)
                        playSound("button")
                      }}
                      className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm"
                    >
                      Card Designer
                    </button>
                    <button
                      onClick={() => {
                        setShowUserProfile(true)
                        playSound("button")
                      }}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                    >
                      Profile
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setShowAuthModal(true)
                      playSound("button")
                    }}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                  >
                    Login / Register
                  </button>
                )}
              </div>
            </div>
          </div>

          {showStats && user && (
            <div className="mb-6">
              <StatsDashboard userId={user._id} />
            </div>
          )}

          <RoomList rooms={rooms} onJoinRoom={handleJoinRoom} playerInfo={playerInfo} />
        </motion.div>

        <motion.div
          className="md:w-1/4 bg-gray-800 rounded-lg shadow-lg p-6"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold mb-4">Create Room</h2>
          <CreateRoomForm onCreateRoom={handleCreateRoom} />

          <div className="mt-8">
            <h3 className="text-xl font-bold mb-2">How to Play</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-300">
              <li>Each player gets 4 random superhero cards</li>
              <li>Take turns passing one card to the next player</li>
              <li>Collect 4 cards of the same superhero to win</li>
              <li>You cannot pass the card you just received unless you have multiple of that hero</li>
              <li>Use the chat to communicate with other players</li>
              <li>You can join games as a spectator to watch</li>
              <li>Create an account to track your stats and customize cards</li>
            </ul>
          </div>
        </motion.div>
      </motion.div>
    </ThemeProvider>
  )
}
