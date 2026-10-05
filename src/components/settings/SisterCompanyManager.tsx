"use client";

import React, { useState } from "react";
import { Building2, Plus, Edit2, Trash2, Check, AlertCircle, X, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

interface SisterCompanyItem {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  is_active: boolean;
  customerCount?: number;
}

export default function SisterCompanyManager({
  initialCompanies = [],
  customerCounts = {},
}: {
  initialCompanies: SisterCompanyItem[];
  customerCounts: Record<string, number>;
}) {
  const router = useRouter();
  const [companies, setCompanies] = useState<SisterCompanyItem[]>(initialCompanies);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<SisterCompanyItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SisterCompanyItem | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleOpenAdd = () => {
    setName("");
    setCode("");
    setDescription("");
    setErrorMsg("");
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (comp: SisterCompanyItem) => {
    setEditingCompany(comp);
    setName(comp.name);
    setCode(comp.code || "");
    setDescription(comp.description || "");
    setErrorMsg("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Nama Sister Company tidak boleh kosong");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const isEditing = !!editingCompany;
      const res = await fetch("/api/sister-companies", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingCompany?.id,
          name: name.trim(),
          code: code.trim(),
          description: description.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Gagal menyimpan Sister Company");
      }

      setIsAddModalOpen(false);
      setEditingCompany(null);
      router.refresh();
      // Update local state
      if (isEditing) {
        setCompanies(prev => prev.map(c => c.id === data.sisterCompany.id ? data.sisterCompany : c));
      } else {
        setCompanies(prev => [...prev, data.sisterCompany]);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/sister-companies?id=${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Gagal menghapus Sister Company");
      }

      setCompanies(prev => prev.filter(c => c.id !== deleteTarget.id));
      setDeleteTarget(null);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-[#1C1B18]/10 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1C1B18]/8">
        <div>
          <div className="flex items-center gap-2">
            <Building2 size={18} className="text-[#FF7800]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1C1B18]/80">
              Sister Companies Database
            </h3>
          </div>
          <p className="text-xs text-[#1C1B18]/50 mt-0.5">
            Kelola daftar sister company asal database prospek (dapat ditambah, diedit, atau dihapus).
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF7800] text-white text-xs font-semibold hover:bg-[#e66c00] transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus size={14} />
          <span>Tambah Sister Company</span>
        </button>
      </div>

      {/* List */}
      <div className="divide-y divide-[#1C1B18]/8">
        {companies.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#1C1B18]/50">
            Belum ada Sister Company terdaftar. Silakan tambah baru.
          </div>
        ) : (
          companies.map((comp) => {
            const count = customerCounts[comp.name] ?? 0;
            return (
              <div key={comp.id} className="py-3.5 flex items-center justify-between gap-3 group">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs text-[#1C1B18]">
                      {comp.name}
                    </span>
                    {comp.code && (
                      <span className="font-number text-[10px] bg-[#1C1B18]/5 text-[#1C1B18]/60 px-1.5 py-0.2 rounded border border-[#1C1B18]/10 font-medium">
                        {comp.code}
                      </span>
                    )}
                    <span className="text-[11px] font-number text-[#c25900] bg-[#FF7800]/10 border border-[#FF7800]/25 px-2 py-0.2 rounded-full font-semibold">
                      {count} Prospek Terhubung
                    </span>
                  </div>
                  {comp.description && (
                    <p className="text-[11px] text-[#1C1B18]/50 mt-0.5 truncate max-w-lg">
                      {comp.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(comp)}
                    className="p-1.5 rounded-md hover:bg-[#FCFBF0] text-[#1C1B18]/60 hover:text-[#002236] transition-colors cursor-pointer"
                    title="Edit Sister Company"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(comp)}
                    className="p-1.5 rounded-md hover:bg-rose-50 text-[#1C1B18]/40 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Hapus Sister Company"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Modal */}
      {(isAddModalOpen || editingCompany) && (
        <div className="fixed inset-0 z-50 bg-[#002236]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#1C1B18]/15 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#002236] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-[#FF7800]" />
                <h4 className="font-bold text-sm">
                  {editingCompany ? "Edit Sister Company" : "Tambah Sister Company Baru"}
                </h4>
              </div>
              <button
                onClick={() => { setIsAddModalOpen(false); setEditingCompany(null); }}
                className="text-white/60 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#1C1B18] mb-1">
                  Nama Sister Company <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. EZY Yacht & Boat Charter"
                  className="w-full text-xs p-2.5 rounded-lg border border-[#1C1B18]/20 focus:outline-none focus:border-[#FF7800] focus:ring-1 focus:ring-[#FF7800]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C1B18] mb-1">
                  Kode Singkat (Opsional)
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. EZY_YACHT"
                  className="w-full text-xs font-number p-2.5 rounded-lg border border-[#1C1B18]/20 focus:outline-none focus:border-[#FF7800]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C1B18] mb-1">
                  Deskripsi / Bidang Bisnis (Opsional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="e.g. Unit bisnis penyewaan kapal pesiar & aktivitas maritim"
                  className="w-full text-xs p-2.5 rounded-lg border border-[#1C1B18]/20 focus:outline-none focus:border-[#FF7800] resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#1C1B18]/10">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setEditingCompany(null); }}
                  className="px-3.5 py-2 text-xs font-semibold text-[#1C1B18]/60 hover:text-[#1C1B18]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-[#FF7800] text-white text-xs font-bold hover:bg-[#e66c00] transition-colors shadow-xs"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-[#002236]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#1C1B18]/15 shadow-2xl w-full max-w-sm overflow-hidden p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 size={18} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#1C1B18]">
                  Hapus Sister Company?
                </h4>
                <p className="text-xs text-[#1C1B18]/60 mt-0.5">
                  Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>

            <p className="text-xs text-[#1C1B18]/80 bg-[#FCFBF0] p-3 rounded-lg border border-[#1C1B18]/10">
              Apakah Anda yakin ingin menghapus <strong>"{deleteTarget.name}"</strong>?{" "}
              {customerCounts[deleteTarget.name] ? (
                <span className="text-rose-600 font-semibold block mt-1">
                  ⚠️ Perhatian: Ada {customerCounts[deleteTarget.name]} data prospek yang menggunakan sister company ini.
                </span>
              ) : null}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1C1B18]/10">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-3.5 py-2 text-xs font-semibold text-[#1C1B18]/60 hover:text-[#1C1B18]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors shadow-xs"
              >
                {isSubmitting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
