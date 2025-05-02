"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"

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
      <div className="p-3 border-b border-gray-700">
        <h3 className="font-bold">Game Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center text-sm italic">No messages yet. Say hello!</p>
        ) : (
          messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.senderId === playerInfo.id ? "justify-end" : "justify-start"}`}
            >
              <div className="flex items-start max-w-[80%]">
                {msg.senderId !== playerInfo.id && msg.senderId !== "system" && (
                  <div className="w-6 h-6 rounded-full bg-gray-700 flex-shrink-0 mr-2 overflow-hidden">
                    <img
                      src={`/avatars/avatar-${msg.senderAvatar}.png`}
                      alt={msg.senderName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div
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
                >
                  {msg.senderId !== playerInfo.id && msg.senderId !== "system" && (
                    <div className="font-bold text-xs text-gray-300 mb-1">
                      {msg.senderName} {msg.isSpectator && "(Spectator)"}
                    </div>
                  )}
                  <p>{msg.text}</p>
                </div>

                {msg.senderId === playerInfo.id && (
                  <div className="w-6 h-6 rounded-full bg-gray-700 flex-shrink-0 ml-2 overflow-hidden">
                    <img
                      src={`/avatars/avatar-${msg.senderAvatar}.png`}
                      alt={msg.senderName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-700 flex">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 bg-gray-700 rounded-l-md px-3 py-2 text-white border-0 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder={isSpectator ? "Chat as spectator..." : "Type a message..."}
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className="bg-purple-600 text-white px-4 py-2 rounded-r-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </motion.div>
  )
}
