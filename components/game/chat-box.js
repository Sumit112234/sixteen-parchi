"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../custom/button"
import { Input } from "../custom/input"

export default function ChatBox({ messages, onSendMessage, playerInfo, isSpectator }) {
  const [message, setMessage] = useState("")
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim()) {
      onSendMessage(message)
      setMessage("")
    }
  }

  return (
    <motion.div
      className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 flex flex-col h-[500px]"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <motion.div
        className="p-3 border-b border-gray-700"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h3 className="font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
          Game Chat
        </h3>
      </motion.div>

      <motion.div
        className="flex-1 overflow-y-auto p-3 space-y-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center text-sm italic">No messages yet. Say hello!</p>
        ) : (
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex ${msg.senderId === playerInfo.id ? "justify-end" : "justify-start"}`}
              >
                <div className="flex items-start max-w-[80%]">
                  {msg.senderId !== playerInfo.id && msg.senderId !== "system" && (
                    <motion.div
                      className="w-6 h-6 rounded-full bg-gray-700 flex-shrink-0 mr-2 overflow-hidden"
                      whileHover={{ scale: 1.2 }}
                    >
                      <img
                        src={`/avatars/avatar-${msg.senderAvatar}.png`}
                        alt={msg.senderName}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  )}

                  <motion.div
                    className={`rounded-lg px-3 py-2 text-sm ${
                      msg.senderId === "system"
                        ? msg.isError
                          ? "bg-red-900/50 text-red-300 italic"
                          : "bg-gray-700/50 text-gray-300 italic"
                        : msg.senderId === playerInfo.id
                          ? "bg-purple-700 text-white"
                          : msg.isSpectator
                            ? "bg-blue-700/70 text-white"
                            : "bg-gray-700 text-white"
                    }`}
                    whileHover={{ scale: 1.02 }}
                  >
                    {msg.senderId !== playerInfo.id && msg.senderId !== "system" && (
                      <div className="font-bold text-xs text-gray-300 mb-1">
                        {msg.senderName} {msg.isSpectator && "(Spectator)"}
                      </div>
                    )}
                    <p>{msg.text}</p>
                  </motion.div>

                  {msg.senderId === playerInfo.id && (
                    <motion.div
                      className="w-6 h-6 rounded-full bg-gray-700 flex-shrink-0 ml-2 overflow-hidden"
                      whileHover={{ scale: 1.2 }}
                    >
                      <img
                        src={`/avatars/avatar-${msg.senderAvatar}.png`}
                        alt={msg.senderName}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </motion.div>

      <motion.form
        onSubmit={handleSubmit}
        className="p-3 border-t border-gray-700 flex"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 rounded-r-none"
          placeholder={isSpectator ? "Chat as spectator..." : "Type a message..."}
        />
        <Button type="submit" disabled={!message.trim()} className="rounded-l-none">
          Send
        </Button>
      </motion.form>
    </motion.div>
  )
}
