"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, X, RefreshCw, CheckCircle2, XCircle, AlertTriangle, Key } from "lucide-react";

export default function KeyDiagnosticsModal({ isOpen, onClose, token }) {
  const [loading, setLoading] = useState(false);
  const [diagnostics, setDiagnostics] = useState(null);
  const [error, setError] = useState(null);

  const runCheck = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/check-keys", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error(`Status ${res.status}`);
      }
      const data = await res.json();
      setDiagnostics(data.keyDiagnostics);
    } catch (err) {
      setError(err.message || "Failed to run diagnostics");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isOpen) {
      runCheck();
    }
  }, [isOpen, runCheck]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose}>
        <motion.div
          className="modal-content"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <div className="modal-title">
              <ShieldCheck size={20} className="text-indigo-400" />
              <span>API Key & Model Diagnostics</span>
            </div>
            <button className="modal-close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          <div className="modal-body">
            {loading ? (
              <div className="modal-loading">
                <RefreshCw size={24} className="animate-spin text-indigo-400" />
                <p>Testing API keys & model endpoints...</p>
              </div>
            ) : error ? (
              <div className="modal-error">
                <AlertTriangle size={20} />
                <span>{error}</span>
              </div>
            ) : diagnostics ? (
              <div className="diagnostics-list">
                {Object.entries(diagnostics).map(([key, provider]) => (
                  <div key={key} className="diag-provider-card">
                    <div className="diag-provider-header">
                      <span className="diag-provider-name">{provider.name}</span>
                      <span className={`diag-badge diag-badge-${provider.status}`}>
                        {provider.status === "active" && (
                          <>
                            <CheckCircle2 size={13} /> Active
                          </>
                        )}
                        {provider.status === "missing_key" && (
                          <>
                            <Key size={13} /> Missing Key
                          </>
                        )}
                        {provider.status === "key_error" && (
                          <>
                            <XCircle size={13} /> Key Error
                          </>
                        )}
                      </span>
                    </div>

                    {provider.message && (
                      <p className="diag-provider-msg">{provider.message}</p>
                    )}

                    {provider.testedModels?.length > 0 && (
                      <div className="diag-models-grid">
                        {provider.testedModels.map((model) => (
                          <div key={model.id} className="diag-model-item">
                            <div className="diag-model-info">
                              <span className="diag-model-name">{model.name}</span>
                              <span className="diag-model-id">{model.id}</span>
                            </div>
                            <span className={`diag-model-status diag-model-${model.status}`}>
                              {model.status === "working" ? (
                                <CheckCircle2 size={14} className="text-emerald-400" />
                              ) : (
                                <XCircle size={14} className="text-rose-400" />
                              )}
                              <span className="text-xs">{model.message}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="modal-footer">
            <button className="modal-btn-secondary" onClick={runCheck} disabled={loading}>
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Re-test Keys
            </button>
            <button className="modal-btn-primary" onClick={onClose}>
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
