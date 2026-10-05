"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Check, 
  Building2, 
  User as UserIcon, 
  MessageSquare, 
  Clock, 
  PhoneCall, 
  Handshake, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Phone,
  FileText,
  CircleDollarSign,
  Layers,
  Globe,
  Search,
  Share2,
  Camera
} from "lucide-react";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import CustomDropdown from "@/components/ui/CustomDropdown";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";

export interface CrmCustomerTarget {
  id: string;
  business_name: string;
  contact_name: string | null;
  phone: string | null;
  lead_status: string;
  assigned_to_id: string | null;
  assigned_to_name?: string | null;
  lead_notes: string | null;
  offering_value?: number | null;
  deal_value?: number | null;
  closing_services?: string | null;
}

export interface SalesUserOption {
  id: string;
  name: string;
  role: string;
  specialty?: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  customer: CrmCustomerTarget | null;
  users: SalesUserOption[];
  onUpdated?: () => void;
}

export const AVAILABLE_CLOSING_SERVICES = [
  { id: "WEBSITE", label: "Website Dev", icon: Globe, desc: "Company Profile / Catalog" },
  { id: "SEO", label: "SEO Optimization", icon: Search, desc: "Google Search Ranking" },
  { id: "SOCMED", label: "Social Media", icon: Share2, desc: "Instagram & Content Mgmt" },
  { id: "PRODUCTION", label: "Production & Media", icon: Camera, desc: "Foto & Video Properti/Bisnis" },
];

const STAGES = [
  { id: "NEW_LEAD", label: "New Lead", desc: "Belum pernah dihubungi", color: "border-slate-300 text-slate-700 bg-slate-50", activeColor: "bg-slate-800 text-white border-slate-800" },
  { id: "CONTACTED", label: "Contacted", desc: "Sudah kontak via WA/Telepon", color: "border-blue-200 text-blue-800 bg-blue-50/60", activeColor: "bg-blue-600 text-white border-blue-600" },
  { id: "FOLLOW_UP", label: "Follow Up", desc: "Dalam proses diskusi aktif", color: "border-amber-200 text-amber-800 bg-amber-50/60", activeColor: "bg-amber-600 text-white border-amber-600" },
  { id: "NEGOTIATION", label: "Negotiation", desc: "Tahap proposal & penawaran", color: "border-orange-200 text-orange-800 bg-orange-50/60", activeColor: "bg-[#FF7800] text-white border-[#FF7800]" },
  { id: "SUCCESS", label: "Won / Deal Closing", desc: "Deal berhasil disepakati", color: "border-emerald-200 text-emerald-800 bg-emerald-50/60", activeColor: "bg-emerald-600 text-white border-emerald-600" },
  { id: "FAILED", label: "Failed / Lost", desc: "Tidak berminat / batal", color: "border-rose-200 text-rose-800 bg-rose-50/60", activeColor: "bg-rose-600 text-white border-rose-600" },
];

const CHANNELS = [
  { id: "WHATSAPP_CHAT", label: "Chat WhatsApp", icon: <WhatsAppIcon size={14} /> },
  { id: "CALL", label: "Panggilan Telepon", icon: <Phone size={14} className="text-[#1A75FF]" /> },
  { id: "MEETING", label: "Meeting / On-site", icon: <Handshake size={14} className="text-[#FF7800]" /> },
  { id: "STATUS_CHANGE", label: "Catatan Internal", icon: <FileText size={14} className="text-slate-500" /> },
];

import { useUser } from "@/context/UserContext";

export default function CrmUpdateModal({
  isOpen,
  onClose,
  customer,
  users,
  onUpdated,
}: Props) {
  const router = useRouter();
  const { user: currentUser } = useUser();
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<string>("CONTACTED");
  const [selectedSalesId, setSelectedSalesId] = useState<string>("");
  const [actionType, setActionType] = useState<string>("WHATSAPP_CHAT");
  const [notes, setNotes] = useState("");
  const [offeringValue, setOfferingValue] = useState<string>("");
  const [dealValue, setDealValue] = useState<string>("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Populate form when modal opens
  useEffect(() => {
    if (customer) {
      setSelectedStatus(customer.lead_status || "CONTACTED");
      setSelectedSalesId(customer.assigned_to_id || "");
      setNotes(customer.lead_notes || "");
      setOfferingValue(customer.offering_value ? String(customer.offering_value) : "");
      setDealValue(customer.deal_value ? String(customer.deal_value) : "");
      setSelectedServices(
        customer.closing_services
          ? customer.closing_services.split(",").map((s) => s.trim()).filter(Boolean)
          : []
      );
      setErrorMsg("");
    }
  }, [customer]);

  if (!isOpen || !customer) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/crm/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer.id,
          leadStatus: selectedStatus,
          assignedToId: selectedSalesId || null,
          notes: notes.trim(),
          offeringValue: offeringValue.trim() ? parseFloat(offeringValue) : null,
          dealValue: dealValue.trim() ? parseFloat(dealValue) : null,
          closingServices: selectedServices,
          actionType,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Gagal memperbarui status CRM");
      }

      showSuccessToast(
        `Status prospek "${customer.business_name}" berhasil diperbarui ke ${selectedStatus}!`,
        "Update Berhasil"
      );

      onClose();
      if (onUpdated) onUpdated();
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message);
      showErrorToast(err.message || "Gagal memperbarui status CRM", "Gagal Update");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAssignedToMe = currentUser && selectedSalesId === currentUser.id;

  return (
    <div className="fixed inset-0 z-50 bg-[#002236]/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-2xl border border-[#1C1B18]/15 shadow-2xl w-full max-w-lg my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Clean, Friendly Aesthetic */}
        <div className="p-4 sm:p-5 border-b border-[#1C1B18]/10 flex items-start justify-between bg-[#FCFBF0]/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10.5px] uppercase font-bold tracking-wider text-[#FF7800] bg-[#FF7800]/10 px-2 py-0.5 rounded">
                Update Prospek CRM
              </span>
            </div>
            <h3 className="text-base font-bold text-[#1C1B18] mt-1 tracking-tight">
              {customer.business_name}
            </h3>
            {(customer.contact_name || customer.phone) && (
              <p className="text-xs text-[#1C1B18]/60 mt-0.5">
                {customer.contact_name} {customer.phone && `• ${customer.phone}`}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-[#1C1B18]/15 text-[#1C1B18]/60 hover:text-[#1C1B18] hover:bg-[#1C1B18]/5 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X size={15} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Status Selection (Clear, Friendly Cards with Full Labels) */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-[#1C1B18] uppercase tracking-wider">
              Tahapan Pipeline (Lead Status)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {STAGES.map((st) => {
                const isSelected = selectedStatus === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSelectedStatus(st.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? `${st.activeColor} shadow-xs font-bold ring-2 ring-offset-1 ring-[#FF7800]/40`
                        : `${st.color} hover:bg-white hover:border-[#1C1B18]/25`
                    }`}
                  >
                    <div className="pt-0.5">
                      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                        isSelected ? "bg-white text-[#002236]" : "border border-current"
                      }`}>
                        {isSelected && "✓"}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold leading-tight">{st.label}</div>
                      <div className={`text-[10.5px] mt-0.5 leading-tight ${isSelected ? "opacity-90" : "opacity-70"}`}>
                        {st.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Sales PIC Assignment (Friendly Card with 1-Click Self-Assign) */}
          <div className="space-y-1.5 pt-2 border-t border-[#1C1B18]/8">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-[#1C1B18] uppercase tracking-wider">
                Sales Person In Charge (PIC)
              </label>
              {currentUser && !isAssignedToMe && (
                <button
                  type="button"
                  onClick={() => setSelectedSalesId(currentUser.id)}
                  className="text-[11px] font-bold text-[#FF7800] hover:text-[#e66c00] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>+ Assign ke Saya ({currentUser.name})</span>
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1">
                <CustomDropdown
                  value={selectedSalesId}
                  onChange={setSelectedSalesId}
                  options={[
                    { value: "", label: "— Belum Diassign (Unassigned) —" },
                    ...users.map((u) => ({
                      value: u.id,
                      label: `${u.name} (${u.specialty ? u.specialty.split("&")[0].trim() : u.role})`,
                      badge: currentUser?.id === u.id ? "Saya" : undefined,
                    })),
                  ]}
                  placeholder="Pilih Sales PIC..."
                  menuWidth="w-full"
                />
              </div>

              {currentUser && (
                <button
                  type="button"
                  onClick={() => setSelectedSalesId(currentUser.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                    isAssignedToMe
                      ? "bg-emerald-600 text-white font-bold shadow-2xs"
                      : "bg-[#002236]/5 hover:bg-[#002236]/10 text-[#002236] border border-[#002236]/15"
                  }`}
                >
                  {isAssignedToMe ? "✓ Di-assign ke Saya" : "Saya yang Handle"}
                </button>
              )}
            </div>
          </div>

          {/* 3. Kanal Interaksi Terakhir (Pill Selector) */}
          <div className="space-y-1.5 pt-2 border-t border-[#1C1B18]/8">
            <label className="block text-[11px] font-bold text-[#1C1B18] uppercase tracking-wider">
              Kanal Interaksi Terakhir
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CHANNELS.map((ch) => {
                const isSelected = actionType === ch.id;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setActionType(ch.id)}
                    className={`px-2.5 py-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#002236] text-white border-[#002236] shadow-xs"
                        : "bg-white text-[#1C1B18]/70 border-[#1C1B18]/15 hover:bg-[#FCFBF0]"
                    }`}
                  >
                    {ch.icon}
                    <span className="truncate">{ch.label.split(" ")[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Nilai Finansial Penawaran & Deal Closing */}
          <div className="space-y-2 pt-2 border-t border-[#1C1B18]/8">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-[#1C1B18] uppercase tracking-wider flex items-center gap-1.5">
                <CircleDollarSign size={15} className="text-emerald-600" />
                <span>Nilai Penawaran & Deal Closing</span>
              </label>
              <span className="text-[10px] text-[#1C1B18]/45">Isi angka (Rp)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Nilai Penawaran */}
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-[#1C1B18]/70">
                  Nilai Penawaran / Proposal (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#1C1B18]/40">Rp</span>
                  <input
                    type="number"
                    min="0"
                    step="100000"
                    value={offeringValue}
                    onChange={(e) => setOfferingValue(e.target.value)}
                    placeholder="0"
                    className="w-full h-9 pl-9 pr-3 bg-[#FCFBF0]/40 border border-[#1C1B18]/15 rounded-lg text-xs font-number font-semibold text-[#002236] focus:outline-none focus:border-[#FF7800]"
                  />
                </div>
                {offeringValue && Number(offeringValue) > 0 && (
                  <span className="text-[10.5px] text-amber-700 font-semibold font-number block">
                    Rp {Number(offeringValue).toLocaleString("id-ID")}
                  </span>
                )}
              </div>

              {/* Nilai Deal Closing */}
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-[#1C1B18]/70">
                  Nilai Deal Disepakati (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#1C1B18]/40">Rp</span>
                  <input
                    type="number"
                    min="0"
                    step="100000"
                    value={dealValue}
                    onChange={(e) => setDealValue(e.target.value)}
                    placeholder="0"
                    className="w-full h-9 pl-9 pr-3 bg-[#FCFBF0]/40 border border-[#1C1B18]/15 rounded-lg text-xs font-number font-semibold text-[#002236] focus:outline-none focus:border-[#FF7800]"
                  />
                </div>
                {dealValue && Number(dealValue) > 0 && (
                  <span className="text-[10.5px] text-emerald-700 font-bold font-number block">
                    Rp {Number(dealValue).toLocaleString("id-ID")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 5. Closing Services (Bisa Multi-Select) */}
          <div className="space-y-1.5 pt-2 border-t border-[#1C1B18]/8">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-[#1C1B18] uppercase tracking-wider flex items-center gap-1.5">
                <Layers size={15} className="text-[#FF7800]" />
                <span>Service / Layanan Yang Ditawarkan / Deal</span>
                <span className="text-[9px] font-semibold uppercase bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded border border-blue-200">Bisa Multi</span>
              </label>
              <span className="text-[10px] text-[#1C1B18]/45">
                {selectedServices.length} layanan dipilih
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {AVAILABLE_CLOSING_SERVICES.map((srv) => {
                const isSelected = selectedServices.includes(srv.id);
                const SrvIcon = srv.icon;
                return (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedServices(selectedServices.filter(s => s !== srv.id));
                      } else {
                        setSelectedServices([...selectedServices, srv.id]);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#002236] text-white border-[#002236] shadow-2xs font-bold ring-1 ring-[#002236]"
                        : "bg-white text-[#1C1B18]/70 border-[#1C1B18]/15 hover:bg-[#FCFBF0]"
                    }`}
                  >
                    <SrvIcon size={14} className={isSelected ? "text-white" : "text-[#FF7800]"} />
                    <span className="truncate text-[11px]">{srv.label}</span>
                    {isSelected && <Check size={14} className="ml-auto text-emerald-400 font-bold shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. Notes Textarea */}
          <div className="space-y-1.5 pt-2 border-t border-[#1C1B18]/8">
            <label className="block text-[11px] font-bold text-[#1C1B18] uppercase tracking-wider">
              Catatan Progres / Hasil Diskusi
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Klien sangat antusias dengan penawaran paket website dev. Follow up proposal hari Kamis."
              className="w-full p-3 bg-[#FCFBF0]/40 border border-[#1C1B18]/15 rounded-xl text-xs text-[#1C1B18] focus:outline-none focus:border-[#FF7800] focus:ring-1 focus:ring-[#FF7800] placeholder:text-[#1C1B18]/35 transition-colors resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#1C1B18]/10 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-white border border-[#1C1B18]/15 text-[#1C1B18] text-xs font-semibold hover:bg-[#FCFBF0] transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-5 py-2 rounded-lg bg-[#FF7800] text-white text-xs font-bold hover:bg-[#e66c00] transition-colors shadow-xs disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check size={14} />
              <span>{isSubmitting ? "Menyimpan..." : "Simpan Pembaruan CRM"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
