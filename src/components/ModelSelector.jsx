"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sparkles, Brain, Gem, Route, Check, AlertCircle } from "lucide-react";

const PROVIDER_ICONS = {
  openai: Sparkles,
  anthropic: Brain,
  google: Gem,
  openrouter: Route,
};

export default function ModelSelector({ providers, selectedModel, onSelectModel }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const getSelectedModelInfo = () => {
    if (!selectedModel) return null;
    for (const [provKey, prov] of Object.entries(providers || {})) {
      const model = prov.models?.find((m) => m.id === selectedModel.modelId);
      if (model && provKey === selectedModel.provider) {
        return { ...model, providerName: prov.name, providerKey: provKey, color: prov.color };
      }
    }
    return null;
  };

  const selected = getSelectedModelInfo();
  const SelectedIcon = selected ? PROVIDER_ICONS[selected.providerKey] : null;

  return (
    <div className="model-selector" ref={dropdownRef}>
      <motion.button
        className="model-selector-trigger"
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.97 }}
      >
        {selected ? (
          <>
            {SelectedIcon && (
              <SelectedIcon size={16} style={{ color: selected.color }} />
            )}
            <span className="model-selector-name">{selected.name}</span>
          </>
        ) : (
          <span className="model-selector-placeholder">Select a model</span>
        )}
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="model-dropdown"
            initial={{ opacity: 0, y: -10, scale: 0.95, rotateX: -10 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{ transformOrigin: "top center", perspective: "800px" }}
          >
            {Object.entries(providers || {}).map(([provKey, prov]) => {
              const Icon = PROVIDER_ICONS[provKey];
              return (
                <div key={provKey} className="model-group">
                  <div className="model-group-header">
                    {Icon && <Icon size={14} style={{ color: prov.color }} />}
                    <span>{prov.name}</span>
                    {!prov.available && (
                      <span className="model-group-badge">
                        <AlertCircle size={12} />
                        No Key
                      </span>
                    )}
                  </div>
                  {prov.models?.map((model) => {
                    const isSelected =
                      selectedModel?.provider === provKey &&
                      selectedModel?.modelId === model.id;
                    return (
                      <motion.button
                        key={model.id}
                        className={`model-option ${isSelected ? "model-option-active" : ""} ${
                          !prov.available ? "model-option-disabled" : ""
                        }`}
                        onClick={() => {
                          if (!prov.available) return;
                          onSelectModel({ provider: provKey, modelId: model.id });
                          setIsOpen(false);
                        }}
                        whileHover={prov.available ? { x: 4 } : {}}
                        disabled={!prov.available}
                      >
                        <div className="model-option-info">
                          <span className="model-option-name">{model.name}</span>
                          <span className="model-option-desc">{model.description}</span>
                        </div>
                        {isSelected && (
                          <Check size={16} className="model-option-check" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
