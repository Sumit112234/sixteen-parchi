"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAudio } from "@/hooks/use-audio"

export default function AchievementsModal({ userId, onClose }) {
  const [achievements, setAchievements] = useState([])
  const [unlockedAchievements, setUnlockedAchievements] = useState([])
  const [loading, setLoading] = useState(true)
  const { playSound } = useAudio()

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true)

        // Fetch all achievements
        const allResponse = await fetch("/api/achievements")
        const allData = await allResponse.json()

        // Fetch user's unlocked achievements
        const userResponse = await fetch(`/api/achievements/user/${userId}`)
        const userData = await userResponse.json()

        setAchievements(allData.achievements || [])
        setUnlockedAchievements(userData.achievements || [])
      } catch (error) {
        console.error("Error fetching achievements:", error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchAchievements()
    }
  }, [userId])

  const isUnlocked = (achievementId) => {
    return unlockedAchievements.some((a) => a.id === achievementId)
  }

  const getUnlockDate = (achievementId) => {
    const achievement = unlockedAchievements.find((a) => a.id === achievementId)
    return achievement ? new Date(achievement.unlocked_at).toLocaleDateString() : null
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Achievements</h2>
            <button
              onClick={() => {
                playSound("button")
                onClose()
              }}
              className="text-gray-400 hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border ${
                    isUnlocked(achievement.id) ? "bg-purple-900/30 border-purple-500" : "bg-gray-700/50 border-gray-600"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isUnlocked(achievement.id) ? "bg-purple-600" : "bg-gray-600"
                      }`}
                    >
                      <span className="text-2xl">{achievement.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-bold">{achievement.name}</h3>
                      <p className="text-sm text-gray-300">{achievement.description}</p>
                      {isUnlocked(achievement.id) && (
                        <p className="text-xs text-purple-300 mt-1">Unlocked on {getUnlockDate(achievement.id)}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-700 flex justify-between">
          <div className="text-sm text-gray-400">
            {unlockedAchievements.length} of {achievements.length} achievements unlocked
          </div>
          <button
            onClick={() => {
              playSound("button")
              onClose()
            }}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
