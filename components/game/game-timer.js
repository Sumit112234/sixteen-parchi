"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

export default function GameTimer({ isActive, duration = 30, onTimeUp }) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [isWarning, setIsWarning] = useState(false)

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(duration)
      setIsWarning(false)
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1

        // Set warning when less than 10 seconds left
        if (newTime <= 10 && !isWarning) {
          setIsWarning(true)
        }

        // Time's up
        if (newTime <= 0) {
          clearInterval(timer)
          if (onTimeUp) onTimeUp()
          return 0
        }

        return newTime
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isActive, duration, onTimeUp, isWarning])

  // Reset when duration changes
  useEffect(() => {
    setTimeLeft(duration)
  }, [duration])

  // Calculate progress percentage
  const progress = (timeLeft / duration) * 100

  return (
    <div className="w-full">
      <div className="flex justify-between items-center text-sm mb-1">
        <span>Time Left</span>
        <span className={isWarning ? "text-red-400 font-bold" : ""}>{timeLeft}s</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
        <motion.div
          className={`h-full ${isWarning ? "bg-red-600" : "bg-green-600"}`}
          style={{ width: `${progress}%` }}
          animate={{
            width: `${progress}%`,
          }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  )
}
