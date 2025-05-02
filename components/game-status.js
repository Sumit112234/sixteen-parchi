"use client"

export default function GameStatus({ gameState, startGame, resetGame }) {
  const { players, gameStarted, winner } = gameState

  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Game Status</h2>

        {!gameStarted && players.length >= 2 && (
          <button
            onClick={startGame}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Start Game ({players.length}/4 players)
          </button>
        )}

        {winner && (
          <button
            onClick={resetGame}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Play Again
          </button>
        )}
      </div>

      {!gameStarted && players.length < 2 && (
        <p className="mt-2">Waiting for more players to join... ({players.length}/4)</p>
      )}

      {winner && (
        <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
          <p className="text-xl font-bold text-center">
            {winner.name} wins with 4 {winner.winningHero} cards!
          </p>
        </div>
      )}
    </div>
  )
}
