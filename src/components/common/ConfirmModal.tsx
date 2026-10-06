"use client";

import React, { useEffect } from "react";
import { AlertTriangle, LogOut, Loader2, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "primary";
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  variant = "danger",
  isLoading = false,
  icon,
}: ConfirmModalProps) {
  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl border border-[#1C1B18]/10 space-y-4 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                variant === "danger"
                  ? "bg-rose-100 text-rose-600 border border-rose-200"
                  : variant === "warning"
                  ? "bg-amber-100 text-amber-700 border border-amber-200"
                  : "bg-blue-100 text-blue-600 border border-blue-200"
              }`}
            >
              {icon || (variant === "danger" ? <LogOut size={18} /> : <AlertTriangle size={18} />)}
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1C1B18] leading-tight">{title}</h3>
              <p className="text-xs text-[#1C1B18]/60 mt-1 leading-relaxed">{description}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-[#1C1B18]/40 hover:text-[#1C1B18] transition-colors p-1 rounded-lg hover:bg-[#1C1B18]/5 cursor-pointer disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#1C1B18]/8">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold text-[#1C1B18]/70 hover:bg-[#1C1B18]/5 transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white transition-colors shadow-xs cursor-pointer disabled:opacity-60 ${
              variant === "danger"
                ? "bg-rose-600 hover:bg-rose-700"
                : variant === "warning"
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-[#002236] hover:bg-[#FF7800]"
            }`}
          >
            {isLoading && <Loader2 size={13} className="animate-spin" />}
            <span>{isLoading ? "Memproses..." : confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
