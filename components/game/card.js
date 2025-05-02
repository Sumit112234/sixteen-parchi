"use client"

import { motion } from "framer-motion"

export default function Card({ card, onClick, selectable, customDesign }) {
  if (!card) return null

  const { hero, points } = card

  // Define colors for different heroes
  const heroColors = {
    Superman: "from-blue-600 to-blue-800 border-blue-400",
    Batman: "from-gray-800 to-gray-900 border-gray-600",
    "Wonder Woman": "from-red-600 to-red-800 border-red-400",
    Flash: "from-yellow-600 to-yellow-800 border-yellow-400",
  }

  const defaultBgColor = heroColors[hero] || "from-purple-600 to-purple-800 border-purple-400"

  // Apply custom design if available
  const style = customDesign
    ? {
        backgroundColor: customDesign.backgroundColor,
        color: customDesign.textColor,
        borderColor: customDesign.borderColor,
        borderWidth: `${customDesign.borderWidth}px`,
        borderRadius: `${customDesign.borderRadius}px`,
        fontFamily: customDesign.fontFamily,
        boxShadow: customDesign.glowEffect ? `0 0 15px ${customDesign.glowColor}` : "none",
        backgroundImage: customDesign.pattern !== "none" ? `url(/patterns/${customDesign.pattern}.svg)` : "none",
      }
    : {}

  return (
    <motion.div
      className={`${
        customDesign ? "" : `bg-gradient-to-br ${defaultBgColor}`
      } text-white rounded-lg p-3 flex flex-col items-center justify-between h-32 border shadow-lg
        ${selectable ? "cursor-pointer" : ""}
      `}
      style={style}
      onClick={onClick}
      whileHover={selectable ? { scale: 1.05 } : {}}
      whileTap={selectable ? { scale: 0.95 } : {}}
    >
      <h4 className="font-bold text-center text-sm">{hero}</h4>
      <div className="text-3xl font-bold">{points}</div>
      <div className="text-xs">points</div>
    </motion.div>
  )
}
