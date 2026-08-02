"use client";
import { Toaster } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import LockScreen from "@/components/LockScreen";
import ChatApp from "@/components/ChatApp";

export default function Home() {
  const { token, mounted, isAuthenticated, loading, error, login, logout, clearError } = useAuth();

  if (!mounted) return null;

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#1a1b2e",
            color: "#f1f5f9",
            border: "1px solid rgba(99, 102, 241, 0.2)",
            borderRadius: "12px",
            fontSize: "14px",
          },
        }}
      />

      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <motion.div
            key="lock"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
          >
            <LockScreen
              onAuthenticated={() => {}}
              login={login}
              loading={loading}
              error={error}
              clearError={clearError}
            />
          </motion.div>
        ) : (
          <motion.div
            key="app"
            className="app-root"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <ChatApp token={token} onLogout={logout} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
