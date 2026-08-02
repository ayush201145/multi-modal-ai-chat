"use client";
import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import { Zap, MessageSquarePlus, Sparkles } from "lucide-react";

export default function ChatWindow({
  messages,
  isStreaming,
  streamingContent,
  onSend,
  onStop,
  selectedModel,
}) {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const allMessages = [
    ...messages,
    ...(isStreaming && streamingContent
      ? [{ id: "streaming", role: "assistant", content: streamingContent }]
      : []),
  ];

  return (
    <div className="chat-window">
      <div className="chat-messages" ref={containerRef}>
        {allMessages.length === 0 ? (
          <div className="chat-empty">
            {/* 3D animated empty state */}
            <motion.div
              className="chat-empty-visual"
              animate={{
                rotateY: [0, 10, -10, 0],
                rotateX: [0, -5, 5, 0],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              style={{ perspective: "600px", transformStyle: "preserve-3d" }}
            >
              <div className="chat-empty-cube">
                <div className="cube-face cube-front">
                  <Zap size={40} />
                </div>
                <div className="cube-face cube-back">
                  <Sparkles size={40} />
                </div>
                <div className="cube-face cube-right">
                  <MessageSquarePlus size={40} />
                </div>
                <div className="cube-face cube-left">
                  <Zap size={40} />
                </div>
              </div>
            </motion.div>

            <motion.h2
              className="chat-empty-title"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Start a conversation
            </motion.h2>
            <motion.p
              className="chat-empty-subtitle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {selectedModel
                ? "Type a message below to begin chatting"
                : "Select a model from the header to get started"}
            </motion.p>

            {/* Quick prompts */}
            {selectedModel && (
              <motion.div
                className="chat-quick-prompts"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                {[
                  "Explain quantum computing simply",
                  "Write a Python web scraper",
                  "Compare React vs Vue vs Svelte",
                  "Help me debug my code",
                ].map((prompt) => (
                  <motion.button
                    key={prompt}
                    className="quick-prompt-btn"
                    onClick={() => onSend(prompt)}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {prompt}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </div>
        ) : (
          <div className="messages-list">
            {allMessages.map((msg, i) => (
              <MessageBubble key={msg.id || i} message={msg} index={i} />
            ))}
            {isStreaming && !streamingContent && (
              <motion.div
                className="typing-indicator"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </motion.div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        onSend={onSend}
        onStop={onStop}
        isStreaming={isStreaming}
        disabled={!selectedModel}
      />
    </div>
  );
}
