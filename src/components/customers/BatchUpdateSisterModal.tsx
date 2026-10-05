"use client";

import { useState } from "react";
import { Building2, ArrowRight, X, Check, AlertCircle } from "lucide-react";
import CustomDropdown from "@/components/ui/CustomDropdown";
import { useToast } from "@/context/ToastContext";

export interface BatchUpdateSisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  existingSisterCompanies: string[];
  totalCustomersCount: number;
  selectedIds?: string[];
}

const DEFAULT_SISTER_LIST = [
  "Royal Hindia",
  "Happy Farm Bali",
  "Happy Farm Jakarta",
  "Havenland",
  "EZY Property",
];

export default function BatchUpdateSisterModal({
  isOpen,
  onClose,
  onSuccess,
  existingSisterCompanies = [],
  totalCustomersCount = 0,
  selectedIds = [],
}: BatchUpdateSisterModalProps) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Scope: "SELECTED" | "SPECIFIC_SISTER" | "ALL"
  const hasSelection = selectedIds.length > 0;
  const [scope, setScope] = useState<"SELECTED" | "SPECIFIC_SISTER" | "ALL">(
    hasSelection ? "SELECTED" : "SPECIFIC_SISTER"
  );

  const [fromSister, setFromSister] = useState<string>(existingSisterCompanies[0] || "");
  const [toSister, setToSister] = useState<string>(DEFAULT_SISTER_LIST[0]);
  const [customToSister, setCustomToSister] = useState("");

  if (!isOpen) return null;

  const sisterCompanyOptions = Array.from(
    new Set([...existingSisterCompanies, ...DEFAULT_SISTER_LIST])
  ).filter(Boolean);

  const handleUpdate = async () => {
    setErrorMsg(null);
    const finalToSister = toSister === "Custom" ? customToSister.trim() : toSister;

    if (!finalToSister) {
      setErrorMsg("Harap tentukan nama Sister Company tujuan.");
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        toSisterCompany: finalToSister,
      };

      if (scope === "ALL") {
        payload.all = true;
      } else if (scope === "SELECTED") {
        payload.ids = selectedIds;
      } else {
        payload.fromSisterCompany = fromSister;
      }

      const res = await fetch("/api/customers/bulk-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memperbarui Sister Company.");
      }

      addToast(
        "success",
        "Sister Company Diperbarui",
        `Berhasil mengubah Sister Company menjadi "${finalToSister}" (${data.count} customer).`
      );

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Batch update sister error:", err);
      setErrorMsg(err.message || "Terjadi kesalahan saat memproses pembaruan.");
      addToast("error", "Gagal Memperbarui", err.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-[#1C1B18]/15 overflow-hidden">
        {/* Header Modal */}
        <div className="px-5 py-4 border-b border-[#1C1B18]/10 flex items-center justify-between bg-[#FCFBF0]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#002236] flex items-center justify-center text-white">
              <Building2 size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1C1B18] tracking-tight">
                Ubah Sister Company Masal
              </h3>
              <p className="text-[11px] text-[#1C1B18]/60">
                Koreksi nama Sister Company sekaligus untuk banyak customer
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#1C1B18]/40 hover:text-[#1C1B18] hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
              <AlertCircle size={15} className="text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Scope Selection */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-[#1C1B18]">
              Target Customer yang Ingin Diubah:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {hasSelection && (
                <button
                  type="button"
                  onClick={() => setScope("SELECTED")}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    scope === "SELECTED"
                      ? "border-[#FF7800] bg-[#FF7800]/5 text-[#FF7800] font-bold"
                      : "border-[#1C1B18]/15 text-[#1C1B18]/70 hover:bg-[#FCFBF0]"
                  }`}
                >
                  <span className="block text-[11px]">Customer Terpilih</span>
                  <span className="text-xs font-number">({selectedIds.length} data)</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setScope("SPECIFIC_SISTER")}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  scope === "SPECIFIC_SISTER"
                    ? "border-[#FF7800] bg-[#FF7800]/5 text-[#FF7800] font-bold"
                    : "border-[#1C1B18]/15 text-[#1C1B18]/70 hover:bg-[#FCFBF0]"
                }`}
              >
                <span className="block text-[11px]">Berdasarkan Sister</span>
                <span className="text-xs">Pilih nama lama</span>
              </button>

              <button
                type="button"
                onClick={() => setScope("ALL")}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  scope === "ALL"
                    ? "border-[#FF7800] bg-[#FF7800]/5 text-[#FF7800] font-bold"
                    : "border-[#1C1B18]/15 text-[#1C1B18]/70 hover:bg-[#FCFBF0]"
                }`}
              >
                <span className="block text-[11px]">Seluruh Customer</span>
                <span className="text-xs font-number">({totalCustomersCount} data)</span>
              </button>
            </div>
          </div>

          {/* From Sister Company (jika scope SPECIFIC_SISTER) */}
          {scope === "SPECIFIC_SISTER" && (
            <div className="space-y-1">
              <label className="block font-semibold text-[#1C1B18]">
                Ganti dari Sister Company Saat Ini:
              </label>
              <CustomDropdown
                value={fromSister}
                onChange={(val) => setFromSister(val)}
                options={existingSisterCompanies.map((sc) => ({ value: sc, label: sc }))}
                className="w-full"
              />
            </div>
          )}

          {/* To Sister Company */}
          <div className="space-y-1 pt-2 border-t border-[#1C1B18]/10">
            <label className="block font-semibold text-[#1C1B18]">
              Ubah Menjadi Sister Company Baru:
            </label>
            <CustomDropdown
              value={toSister}
              onChange={(val) => setToSister(val)}
              options={[
                ...sisterCompanyOptions.map((sc) => ({ value: sc, label: sc })),
                { value: "Custom", label: "+ Ketik Nama Sister Company Baru..." },
              ]}
              className="w-full"
            />
            {toSister === "Custom" && (
              <input
                type="text"
                value={customToSister}
                onChange={(e) => setCustomToSister(e.target.value)}
                placeholder="Masukkan nama Sister Company yang benar..."
                className="w-full mt-2 px-3 py-2 rounded-lg border border-[#FF7800] focus:ring-1 focus:ring-[#FF7800] outline-hidden text-xs bg-white"
              />
            )}
          </div>

          {/* Preview Warning / Summary */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
            <ArrowRight size={14} className="text-[#FF7800] shrink-0 mt-0.5" />
            <div>
              Semua customer dengan kriteria di atas akan diperbarui nilai <strong className="font-bold">sister_company</strong>-nya menjadi <strong className="text-[#FF7800] font-bold">"{toSister === "Custom" ? customToSister || "..." : toSister}"</strong>.
            </div>
          </div>

          {/* Actions */}
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
              disabled={loading || (toSister === "Custom" && !customToSister.trim())}
              onClick={handleUpdate}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#002236] text-white text-xs font-semibold hover:bg-[#FF7800] transition-colors shadow-xs disabled:opacity-40 cursor-pointer"
            >
              <Check size={13} />
              <span>{loading ? "Menyimpan..." : "Update Sekarang"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
