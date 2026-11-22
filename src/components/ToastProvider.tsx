"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";

interface ToastContextValue {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [timerId, setTimerId] = useState<number | null>(null);

  const showToast = useCallback(
    (message: string) => {
      if (timerId !== null) {
        window.clearTimeout(timerId);
      }
      setToastMessage(message);
      const id = window.setTimeout(() => {
        setToastMessage(null);
      }, 2400);
      setTimerId(id);
    },
    [timerId]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex justify-center px-4">
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              className="flex items-center gap-2 rounded-full bg-ink/92 px-5 py-2.5 text-[13px] font-medium tracking-tight text-ivory shadow-lg backdrop-blur-md"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-sage text-white">
                <Check className="h-2.5 w-2.5 stroke-[3]" />
              </span>
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
