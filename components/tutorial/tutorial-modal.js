"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useAudio } from "@/hooks/use-audio"

const tutorialSteps = [
  {
    title: "Welcome to Superhero Card Game!",
    content: "This tutorial will guide you through the basics of the game. Click 'Next' to continue.",
    image: "/tutorial/welcome.png",
  },
  {
    title: "Game Objective",
    content: "The goal is to collect 4 cards of the same superhero. The first player to do so wins the game!",
    image: "/tutorial/objective.png",
  },
  {
    title: "Game Setup",
    content:
      "Each player starts with 4 random superhero cards. You can see your cards, but not the cards of other players.",
    image: "/tutorial/setup.png",
  },
  {
    title: "Taking Turns",
    content: "On your turn, select one card from your hand to pass to the next player. The game continues clockwise.",
    image: "/tutorial/turns.png",
  },
  {
    title: "Card Passing Rule",
    content: "You cannot pass the card you just received unless you have multiple cards of that hero.",
    image: "/tutorial/passing.png",
  },
  {
    title: "Winning the Game",
    content: "Collect 4 cards of the same superhero to win! The game ends immediately when a player wins.",
    image: "/tutorial/winning.png",
  },
  {
    title: "Game Features",
    content: "Use the chat to communicate with other players. You can also customize your cards and track your stats!",
    image: "/tutorial/features.png",
  },
  {
    title: "Ready to Play?",
    content: "You're now ready to play Superhero Card Game! Join a room or create your own to start playing.",
    image: "/tutorial/ready.png",
  },
]

export default function TutorialModal({ onComplete, onClose }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [showTutorial, setShowTutorial] = useState(true)
  const { playSound } = useAudio()

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1)
      playSound("button")
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      playSound("button")
    }
  }

  const handleComplete = async () => {
    playSound("success")
    if (onComplete) {
      await onComplete()
    }
    setShowTutorial(false)
  }

  const handleSkip = () => {
    playSound("button")
    setShowTutorial(false)
    if (onClose) {
      onClose()
    }
  }

  if (!showTutorial) {
    return null
  }

  const step = tutorialSteps[currentStep]

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
            <h2 className="text-2xl font-bold">{step.title}</h2>
            <button onClick={handleSkip} className="text-gray-400 hover:text-white">
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
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2">
              <div className="bg-gray-700 rounded-lg overflow-hidden h-64 flex items-center justify-center">
                <img
                  src={step.image || "/placeholder.svg?height=300&width=400"}
                  alt={`Tutorial step ${currentStep + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>
            <div className="md:w-1/2">
              <p className="text-lg mb-4">{step.content}</p>
              <div className="flex items-center justify-between mt-8">
                <div className="flex space-x-2">
                  {Array.from({ length: tutorialSteps.length }).map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${index === currentStep ? "bg-purple-500" : "bg-gray-600"}`}
                    />
                  ))}
                </div>
                <div className="text-sm text-gray-400">
                  Step {currentStep + 1} of {tutorialSteps.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-700 flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            {currentStep === tutorialSteps.length - 1 ? "Complete" : "Next"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
