"use client";

import { useState, useEffect } from "react";
import {
  X,
  Save,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Globe,
  Tag,
  DollarSign,
  AlertCircle,
  Briefcase
} from "lucide-react";
import InstagramIcon from "@/components/ui/InstagramIcon";
import CustomDropdown from "@/components/ui/CustomDropdown";
import { useToast } from "@/context/ToastContext";

export interface EditCustomerData {
  id: string;
  business_name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  business_category: string | null;
  sister_company: string | null;
  lead_status?: string | null;
  assigned_to_id?: string | null;
  offering_value?: number | null;
  deal_value?: number | null;
  closing_services?: string | null;
  lead_notes?: string | null;
  website?: {
    domain: string | null;
    status: string;
  } | null;
  instagram?: {
    username: string | null;
    status: string;
  } | null;
}

export interface EditCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  customer: EditCustomerData | null;
  users?: Array<{ id: string; name: string; role: string; specialty?: string | null }>;
  isSuperadminOrHead?: boolean;
  availableSisterCompanies?: string[];
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

const DEFAULT_SISTER_COMPANIES = [
  "Royal Hindia",
  "Happy Farm Bali",
  "Happy Farm Jakarta",
  "Havenland",
  "EZY Property",
];

export default function EditCustomerModal({
  isOpen,
  onClose,
  onSuccess,
  customer,
  users = [],
  isSuperadminOrHead = false,
  availableSisterCompanies = [],
}: EditCustomerModalProps) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
  const [sisterCompany, setSisterCompany] = useState("");
  const [customSister, setCustomSister] = useState("");

  const [websiteDomain, setWebsiteDomain] = useState("");
  const [instagramUsername, setInstagramUsername] = useState("");

  const [leadStatus, setLeadStatus] = useState("NEW_LEAD");
  const [assignedToId, setAssignedToId] = useState<string>("");

  const [offeringValue, setOfferingValue] = useState<string>("");
  const [dealValue, setDealValue] = useState<string>("");
  const [closingServices, setClosingServices] = useState<string[]>([]);
  const [leadNotes, setLeadNotes] = useState("");

  const sisterCompanyOptions = Array.from(
    new Set([...availableSisterCompanies, ...DEFAULT_SISTER_COMPANIES])
  ).filter(Boolean);

  useEffect(() => {
    if (customer) {
      setBusinessName(customer.business_name || "");
      setContactName(customer.contact_name || "");
      setPhone(customer.phone || "");
      setEmail(customer.email || "");
      setAddress(customer.address || "");
      setCity(customer.city || "Badung");
      setProvince(customer.province || "Bali");

      if (customer.business_category) {
        if (COMMON_CATEGORIES.includes(customer.business_category)) {
          setBusinessCategory(customer.business_category);
          setCustomCategory("");
        } else {
          setBusinessCategory("Lainnya");
          setCustomCategory(customer.business_category);
        }
      } else {
        setBusinessCategory("Restaurant & Cafe");
        setCustomCategory("");
      }

      if (customer.sister_company) {
        if (sisterCompanyOptions.includes(customer.sister_company)) {
          setSisterCompany(customer.sister_company);
          setCustomSister("");
        } else {
          setSisterCompany("Custom");
          setCustomSister(customer.sister_company);
        }
      } else {
        setSisterCompany(sisterCompanyOptions[0] || "Royal Hindia");
        setCustomSister("");
      }

      setWebsiteDomain(customer.website?.domain || "");
      setInstagramUsername(customer.instagram?.username || "");
      setLeadStatus(customer.lead_status || "NEW_LEAD");
      setAssignedToId(customer.assigned_to_id || "UNASSIGNED");
      setOfferingValue(customer.offering_value !== null && customer.offering_value !== undefined ? String(customer.offering_value) : "");
      setDealValue(customer.deal_value !== null && customer.deal_value !== undefined ? String(customer.deal_value) : "");
      setClosingServices(
        customer.closing_services ? customer.closing_services.split(",").map((s) => s.trim()) : []
      );
      setLeadNotes(customer.lead_notes || "");
      setErrorMsg(null);
    }
  }, [customer, isOpen]);

  if (!isOpen || !customer) return null;

  const toggleService = (srv: string) => {
    setClosingServices((prev) =>
      prev.includes(srv) ? prev.filter((s) => s !== srv) : [...prev, srv]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!businessName.trim()) {
      setErrorMsg("Nama Bisnis wajib diisi.");
      return;
    }

    const finalCategory = businessCategory === "Lainnya" ? customCategory.trim() : businessCategory;
    const finalSister = sisterCompany === "Custom" ? customSister.trim() : sisterCompany;

    setLoading(true);

    try {
      const res = await fetch(`/api/customers/${customer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: businessName.trim(),
          contact_name: contactName.trim() || null,
          phone: phone.trim() || null,
          email: email.trim() || null,
          address: address.trim() || null,
          city: city.trim() || null,
          province: province.trim() || null,
          business_category: finalCategory || null,
          sister_company: finalSister || null,
          website_domain: websiteDomain.trim() || null,
          instagram_username: instagramUsername.trim() || null,
          lead_status: leadStatus,
          assigned_to_id: assignedToId === "UNASSIGNED" ? null : assignedToId,
          offering_value: offeringValue ? parseFloat(offeringValue) : null,
          deal_value: dealValue ? parseFloat(dealValue) : null,
          closing_services: closingServices.length > 0 ? closingServices.join(",") : null,
          lead_notes: leadNotes.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memperbarui data customer.");
      }

      addToast("success", "Perubahan Disimpan", `Data customer ${businessName} berhasil diperbarui.`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Save edit customer error:", err);
      setErrorMsg(err.message || "Terjadi kesalahan sistem saat menyimpan.");
      addToast("error", "Gagal Menyimpan", err.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl border border-[#1C1B18]/15 overflow-hidden">
        {/* Header Modal */}
        <div className="px-6 py-4.5 border-b border-[#1C1B18]/10 flex items-center justify-between bg-[#FCFBF0]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#002236] text-white flex items-center justify-center shadow-xs">
              <Building2 size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1C1B18] tracking-tight">
                Edit Data Customer
              </h3>
              <p className="text-[11px] text-[#1C1B18]/60">
                Ubah profil bisnis, PIC, Sister Company, dan informasi kontak
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#1C1B18]/50 hover:text-[#1C1B18] hover:bg-[#1C1B18]/5 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Form Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2.5">
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Profil Bisnis & Sister Company */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#002236] font-bold text-[11px] uppercase tracking-wider">
              <Building2 size={14} className="text-[#FF7800]" />
              <span>Identitas Bisnis & Sister Company</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-[#1C1B18] mb-1">
                  Nama Bisnis / Brand <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Contoh: Choji Coffee"
                  className="w-full px-3 py-2 rounded-lg border border-[#1C1B18]/20 focus:border-[#FF7800] focus:ring-1 focus:ring-[#FF7800] outline-hidden text-xs bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1C1B18] mb-1">
                  Sister Company <span className="text-[#FF7800]">*</span>
                </label>
                <CustomDropdown
                  value={sisterCompany}
                  onChange={(val) => setSisterCompany(val)}
                  options={[
                    ...sisterCompanyOptions.map((sc) => ({ value: sc, label: sc })),
                    { value: "Custom", label: "+ Ketik Sister Company Lain..." },
                  ]}
                  className="w-full"
                />
                {sisterCompany === "Custom" && (
                  <input
                    type="text"
                    required
                    value={customSister}
                    onChange={(e) => setCustomSister(e.target.value)}
                    placeholder="Masukkan nama Sister Company..."
                    className="w-full mt-2 px-3 py-2 rounded-lg border border-[#FF7800] focus:ring-1 focus:ring-[#FF7800] outline-hidden text-xs bg-white"
                  />
                )}
              </div>

              <div>
                <label className="block font-semibold text-[#1C1B18] mb-1">
                  Kategori Bisnis
                </label>
                <CustomDropdown
                  value={businessCategory}
                  onChange={(val) => setBusinessCategory(val)}
                  options={[
                    ...COMMON_CATEGORIES.map((c) => ({ value: c, label: c })),
                    { value: "Lainnya", label: "Lainnya (Ketik Manual)" },
                  ]}
                  className="w-full"
                />
                {businessCategory === "Lainnya" && (
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Tulis kategori bisnis..."
                    className="w-full mt-2 px-3 py-2 rounded-lg border border-[#1C1B18]/20 focus:border-[#FF7800] outline-hidden text-xs bg-white"
                  />
                )}
              </div>

              <div>
                <label className="block font-semibold text-[#1C1B18] mb-1">
                  Kota / Wilayah
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Contoh: Badung, Denpasar, Gianyar"
                  className="w-full px-3 py-2 rounded-lg border border-[#1C1B18]/20 focus:border-[#FF7800] outline-hidden text-xs bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#1C1B18] mb-1">
                Alamat Lengkap
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Jl. Raya Kayutulang No.17, Canggu..."
                className="w-full px-3 py-2 rounded-lg border border-[#1C1B18]/20 focus:border-[#FF7800] outline-hidden text-xs bg-white resize-none"
              />
            </div>
          </div>

          {/* Section 2: Kontak PIC */}
          <div className="space-y-3 pt-3 border-t border-[#1C1B18]/10">
            <div className="flex items-center gap-2 text-[#002236] font-bold text-[11px] uppercase tracking-wider">
              <User size={14} className="text-[#FF7800]" />
              <span>Kontak Penanggung Jawab (PIC)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block font-semibold text-[#1C1B18] mb-1">
                  Nama PIC
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Nama kontak"
                  className="w-full px-3 py-2 rounded-lg border border-[#1C1B18]/20 focus:border-[#FF7800] outline-hidden text-xs bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1C1B18] mb-1">
                  Nomor Telepon / WA
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0812..."
                  className="w-full px-3 py-2 rounded-lg border border-[#1C1B18]/20 focus:border-[#FF7800] outline-hidden text-xs bg-white font-number"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1C1B18] mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="info@bisnis.com"
                  className="w-full px-3 py-2 rounded-lg border border-[#1C1B18]/20 focus:border-[#FF7800] outline-hidden text-xs bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Digital Presence (Website & Instagram) */}
          <div className="space-y-3 pt-3 border-t border-[#1C1B18]/10">
            <div className="flex items-center gap-2 text-[#002236] font-bold text-[11px] uppercase tracking-wider">
              <Globe size={14} className="text-[#FF7800]" />
              <span>Digital Presence (Website & Instagram)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-[#1C1B18] mb-1">
                  Domain Website
                </label>
                <div className="relative">
                  <Globe size={14} className="absolute left-3 top-2.5 text-[#1C1B18]/40" />
                  <input
                    type="text"
                    value={websiteDomain}
                    onChange={(e) => setWebsiteDomain(e.target.value)}
                    placeholder="contohbisnis.com"
                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-[#1C1B18]/20 focus:border-[#FF7800] outline-hidden text-xs bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1C1B18] mb-1">
                  Instagram Handle
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-[#1C1B18]/40 font-mono">@</span>
                  <input
                    type="text"
                    value={instagramUsername}
                    onChange={(e) => setInstagramUsername(e.target.value)}
                    placeholder="username_instagram"
                    className="w-full pl-7 pr-3 py-2 rounded-lg border border-[#1C1B18]/20 focus:border-[#FF7800] outline-hidden text-xs bg-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Sales Pipeline & Deal Details */}
          <div className="space-y-3 pt-3 border-t border-[#1C1B18]/10">
            <div className="flex items-center gap-2 text-[#002236] font-bold text-[11px] uppercase tracking-wider">
              <Briefcase size={14} className="text-[#FF7800]" />
              <span>Status Penjualan & Nilai Prospek</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-[#1C1B18] mb-1">
                  Status Prospek
                </label>
                <CustomDropdown
                  value={leadStatus}
                  onChange={(val) => setLeadStatus(val)}
                  options={[
                    { value: "NEW_LEAD", label: "New Lead (Belum Dikontak)" },
                    { value: "CONTACTED", label: "Contacted (Sudah Dikontak)" },
                    { value: "PITCHING", label: "Pitching (Sedang Presentasi)" },
                    { value: "NEGOTIATION", label: "Negotiation (Negosiasi Harga)" },
                    { value: "DEAL_WON", label: "Deal Won (Closing Berhasil)" },
                    { value: "DEAL_LOST", label: "Deal Lost (Belum Berjodoh)" },
                  ]}
                  className="w-full"
                />
              </div>

              {isSuperadminOrHead && (
                <div>
                  <label className="block font-semibold text-[#1C1B18] mb-1">
                    Assign Sales PIC
                  </label>
                  <CustomDropdown
                    value={assignedToId}
                    onChange={(val) => setAssignedToId(val)}
                    options={[
                      { value: "UNASSIGNED", label: "Unassigned (Belum Ditugaskan)" },
                      ...users.map((u) => ({
                        value: u.id,
                        label: `${u.name} (${u.role})`,
                      })),
                    ]}
                    className="w-full"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-[#1C1B18] mb-1">
                  Offering Value (Rp)
                </label>
                <input
                  type="number"
                  value={offeringValue}
                  onChange={(e) => setOfferingValue(e.target.value)}
                  placeholder="5000000"
                  className="w-full px-3 py-2 rounded-lg border border-[#1C1B18]/20 focus:border-[#FF7800] outline-hidden text-xs bg-white font-number"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1C1B18] mb-1">
                  Deal Value (Rp)
                </label>
                <input
                  type="number"
                  value={dealValue}
                  onChange={(e) => setDealValue(e.target.value)}
                  placeholder="4500000"
                  className="w-full px-3 py-2 rounded-lg border border-[#1C1B18]/20 focus:border-[#FF7800] outline-hidden text-xs bg-white font-number"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#1C1B18] mb-1.5">
                Target Layanan Closing EZY
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "WEBSITE", label: "Website Development" },
                  { id: "SEO", label: "SEO Optimization" },
                  { id: "SOCMED", label: "Social Media Management" },
                  { id: "PRODUCTION", label: "Production (Villa/Realty)" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleService(s.id)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                      closingServices.includes(s.id)
                        ? "bg-[#002236] border-[#002236] text-white shadow-xs"
                        : "bg-white border-[#1C1B18]/15 text-[#1C1B18]/70 hover:bg-[#FCFBF0]"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#1C1B18] mb-1">
                Catatan Prospek
              </label>
              <textarea
                rows={2}
                value={leadNotes}
                onChange={(e) => setLeadNotes(e.target.value)}
                placeholder="Catatan kebutuhan klien, preferensi meeting..."
                className="w-full px-3 py-2 rounded-lg border border-[#1C1B18]/20 focus:border-[#FF7800] outline-hidden text-xs bg-white resize-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#1C1B18]/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-white border border-[#1C1B18]/15 text-xs font-semibold text-[#1C1B18]/70 hover:bg-[#FCFBF0] transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#FF7800] text-white text-xs font-semibold hover:bg-[#e66c00] transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Save size={14} />
              <span>{loading ? "Menyimpan..." : "Simpan Perubahan"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
