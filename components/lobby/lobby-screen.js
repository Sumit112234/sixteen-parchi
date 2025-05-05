"use client"

import { useState, useEffect } from "react"
import { io } from "socket.io-client"
import { motion, AnimatePresence } from "framer-motion"
import GameBoard from "../game/game-board"
import RoomList from "./room-list"
import CreateRoomForm from "./create-room-form"
import AvatarSelector from "./avatar-selector"
import { useAudio } from "@/hooks/use-audio"
import AuthModal from "../auth/auth-modal"
import StatsDashboard from "../stats/stats-dashboard"
import CardDesigner from "../card-designer/card-designer"
import UserProfileModal from "../profile/user-profile-modal"
import TutorialModal from "../tutorial/tutorial-modal"
import AchievementsModal from "../achievements/achievements-modal"
import ThemeSelector from "../settings/theme-selector"
import PrivateRoomModal from "./private-room-modal"
import { Button } from "../custom/button"
import { Tooltip } from "../custom/tooltip"
import { Card, CardContent, CardHeader } from "../custom/card"

let socket

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
}

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
  const [showTutorial, setShowTutorial] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const [showThemeSelector, setShowThemeSelector] = useState(false)
  const [currentTheme, setCurrentTheme] = useState("default")
  const [showPrivateRoomModal, setShowPrivateRoomModal] = useState(false)
  const [newAchievements, setNewAchievements] = useState([])
  const [showNewAchievementNotification, setShowNewAchievementNotification] = useState(false)

  const { playSound } = useAudio()

  useEffect(() => {
    // Initialize socket connection
    socketInitializer()

    // Check if user has completed tutorial
    const tutorialCompleted = localStorage.getItem("tutorialCompleted")
    if (!tutorialCompleted) {
      setShowTutorial(true)
    }

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [])

  useEffect(() => {
    // Apply theme
    document.documentElement.setAttribute("data-theme", currentTheme)

    // Save theme preference
    if (user && user._id) {
      updateUserSettings({ theme: currentTheme })
    } else {
      localStorage.setItem("theme", currentTheme)
    }
  }, [currentTheme, user])

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

    socket.on("privateRoomCreated", ({ roomId }) => {
      // Now join the room
      socket.emit("joinRoom", { roomId })
    })

    socket.on("privateRoomValidated", ({ roomId }) => {
      // Now join the room
      socket.emit("joinRoom", { roomId })
    })

    socket.on("newAchievements", (achievements) => {
      if (achievements && achievements.length > 0) {
        setNewAchievements(achievements)
        setShowNewAchievementNotification(true)
        playSound("success")
      }
    })
  }

  const handleCreateRoom = (roomName, maxPlayers, turnDuration, includeAI, aiDifficulty) => {
    if (!playerInfo) return

    socket.emit("createRoom", {
      roomName,
      maxPlayers: Number.parseInt(maxPlayers),
      turnDuration: Number.parseInt(turnDuration),
      createdBy: playerInfo.id,
    })
    playSound("button")

    // If AI is included, add AI players after room creation
    if (includeAI) {
      // We'll add the AI player after joining the room
      setTimeout(() => {
        if (currentRoom) {
          socket.emit("addAIPlayer", {
            roomId: currentRoom.id,
            difficulty: aiDifficulty,
          })
        }
      }, 1000)
    }
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

    // Load user theme preference
    if (userData.settings?.theme) {
      setCurrentTheme(userData.settings.theme)
    }

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

    // Check if tutorial is completed
    if (userData.tutorialCompleted) {
      localStorage.setItem("tutorialCompleted", "true")
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

  const handleCompleteTutorial = async () => {
    localStorage.setItem("tutorialCompleted", "true")
    setShowTutorial(false)

    // Update user profile if logged in
    if (user && user._id) {
      try {
        await fetch(`/api/users/${user._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile: { tutorialCompleted: true } }),
        })
      } catch (error) {
        console.error("Error updating tutorial status:", error)
      }
    }
  }

  const updateUserSettings = async (settings) => {
    if (!user || !user._id) return

    try {
      await fetch(`/api/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: { settings } }),
      })
    } catch (error) {
      console.error("Error updating user settings:", error)
    }
  }

  const handleCreatePrivateRoom = async (roomId, password) => {
    if (!playerInfo || !user) {
      throw new Error("You must be logged in to create a private room")
    }

    socket.emit("createPrivateRoom", {
      roomId,
      password,
      creatorId: user._id,
    })
  }

  const handleJoinPrivateRoom = async (roomId, password) => {
    socket.emit("joinPrivateRoom", { roomId, password })
  }

  if (!connected) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"
          />
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl"
          >
            Connecting to server...
          </motion.p>
        </motion.div>
      </div>
    )
  }

  if (!playerInfo || showAvatarSelector) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700"
        >
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text"
          >
            Join the Superhero Card Game
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-4"
          >
            <label className="block text-sm font-medium mb-1">Your Name</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Enter your name"
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <AvatarSelector selectedAvatar={selectedAvatar} onSelectAvatar={setSelectedAvatar} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4"
          >
            <Button onClick={handleSetPlayerInfo} disabled={!playerName.trim()} className="w-full">
              Enter Lobby
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-4 text-center"
          >
            <button
              onClick={() => {
                setShowAuthModal(true)
                playSound("button")
              }}
              className="text-purple-400 hover:text-purple-300 text-sm"
            >
              Login or Register to save your stats
            </button>
          </motion.div>
        </motion.div>

        {showAuthModal && (
          <AuthModal onLogin={handleLogin} onRegister={handleRegister} onClose={() => setShowAuthModal(false)} />
        )}

        {showTutorial && <TutorialModal onComplete={handleCompleteTutorial} onClose={() => setShowTutorial(false)} />}
      </div>
    )
  }

  if (currentRoom) {
    return (
      <GameBoard
        socket={socket}
        room={currentRoom}
        playerInfo={playerInfo}
        onLeaveRoom={handleLeaveRoom}
        user={user}
        theme={currentTheme}
      />
    )
  }

  return (
    <div className="min-h-screen">
      {showAuthModal && (
        <AuthModal onLogin={handleLogin} onRegister={handleRegister} onClose={() => setShowAuthModal(false)} />
      )}

      {showCardDesigner && user && (
        <CardDesigner userId={user._id} onSave={handleSaveCardDesign} onClose={() => setShowCardDesigner(false)} />
      )}

      {showUserProfile && user && (
        <UserProfileModal user={user} onClose={() => setShowUserProfile(false)} onUpdate={handleUpdateUser} />
      )}

      {showTutorial && <TutorialModal onComplete={handleCompleteTutorial} onClose={() => setShowTutorial(false)} />}

      {showAchievements && user && <AchievementsModal userId={user._id} onClose={() => setShowAchievements(false)} />}

      {showThemeSelector && (
        <ThemeSelector
          currentTheme={currentTheme}
          onSelectTheme={setCurrentTheme}
          onClose={() => setShowThemeSelector(false)}
        />
      )}

      {showPrivateRoomModal && (
        <PrivateRoomModal
          onCreatePrivate={handleCreatePrivateRoom}
          onJoinPrivate={handleJoinPrivateRoom}
          onClose={() => setShowPrivateRoomModal(false)}
        />
      )}

      <AnimatePresence>
        {showNewAchievementNotification && newAchievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-purple-900 border border-purple-500 rounded-lg p-4 shadow-lg z-50 max-w-md"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg mb-2">Achievement Unlocked!</h3>
                <p className="text-purple-200">{newAchievements[0].name}</p>
                <p className="text-sm text-purple-300">{newAchievements[0].description}</p>
              </div>
              <button
                onClick={() => setShowNewAchievementNotification(false)}
                className="text-purple-300 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <div className="mt-2 text-right">
              <button
                onClick={() => {
                  setShowNewAchievementNotification(false)
                  setShowAchievements(true)
                }}
                className="text-sm text-purple-300 hover:text-white"
              >
                View All Achievements
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-4 md:p-8">
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-6">
          <motion.div variants={itemVariants} className="md:w-3/4">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
                    Game Rooms
                  </h2>
                  <div className="flex items-center space-x-4">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
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
                            src={`/avatars/avatar-${playerInfo.avatarId}.png`}
                            alt="Your avatar"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <span>{playerInfo.name}</span>
                    </motion.div>

                    <div className="flex space-x-2">
                      <Tooltip content="Tutorial">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setShowTutorial(true)
                            playSound("button")
                          }}
                          className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </motion.button>
                      </Tooltip>

                      {user ? (
                        <>
                          <Button
                            onClick={() => {
                              setShowStats(!showStats)
                              playSound("button")
                            }}
                            size="sm"
                          >
                            {showStats ? "Hide Stats" : "Show Stats"}
                          </Button>
                          <Button
                            onClick={() => {
                              setShowCardDesigner(true)
                              playSound("button")
                            }}
                            size="sm"
                            variant="secondary"
                          >
                            Card Designer
                          </Button>
                          <Button
                            onClick={() => {
                              setShowAchievements(true)
                              playSound("button")
                            }}
                            size="sm"
                            variant="success"
                          >
                            Achievements
                          </Button>
                          <Button
                            onClick={() => {
                              setShowThemeSelector(true)
                              playSound("button")
                            }}
                            size="sm"
                            variant="outline"
                          >
                            Themes
                          </Button>
                          <Button
                            onClick={() => {
                              setShowPrivateRoomModal(true)
                              playSound("button")
                            }}
                            size="sm"
                            variant="secondary"
                          >
                            Private Room
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => {
                            setShowAuthModal(true)
                            playSound("button")
                          }}
                          size="sm"
                          variant="success"
                        >
                          Login / Register
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {showStats && user && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6"
                  >
                    <StatsDashboard userId={user._id} />
                  </motion.div>
                )}

                <RoomList rooms={rooms} onJoinRoom={handleJoinRoom} playerInfo={playerInfo} />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} className="md:w-1/4">
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
                  Create Room
                </h2>
              </CardHeader>
              <CardContent>
                <CreateRoomForm onCreateRoom={handleCreateRoom} />

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8"
                >
                  <h3 className="text-xl font-bold mb-2 text-purple-300">How to Play</h3>
                  <ul className="list-disc pl-5 space-y-1 text-gray-300">
                    <motion.li
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      Each player gets 4 random superhero cards
                    </motion.li>
                    <motion.li
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.7 }}
                    >
                      Take turns passing one card to the next player
                    </motion.li>
                    <motion.li
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      Collect 4 cards of the same superhero to win
                    </motion.li>
                    <motion.li
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.9 }}
                    >
                      You cannot pass the card you just received unless you have multiple of that hero
                    </motion.li>
                    <motion.li
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 1.0 }}
                    >
                      Use the chat to communicate with other players
                    </motion.li>
                    <motion.li
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 1.1 }}
                    >
                      You can join games as a spectator to watch
                    </motion.li>
                    <motion.li
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 1.2 }}
                    >
                      Create an account to track your stats and customize cards
                    </motion.li>
                    <motion.li
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 1.3 }}
                    >
                      Add AI opponents to practice or fill empty slots
                    </motion.li>
                    <motion.li
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 1.4 }}
                    >
                      Create private rooms to play with friends
                    </motion.li>
                  </ul>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
