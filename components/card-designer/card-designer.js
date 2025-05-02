"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAudio } from "@/hooks/use-audio"

const HEROES = ["Superman", "Batman", "Wonder Woman", "Flash"]
const DEFAULT_DESIGN = {
  backgroundColor: "#4338ca",
  textColor: "#ffffff",
  borderColor: "#6366f1",
  borderWidth: 1,
  borderRadius: 8,
  fontFamily: "Inter, sans-serif",
  glowEffect: false,
  glowColor: "#6366f1",
  pattern: "none",
}

export default function CardDesigner({ userId, onSave, onClose  }) {

  const [designs, setDesigns] = useState({})
  const [currentDesign, setCurrentDesign] = useState({ ...DEFAULT_DESIGN })
  const [designName, setDesignName] = useState("")
  const [selectedHero, setSelectedHero] = useState("Superman")
  const [points, setPoints] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)

  const { playSound } = useAudio()

  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`)
        const data = await response.json()

        if (response.ok && data.user.customCardDesigns) {
          setDesigns(data.user.customCardDesigns)
        }
      } catch (error) {
        console.error("Error fetching designs:", error)
      }
    }

    if (userId) {
      fetchDesigns()
    }
  }, [userId])

  const handleDesignChange = (property, value) => {
    setCurrentDesign((prev) => ({ ...prev, [property]: value }))
    playSound("button")
  }

  const handleSaveDesign = async () => {
    if (!designName.trim()) {
      setError("Please enter a design name")
      playSound("error")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardDesign: {
            name: designName,
            design: currentDesign,
          },
        }),
      })

      if (response.ok) {
        setDesigns((prev) => ({ ...prev, [designName]: currentDesign }))
        setSaved(true)
        playSound("success")

        // Reset after 2 seconds
        setTimeout(() => {
          setSaved(false)
          setDesignName("")
        }, 2000)

        if (onSave) {
          onSave(designName, currentDesign)
        }
      } else {
        const data = await response.json()
        setError(data.error || "Failed to save design")
        playSound("error")
      }
    } catch (error) {
      setError(error.message || "An error occurred")
      playSound("error")
    } finally {
      setLoading(false)
    }
  }

  const loadDesign = (name) => {
    if (designs[name]) {
      setCurrentDesign(designs[name])
      setDesignName(name)
      playSound("button")
    }
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Card Designer</h2>
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

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-100 px-4 py-2 rounded mb-4">{error}</div>
        )}

        {saved && (
          <div className="bg-green-900/50 border border-green-500 text-green-100 px-4 py-2 rounded mb-4">
            Design saved successfully!
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Preview</h3>
            <div className="flex justify-center mb-4">
              <div
                style={{
                  backgroundColor: currentDesign.backgroundColor,
                  color: currentDesign.textColor,
                  borderColor: currentDesign.borderColor,
                  borderWidth: `${currentDesign.borderWidth}px`,
                  borderRadius: `${currentDesign.borderRadius}px`,
                  fontFamily: currentDesign.fontFamily,
                  boxShadow: currentDesign.glowEffect ? `0 0 15px ${currentDesign.glowColor}` : "none",
                  backgroundImage:
                    currentDesign.pattern !== "none" ? `url(/patterns/${currentDesign.pattern}.svg)` : "none",
                }}
                className="w-48 h-64 rounded-lg p-3 flex flex-col items-center justify-between border shadow-lg"
              >
                <h4 className="font-bold text-center text-sm">{selectedHero}</h4>
                <div className="text-3xl font-bold">{points}</div>
                <div className="text-xs">points</div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Hero</label>
                <select
                  value={selectedHero}
                  onChange={(e) => setSelectedHero(e.target.value)}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
                >
                  {HEROES.map((hero) => (
                    <option key={hero} value={hero}>
                      {hero}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Points</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium mb-1">Design Name</label>
                <input
                  type="text"
                  value={designName}
                  onChange={(e) => setDesignName(e.target.value)}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
                  placeholder="My Custom Design"
                />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={handleSaveDesign}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Saving..." : "Save Design"}
                </button>
              </div>
            </div>

            {Object.keys(designs).length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Saved Designs</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(designs).map((name) => (
                    <button
                      key={name}
                      onClick={() => loadDesign(name)}
                      className="px-3 py-1 bg-gray-700 rounded-full text-sm hover:bg-gray-600"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Customize</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Background Color</label>
                <div className="flex items-center">
                  <input
                    type="color"
                    value={currentDesign.backgroundColor}
                    onChange={(e) => handleDesignChange("backgroundColor", e.target.value)}
                    className="w-10 h-10 rounded mr-2"
                  />
                  <input
                    type="text"
                    value={currentDesign.backgroundColor}
                    onChange={(e) => handleDesignChange("backgroundColor", e.target.value)}
                    className="flex-1 p-2 bg-gray-700 rounded border border-gray-600 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Text Color</label>
                <div className="flex items-center">
                  <input
                    type="color"
                    value={currentDesign.textColor}
                    onChange={(e) => handleDesignChange("textColor", e.target.value)}
                    className="w-10 h-10 rounded mr-2"
                  />
                  <input
                    type="text"
                    value={currentDesign.textColor}
                    onChange={(e) => handleDesignChange("textColor", e.target.value)}
                    className="flex-1 p-2 bg-gray-700 rounded border border-gray-600 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Border Color</label>
                <div className="flex items-center">
                  <input
                    type="color"
                    value={currentDesign.borderColor}
                    onChange={(e) => handleDesignChange("borderColor", e.target.value)}
                    className="w-10 h-10 rounded mr-2"
                  />
                  <input
                    type="text"
                    value={currentDesign.borderColor}
                    onChange={(e) => handleDesignChange("borderColor", e.target.value)}
                    className="flex-1 p-2 bg-gray-700 rounded border border-gray-600 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Border Width</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={currentDesign.borderWidth}
                  onChange={(e) => handleDesignChange("borderWidth", Number.parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-sm text-gray-400 text-right">{currentDesign.borderWidth}px</div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Border Radius</label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={currentDesign.borderRadius}
                  onChange={(e) => handleDesignChange("borderRadius", Number.parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-sm text-gray-400 text-right">{currentDesign.borderRadius}px</div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Font Family</label>
                <select
                  value={currentDesign.fontFamily}
                  onChange={(e) => handleDesignChange("fontFamily", e.target.value)}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
                >
                  <option value="Inter, sans-serif">Inter</option>
                  <option value="'Courier New', monospace">Courier</option>
                  <option value="'Times New Roman', serif">Times New Roman</option>
                  <option value="Arial, sans-serif">Arial</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="glowEffect"
                  checked={currentDesign.glowEffect}
                  onChange={(e) => handleDesignChange("glowEffect", e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="glowEffect" className="text-sm font-medium">
                  Glow Effect
                </label>
              </div>

              {currentDesign.glowEffect && (
                <div>
                  <label className="block text-sm font-medium mb-1">Glow Color</label>
                  <div className="flex items-center">
                    <input
                      type="color"
                      value={currentDesign.glowColor}
                      onChange={(e) => handleDesignChange("glowColor", e.target.value)}
                      className="w-10 h-10 rounded mr-2"
                    />
                    <input
                      type="text"
                      value={currentDesign.glowColor}
                      onChange={(e) => handleDesignChange("glowColor", e.target.value)}
                      className="flex-1 p-2 bg-gray-700 rounded border border-gray-600 text-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Background Pattern</label>
                <select
                  value={currentDesign.pattern}
                  onChange={(e) => handleDesignChange("pattern", e.target.value)}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
                >
                  <option value="none">None</option>
                  <option value="dots">Dots</option>
                  <option value="lines">Lines</option>
                  <option value="grid">Grid</option>
                  <option value="waves">Waves</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
