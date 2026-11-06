"use client";

import React, { useState } from "react";
import { User, Plus, Edit2, Trash2, Check, AlertCircle, X, Shield, Lock, Briefcase, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  specialty?: string | null;
  is_active: boolean;
  created_at?: any;
}

export default function UserManager({
  initialUsers = [],
  isSuperadmin = false,
}: {
  initialUsers: UserItem[];
  isSuperadmin: boolean;
}) {
  const router = useRouter();
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("SALES");
  const [specialty, setSpecialty] = useState("Website & Social Media Specialist");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleOpenAdd = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole("SALES");
    setSpecialty("Website & Social Media Specialist");
    setErrorMsg("");
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (u: UserItem) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setPassword(""); // biarkan kosong jika tidak ingin ubah password
    setRole(u.role);
    setSpecialty(u.specialty || "Website & Social Media Specialist");
    setErrorMsg("");
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setErrorMsg("Nama dan email wajib diisi");
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg("Password minimal 6 karakter");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, specialty }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Gagal menambah user baru");
        setIsSubmitting(false);
        return;
      }

      setUsers((prev) => [...prev, data.user]);
      setIsAddModalOpen(false);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan server");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!name.trim() || !email.trim()) {
      setErrorMsg("Nama dan email wajib diisi");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          ...(password ? { password } : {}),
          role,
          specialty,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Gagal memperbarui user");
        setIsSubmitting(false);
        return;
      }

      setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? data.user : u)));
      setEditingUser(null);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan server");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/users/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Gagal menghapus user");
        setIsSubmitting(false);
        return;
      }

      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      alert("Terjadi kesalahan server saat menghapus");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#1C1B18]/10 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#1C1B18]/10 bg-[#FCFBF0]/60 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1B18]/80">
            User Accounts & Role Access
          </h4>
          <p className="text-[11px] text-[#1C1B18]/50 mt-0.5">
            Kelola akun tim sales, pembagian spesialisasi (Website, SEO, Socmed), dan peran akses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#FF7800]/15 text-[#c25900] font-number">
            {users.length} Akun Aktif
          </span>

          {isSuperadmin && (
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF7800] hover:bg-[#e66c00] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Plus size={14} />
              <span>+ Tambah Sales / User</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#1C1B18]/10 bg-[#FCFBF0]/40 text-[10px] font-bold uppercase tracking-wider text-[#1C1B18]/50">
              <th className="py-2.5 px-4">Nama User</th>
              <th className="py-2.5 px-3">Role</th>
              <th className="py-2.5 px-3">Spesialisasi Sales</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1C1B18]/8">
            {users.map((u) => {
              const isSuper = u.role === "SUPERADMIN";
              const isHeadRole = u.role === "HEAD";
              return (
                <tr key={u.id} className="hover:bg-[#FCFBF0]/40 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-semibold text-xs text-[#1C1B18] block">
                      {u.name}
                    </span>
                    <span className="text-[11px] font-number text-[#1C1B18]/50 block">
                      {u.email}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-number ${
                        isSuper
                          ? "bg-[#002236] text-white"
                          : isHeadRole
                          ? "bg-[#4F46E5] text-white"
                          : u.role === "SCOUT"
                          ? "bg-amber-600 text-white"
                          : "bg-[#1A75FF] text-white"
                      }`}
                    >
                      {isSuper ? "Superadmin" : isHeadRole ? "Head" : u.role === "SCOUT" ? "Lead Scout" : "Sales Specialist"}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-[#1C1B18]/80 font-medium">
                    {u.specialty || "Website & Social Media"}
                  </td>

                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Aktif
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    {isSuperadmin && (
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 rounded hover:bg-[#1C1B18]/5 text-[#1C1B18]/60 hover:text-[#002236] transition-colors cursor-pointer"
                          title="Edit User"
                        >
                          <Edit2 size={13} />
                        </button>
                        {!isSuper && (
                          <button
                            onClick={() => setDeleteTarget(u)}
                            className="p-1.5 rounded hover:bg-rose-50 text-[#1C1B18]/40 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Hapus Akun User"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL TAMBAH USER */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 border border-[#1C1B18]/10">
            <div className="flex items-center justify-between border-b border-[#1C1B18]/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FF7800] text-white flex items-center justify-center font-bold">
                  <User size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#002236]">Tambah Akun Sales / Tim</h3>
                  <p className="text-[11px] text-[#1C1B18]/50">Buat akun baru untuk tim operasional atau sales.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#1C1B18]/40 hover:text-[#1C1B18] p-1"
              >
                <X size={18} />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveAdd} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#1C1B18] mb-1">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: Dimas Ramadhan"
                  className="w-full h-9 px-3 border border-[#1C1B18]/15 rounded-lg focus:outline-none focus:border-[#FF7800]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1C1B18] mb-1">
                  Email Login <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="dimas@ezydigital.com"
                  className="w-full h-9 px-3 border border-[#1C1B18]/15 rounded-lg focus:outline-none focus:border-[#FF7800]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1C1B18] mb-1">
                  Password Login <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full h-9 px-3 border border-[#1C1B18]/15 rounded-lg focus:outline-none focus:border-[#FF7800]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1C1B18] mb-1">Role / Peran</label>
                  <select
                    value={role}
                    onChange={(e) => {
                      const newRole = e.target.value;
                      setRole(newRole);
                      if (newRole === "SCOUT") {
                        setSpecialty("Lead Scout / Data Prospector");
                      }
                    }}
                    className="w-full h-9 px-2.5 border border-[#1C1B18]/15 rounded-lg focus:outline-none focus:border-[#FF7800] bg-white font-medium"
                  >
                    <option value="SALES">Sales Specialist</option>
                    <option value="SCOUT">Lead Scout (Input Saja)</option>
                    <option value="HEAD">Head of Sales</option>
                    <option value="SUPERADMIN">Superadmin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#1C1B18] mb-1">Fokus Spesialisasi</label>
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full h-9 px-2.5 border border-[#1C1B18]/15 rounded-lg focus:outline-none focus:border-[#FF7800] bg-white font-medium"
                  >
                    <option value="Website & Social Media Specialist">Website & Social Media</option>
                    <option value="Lead Scout / Data Prospector">Lead Scout / Data Prospector</option>
                    <option value="Website & SEO Specialist">Website & SEO</option>
                    <option value="Social Media Specialist">Social Media Only</option>
                    <option value="Production & Media Specialist">Production / Media</option>
                    <option value="Senior Sales Executive">General Full-Stack Sales</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1C1B18]/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-[#1C1B18]/15 text-[#1C1B18]/70 font-semibold hover:bg-[#FCFBF0]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-lg bg-[#FF7800] hover:bg-[#e66c00] text-white font-bold disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Buat Akun Sales"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT USER */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 border border-[#1C1B18]/10">
            <div className="flex items-center justify-between border-b border-[#1C1B18]/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#002236] text-white flex items-center justify-center font-bold">
                  <Edit2 size={15} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#002236]">Edit Akun: {editingUser.name}</h3>
                  <p className="text-[11px] text-[#1C1B18]/50">Perbarui profil, role, atau reset password.</p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-[#1C1B18]/40 hover:text-[#1C1B18] p-1"
              >
                <X size={18} />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#1C1B18] mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-9 px-3 border border-[#1C1B18]/15 rounded-lg focus:outline-none focus:border-[#FF7800]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1C1B18] mb-1">Email Login</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-9 px-3 border border-[#1C1B18]/15 rounded-lg focus:outline-none focus:border-[#FF7800]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1C1B18] mb-1">
                  Reset Password Baru <span className="text-[#1C1B18]/40 font-normal">(Kosongkan jika tidak diubah)</span>
                </label>
                <input
                  type="password"
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Biarkan kosong jika tidak diubah"
                  className="w-full h-9 px-3 border border-[#1C1B18]/15 rounded-lg focus:outline-none focus:border-[#FF7800]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1C1B18] mb-1">Role / Peran</label>
                  <select
                    value={role}
                    onChange={(e) => {
                      const newRole = e.target.value;
                      setRole(newRole);
                      if (newRole === "SCOUT") {
                        setSpecialty("Lead Scout / Data Prospector");
                      }
                    }}
                    className="w-full h-9 px-2.5 border border-[#1C1B18]/15 rounded-lg focus:outline-none focus:border-[#FF7800] bg-white font-medium"
                  >
                    <option value="SALES">Sales Specialist</option>
                    <option value="SCOUT">Lead Scout (Input Saja)</option>
                    <option value="HEAD">Head of Sales</option>
                    <option value="SUPERADMIN">Superadmin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#1C1B18] mb-1">Fokus Spesialisasi</label>
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full h-9 px-2.5 border border-[#1C1B18]/15 rounded-lg focus:outline-none focus:border-[#FF7800] bg-white font-medium"
                  >
                    <option value="Website & Social Media Specialist">Website & Social Media</option>
                    <option value="Lead Scout / Data Prospector">Lead Scout / Data Prospector</option>
                    <option value="Website & SEO Specialist">Website & SEO</option>
                    <option value="Social Media Specialist">Social Media Only</option>
                    <option value="Production & Media Specialist">Production / Media</option>
                    <option value="Senior Sales Executive">General Full-Stack Sales</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1C1B18]/10">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-[#1C1B18]/15 text-[#1C1B18]/70 font-semibold hover:bg-[#FCFBF0]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-lg bg-[#002236] hover:bg-[#FF7800] text-white font-bold disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4 border border-[#1C1B18]/10">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <Trash2 size={24} />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-[#1C1B18]">Hapus Akun {deleteTarget.name}?</h3>
              <p className="text-xs text-[#1C1B18]/60 leading-relaxed">
                Akun ini akan dihapus permanen. Prospek yang saat ini dipegang oleh user ini akan otomatis dilepas kembali ke pool unassigned.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg border border-[#1C1B18]/15 text-[#1C1B18]/70 text-xs font-semibold hover:bg-[#FCFBF0]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? "Menghapus..." : "Ya, Hapus Akun"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

