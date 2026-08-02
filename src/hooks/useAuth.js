"use client";
import { useState, useEffect, useCallback } from "react";

/**
 * Auth hook — manages login state and session token.
 */
export function useAuth() {
  const [token, setToken] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const savedToken = sessionStorage.getItem("nexus_token");
    if (savedToken) setToken(savedToken);
    setMounted(true);
  }, []);

  const login = useCallback(async (password) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data?.error?.message || "Authentication failed";
        setError(msg);
        return false;
      }

      sessionStorage.setItem("nexus_token", data.token);
      setToken(data.token);
      return true;
    } catch (err) {
      setError("Network error. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem("nexus_token");
    setToken(null);
  }, []);

  return {
    token,
    mounted,
    isAuthenticated: !!token,
    loading,
    error,
    login,
    logout,
    clearError: () => setError(null),
  };
}
