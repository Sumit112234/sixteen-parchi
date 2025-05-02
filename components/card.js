"use client"

export default function Card({ card, onClick, selectable }) {
  if (!card) return null

  const { hero, points } = card

  // Define colors for different heroes
  const heroColors = {
    Superman: "bg-blue-600",
    Batman: "bg-gray-800",
    "Wonder Woman": "bg-red-600",
    Flash: "bg-yellow-600",
  }

  const bgColor = heroColors[hero] || "bg-purple-600"

  return (
    <div
      className={`${bgColor} text-white rounded-lg p-4 flex flex-col items-center justify-between h-32 
        ${selectable ? "cursor-pointer transform hover:scale-105 transition-transform" : ""}
      `}
      onClick={onClick}
    >
      <h4 className="font-bold text-center">{hero}</h4>
      <div className="text-2xl font-bold">{points} pts</div>
    </div>
  )
}
