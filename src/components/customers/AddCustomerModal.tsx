"use client";

import { useState, useEffect } from "react";
import {
  X,
  Plus,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Globe,
  Tag,
  DollarSign,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Briefcase
} from "lucide-react";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import InstagramIcon from "@/components/ui/InstagramIcon";
import CustomDropdown from "@/components/ui/CustomDropdown";
import { useToast } from "@/context/ToastContext";

export interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  users?: Array<{ id: string; name: string; role: string; specialty?: string | null }>;
  currentUser?: { id: string; name: string; role: string; specialty?: string | null } | null;
}

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

const BALI_CITIES = [
  "Badung (Canggu/Seminyak/Kuta)",
  "Denpasar",
  "Gianyar (Ubud)",
  "Tabanan",
  "Buleleng (Lovina)",
  "Karangasem",
  "Klungkung (Nusa Penida)",
  "Bangli",
  "Jembrana",
  "Luar Bali / Nasional",
];

export default function AddCustomerModal({
  isOpen,
  onClose,
  onSuccess,
  users = [],
  currentUser,
}: AddCustomerModalProps) {
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Fields
  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Badung");
  const [province, setProvince] = useState("Bali");
  const [businessCategory, setBusinessCategory] = useState("Restaurant & Cafe");
  const [customCategory, setCustomCategory] = useState("");

  const [websiteUrl, setWebsiteUrl] = useState("");
  const [websiteStatus, setWebsiteStatus] = useState("NOT_FOUND");
  const [instagramUsername, setInstagramUsername] = useState("");
  const [instagramStatus, setInstagramStatus] = useState("ACTIVE");

  const [leadStatus, setLeadStatus] = useState("NEW_LEAD");
  const [assignedToId, setAssignedToId] = useState<string>("");

  const [offeringValue, setOfferingValue] = useState<string>("");
  const [dealValue, setDealValue] = useState<string>("");
  const [closingServices, setClosingServices] = useState<string[]>([]);
  const [leadNotes, setLeadNotes] = useState("");

  const isSales = currentUser?.role === "SALES";
  const isSuperadminOrHead = currentUser?.role === "SUPERADMIN" || currentUser?.role === "HEAD";

  // Inisialisasi default assignment
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === "SALES") {
        setAssignedToId(currentUser.id);
      } else {
        // Superadmin atau Head: default ke diri sendiri atau unassigned
        setAssignedToId(currentUser.id);
      }
    }
  }, [currentUser, isOpen]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleService = (service: string) => {
    setClosingServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!businessName.trim()) {
      setErrorMsg("Nama bisnis / prospek wajib diisi!");
      return;
    }

    setLoading(true);

    try {
      const finalCategory = businessCategory === "Custom"
        ? (customCategory.trim() || "General")
        : businessCategory;

      const payload = {
        business_name: businessName.trim(),
        contact_name: contactName.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        address: address.trim() || null,
        city: city.trim(),
        province: province.trim(),
        business_category: finalCategory,
        lead_status: leadStatus,
        assigned_to_id: isSales ? currentUser?.id : (assignedToId === "UNASSIGNED" ? null : assignedToId),
        offering_value: offeringValue ? parseFloat(offeringValue) : null,
        deal_value: dealValue ? parseFloat(dealValue) : null,
        closing_services: closingServices,
        lead_notes: leadNotes.trim() || null,
        website_url: websiteStatus === "NOT_FOUND" ? null : (websiteUrl.trim() || null),
        website_status: websiteStatus,
        instagram_username: instagramStatus === "NOT_FOUND" ? null : (instagramUsername.trim() || null),
        instagram_status: instagramStatus,
      };

      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan prospek baru.");
      }

      showSuccessToast(
        `Prospek "${businessName}" berhasil ditambahkan sebagai Data Organik!`,
        "Prospek Ditambahkan"
      );
      setSuccessMsg(`Prospek "${businessName}" berhasil ditambahkan sebagai Data Organik!`);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
        // Reset form
        setBusinessName("");
        setContactName("");
        setPhone("");
        setEmail("");
        setAddress("");
        setWebsiteUrl("");
        setInstagramUsername("");
        setOfferingValue("");
        setDealValue("");
        setClosingServices([]);
        setLeadNotes("");
      }, 700);
    } catch (err: any) {
      const msg = err.message || "Terjadi kesalahan saat memproses data.";
      setErrorMsg(msg);
      showErrorToast(msg, "Gagal Tambah Prospek");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-[#1C1B18]/10 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1C1B18]/10 bg-[#FCFBF0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#002236] text-white flex items-center justify-center shadow-xs">
              <Plus size={18} className="text-[#FF7800]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#1C1B18]">
                  Tambah Data Prospek Baru
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Data Organik
                </span>
              </div>
              <p className="text-xs text-[#1C1B18]/60 mt-0.5">
                Input data prospek mandiri (bukan dari sister company database)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#1C1B18]/40 hover:text-[#1C1B18] hover:bg-black/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Section 1: Business Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-[#1C1B18]/8">
              <Building2 size={15} className="text-[#FF7800]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1B18]/80">
                1. Profil & Identitas Bisnis
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="md:col-span-2">
                <label className="block font-semibold text-[#1C1B18] mb-1">
                  Nama Bisnis / Usaha <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Aftertaste Bali Cafe, Sayan Wellness Ubud"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full h-10 px-3.5 bg-white border border-[#1C1B18]/20 rounded-lg text-sm text-[#1C1B18] placeholder:text-[#1C1B18]/35 focus:outline-none focus:border-[#FF7800] focus:ring-2 focus:ring-[#FF7800]/20 transition-all"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1C1B18] mb-1">
                  Kategori Bisnis
                </label>
                <CustomDropdown
                  value={businessCategory}
                  onChange={(val) => {
                    setBusinessCategory(val);
                    if (val !== "Custom") setCustomCategory("");
                  }}
                  options={[
                    ...COMMON_CATEGORIES.map((cat) => ({ value: cat, label: cat })),
                    { value: "Custom", label: "➕ Kategori Lainnya (Ketik Manual)" },
                  ]}
                  className="w-full"
                  buttonClassName="w-full justify-between h-9 bg-white"
                  menuWidth="w-full"
                />
                {businessCategory === "Custom" && (
                  <input
                    type="text"
                    placeholder="Ketik kategori kustom..."
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full h-8 px-3 mt-2 bg-white border border-[#1C1B18]/20 rounded-md text-xs focus:outline-none focus:border-[#FF7800]"
                  />
                )}
              </div>

              <div>
                <label className="block font-semibold text-[#1C1B18] mb-1">
                  Kota / Wilayah
                </label>
                <CustomDropdown
                  value={city}
                  onChange={setCity}
                  options={BALI_CITIES.map((c) => ({ value: c, label: c }))}
                  className="w-full"
                  buttonClassName="w-full justify-between h-9 bg-white"
                  menuWidth="w-full"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-[#1C1B18] mb-1">
                  Alamat Lengkap
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Jl. Pantai Batu Bolong No. 12, Canggu, Kuta Utara"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full h-9 px-3.5 bg-white border border-[#1C1B18]/20 rounded-lg text-xs text-[#1C1B18] placeholder:text-[#1C1B18]/35 focus:outline-none focus:border-[#FF7800]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact & PIC */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-[#1C1B18]/8">
              <User size={15} className="text-[#FF7800]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1B18]/80">
                2. Kontak & Komunikasi Sales
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-[#1C1B18] mb-1">
                  Nama PIC / Kontak
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Pak Made / Bu Sarah"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full h-9 px-3 bg-white border border-[#1C1B18]/20 rounded-lg text-xs focus:outline-none focus:border-[#FF7800]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1C1B18] mb-1">
                  WhatsApp / Telepon
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="08123456789 atau 628..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-9 pl-8 pr-3 bg-white border border-[#1C1B18]/20 rounded-lg text-xs font-number focus:outline-none focus:border-[#FF7800]"
                  />
                  <div className="absolute left-2.5 top-2.5 text-[#25D366]">
                    <WhatsAppIcon size={14} />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1C1B18] mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="info@bisnis.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-9 px-3 bg-white border border-[#1C1B18]/20 rounded-lg text-xs focus:outline-none focus:border-[#FF7800]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Digital Presence & Target Opportunity */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-[#1C1B18]/8">
              <div className="flex items-center gap-2">
                <Globe size={15} className="text-[#FF7800]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1B18]/80">
                  3. Kehadiran Digital (Tanpa Perlu Scan Engine)
                </h4>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Terverifikasi Langsung
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#FCFBF0] border border-[#1C1B18]/10 text-[11px] text-[#1C1B18]/70 leading-relaxed">
              💡 <strong>Langsung Masuk ke Filter Peluang:</strong> Status yang Anda tentukan di bawah akan langsung memetakan prospek ke filter yang sesuai (misal: <em>Website Opportunities</em>, <em>High Lead</em>, <em>Production</em>, atau <em>Social Media</em>) sehingga siap dipitch tanpa harus melalui proses Scan Engine lagi.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Website Status & Input */}
              <div className="space-y-2 p-3 rounded-xl border border-[#1C1B18]/10 bg-white">
                <label className="block font-semibold text-[#1C1B18]">
                  Status Website Saat Ini
                </label>
                <CustomDropdown
                  value={websiteStatus}
                  onChange={(val) => {
                    setWebsiteStatus(val);
                    if (val === "NOT_FOUND") setWebsiteUrl("");
                  }}
                  options={[
                    { value: "NOT_FOUND", label: "❌ Belum Punya Website (Target Web Baru)", badge: "Peluang Web" },
                    { value: "ACTIVE", label: "✅ Sudah Punya Website Aktif", badge: "Online" },
                    { value: "INACTIVE", label: "⚠️ Website Error / Tidak Aktif", badge: "Issue" },
                  ]}
                  className="w-full"
                  buttonClassName="w-full justify-between h-9 bg-white"
                  menuWidth="w-full"
                />

                {websiteStatus !== "NOT_FOUND" && (
                  <div className="pt-1">
                    <label className="block text-[11px] font-medium text-[#1C1B18]/70 mb-1">
                      Website URL
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="https://restorancontoh.com"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        className="w-full h-8 pl-8 pr-3 bg-white border border-[#1C1B18]/20 rounded-lg text-xs focus:outline-none focus:border-[#FF7800]"
                      />
                      <Globe size={13} className="absolute left-2.5 top-2.5 text-[#1C1B18]/40" />
                    </div>
                  </div>
                )}
              </div>

              {/* Instagram Status & Input */}
              <div className="space-y-2 p-3 rounded-xl border border-[#1C1B18]/10 bg-white">
                <label className="block font-semibold text-[#1C1B18]">
                  Status Akun Instagram
                </label>
                <CustomDropdown
                  value={instagramStatus}
                  onChange={(val) => {
                    setInstagramStatus(val);
                    if (val === "NOT_FOUND") setInstagramUsername("");
                  }}
                  options={[
                    { value: "ACTIVE", label: "🔥 Instagram Aktif (Rutin Posting)", badge: "Aktif" },
                    { value: "DORMANT", label: "💤 Instagram Pasif / Jarang Update", badge: "Peluang Socmed" },
                    { value: "NOT_FOUND", label: "❌ Belum Ada / Tidak Pakai Instagram" },
                  ]}
                  className="w-full"
                  buttonClassName="w-full justify-between h-9 bg-white"
                  menuWidth="w-full"
                />

                {instagramStatus !== "NOT_FOUND" && (
                  <div className="pt-1">
                    <label className="block text-[11px] font-medium text-[#1C1B18]/70 mb-1">
                      Instagram Handle / Username
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="contoh_bali_resto"
                        value={instagramUsername}
                        onChange={(e) => setInstagramUsername(e.target.value)}
                        className="w-full h-8 pl-8 pr-3 bg-white border border-[#1C1B18]/20 rounded-lg text-xs font-number focus:outline-none focus:border-[#FF7800]"
                      />
                      <div className="absolute left-2.5 top-2 text-pink-500">
                        <InstagramIcon size={14} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Penugasan & Status Pipeline */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-[#1C1B18]/8">
              <Briefcase size={15} className="text-[#FF7800]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1B18]/80">
                4. Penugasan Sales & Status Pipeline
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Assignment Selector */}
              <div>
                <label className="block font-semibold text-[#1C1B18] mb-1">
                  Penugasan Sales (Assigned To)
                </label>

                {isSales ? (
                  <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#1A75FF] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : "ME"}
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-[#002236]">
                        {currentUser?.name} (Anda)
                      </div>
                      <span className="text-[10px] text-blue-700 font-medium">
                        Otomatis ditugaskan ke portofolio Anda
                      </span>
                    </div>
                  </div>
                ) : (
                  <CustomDropdown
                    value={assignedToId}
                    onChange={setAssignedToId}
                    options={[
                      ...(currentUser ? [{
                        value: currentUser.id,
                        label: `👤 Diri Sendiri — ${currentUser.name}`,
                        badge: currentUser.role === "HEAD" ? "Head" : "Superadmin",
                      }] : []),
                      ...users
                        .filter((u) => u.role === "SALES")
                        .map((u) => ({
                          value: u.id,
                          label: `💼 ${u.name} — ${u.specialty ? u.specialty.split("&")[0].trim() : "Sales"}`,
                          badge: "Sales",
                        })),
                      {
                        value: "UNASSIGNED",
                        label: "⚡ Belum Diassign (Masuk Pool Bebas)",
                        badge: "Pool",
                      },
                    ]}
                    className="w-full"
                    buttonClassName="w-full justify-between h-10 bg-white"
                    menuWidth="w-full"
                    direction="up"
                  />
                )}
                <span className="text-[11px] text-[#1C1B18]/50 mt-1 block">
                  {isSales 
                    ? "Sistem CRM mengunci prospek yang Anda buat ke akun Anda sendiri." 
                    : "Superadmin / Head dapat menugaskan ke diri sendiri, sales rep, atau ke pool bebas."}
                </span>
              </div>

              {/* Status Lead */}
              <div>
                <label className="block font-semibold text-[#1C1B18] mb-1">
                  Status Prospek Saat Ini
                </label>
                <CustomDropdown
                  value={leadStatus}
                  onChange={setLeadStatus}
                  options={[
                    { value: "NEW_LEAD", label: "⚡ Prospek Baru (NEW_LEAD)", badge: "Baru" },
                    { value: "CONTACTED", label: "💬 Sudah Dihubungi (CONTACTED)", badge: "Contacted" },
                    { value: "FOLLOW_UP", label: "🔄 Follow Up Berjalan (FOLLOW_UP)", badge: "Follow Up" },
                    { value: "NEGOTIATION", label: "🤝 Dalam Negosiasi (NEGOTIATION)", badge: "Negotiation" },
                    { value: "SUCCESS", label: "🏆 Closing Deal Berhasil (SUCCESS)", badge: "Won / Deal" },
                    { value: "FAILED", label: "❌ Tidak Tertarik / Batal (FAILED)", badge: "Lost" },
                  ]}
                  className="w-full"
                  buttonClassName="w-full justify-between h-10 bg-white"
                  menuWidth="w-full"
                  direction="up"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Komersial & Nilai Deal */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-[#1C1B18]/8">
              <DollarSign size={15} className="text-[#FF7800]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1B18]/80">
                5. Nilai Penawaran & Layanan Ditawarkan
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-[#1C1B18] mb-1">
                  Estimasi Nilai Penawaran (IDR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-[#1C1B18]/40 text-xs">
                    Rp
                  </span>
                  <input
                    type="number"
                    placeholder="Contoh: 15000000"
                    value={offeringValue}
                    onChange={(e) => setOfferingValue(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 bg-white border border-[#1C1B18]/20 rounded-lg text-xs font-number focus:outline-none focus:border-[#FF7800]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1C1B18] mb-1">
                  Nilai Deal / Closing (IDR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-[#1C1B18]/40 text-xs">
                    Rp
                  </span>
                  <input
                    type="number"
                    placeholder="Contoh: 20000000 (Jika deal)"
                    value={dealValue}
                    onChange={(e) => setDealValue(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 bg-white border border-[#1C1B18]/20 rounded-lg text-xs font-number focus:outline-none focus:border-[#FF7800]"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-[#1C1B18] mb-1.5">
                  Layanan yang Ditawarkan / Closing (Multi-pilihan):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { key: "WEBSITE", label: "Website Development", color: "border-blue-300 text-blue-700 bg-blue-50" },
                    { key: "SEO", label: "SEO Optimization", color: "border-emerald-300 text-emerald-700 bg-emerald-50" },
                    { key: "SOCMED", label: "Social Media Growth", color: "border-purple-300 text-purple-700 bg-purple-50" },
                    { key: "PRODUCTION", label: "Production & Video", color: "border-amber-300 text-amber-700 bg-amber-50" },
                  ].map((service) => {
                    const isSelected = closingServices.includes(service.key);
                    return (
                      <button
                        type="button"
                        key={service.key}
                        onClick={() => toggleService(service.key)}
                        className={`h-9 px-3 rounded-lg border text-xs font-semibold flex items-center justify-between transition-all ${
                          isSelected
                            ? `${service.color} ring-1 ring-offset-1 ring-current shadow-xs`
                            : "border-[#1C1B18]/15 bg-white text-[#1C1B18]/70 hover:bg-[#FCFBF0]"
                        }`}
                      >
                        <span>{service.label}</span>
                        {isSelected && <CheckCircle2 size={13} className="shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-[#1C1B18] mb-1">
                  Catatan Prospek / Kebutuhan Klien
                </label>
                <textarea
                  rows={2}
                  placeholder="Tambahkan detail pembicaraan, kebutuhan khusus website atau branding..."
                  value={leadNotes}
                  onChange={(e) => setLeadNotes(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#1C1B18]/20 rounded-lg text-xs placeholder:text-[#1C1B18]/35 focus:outline-none focus:border-[#FF7800]"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-[#1C1B18]/10 bg-[#FCFBF0] flex items-center justify-between">
          <span className="text-[11px] text-[#1C1B18]/50">
            Sumber data otomatis: <strong className="text-[#002236]">Organik</strong>
          </span>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg border border-[#1C1B18]/15 bg-white text-xs font-semibold text-[#1C1B18] hover:bg-[#FCFBF0] transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#FF7800] text-white text-xs font-bold hover:bg-[#e66c00] transition-colors shadow-xs disabled:opacity-50"
            >
              {loading ? (
                <span>Menyimpan...</span>
              ) : (
                <>
                  <Plus size={14} />
                  <span>Simpan Prospek</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
