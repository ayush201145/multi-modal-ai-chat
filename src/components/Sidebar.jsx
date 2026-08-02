"use client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  MessageSquare,
  X,
  Eraser,
  ChevronLeft,
  Zap,
} from "lucide-react";

export default function Sidebar({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onClearAll,
  isOpen,
  onClose,
}) {
  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`sidebar ${isOpen ? "sidebar-open" : ""}`}
        initial={false}
        animate={{ x: isOpen ? 0 : undefined }}
      >
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-logo">
              <Zap size={20} />
            </div>
            <span className="sidebar-brand-text">Nexus Chat</span>
          </div>
          <button onClick={onClose} className="sidebar-close-btn">
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* New Chat button */}
        <motion.button
          className="sidebar-new-btn"
          onClick={onNewChat}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus size={18} />
          New Chat
        </motion.button>

        {/* Chat list */}
        <div className="sidebar-list">
          <AnimatePresence initial={false}>
            {chats.map((chat) => (
              <motion.div
                key={chat.id}
                className={`sidebar-chat-item ${
                  chat.id === activeChatId ? "sidebar-chat-active" : ""
                }`}
                onClick={() => onSelectChat(chat.id)}
                role="button"
                tabIndex={0}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20, height: 0 }}
                layout
              >
                <MessageSquare size={16} className="sidebar-chat-icon" />
                <span className="sidebar-chat-title">
                  {chat.title || "New Chat"}
                </span>
                <button
                  className="sidebar-chat-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {chats.length === 0 && (
            <div className="sidebar-empty">
              <MessageSquare size={24} className="opacity-30" />
              <p>No conversations yet</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {chats.length > 0 && (
          <div className="sidebar-footer">
            <button className="sidebar-clear-btn" onClick={onClearAll}>
              <Eraser size={16} />
              Clear All Chats
            </button>
          </div>
        )}
      </motion.aside>
    </>
  );
}
