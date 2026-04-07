"use client";

import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Loader2 } from "lucide-react";

interface SubstackSearchBoxProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

export const SubstackSearchBox: React.FC<SubstackSearchBoxProps> = ({
  value,
  onChange,
  onSubmit,
  loading,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasContent = value.trim().length > 0;

  return (
    <form
      onSubmit={onSubmit}
      /* Dark pill shell — same geometry as ai-prompt-box */
      className="w-full max-w-lg mx-auto rounded-3xl border border-[#3a3a3a] bg-[#1c1917] p-2 shadow-[0_8px_30px_rgba(0,0,0,0.28)] transition-all duration-300 focus-within:border-[#e97316]/50 focus-within:shadow-[0_8px_40px_rgba(233,115,22,0.12)]"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Input row */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="@handle or substack URL"
        disabled={loading}
        className="w-full bg-transparent px-3 py-2 text-sm text-[#f5f0eb] placeholder:text-[#6b6560] focus:outline-none disabled:opacity-50 caret-[#e97316]"
      />

      {/* Action bar */}
      <div className="flex items-center justify-between px-1 pt-1">
        {/* Left: hint text */}
        <span className="text-[11px] text-[#4a4540] select-none pl-1 font-body">
          No login · No tracking · Free forever
        </span>

        {/* Right: animated submit button */}
        <motion.button
          type="submit"
          disabled={loading || !hasContent}
          whileHover={hasContent && !loading ? { scale: 1.08 } : {}}
          whileTap={hasContent && !loading ? { scale: 0.94 } : {}}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="relative h-8 w-8 rounded-full flex items-center justify-center transition-colors duration-200 disabled:pointer-events-none"
          style={{
            background: hasContent && !loading ? "#ffffff" : "#2e2b28",
          }}
          aria-label="Analyze"
        >
          <AnimatePresence mode="wait" initial={false}>
            {loading ? (
              <motion.span
                key="loading"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Loader2 className="h-4 w-4 text-[#e97316] animate-spin" />
              </motion.span>
            ) : (
              <motion.span
                key="arrow"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <ArrowUp
                  className="h-4 w-4 transition-colors duration-200"
                  style={{ color: hasContent ? "#1c1917" : "#4a4540" }}
                />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </form>
  );
};
