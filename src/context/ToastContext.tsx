"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  addToast: (type: ToastType, title: string, message: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  toast: () => {},
  success: () => {},
  error: () => {},
  addToast: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = "info", title?: string, duration = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      setToasts((prev) => [...prev, { id, type, message, title, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, title = "Berhasil") => {
      addToast(message, "success", title, 4000);
    },
    [addToast]
  );

  const error = useCallback(
    (message: string, title = "Gagal") => {
      addToast(message, "error", title, 6000);
    },
    [addToast]
  );
  const addToastHelper = useCallback(
    (type: ToastType, title: string, message: string) => {
      addToast(message, type, title, 4500);
    },
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, addToast: addToastHelper }}>
      {children}
      
      {/* Toast Notification Container di Pojok Kanan Bawah */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in ${
              t.type === "success"
                ? "bg-[#002236]/95 border-emerald-500/40 text-white"
                : t.type === "error"
                ? "bg-[#1C1B18]/95 border-rose-500/50 text-white"
                : "bg-[#002236]/95 border-blue-500/40 text-white"
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {t.type === "success" ? (
                <CheckCircle2 size={19} className="text-emerald-400" />
              ) : t.type === "error" ? (
                <AlertCircle size={19} className="text-rose-400" />
              ) : (
                <Info size={19} className="text-blue-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              {t.title && (
                <h4 className="text-xs font-bold leading-tight mb-0.5 tracking-tight">
                  {t.title}
                </h4>
              )}
              <p className="text-xs text-white/80 leading-relaxed break-words">
                {t.message}
              </p>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 text-white/40 hover:text-white transition-colors cursor-pointer p-0.5"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
