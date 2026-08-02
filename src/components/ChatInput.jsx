"use client";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Square, CornerDownLeft } from "lucide-react";

export default function ChatInput({ onSend, onStop, isStreaming, disabled }) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
    }
  }, [message]);

  const handleSubmit = () => {
    const trimmed = message.trim();
    if (!trimmed || isStreaming || disabled) return;
    onSend(trimmed);
    setMessage("");
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="chat-input-container">
      <div className="chat-input-wrapper">
        <div className="chat-input-glow" />
        <textarea
          ref={textareaRef}
          className="chat-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "Select a model to start chatting..." : "Type a message..."}
          rows={1}
          disabled={disabled || isStreaming}
        />
        <div className="chat-input-actions">
          {isStreaming ? (
            <motion.button
              className="chat-stop-btn"
              onClick={onStop}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Stop generating"
            >
              <Square size={16} fill="currentColor" />
            </motion.button>
          ) : (
            <motion.button
              className="chat-send-btn"
              onClick={handleSubmit}
              disabled={!message.trim() || disabled}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Send message (Enter)"
            >
              <Send size={18} />
            </motion.button>
          )}
        </div>
      </div>
      <div className="chat-input-hint">
        <CornerDownLeft size={12} />
        <span>Enter to send · Shift+Enter for new line</span>
      </div>
    </div>
  );
}
