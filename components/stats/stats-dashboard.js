"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

export default function StatsDashboard({ userId }) {
  const [stats, setStats] = useState(null)
  const [recentGames, setRecentGames] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("personal")

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user stats
        const userResponse = await fetch(`/api/users/${userId}`)
        const userData = await userResponse.json()

        // Fetch recent games
        const gamesResponse = await fetch(`/api/games?userId=${userId}&limit=5`)
        const gamesData = await gamesResponse.json()

        // Fetch leaderboard
        const leaderboardResponse = await fetch(`/api/users?leaderboard=true&limit=10`)
        const leaderboardData = await leaderboardResponse.json()

        setStats(userData.user.stats)
        setRecentGames(gamesData.games || [])
        setLeaderboard(leaderboardData.leaderboard || [])
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchData()
    }
  }, [userId])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex border-b border-gray-700 mb-4">
        <button
          className={`px-4 py-2 ${activeTab === "personal" ? "border-b-2 border-purple-500 text-purple-400" : "text-gray-400"}`}
          onClick={() => setActiveTab("personal")}
        >
          Personal Stats
        </button>
        <button
          className={`px-4 py-2 ${activeTab === "leaderboard" ? "border-b-2 border-purple-500 text-purple-400" : "text-gray-400"}`}
          onClick={() => setActiveTab("leaderboard")}
        >
          Leaderboard
        </button>
        <button
          className={`px-4 py-2 ${activeTab === "recent" ? "border-b-2 border-purple-500 text-purple-400" : "text-gray-400"}`}
          onClick={() => setActiveTab("recent")}
        >
          Recent Games
        </button>
      </div>

      {activeTab === "personal" && stats && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard title="Games Played" value={stats.gamesPlayed} icon="🎮" />
          <StatCard title="Wins" value={stats.wins} icon="🏆" />
          <StatCard
            title="Win Rate"
            value={stats.gamesPlayed > 0 ? `${Math.round((stats.wins / stats.gamesPlayed) * 100)}%` : "0%"}
            icon="📊"
          />
          <StatCard title="Cards Played" value={stats.cardsPlayed} icon="🃏" />
          <StatCard title="Fastest Win" value={stats.fastestWin ? `${stats.fastestWin}s` : "N/A"} icon="⏱️" />
          <StatCard title="Favorite Hero" value={stats.favoriteHero || "None"} icon="🦸‍♂️" />
        </motion.div>
      )}

      {activeTab === "leaderboard" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-2 px-4">Rank</th>
                <th className="py-2 px-4">Player</th>
                <th className="py-2 px-4">Wins</th>
                <th className="py-2 px-4">Games</th>
                <th className="py-2 px-4">Win Rate</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((player, index) => (
                <tr key={player._id} className="border-b border-gray-700">
                  <td className="py-2 px-4">{index + 1}</td>
                  <td className="py-2 px-4 flex items-center">
                    <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
                      <img
                        src={`/avatars/avatar-${player.avatarId}.jpg`}
                        alt={player.username}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {player.username}
                  </td>
                  <td className="py-2 px-4">{player.stats.wins}</td>
                  <td className="py-2 px-4">{player.stats.gamesPlayed}</td>
                  <td className="py-2 px-4">
                    {player.stats.gamesPlayed > 0
                      ? `${Math.round((player.stats.wins / player.stats.gamesPlayed) * 100)}%`
                      : "0%"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {activeTab === "recent" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {recentGames.length > 0 ? (
            recentGames.map((game) => (
              <div key={game._id} className="bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="text-sm text-gray-400">
                      {new Date(game.createdAt).toLocaleDateString()} at {new Date(game.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-sm px-2 py-1 rounded bg-gray-600">
                    {game.duration ? `${game.duration}s` : "Incomplete"}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {game.players.map((player) => (
                    <div
                      key={player.id}
                      className={`px-3 py-1 rounded-full text-sm flex items-center ${
                        player.id === game.winner?.id
                          ? "bg-yellow-600/30 text-yellow-300 border border-yellow-600"
                          : "bg-gray-600 text-gray-300"
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full overflow-hidden mr-1">
                        <img
                          src={`/avatars/avatar-${player.avatarId}.jpg`}
                          alt={player.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {player.name}
                      {player.id === game.winner?.id && <span className="ml-1 text-yellow-300">👑</span>}
                    </div>
                  ))}
                </div>
                {game.winner && (
                  <div className="mt-2 text-sm">
                    Winner: <span className="font-bold text-yellow-400">{game.winner.name}</span> with{" "}
                    <span className="font-bold">{game.winner.winningHero}</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>No recent games found.</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-gray-700 rounded-lg p-4 flex flex-col items-center justify-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-sm text-gray-400">{title}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  )
}
