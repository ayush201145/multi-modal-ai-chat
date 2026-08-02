"use client";
import { motion } from "framer-motion";
import ModelSelector from "./ModelSelector";
import { Menu, LogOut, Wifi, WifiOff, ShieldCheck } from "lucide-react";

export default function Header({
  providers,
  selectedModel,
  onSelectModel,
  onToggleSidebar,
  onLogout,
  onOpenDiagnostics,
  isConnected,
}) {
  return (
    <header className="app-header">
      <div className="header-left">
        <motion.button
          className="header-menu-btn"
          onClick={onToggleSidebar}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Menu size={20} />
        </motion.button>

        <ModelSelector
          providers={providers}
          selectedModel={selectedModel}
          onSelectModel={onSelectModel}
        />
      </div>

      <div className="header-right">
        {/* Connection status */}
        <div className={`header-status ${isConnected ? "header-status-online" : "header-status-offline"}`}>
          {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
          <span>{isConnected ? "Connected" : "Offline"}</span>
        </div>

        <motion.button
          className="header-check-btn"
          onClick={onOpenDiagnostics}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Check API Keys & Available Models"
        >
          <ShieldCheck size={15} />
          <span className="hidden sm:inline">Check Models</span>
        </motion.button>

        <motion.button
          className="header-logout-btn"
          onClick={onLogout}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Logout"
        >
          <LogOut size={18} />
        </motion.button>
      </div>
    </header>
  );
}
