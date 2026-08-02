"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, Zap, ArrowRight } from "lucide-react";

export default function LockScreen({ onAuthenticated, login, loading, error, clearError }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    const success = await login(password);
    if (success) {
      onAuthenticated();
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <div className="lock-screen">
      {/* Animated 3D background */}
      <div className="lock-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="orb orb-4" />
        <div className="grid-floor" />
        {/* Floating particles (deterministic calculation to prevent SSR hydration mismatch) */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${((i * 37) % 90) + 5}%`,
              top: `${((i * 53) % 90) + 5}%`,
              animationDelay: `${((i * 1.3) % 8).toFixed(1)}s`,
              animationDuration: `${(6 + ((i * 1.7) % 8)).toFixed(1)}s`,
            }}
          />
        ))}
      </div>

      {/* Login card */}
      <motion.div
        initial={{ opacity: 0, y: 40, rotateX: 10 }}
        animate={{
          opacity: 1,
          y: 0,
          rotateX: 0,
          x: shake ? [0, -12, 12, -8, 8, -4, 4, 0] : 0,
        }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="lock-card"
        style={{ perspective: "1200px" }}
      >
        {/* Glow ring */}
        <div className="lock-glow" />

        {/* Logo */}
        <motion.div
          className="lock-logo"
          animate={{ rotateY: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <div className="lock-logo-inner">
            <Zap size={32} strokeWidth={1.5} />
          </div>
        </motion.div>

        <motion.h1
          className="lock-title"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Nexus Chat
        </motion.h1>
        <motion.p
          className="lock-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Multi-model AI interface
        </motion.p>

        <form onSubmit={handleSubmit} className="lock-form">
          <div className="lock-input-group">
            <Lock size={18} className="lock-input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter access code"
              className="lock-input"
              autoFocus
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="lock-eye-btn"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="lock-error"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            className="lock-submit"
            disabled={loading || !password}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <div className="lock-spinner" />
            ) : (
              <>
                Unlock
                <ArrowRight size={18} />
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
