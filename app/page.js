// import LobbyScreen from "@/components/lobby/lobby-screen"


import LobbyScreen from "../components/lobby/lobby-screen";


export default function Home() {
 
 
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24 bg-gradient-to-br from-indigo-900 to-purple-900 text-white">
      <div className="z-10 w-full max-w-6xl items-center justify-center font-mono text-sm">
        <h1 className="text-5xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-400 to-pink-500">
          Superhero Card Game
        </h1>

        <LobbyScreen />
      </div>
    </main>
  )
}
