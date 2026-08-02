"use client";
import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import Sidebar from "./Sidebar";
import Header from "./Header";
import ChatWindow from "./ChatWindow";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useChatStream } from "@/hooks/useChatStream";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export default function ChatApp({ token, onLogout }) {
  // Persisted state
  const [chats, setChats] = useLocalStorage("nexus_chats", []);
  const [activeChatId, setActiveChatId] = useLocalStorage("nexus_active_chat", null);
  const [selectedModel, setSelectedModel] = useLocalStorage("nexus_model", null);

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [providers, setProviders] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const [streamingContent, setStreamingContent] = useState("");

  const activeChat = chats.find((c) => c.id === activeChatId);

  // Error handler for chat stream
  const handleStreamError = useCallback((error) => {
    toast.error(error.message || "An error occurred", {
      duration: 5000,
      style: {
        background: "#1a1b2e",
        color: "#f1f5f9",
        border: "1px solid rgba(239, 68, 68, 0.3)",
        borderRadius: "12px",
      },
      iconTheme: { primary: "#ef4444", secondary: "#1a1b2e" },
    });
  }, []);

  const { sendMessage, stopStreaming, isStreaming } = useChatStream({
    token,
    onError: handleStreamError,
  });

  // Fetch available models on mount
  useEffect(() => {
    async function fetchModels() {
      try {
        const res = await fetch("/api/models", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setProviders(data.providers);
          setIsConnected(true);
        } else {
          setIsConnected(false);
          toast.error("Failed to load available models");
        }
      } catch {
        setIsConnected(false);
        toast.error("Cannot connect to server");
      }
    }
    fetchModels();
  }, [token]);

  // Create a new chat
  const createNewChat = useCallback(() => {
    const newChat = {
      id: generateId(),
      title: "New Chat",
      messages: [],
      createdAt: Date.now(),
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    setSidebarOpen(false);
  }, [setChats, setActiveChatId]);

  // Delete a chat
  const deleteChat = useCallback(
    (chatId) => {
      setChats((prev) => prev.filter((c) => c.id !== chatId));
      if (activeChatId === chatId) {
        setActiveChatId(null);
      }
    },
    [activeChatId, setChats, setActiveChatId]
  );

  // Clear all chats
  const clearAllChats = useCallback(() => {
    setChats([]);
    setActiveChatId(null);
  }, [setChats, setActiveChatId]);

  // Send a message
  const handleSend = useCallback(
    async (content) => {
      if (!selectedModel) {
        toast.error("Please select a model first");
        return;
      }

      // Auto-create chat if none active
      let currentChatId = activeChatId;
      if (!currentChatId) {
        const newChat = {
          id: generateId(),
          title: content.slice(0, 40) + (content.length > 40 ? "..." : ""),
          messages: [],
          createdAt: Date.now(),
        };
        setChats((prev) => [newChat, ...prev]);
        setActiveChatId(newChat.id);
        currentChatId = newChat.id;
      }

      // Add user message
      const userMessage = {
        id: generateId(),
        role: "user",
        content,
        timestamp: Date.now(),
      };

      setChats((prev) =>
        prev.map((c) => {
          if (c.id === currentChatId) {
            const updated = {
              ...c,
              messages: [...c.messages, userMessage],
              title: c.messages.length === 0 ? content.slice(0, 40) + (content.length > 40 ? "..." : "") : c.title,
            };
            return updated;
          }
          return c;
        })
      );

      setStreamingContent("");

      // Prepare chat history + new message for API
      const previousMessages = activeChatId
        ? (chats.find((c) => c.id === currentChatId)?.messages || [])
        : [];
      
      const chatMessages = [...previousMessages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Stream response
      const result = await sendMessage(
        chatMessages,
        selectedModel.provider,
        selectedModel.modelId,
        (chunkText) => setStreamingContent(chunkText)
      );

      if (result) {
        const assistantMessage = {
          id: generateId(),
          role: "assistant",
          content: result,
          timestamp: Date.now(),
        };

        setChats((prev) =>
          prev.map((c) => {
            if (c.id === currentChatId) {
              return { ...c, messages: [...c.messages, assistantMessage] };
            }
            return c;
          })
        );
      }

      setStreamingContent("");
    },
    [selectedModel, activeChatId, chats, setChats, setActiveChatId, sendMessage]
  );

  return (
    <div className="app-layout">
      {/* Ambient background */}
      <div className="app-bg">
        <div className="app-bg-orb app-bg-orb-1" />
        <div className="app-bg-orb app-bg-orb-2" />
        <div className="app-bg-orb app-bg-orb-3" />
      </div>

      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={(id) => {
          setActiveChatId(id);
          setSidebarOpen(false);
        }}
        onNewChat={createNewChat}
        onDeleteChat={deleteChat}
        onClearAll={clearAllChats}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="app-main">
        <Header
          providers={providers}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onLogout={onLogout}
          isConnected={isConnected}
        />

        <ChatWindow
          messages={activeChat?.messages || []}
          isStreaming={isStreaming}
          streamingContent={streamingContent}
          onSend={handleSend}
          onStop={stopStreaming}
          selectedModel={selectedModel}
        />
      </main>
    </div>
  );
}
