"use client"

import { useEffect, useRef } from "react"

export function useAudio() {
  const audioRefs = useRef({})
  const audioContext = useRef(null)

  useEffect(() => {
    // Initialize audio context on user interaction
    const initAudio = () => {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || window.webkitAudioContext)()

        // Preload all sound effects
        const sounds = {
          cardPass: "/sounds/card-pass.mp3",
          victory: "/sounds/victory.mp3",
          gameStart: "/sounds/game-start.mp3",
          button: "/sounds/button-click.mp3",
          message: "/sounds/message.mp3",
          connect: "/sounds/connect.mp3",
          join: "/sounds/join.mp3",
          leave: "/sounds/leave.mp3",
          playerJoin: "/sounds/player-join.mp3",
          playerLeave: "/sounds/player-leave.mp3",
          success: "/sounds/success.mp3",
          error: "/sounds/error.mp3", // Add error sound
        }

        // Preload all sounds
        Object.entries(sounds).forEach(([name, url]) => {
          const audio = new Audio(url)
          audio.preload = "auto"
          audioRefs.current[name] = audio
        })
      }
    }

    // Initialize on first user interaction
    const handleInteraction = () => {
      initAudio()
      // Remove event listeners after initialization
      document.removeEventListener("click", handleInteraction)
      document.removeEventListener("keydown", handleInteraction)
    }

    document.addEventListener("click", handleInteraction)
    document.addEventListener("keydown", handleInteraction)

    return () => {
      document.removeEventListener("click", handleInteraction)
      document.removeEventListener("keydown", handleInteraction)
    }
  }, [])

  const playSound = (soundName) => {
    try {
      if (audioRefs.current[soundName]) {
        // Clone the audio to allow overlapping sounds
        const sound = audioRefs.current[soundName].cloneNode()
        sound.volume = 0.5 // Set volume to 50%
        sound.play().catch((err) => console.log("Audio play error:", err))
      }
    } catch (error) {
      console.error("Error playing sound:", error)
    }
  }

  return { playSound }
}
