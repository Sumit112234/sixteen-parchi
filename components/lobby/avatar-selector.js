"use client"

import { motion } from "framer-motion"

export default function AvatarSelector({ selectedAvatar, onSelectAvatar }) {
  // We'll have 8 avatar options
  const avatarCount = 8

  return (
    <div>
      <label className="block text-sm font-medium mb-2">Select Your Avatar</label>
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: avatarCount }).map((_, index) => {
          const avatarId = index + 1
          return (
            <motion.div
              key={avatarId}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectAvatar(avatarId)}
              className={`
                cursor-pointer rounded-lg p-1 border-2 
                ${
                  selectedAvatar === avatarId
                    ? "border-purple-500 bg-purple-900/30"
                    : "border-gray-600 hover:border-gray-400"
                }
              `}
            >
              <div className="w-full aspect-square rounded overflow-hidden">
                <img
                  src={`https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQt_0plSJKNSdr-PRYr_V36bNZDdEa_TXeBqg&s`}
                  alt={`Avatar ${avatarId}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
