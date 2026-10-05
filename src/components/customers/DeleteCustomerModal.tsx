"use client";

import { useState } from "react";
import { AlertTriangle, Trash2, X, AlertCircle } from "lucide-react";
import { useToast } from "@/context/ToastContext";

export interface DeleteCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  // Mode: "SINGLE" | "SELECTED" | "ALL"
  mode: "SINGLE" | "SELECTED" | "ALL";
  customerName?: string;
  customerId?: string;
  selectedIds?: string[];
  totalCustomersCount?: number;
}

export default function DeleteCustomerModal({
  isOpen,
  onClose,
  onSuccess,
  mode,
  customerName,
  customerId,
  selectedIds = [],
  totalCustomersCount = 0,
}: DeleteCustomerModalProps) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const isDeleteAll = mode === "ALL";
  const isSelected = mode === "SELECTED";
  const requiredConfirmationText = "HAPUS SEMUA";
  const isConfirmed = isDeleteAll ? confirmText.trim().toUpperCase() === requiredConfirmationText : true;

  const handleDelete = async () => {
    if (isDeleteAll && !isConfirmed) {
      setErrorMsg(`Ketik "${requiredConfirmationText}" untuk mengonfirmasi.`);
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      if (mode === "SINGLE" && customerId) {
        const res = await fetch(`/api/customers/${customerId}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal menghapus customer");
        addToast("success", "Customer Dihapus", `Customer "${customerName}" berhasil dihapus.`);
      } else if (mode === "SELECTED") {
        const res = await fetch("/api/customers/bulk-delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: selectedIds }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal menghapus data");
        addToast("success", "Penghapusan Berhasil", `${data.count || selectedIds.length} customer berhasil dihapus.`);
      } else if (mode === "ALL") {
        const res = await fetch("/api/customers/bulk-delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ all: true }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal menghapus seluruh customer");
        addToast("success", "Database Dibersihkan", `Seluruh data customer (${data.count} data) berhasil dihapus.`);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Delete customer error:", err);
      setErrorMsg(err.message || "Gagal melakukan penghapusan.");
      addToast("error", "Penghapusan Gagal", err.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-rose-200 overflow-hidden">
        {/* Header Modal */}
        <div className="px-5 py-4 border-b border-[#1C1B18]/10 flex items-center justify-between bg-rose-50/50">
          <div className="flex items-center gap-2.5 text-rose-700">
            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600">
              <AlertTriangle size={18} />
            </div>
            <h3 className="text-sm font-bold tracking-tight">
              {isDeleteAll
                ? "Konfirmasi Hapus Seluruh Customer"
                : isSelected
                ? `Konfirmasi Hapus (${selectedIds.length} Customer)`
                : "Konfirmasi Hapus Customer"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#1C1B18]/40 hover:text-[#1C1B18] hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
              <AlertCircle size={15} className="text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="text-[#1C1B18]/80 leading-relaxed space-y-2">
            {isDeleteAll ? (
              <>
                <p>
                  Apakah Anda yakin ingin menghapus <strong className="text-rose-700">SEMUA customer ({totalCustomersCount} data)</strong> dari database?
                </p>
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200/80 text-rose-900 text-[11px] space-y-1">
                  <span className="font-bold block">Peringatan Kritis:</span>
                  <p>Tindakan ini tidak dapat dibatalkan. Seluruh riwayat website, profil Instagram, dan log aktivitas CRM terkait juga akan terhapus permanen.</p>
                </div>
                <div className="pt-2">
                  <label className="block text-[11px] font-semibold text-[#1C1B18]/70 mb-1">
                    Ketik <code className="px-1.5 py-0.5 rounded bg-rose-100 font-bold text-rose-800">{requiredConfirmationText}</code> untuk melanjutkan:
                  </label>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="Ketik HAPUS SEMUA"
                    className="w-full px-3 py-2 rounded-lg border border-rose-300 focus:border-rose-600 focus:ring-1 focus:ring-rose-600 outline-hidden font-bold tracking-wider uppercase text-rose-700 bg-white"
                  />
                </div>
              </>
            ) : isSelected ? (
              <p>
                Apakah Anda yakin ingin menghapus <strong className="text-[#1C1B18]">{selectedIds.length} customer terpilih</strong>? Seluruh data website dan Instagram terkait akan ikut dihapus.
              </p>
            ) : (
              <p>
                Apakah Anda yakin ingin menghapus customer <strong className="text-[#1C1B18] font-bold">"{customerName}"</strong>? Data website dan Instagram resmi yang tersimpan juga akan ikut dihapus permanen.
              </p>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#1C1B18]/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-3.5 py-2 rounded-lg bg-white border border-[#1C1B18]/15 text-xs font-semibold text-[#1C1B18]/70 hover:bg-[#FCFBF0] transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={loading || (isDeleteAll && !isConfirmed)}
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Trash2 size={13} />
              <span>{loading ? "Menghapus..." : isDeleteAll ? "Hapus Semua Data" : "Hapus Customer"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
