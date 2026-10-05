"use client";

import React, { useState, useEffect } from "react";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { X, Copy, Check, ExternalLink, Building2, Sparkles, MessageSquare, Phone, Globe, Camera, Share2, Search } from "lucide-react";

export interface PitchCustomerData {
  id: string;
  business_name: string;
  contact_name: string | null;
  phone: string | null;
  business_category: string | null;
  sister_company: string | null;
  website_domain?: string | null;
  instagram_username?: string | null;
  opportunity_type?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  customer: PitchCustomerData | null;
}

export function cleanPhoneNumber(rawPhone: string | null | undefined): string {
  if (!rawPhone) return "";
  let cleaned = rawPhone.replace(/[^0-9]/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.substring(1);
  } else if (!cleaned.startsWith("62") && cleaned.length >= 9) {
    cleaned = "62" + cleaned;
  }
  return cleaned;
}

export default function WhatsAppPitchModal({ isOpen, onClose, customer }: Props) {
  const [activeTemplate, setActiveTemplate] = useState<"website" | "production" | "social" | "seo" | "intro">("website");
  const [customPhone, setCustomPhone] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  // Sync phone & template when customer opens
  useEffect(() => {
    if (customer) {
      setCustomPhone(customer.phone || "");
      // Default to appropriate template based on category or opportunity
      const cat = (customer.business_category || "").toLowerCase();
      const isProperty = cat.includes("property") || cat.includes("villa") || cat.includes("resort") || cat.includes("hotel") || cat.includes("real estate");

      if (isProperty) {
        setActiveTemplate("production");
      } else if (customer.opportunity_type === "social") {
        setActiveTemplate("social");
      } else if (customer.opportunity_type === "seo") {
        setActiveTemplate("seo");
      } else {
        setActiveTemplate("website");
      }
    }
  }, [customer]);

  // Re-generate text whenever activeTemplate or customer changes
  useEffect(() => {
    if (!customer) return;

    const contactGreeting = customer.contact_name ? `kak ${customer.contact_name}` : "Bapak/Ibu";
    const businessName = customer.business_name || "bisnis Bapak/Ibu";
    const sisterCompany = customer.sister_company || "sister company kami di Bali";
    const igMention = customer.instagram_username ? `@${customer.instagram_username}` : "Instagram";
    const webMention = customer.website_domain || "website resmi";

    let text = "";

    switch (activeTemplate) {
      case "website":
        text = `Halo ${contactGreeting}, salam hangat dari tim EZY Digital Bali! 😊\n\nKami menghubungi kakak karena ${businessName} merupakan relasi & partner dari sister company kami, *${sisterCompany}*.\n\nSaat tim kami melihat profil Instagram ${igMention} yang sangat aktif dan menarik, kami perhatikan ${businessName} belum memiliki website resmi (official website).\n\nDi Bali, memiliki official website sangat krusial untuk:\n1. Meningkatkan direct booking/order langsung tanpa potongan komisi OTA / platform pihak ketiga (15-20%).\n2. Mendapatkan calon tamu & klien dari Google Search (SEO) lokal & internasional.\n3. Meningkatkan kredibilitas & citra profesional brand.\n\nDi EZY Digital Bali, kami menyediakan pembuatan website modern yang cepat, mobile-friendly, dan terintegrasi sistem reservasi WhatsApp.\n\nApakah ada waktu 5-10 menit untuk kami kirimkan demo desain website atau ngobrol santai kak? Terima kasih banyak ${contactGreeting}! 🙏`;
        break;

      case "production":
        text = `Halo ${contactGreeting}, salam hangat dari tim EZY Digital Bali! 😊\n\nKami dari tim media kreatif EZY Digital, sister company dari *${sisterCompany}*.\n\nMelihat properti & tempat ${businessName} yang sangat menawan dan berpotensi tinggi, kami ingin menawarkan solusi visual media premium untuk mendongkrak okupansi dan daya pikat tamu/investor:\n\n📸 Architectural & Interior Photography profesional\n🎥 Cinematic Video Tour (Reels & YouTube 4K)\n🚁 Drone Aerial Footage (FPV & lanskap Bali)\n🌐 3D Virtual Walkthrough Tour untuk buyer luar negeri\n\nApakah boleh kami kirimkan link portofolio media properti & hospitality yang pernah kami kerjakan kak? Terima kasih banyak ${contactGreeting}! 🙏`;
        break;

      case "social":
        text = `Halo ${contactGreeting}, salam kenal dari tim EZY Digital Bali! 😊\n\nKami menghubungi kakak sebagai bagian dari keluarga ekosistem sister company kami, *${sisterCompany}*.\n\nWebsite resmi ${businessName} (${webMention}) sudah terlihat sangat profesional! Namun kami perhatikan akun Instagram kelihatannya belum sempat di-update beberapa waktu terakhir.\n\nDi industri Bali yang sangat dinamis, konsistensi sosial media sangat menentukan agar customer tidak beralih ke kompetitor. Kami di EZY Digital menyediakan layanan Social Media Management lengkap:\n✨ Content Calendar, Copywriting & Storytelling\n✨ Photoshoot & Video Reels bulanan on-site di Bali\n✨ Desain feed estetik & manajemen posting terjadwal\n\nBoleh kami buatkan 1 sample ide konten gratis khusus untuk ${businessName} kak? Terima kasih banyak ${contactGreeting}! 🙏`;
        break;

      case "seo":
        text = `Halo ${contactGreeting}, salam sukses dari tim EZY Digital Bali! 😊\n\nKami menghubungi kakak dari ekosistem sister company kami, *${sisterCompany}*.\n\nLuar biasa melihat website (${webMention}) dan Instagram ${igMention} dari ${businessName} sudah aktif berjalan berdampingan!\n\nTim SEO EZY Digital Bali ingin menawarkan Free Website Audit untuk mengecek potensi ranking Google Search di kata kunci strategis turis & ekspatriat Bali. Tujuannya agar traffic organik dan inquiry langsung bisa bertambah signifikan tanpa biaya iklan berlebih.\n\nBoleh kami buatkan laporan audit singkatnya (gratis) untuk ${businessName} kak? Terima kasih banyak ${contactGreeting}! 🙏`;
        break;

      case "intro":
        text = `Halo ${contactGreeting}, salam kenal dari EZY Digital Bali! 😊\n\nKami mendapatkan kontak kakak melalui sister company kami, *${sisterCompany}*.\n\nKami adalah agensi digital di Bali yang fokus membantu pelaku bisnis memaksimalkan website, media sosial, dan produksi visual (foto/video/drone).\n\nSenang bisa terhubung dengan ${businessName}. Boleh kami simpan kontak kakak untuk berbagi update dan solusi digital bila sewaktu-waktu dibutuhkan?\n\nSukses selalu untuk ${businessName} ya kak! 🙏`;
        break;
    }

    setMessage(text);
  }, [activeTemplate, customer]);

  if (!isOpen || !customer) return null;

  const cleanedPhone = cleanPhoneNumber(customPhone);
  const waUrl = cleanedPhone
    ? `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(message)}`
    : "#";

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = async () => {
    if (!cleanedPhone) {
      alert("Harap masukkan nomor WhatsApp yang valid terlebih dahulu.");
      return;
    }

    // Auto record CRM activity and update lead status to CONTACTED
    try {
      fetch("/api/crm/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer.id,
          leadStatus: "CONTACTED",
          notes: `Menghubungi via WhatsApp template: ${activeTemplate.toUpperCase()} PITCH ke ${cleanedPhone}`,
          actionType: "WHATSAPP_CHAT",
        }),
      }).catch((e) => console.error(e));
    } catch (e) {
      // ignore
    }

    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#002236]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl border border-[#1C1B18]/15 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#002236] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-xs shrink-0">
              <WhatsAppIcon size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base text-white">
                  Pitching via WhatsApp
                </h3>
                <span className="text-[11px] font-semibold bg-[#25D366]/20 text-[#25D366] px-2 py-0.5 rounded-full border border-[#25D366]/40">
                  Direct WhatsApp Chat
                </span>
              </div>
              <p className="text-xs text-white/70 mt-0.5">
                Kirim pesan pitching terpersonalisasi langsung ke prospek
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-white/60 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Prospek & Sister Company Info Card */}
        <div className="bg-[#FCFBF0] border-b border-[#1C1B18]/10 p-4 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#1C1B18]/50">
                Nama Prospek / Bisnis
              </span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#1C1B18]">
                  {customer.business_name}
                </span>
                {customer.business_category && (
                  <span className="text-[11px] px-2 py-0.5 rounded bg-[#1C1B18]/10 text-[#1C1B18]/80 font-medium">
                    {customer.business_category}
                  </span>
                )}
              </div>
            </div>

            {/* SISTER COMPANY BADGE - VITAL REQUIREMENT */}
            <div className="bg-[#FF7800]/10 border border-[#FF7800]/30 rounded-lg px-3 py-1.5 flex items-center gap-2">
              <Building2 size={15} className="text-[#FF7800]" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#c25900] block leading-none">
                  Database Sister Company
                </span>
                <span className="text-xs font-bold text-[#002236]">
                  {customer.sister_company || "EZY Property"}
                </span>
              </div>
            </div>
          </div>

          {/* Contact & Phone input row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#1C1B18]/8">
            <div>
              <span className="text-[11px] font-semibold text-[#1C1B18]/60 block">
                Contact Person
              </span>
              <span className="text-xs font-semibold text-[#1C1B18]">
                {customer.contact_name || "Owner / Pengelola (Belum ada nama spesifik)"}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-[#1C1B18]/60 block">
                Nomor WhatsApp Target
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <Phone size={13} className="text-[#25D366]" />
                <input
                  type="text"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  placeholder="e.g. 081234567890 / +62..."
                  className="font-number text-xs font-bold text-[#002236] bg-white border border-[#1C1B18]/20 rounded px-2 py-0.5 w-full focus:outline-none focus:border-[#25D366]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Template Selector Pills */}
        <div className="p-4 border-b border-[#1C1B18]/10 space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#1C1B18]/60 flex items-center gap-1.5">
            <Sparkles size={13} className="text-[#FF7800]" />
            <span>Pilih Template Pitching Teks:</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "website", label: "Website Dev", icon: Globe, desc: "No web + active IG" },
              { id: "production", label: "Production Media", icon: Camera, desc: "Villa / Property" },
              { id: "social", label: "Social Media Mgt", icon: Share2, desc: "IG cooling/dormant" },
              { id: "seo", label: "Free SEO Audit", icon: Search, desc: "Web + IG aktif" },
              { id: "intro", label: "Sapaan Hangat", icon: Sparkles, desc: "Perkenalan awal" },
            ].map((t) => {
              const isActive = activeTemplate === t.id;
              const TIcon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTemplate(t.id as any)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#002236] text-white shadow-xs"
                      : "bg-[#FCFBF0] text-[#1C1B18]/70 hover:bg-[#1C1B18]/10 border border-[#1C1B18]/10"
                  }`}
                >
                  <TIcon size={12} className={isActive ? "text-white" : "text-[#FF7800]"} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Editable Message Box */}
        <div className="p-4 flex-1 overflow-y-auto space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#1C1B18]/60">
              Preview & Edit Pesan WhatsApp:
            </label>
            <span className="text-[11px] text-[#1C1B18]/50">
              Dapat diedit bebas sebelum dikirim
            </span>
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={8}
            className="w-full text-xs font-sans p-3 bg-[#FCFBF0]/40 border border-[#1C1B18]/15 rounded-xl focus:outline-none focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] text-[#1C1B18] leading-relaxed resize-none"
          />
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#FCFBF0] border-t border-[#1C1B18]/10 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-[#1C1B18]/20 text-[#1C1B18] text-xs font-semibold hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check size={14} className="text-emerald-600" />
                <span className="text-emerald-700">Tersalin ke Clipboard!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Salin Teks Template</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold text-[#1C1B18]/60 hover:text-[#1C1B18] transition-colors cursor-pointer"
            >
              Tutup
            </button>
            <button
              onClick={handleOpenWhatsApp}
              disabled={!cleanedPhone}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer ${
                cleanedPhone
                  ? "bg-[#25D366] hover:bg-[#20ba59] text-white"
                  : "bg-zinc-300 text-zinc-500 cursor-not-allowed"
              }`}
            >
              <WhatsAppIcon size={16} />
              <span>Buka WhatsApp Sekarang</span>
              <ExternalLink size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
