"use client"

import Card from "./card"

export default function PlayerHand({ player, isCurrentPlayer, isLocalPlayer, onCardSelect, gameStarted, winner }) {
  if (!player) return null

  return (
    <div className={`p-4 rounded-lg border-2 ${isCurrentPlayer ? "border-green-500" : "border-gray-300"}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-bold">
          {player.name} {isLocalPlayer && "(You)"}
        </h3>
        {isCurrentPlayer && !winner && <span className="text-green-500 font-bold">Your turn!</span>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {isLocalPlayer
          ? player.hand?.map((card, index) => (
              <Card
                key={index}
                card={card}
                onClick={() => (isCurrentPlayer && gameStarted && !winner ? onCardSelect(index) : null)}
                selectable={isCurrentPlayer && gameStarted && !winner}
              />
            ))
          : // Show card backs for other players
            Array(player.handSize || 0)
              .fill()
              .map((_, index) => (
                <div key={index} className="bg-blue-800 rounded-lg h-32 flex items-center justify-center text-white">
                  Card
                </div>
              ))}
      </div>
    </div>
  )
}
