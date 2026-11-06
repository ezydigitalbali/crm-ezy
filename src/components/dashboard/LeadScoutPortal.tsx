"use client";

import React, { useState } from "react";
import { Plus, CheckCircle2, AlertCircle, Building2, User, Phone, Mail, MapPin, Globe, Sparkles, Send } from "lucide-react";
import InstagramIcon from "@/components/ui/InstagramIcon";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";

const BALI_CITIES = [
  "Badung (Canggu/Seminyak/Kuta)",
  "Denpasar",
  "Gianyar (Ubud)",
  "Tabanan",
  "Buleleng (Singaraja)",
  "Karangasem",
  "Klungkung",
  "Bangli",
  "Jembrana",
];

const COMMON_CATEGORIES = [
  "Restaurant & Cafe",
  "Villa & Resort",
  "Hotel & Hospitality",
  "Real Estate & Property",
  "Tour & Travel",
  "Spa & Wellness",
  "Beach Club & Bar",
  "Retail & Boutique",
  "Automotive & Rental",
  "General",
];

export default function LeadScoutPortal({ user }: { user: { name: string; email: string } }) {
  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("Badung (Canggu/Seminyak/Kuta)");
  const [address, setAddress] = useState("");
  const [businessCategory, setBusinessCategory] = useState("Restaurant & Cafe");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [instagramUsername, setInstagramUsername] = useState("");
  const [leadNotes, setLeadNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [submittedCount, setSubmittedCount] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      setErrorMsg("Nama bisnis / prospek wajib diisi.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: businessName,
          contact_name: contactName,
          phone: phone,
          email: email,
          city: city,
          address: address,
          business_category: businessCategory,
          website_url: websiteUrl,
          instagram_username: instagramUsername,
          lead_notes: leadNotes,
          lead_status: "NEW_LEAD",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menambahkan prospek.");
      }

      setSuccessMsg(`Prospek "${businessName}" berhasil ditambahkan dan otomatis diteruskan ke Joan sebagai New Lead!`);
      setSubmittedCount((prev) => prev + 1);

      // Reset form
      setBusinessName("");
      setContactName("");
      setPhone("");
      setEmail("");
      setAddress("");
      setWebsiteUrl("");
      setInstagramUsername("");
      setLeadNotes("");
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat menyimpan prospek.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#002236] to-[#013554] text-white p-6 rounded-2xl shadow-sm border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
            <Sparkles size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">Portal Input Prospek (Lead Scout)</h2>
              <span className="bg-amber-500 text-[#002236] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-number">
                Scout Mode
              </span>
            </div>
            <p className="text-xs text-white/70 mt-1">
              Halo, <strong className="text-white">{user.name}</strong>. Anda bertindak sebagai Lead Scout. Setiap data yang Anda masukkan otomatis dialirkan ke prospek user <strong className="text-amber-300">Joan</strong> sebagai <em>New Lead</em>.
            </p>
          </div>
        </div>

        {submittedCount > 0 && (
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/80">
            <span>Prospek yang berhasil Anda kirim sesi ini:</span>
            <span className="font-bold text-amber-300 font-number bg-amber-400/20 px-2.5 py-0.5 rounded">
              {submittedCount} prospek
            </span>
          </div>
        )}
      </div>

      {/* Success / Error alerts */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle size={18} className="text-rose-600 shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Main Form */}
      <div className="bg-white rounded-2xl border border-[#1C1B18]/10 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1C1B18]/10 bg-[#FCFBF0]/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus size={16} className="text-[#FF7800]" />
            <h3 className="text-sm font-bold text-[#002236]">Formulir Penambahan Prospek Baru</h3>
          </div>
          <span className="text-[11px] text-[#1C1B18]/50">Otomatis Terverifikasi & Assigned ke Joan</span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* 1. Profil Bisnis */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1B18]/50 flex items-center gap-2">
              <Building2 size={14} className="text-[#FF7800]" />
              Informasi Bisnis
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#1C1B18] mb-1">
                  Nama Bisnis / Brand <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Contoh: Cafe Mola Canggu"
                  className="w-full h-10 px-3 border border-[#1C1B18]/15 rounded-lg text-xs focus:outline-none focus:border-[#FF7800] bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1B18] mb-1">
                  Kategori Bisnis
                </label>
                <select
                  value={businessCategory}
                  onChange={(e) => setBusinessCategory(e.target.value)}
                  className="w-full h-10 px-3 border border-[#1C1B18]/15 rounded-lg text-xs focus:outline-none focus:border-[#FF7800] bg-white font-medium"
                >
                  {COMMON_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1B18] mb-1">
                  Kota / Wilayah
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full h-10 px-3 border border-[#1C1B18]/15 rounded-lg text-xs focus:outline-none focus:border-[#FF7800] bg-white font-medium"
                >
                  {BALI_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#1C1B18] mb-1">
                  Alamat Lengkap (Opsional)
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Jl. Pantai Batu Bolong No. 12, Canggu"
                  className="w-full h-10 px-3 border border-[#1C1B18]/15 rounded-lg text-xs focus:outline-none focus:border-[#FF7800] bg-white"
                />
              </div>
            </div>
          </div>

          <hr className="border-[#1C1B18]/10" />

          {/* 2. Kontak PIC */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1B18]/50 flex items-center gap-2">
              <User size={14} className="text-[#FF7800]" />
              Kontak PIC / Penanggung Jawab
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1C1B18] mb-1">
                  Nama PIC
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Contoh: Pak Made / Bu Sarah"
                  className="w-full h-10 px-3 border border-[#1C1B18]/15 rounded-lg text-xs focus:outline-none focus:border-[#FF7800] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1B18] mb-1">
                  Nomor WhatsApp / HP
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-[#1C1B18]/40">
                    <WhatsAppIcon size={14} />
                  </span>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full h-10 pl-9 pr-3 border border-[#1C1B18]/15 rounded-lg text-xs focus:outline-none focus:border-[#FF7800] bg-white font-number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1B18] mb-1">
                  Email PIC / Bisnis
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="info@cafemola.com"
                  className="w-full h-10 px-3 border border-[#1C1B18]/15 rounded-lg text-xs focus:outline-none focus:border-[#FF7800] bg-white"
                />
              </div>
            </div>
          </div>

          <hr className="border-[#1C1B18]/10" />

          {/* 3. Link Digital Presence */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1B18]/50 flex items-center gap-2">
              <Globe size={14} className="text-[#FF7800]" />
              Digital Presence Bisnis
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1C1B18] mb-1">
                  Website URL
                </label>
                <input
                  type="text"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://cafemola.com (Kosongkan jika belum punya)"
                  className="w-full h-10 px-3 border border-[#1C1B18]/15 rounded-lg text-xs focus:outline-none focus:border-[#FF7800] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1B18] mb-1">
                  Instagram Username
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-[#1C1B18]/40">
                    <InstagramIcon size={14} />
                  </span>
                  <input
                    type="text"
                    value={instagramUsername}
                    onChange={(e) => setInstagramUsername(e.target.value)}
                    placeholder="cafemolacanggu (tanpa @)"
                    className="w-full h-10 pl-9 pr-3 border border-[#1C1B18]/15 rounded-lg text-xs focus:outline-none focus:border-[#FF7800] bg-white font-number"
                  />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-[#1C1B18]/10" />

          {/* 4. Catatan Tambahan */}
          <div>
            <label className="block text-xs font-semibold text-[#1C1B18] mb-1">
              Catatan Prospek / Kebutuhan Awal
            </label>
            <textarea
              rows={3}
              value={leadNotes}
              onChange={(e) => setLeadNotes(e.target.value)}
              placeholder="Contoh: Resto baru buka 2 bulan, belum punya website, instagram followers 12k tapi engagement drop. Tertarik paket redesign web & reels."
              className="w-full p-3 border border-[#1C1B18]/15 rounded-lg text-xs focus:outline-none focus:border-[#FF7800] bg-white"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FF7800] text-white text-xs font-bold hover:bg-[#e66c00] transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>Menyimpan...</>
              ) : (
                <>
                  <Send size={15} />
                  Kirim Prospek ke Joan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
