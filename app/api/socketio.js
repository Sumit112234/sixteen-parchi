import { Server } from "socket.io"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Game data
const superheroes = [
  { hero: "Superman", points: 10 },
  { hero: "Superman", points: 8 },
  { hero: "Superman", points: 12 },
  { hero: "Superman", points: 9 },
  { hero: "Batman", points: 9 },
  { hero: "Batman", points: 7 },
  { hero: "Batman", points: 11 },
  { hero: "Batman", points: 8 },
  { hero: "Wonder Woman", points: 11 },
  { hero: "Wonder Woman", points: 9 },
  { hero: "Wonder Woman", points: 10 },
  { hero: "Wonder Woman", points: 8 },
  { hero: "Flash", points: 8 },
  { hero: "Flash", points: 12 },
  { hero: "Flash", points: 7 },
  { hero: "Flash", points: 10 },
]

// Game state
const players = new Map() // Map of player ID to player object
const rooms = new Map() // Map of room ID to room object

// Generate a unique ID
function generateId() {
  return Math.random().toString(36).substring(2, 15)
}

// Shuffle cards using Fisher-Yates algorithm
function shuffleCards(cards) {
  const shuffled = [...cards]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Deal cards to players in a room
function dealCards(roomId) {
  const room = rooms.get(roomId)
  if (!room) return

  const shuffledCards = shuffleCards(superheroes)
  const playerIds = [...room.players.keys()]

  playerIds.forEach((playerId, index) => {
    const player = room.players.get(playerId)
    player.hand = shuffledCards.slice(index * 4, (index + 1) * 4)
    player.handSize = player.hand.length
  })
}

// Check if a player has won
function checkWinner(player) {
  if (!player.hand || player.hand.length !== 4) return false

  const heroCount = {}

  player.hand.forEach((card) => {
    heroCount[card.hero] = (heroCount[card.hero] || 0) + 1
  })

  for (const [hero, count] of Object.entries(heroCount)) {
    if (count === 4) {
      return { winner: player, winningHero: hero }
    }
  }

  return false
}

// Reset game in a room
function resetGame(roomId) {
  const room = rooms.get(roomId)
  if (!room) return

  room.currentPlayerIndex = 0
  room.gameStarted = false
  room.winner = null
  room.gameStartTime = null
  room.turnStartTime = null
  room.currentTurnDuration = 30

  room.players.forEach((player) => {
    player.hand = []
    player.handSize = 0
    player.cardsPlayed = 0
  })
}

// Get room data for client
function getRoomData(room) {
  return {
    id: room.id,
    name: room.name,
    maxPlayers: room.maxPlayers,
    gameStarted: room.gameStarted,
    createdBy: players.get(room.createdBy),
    turnDuration: room.turnDuration || 30,
    players: Array.from(room.players.values()).map((player) => ({
      id: player.id,
      name: player.name,
      avatarId: player.avatarId,
      handSize: player.handSize || 0,
      userId: player.userId,
      customCardDesign: player.customCardDesign,
    })),
    spectators: Array.from(room.spectators.values()).map((spectator) => ({
      id: spectator.id,
      name: spectator.name,
      avatarId: spectator.avatarId,
      userId: spectator.userId,
    })),
  }
}

// Get room list for client
function getRoomList() {
  return Array.from(rooms.values()).map(getRoomData)
}

// Save game result to database
async function saveGameResultToDb(room) {
  try {
    const { db } = await connectToDatabase()

    const gameData = {
      roomName: room.name,
      players: Array.from(room.players.values()).map((player) => ({
        id: player.id,
        name: player.name,
        avatarId: player.avatarId,
        userId: player.userId,
      })),
      spectators: Array.from(room.spectators.values()).map((spectator) => ({
        id: spectator.id,
        name: spectator.name,
        avatarId: spectator.avatarId,
        userId: spectator.userId,
      })),
      winner: room.winner,
      duration: room.gameStartTime ? Math.floor((Date.now() - room.gameStartTime) / 1000) : null,
      createdAt: new Date(),
    }

    const result = await db.collection("games").insertOne(gameData)

    // Update player stats
    if (room.winner && room.winner.userId) {
      const winnerUserId = room.winner.userId

      // Get current stats
      const user = await db.collection("users").findOne({ _id: new ObjectId(winnerUserId) })

      if (user) {
        const stats = user.stats || {
          gamesPlayed: 0,
          wins: 0,
          losses: 0,
          cardsPlayed: 0,
          fastestWin: null,
          favoriteHero: null,
        }

        // Update stats
        stats.wins += 1
        stats.gamesPlayed += 1

        // Update fastest win if applicable
        const gameDuration = Math.floor((Date.now() - room.gameStartTime) / 1000)
        if (!stats.fastestWin || gameDuration < stats.fastestWin) {
          stats.fastestWin = gameDuration
        }

        // Update favorite hero
        const heroCount = {}
        if (stats.favoriteHero) {
          heroCount[stats.favoriteHero] = 1
        }

        if (room.winner.winningHero) {
          heroCount[room.winner.winningHero] = (heroCount[room.winner.winningHero] || 0) + 1
        }

        let maxCount = 0
        let favoriteHero = stats.favoriteHero

        for (const [hero, count] of Object.entries(heroCount)) {
          if (count > maxCount) {
            maxCount = count
            favoriteHero = hero
          }
        }

        stats.favoriteHero = favoriteHero

        // Update cards played
        const player = room.players.get(room.winner.id)
        if (player && player.cardsPlayed) {
          stats.cardsPlayed += player.cardsPlayed
        }

        // Save updated stats
        await db.collection("users").updateOne({ _id: new ObjectId(winnerUserId) }, { $set: { stats } })
      }
    }

    // Update stats for all players
    for (const player of room.players.values()) {
      if (player.userId && player.id !== (room.winner?.id || null)) {
        const userId = player.userId

        // Get current stats
        const user = await db.collection("users").findOne({ _id: new ObjectId(userId) })

        if (user) {
          const stats = user.stats || {
            gamesPlayed: 0,
            wins: 0,
            losses: 0,
            cardsPlayed: 0,
            fastestWin: null,
            favoriteHero: null,
          }

          // Update stats
          stats.gamesPlayed += 1
          stats.losses += 1

          // Update cards played
          if (player.cardsPlayed) {
            stats.cardsPlayed += player.cardsPlayed
          }

          // Save updated stats
          await db.collection("users").updateOne({ _id: new ObjectId(userId) }, { $set: { stats } })
        }
      }
    }

    return result.insertedId
  } catch (error) {
    console.error("Error saving game result:", error)
    return null
  }
}

export default function SocketHandler(req, res) {
  // Check if socket.io server is already initialized

  console.log("Socket server initialized", res.socket)
  
  if (res.socket.server.io) {
    console.log("Socket server already running")
    res.end()
    return
  }

  const io = new Server(res.socket.server)
  res.socket.server.io = io

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id)

    // Set player info
    socket.on("setPlayerInfo", ({ name, avatarId, userId, customCardDesign }) => {
      const player = {
        id: socket.id,
        name: name || `Player ${players.size + 1}`,
        avatarId: avatarId || 1,
        userId: userId || null,
        customCardDesign: customCardDesign || null,
        rooms: new Set(),
      }

      players.set(socket.id, player)

      // Send player info to client
      socket.emit("playerInfo", player)

      // Send room list to client
      socket.emit("roomList", getRoomList())
    })

    // Create room
    socket.on("createRoom", ({ roomName, maxPlayers, turnDuration, createdBy }) => {
      const player = players.get(socket.id)
      if (!player) return

      const roomId = generateId()
      const room = {
        id: roomId,
        name: roomName,
        maxPlayers: maxPlayers || 4,
        turnDuration: turnDuration || 30,
        players: new Map(),
        spectators: new Map(),
        createdBy: socket.id,
        gameStarted: false,
        currentPlayerIndex: 0,
        winner: null,
        messages: [],
        gameStartTime: null,
        turnStartTime: null,
        currentTurnDuration: turnDuration || 30,
      }

      // Add player to room
      room.players.set(socket.id, {
        ...player,
        handSize: 0,
        hand: [],
        cardsPlayed: 0,
        roomMaxPlayers: maxPlayers,
      })

      // Add room to player's rooms
      player.rooms.add(roomId)

      // Add room to rooms map
      rooms.set(roomId, room)

      // Join socket to room
      socket.join(roomId)

      // Send room data to client
      socket.emit("joinedRoom", getRoomData(room))

      // Broadcast updated room list to all clients
      io.emit("roomList", getRoomList())
    })

    // Join room
    socket.on("joinRoom", ({ roomId, asSpectator = false }) => {
      const player = players.get(socket.id)
      const room = rooms.get(roomId)

      if (!player || !room) return

      if (asSpectator) {
        // Add spectator to room
        room.spectators.set(socket.id, {
          ...player,
        })

        // Add room to player's rooms
        player.rooms.add(roomId)

        // Join socket to room
        socket.join(roomId)

        // Send room data to client
        socket.emit("joinedRoom", getRoomData(room))

        // Broadcast updated spectator list to room
        io.to(roomId).emit(
          "spectatorJoined",
          Array.from(room.spectators.values()).map((s) => ({
            id: s.id,
            name: s.name,
            avatarId: s.avatarId,
            userId: s.userId,
          })),
        )

        // Add system message
        const message = {
          senderId: "system",
          senderName: "System",
          senderAvatar: 1,
          text: `${player.name} has joined as a spectator.`,
          timestamp: Date.now(),
        }

        room.messages.push(message)
        io.to(roomId).emit("chatMessage", message)
      } else {
        // Check if room is full
        if (room.players.size >= room.maxPlayers) {
          socket.emit("error", { message: "Room is full" })
          return
        }

        // Check if game already started
        if (room.gameStarted) {
          socket.emit("error", { message: "Game already started" })
          return
        }

        // Add player to room
        room.players.set(socket.id, {
          ...player,
          handSize: 0,
          hand: [],
          cardsPlayed: 0,
          roomMaxPlayers: room.maxPlayers,
        })

        // Add room to player's rooms
        player.rooms.add(roomId)

        // Join socket to room
        socket.join(roomId)

        // Send room data to client
        socket.emit("joinedRoom", getRoomData(room))

        // Broadcast updated player list to room
        io.to(roomId).emit(
          "playerJoined",
          Array.from(room.players.values()).map((p) => ({
            id: p.id,
            name: p.name,
            avatarId: p.avatarId,
            handSize: p.handSize || 0,
            userId: p.userId,
            customCardDesign: p.customCardDesign,
          })),
        )

        // Add system message
        const message = {
          senderId: "system",
          senderName: "System",
          senderAvatar: 1,
          text: `${player.name} has joined the room.`,
          timestamp: Date.now(),
        }

        room.messages.push(message)
        io.to(roomId).emit("chatMessage", message)
      }

      // Broadcast updated room list to all clients
      io.emit("roomList", getRoomList())
    })

    // Leave room
    socket.on("leaveRoom", () => {
      const player = players.get(socket.id)
      if (!player) return

      // Find rooms player is in
      player.rooms.forEach((roomId) => {
        const room = rooms.get(roomId)
        if (!room) return

        // Check if player is a spectator
        const isSpectator = room.spectators.has(socket.id)

        if (isSpectator) {
          // Remove spectator from room
          room.spectators.delete(socket.id)

          // Add system message
          const message = {
            senderId: "system",
            senderName: "System",
            senderAvatar: 1,
            text: `${player.name} has left (spectator).`,
            timestamp: Date.now(),
          }

          room.messages.push(message)

          // Broadcast updated spectator list to room
          io.to(roomId).emit(
            "spectatorLeft",
            Array.from(room.spectators.values()).map((s) => ({
              id: s.id,
              name: s.name,
              avatarId: s.avatarId,
              userId: s.userId,
            })),
          )

          io.to(roomId).emit("chatMessage", message)
        } else {
          // Remove player from room
          room.players.delete(socket.id)

          // If room is empty, delete it
          if (room.players.size === 0 && room.spectators.size === 0) {
            rooms.delete(roomId)
          } else {
            // If player was room creator, assign to another player
            if (room.createdBy === socket.id) {
              const playerIds = Array.from(room.players.keys())
              if (playerIds.length > 0) {
                room.createdBy = playerIds[0]
              } else {
                // If no players left, assign to first spectator
                const spectatorIds = Array.from(room.spectators.keys())
                if (spectatorIds.length > 0) {
                  room.createdBy = spectatorIds[0]
                }
              }
            }

            // If game was in progress, reset it
            if (room.gameStarted) {
              resetGame(roomId)
            }

            // Add system message
            const message = {
              senderId: "system",
              senderName: "System",
              senderAvatar: 1,
              text: `${player.name} has left the room.`,
              timestamp: Date.now(),
            }

            room.messages.push(message)

            // Broadcast updated player list to room
            io.to(roomId).emit(
              "playerLeft",
              Array.from(room.players.values()).map((p) => ({
                id: p.id,
                name: p.name,
                avatarId: p.avatarId,
                handSize: p.handSize || 0,
                userId: p.userId,
                customCardDesign: p.customCardDesign,
              })),
            )

            io.to(roomId).emit("chatMessage", message)
          }
        }

        // Leave socket room
        socket.leave(roomId)
      })

      // Clear player's rooms
      player.rooms.clear()

      // Send confirmation to client
      socket.emit("leftRoom")

      // Broadcast updated room list to all clients
      io.emit("roomList", getRoomList())
    })

    // Start game
    socket.on("startGame", ({ roomId }) => {
      const room = rooms.get(roomId)
      if (!room) return

      // Check if player is room creator
      if (room.createdBy !== socket.id) {
        socket.emit("error", { message: "Only room creator can start the game" })
        return
      }

      // Check if enough players
      if (room.players.size < 2) {
        socket.emit("error", { message: "Need at least 2 players to start" })
        return
      }

      // Start game
      room.gameStarted = true
      room.currentPlayerIndex = 0
      room.gameStartTime = Date.now()
      room.turnStartTime = Date.now()
      dealCards(roomId)

      // Get current player
      const playerIds = Array.from(room.players.keys())
      const currentPlayerId = playerIds[room.currentPlayerIndex]

      // Send hands to each player
      room.players.forEach((player, playerId) => {
        io.to(playerId).emit("gameState", {
          hand: player.hand,
        })
      })

      // Add system message
      const message = {
        senderId: "system",
        senderName: "System",
        senderAvatar: 1,
        text: "Game has started!",
        timestamp: Date.now(),
      }

      room.messages.push(message)

      // Broadcast game state to room
      io.to(roomId).emit("gameStarted", {
        players: Array.from(room.players.values()).map((p) => ({
          id: p.id,
          name: p.name,
          avatarId: p.avatarId,
          handSize: p.hand.length,
          roomMaxPlayers: room.maxPlayers,
          userId: p.userId,
          customCardDesign: p.customCardDesign,
        })),
        currentPlayer: currentPlayerId,
        messages: room.messages,
        turnDuration: room.turnDuration,
        turnStartTime: room.turnStartTime,
      })

      // Broadcast updated room list to all clients
      io.emit("roomList", getRoomList())
    })

    // Pass card
    socket.on("passCard", ({ cardIndex, roomId }) => {
      const room = rooms.get(roomId)
      if (!room || !room.gameStarted || room.winner) return

      const playerIds = Array.from(room.players.keys())
      const currentPlayerId = playerIds[room.currentPlayerIndex]

      // Check if it's the player's turn
      if (currentPlayerId !== socket.id) {
        socket.emit("error", { message: "Not your turn" })
        return
      }

      // Get current and next player
      const currentPlayer = room.players.get(currentPlayerId)
      const nextPlayerIndex = (room.currentPlayerIndex + 1) % playerIds.length
      const nextPlayerId = playerIds[nextPlayerIndex]
      const nextPlayer = room.players.get(nextPlayerId)

      // Pass the card
      const card = currentPlayer.hand.splice(cardIndex, 1)[0]
      nextPlayer.hand.push(card)

      // Update hand sizes and cards played
      currentPlayer.handSize = currentPlayer.hand.length
      nextPlayer.handSize = nextPlayer.hand.length
      currentPlayer.cardsPlayed = (currentPlayer.cardsPlayed || 0) + 1

      // Update turn timer
      room.turnStartTime = Date.now()

      // Add system message
      const message = {
        senderId: "system",
        senderName: "System",
        senderAvatar: 1,
        text: `${currentPlayer.name} passed a card to ${nextPlayer.name}.`,
        timestamp: Date.now(),
      }

      room.messages.push(message)

      // Check if the next player has won
      const winResult = checkWinner(nextPlayer)
      if (winResult) {
        room.winner = {
          id: nextPlayer.id,
          name: nextPlayer.name,
          winningHero: winResult.winningHero,
          userId: nextPlayer.userId,
        }

        // Add system message for winner
        const winMessage = {
          senderId: "system",
          senderName: "System",
          senderAvatar: 1,
          text: `${nextPlayer.name} wins with 4 ${winResult.winningHero} cards!`,
          timestamp: Date.now(),
        }

        room.messages.push(winMessage)

        // Save game result to database
        saveGameResultToDb(room)

        io.to(roomId).emit("gameWon", { winner: room.winner })
        io.to(roomId).emit("chatMessage", winMessage)
      }

      // Update current player
      room.currentPlayerIndex = nextPlayerIndex

      // Send updated hands to the players involved
      io.to(currentPlayerId).emit("gameState", {
        hand: currentPlayer.hand,
      })

      io.to(nextPlayerId).emit("gameState", {
        hand: nextPlayer.hand,
      })

      // Broadcast updated game state to room
      io.to(roomId).emit("cardPassed", {
        players: Array.from(room.players.values()).map((p) => ({
          id: p.id,
          name: p.name,
          avatarId: p.avatarId,
          handSize: p.hand.length,
          userId: p.userId,
          customCardDesign: p.customCardDesign,
        })),
        currentPlayer: playerIds[room.currentPlayerIndex],
        winner: room.winner,
        turnStartTime: room.turnStartTime,
      })

      io.to(roomId).emit("chatMessage", message)
    })

    // Auto pass card (when timer expires)
    socket.on("autoPassCard", ({ roomId }) => {
      const room = rooms.get(roomId)
      if (!room || !room.gameStarted || room.winner) return

      const playerIds = Array.from(room.players.keys())
      const currentPlayerId = playerIds[room.currentPlayerIndex]

      // Check if it's the player's turn
      if (currentPlayerId !== socket.id) {
        return
      }

      // Get current and next player
      const currentPlayer = room.players.get(currentPlayerId)
      const nextPlayerIndex = (room.currentPlayerIndex + 1) % playerIds.length
      const nextPlayerId = playerIds[nextPlayerIndex]
      const nextPlayer = room.players.get(nextPlayerId)

      // Select a random card to pass
      const randomCardIndex = Math.floor(Math.random() * currentPlayer.hand.length)
      const card = currentPlayer.hand.splice(randomCardIndex, 1)[0]
      nextPlayer.hand.push(card)

      // Update hand sizes and cards played
      currentPlayer.handSize = currentPlayer.hand.length
      nextPlayer.handSize = nextPlayer.hand.length
      currentPlayer.cardsPlayed = (currentPlayer.cardsPlayed || 0) + 1

      // Update turn timer
      room.turnStartTime = Date.now()

      // Add system message
      const message = {
        senderId: "system",
        senderName: "System",
        senderAvatar: 1,
        text: `Time's up! ${currentPlayer.name} automatically passed a card to ${nextPlayer.name}.`,
        timestamp: Date.now(),
      }

      room.messages.push(message)

      // Check if the next player has won
      const winResult = checkWinner(nextPlayer)
      if (winResult) {
        room.winner = {
          id: nextPlayer.id,
          name: nextPlayer.name,
          winningHero: winResult.winningHero,
          userId: nextPlayer.userId,
        }

        // Add system message for winner
        const winMessage = {
          senderId: "system",
          senderName: "System",
          senderAvatar: 1,
          text: `${nextPlayer.name} wins with 4 ${winResult.winningHero} cards!`,
          timestamp: Date.now(),
        }

        room.messages.push(winMessage)

        // Save game result to database
        saveGameResultToDb(room)

        io.to(roomId).emit("gameWon", { winner: room.winner })
        io.to(roomId).emit("chatMessage", winMessage)
      }

      // Update current player
      room.currentPlayerIndex = nextPlayerIndex

      // Send updated hands to the players involved
      io.to(currentPlayerId).emit("gameState", {
        hand: currentPlayer.hand,
      })

      io.to(nextPlayerId).emit("gameState", {
        hand: nextPlayer.hand,
      })

      // Broadcast updated game state to room
      io.to(roomId).emit("cardPassed", {
        players: Array.from(room.players.values()).map((p) => ({
          id: p.id,
          name: p.name,
          avatarId: p.avatarId,
          handSize: p.hand.length,
          userId: p.userId,
          customCardDesign: p.customCardDesign,
        })),
        currentPlayer: playerIds[room.currentPlayerIndex],
        winner: room.winner,
        turnStartTime: room.turnStartTime,
      })

      io.to(roomId).emit("chatMessage", message)
    })

    // Reset game
    socket.on("resetGame", ({ roomId }) => {
      const room = rooms.get(roomId)
      if (!room) return

      // Check if player is room creator
      if (room.createdBy !== socket.id) {
        socket.emit("error", { message: "Only room creator can reset the game" })
        return
      }

      resetGame(roomId)

      // Add system message
      const message = {
        senderId: "system",
        senderName: "System",
        senderAvatar: 1,
        text: "Game has been reset.",
        timestamp: Date.now(),
      }

      room.messages.push(message)

      // Broadcast updated game state to room
      io.to(roomId).emit("gameState", {
        players: Array.from(room.players.values()).map((p) => ({
          id: p.id,
          name: p.name,
          avatarId: p.avatarId,
          handSize: p.handSize,
          userId: p.userId,
          customCardDesign: p.customCardDesign,
        })),
        gameStarted: false,
        winner: null,
        messages: room.messages,
      })

      io.to(roomId).emit("chatMessage", message)

      // Broadcast updated room list to all clients
      io.emit("roomList", getRoomList())
    })

    // Send chat message
    socket.on("sendMessage", ({ roomId, message }) => {
      const player = players.get(socket.id)
      const room = rooms.get(roomId)

      if (!player || !room) return

      // Check if player is in the room (as player or spectator)
      const isInRoom = room.players.has(socket.id) || room.spectators.has(socket.id)
      if (!isInRoom) return

      const isSpectator = room.spectators.has(socket.id)

      const chatMessage = {
        senderId: player.id,
        senderName: player.name,
        senderAvatar: player.avatarId,
        text: message,
        timestamp: Date.now(),
        isSpectator: isSpectator,
      }

      // Add message to room history
      room.messages.push(chatMessage)

      // Broadcast message to room
      io.to(roomId).emit("chatMessage", chatMessage)
    })

    // Update custom card design
    socket.on("updateCardDesign", ({ roomId, design }) => {
      const player = players.get(socket.id)
      const room = rooms.get(roomId)

      if (!player || !room) return

      // Check if player is in the room
      if (!room.players.has(socket.id)) return

      // Update player's custom card design
      const roomPlayer = room.players.get(socket.id)
      roomPlayer.customCardDesign = design

      // Broadcast updated player info to room
      io.to(roomId).emit("playerUpdated", {
        id: socket.id,
        customCardDesign: design,
      })
    })

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id)

      const player = players.get(socket.id)
      if (!player) return

      // Handle player leaving all rooms
      player.rooms.forEach((roomId) => {
        const room = rooms.get(roomId)
        if (!room) return

        // Check if player is a spectator
        const isSpectator = room.spectators.has(socket.id)

        if (isSpectator) {
          // Remove spectator from room
          room.spectators.delete(socket.id)

          // If room is empty, delete it
          if (room.players.size === 0 && room.spectators.size === 0) {
            rooms.delete(roomId)
          } else {
            // If spectator was room creator, assign to another player or spectator
            if (room.createdBy === socket.id) {
              const playerIds = Array.from(room.players.keys())
              if (playerIds.length > 0) {
                room.createdBy = playerIds[0]
              } else {
                const spectatorIds = Array.from(room.spectators.keys())
                if (spectatorIds.length > 0) {
                  room.createdBy = spectatorIds[0]
                }
              }
            }

            // Add system message
            const message = {
              senderId: "system",
              senderName: "System",
              senderAvatar: 1,
              text: `${player.name} has disconnected (spectator).`,
              timestamp: Date.now(),
            }

            room.messages.push(message)

            // Broadcast updated spectator list to room
            io.to(roomId).emit(
              "spectatorLeft",
              Array.from(room.spectators.values()).map((s) => ({
                id: s.id,
                name: s.name,
                avatarId: s.avatarId,
                userId: s.userId,
              })),
            )

            io.to(roomId).emit("chatMessage", message)
          }
        } else {
          // Remove player from room
          room.players.delete(socket.id)

          // If room is empty, delete it
          if (room.players.size === 0 && room.spectators.size === 0) {
            rooms.delete(roomId)
          } else {
            // If player was room creator, assign to another player or spectator
            if (room.createdBy === socket.id) {
              const playerIds = Array.from(room.players.keys())
              if (playerIds.length > 0) {
                room.createdBy = playerIds[0]
              } else {
                const spectatorIds = Array.from(room.spectators.keys())
                if (spectatorIds.length > 0) {
                  room.createdBy = spectatorIds[0]
                }
              }
            }

            // If game was in progress, reset it
            if (room.gameStarted) {
              resetGame(roomId)
            }

            // Add system message
            const message = {
              senderId: "system",
              senderName: "System",
              senderAvatar: 1,
              text: `${player.name} has disconnected.`,
              timestamp: Date.now(),
            }

            room.messages.push(message)

            // Broadcast updated player list to room
            io.to(roomId).emit(
              "playerLeft",
              Array.from(room.players.values()).map((p) => ({
                id: p.id,
                name: p.name,
                avatarId: p.avatarId,
                handSize: p.handSize || 0,
                userId: p.userId,
                customCardDesign: p.customCardDesign,
              })),
            )

            io.to(roomId).emit("chatMessage", message)
          }
        }
      })

      // Remove player from players map
      players.delete(socket.id)

      // Broadcast updated room list to all clients
      io.emit("roomList", getRoomList())
    })
  })

  console.log("Socket server initialized")
  res.end()
}
