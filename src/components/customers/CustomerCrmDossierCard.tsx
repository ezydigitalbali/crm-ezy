"use client";

import React, { useState } from "react";
import { 
  Handshake, 
  User as UserIcon, 
  Clock, 
  MessageSquare, 
  Phone, 
  Calendar, 
  Edit3, 
  CheckCircle2, 
  Building2,
  Sparkles,
  DollarSign,
  TrendingUp,
  Briefcase
} from "lucide-react";
import LeadStatusBadge from "@/components/ui/LeadStatusBadge";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import WhatsAppPitchModal, { PitchCustomerData } from "@/components/common/WhatsAppPitchModal";
import CrmUpdateModal, { CrmCustomerTarget, SalesUserOption } from "@/components/crm/CrmUpdateModal";

interface ActivityItem {
  id: string;
  user_name: string;
  action_type: string;
  status_from: string | null;
  status_to: string | null;
  notes: string | null;
  created_at: string;
}

interface Props {
  customer: {
    id: string;
    business_name: string;
    contact_name: string | null;
    phone: string | null;
    lead_status: string;
    assigned_to_id: string | null;
    assigned_to_name: string | null;
    last_contacted_at: string | null;
    last_contacted_by: string | null;
    lead_notes: string | null;
    business_category: string | null;
    sister_company: string | null;
    website_domain?: string | null;
    instagram_username?: string | null;
    offering_value?: number | null;
    deal_value?: number | null;
    closing_services?: string | null;
  };
  activities: ActivityItem[];
  users: SalesUserOption[];
}

export default function CustomerCrmDossierCard({
  customer,
  activities,
  users,
}: Props) {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  const formatLastContact = (dateStr: string | null, by: string | null) => {
    if (!dateStr) return <span className="text-[#1C1B18]/40 italic">Belum pernah dihubungi</span>;
    const date = new Date(dateStr);
    const days = Math.round((Date.now() - date.getTime()) / (1000 * 3600 * 24));
    
    let timeText = "";
    if (days === 0) timeText = "Hari ini";
    else if (days === 1) timeText = "Kemarin";
    else timeText = `${days} hari lalu`;

    return (
      <span className="font-number font-bold text-[#002236]">
        {timeText} ({date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })})
        {by && <span className="text-[#1C1B18]/60 font-sans font-normal ml-1">oleh {by}</span>}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-[#1C1B18]/10 shadow-xs space-y-5">
      {/* Header card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1C1B18]/8">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#002236] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Handshake size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1C1B18]/90">
              Sales CRM Lead Management
            </h3>
            <p className="text-xs text-[#1C1B18]/50">
              Status pipeline interaksi dan catatan pitching sales
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsWhatsAppModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-xs font-bold hover:bg-[#20ba59] transition-all shadow-xs cursor-pointer"
          >
            <WhatsAppIcon size={14} />
            <span>Chat WhatsApp</span>
          </button>
          <button
            onClick={() => setIsUpdateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#002236] text-white text-xs font-semibold hover:bg-[#FF7800] transition-colors cursor-pointer"
          >
            <Edit3 size={13} />
            <span>Update Status & Catatan</span>
          </button>
        </div>
      </div>

      {/* Grid Status Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#FCFBF0] p-4 rounded-xl border border-[#1C1B18]/10 text-xs">
        {/* Status Pipeline */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#1C1B18]/50 block mb-1">
            Tahapan Pipeline
          </span>
          <LeadStatusBadge status={customer.lead_status} size="md" />
        </div>

        {/* Assigned PIC */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#1C1B18]/50 block mb-1">
            Sales Penanggung Jawab (PIC)
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <UserIcon size={14} className="text-[#FF7800]" />
            <span className="font-bold text-[#002236]">
              {customer.assigned_to_name || "Belum Di-assign"}
            </span>
          </div>
        </div>

        {/* Last Contacted */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#1C1B18]/50 block mb-1">
            Terakhir Dihubungi
          </span>
          <div className="mt-0.5">
            {formatLastContact(customer.last_contacted_at, customer.last_contacted_by)}
          </div>
        </div>
      </div>

      {/* Financial & Deal Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gradient-to-r from-emerald-50/70 to-teal-50/50 p-4 rounded-xl border border-emerald-200/60 text-xs">
        {/* Nilai Penawaran */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700/60 block mb-1">
            <DollarSign size={10} className="inline -mt-0.5 mr-0.5" />Nilai Penawaran
          </span>
          <span className="font-number font-bold text-emerald-900 text-sm">
            {customer.offering_value
              ? `Rp ${customer.offering_value.toLocaleString("id-ID")}`
              : <span className="text-[#1C1B18]/35 italic font-sans text-xs">Belum diisi</span>}
          </span>
        </div>

        {/* Nilai Deal */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700/60 block mb-1">
            <TrendingUp size={10} className="inline -mt-0.5 mr-0.5" />Nilai Deal
          </span>
          <span className="font-number font-bold text-emerald-900 text-sm">
            {customer.deal_value
              ? `Rp ${customer.deal_value.toLocaleString("id-ID")}`
              : <span className="text-[#1C1B18]/35 italic font-sans text-xs">Belum ada deal</span>}
          </span>
        </div>

        {/* Closing Services */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700/60 block mb-1">
            <Briefcase size={10} className="inline -mt-0.5 mr-0.5" />Closing Services
          </span>
          <div className="flex flex-wrap gap-1 mt-0.5">
            {customer.closing_services ? (
              customer.closing_services.split(",").map((svc) => (
                <span
                  key={svc.trim()}
                  className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-xs"
                >
                  {svc.trim()}
                </span>
              ))
            ) : (
              <span className="text-[#1C1B18]/35 italic">Belum ada service</span>
            )}
          </div>
        </div>
      </div>

      {/* Current Lead Notes */}
      {customer.lead_notes && (
        <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-200/70 text-xs space-y-1">
          <span className="font-bold text-amber-900 block text-[11px] uppercase tracking-wider">
            Catatan Prospek Terkini:
          </span>
          <p className="text-amber-950 leading-relaxed font-sans">
            "{customer.lead_notes}"
          </p>
        </div>
      )}

      {/* Activity Timeline */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1B18]/70 flex items-center gap-1.5">
          <Clock size={13} className="text-[#1A75FF]" />
          <span>Riwayat Aktivitas & Kontak ({activities.length})</span>
        </h4>

        {activities.length === 0 ? (
          <div className="text-xs text-[#1C1B18]/40 italic py-2">
            Belum ada aktivitas kontak yang tercatat. Silakan hubungi via WhatsApp atau update status.
          </div>
        ) : (
          <div className="space-y-2 border-l-2 border-[#1C1B18]/10 ml-2 pl-4">
            {activities.map((act) => {
              const date = new Date(act.created_at);
              return (
                <div key={act.id} className="relative text-xs space-y-0.5 pb-2">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#FF7800] border-2 border-white" />
                  <div className="flex items-center gap-2 flex-wrap text-[11px]">
                    <span className="font-number font-semibold text-[#002236]">
                      {date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="font-bold text-[#FF7800]">
                      {act.user_name}
                    </span>
                    <span className="bg-[#1C1B18]/10 text-[#1C1B18]/80 px-1.5 py-0.2 rounded text-[10px] font-semibold">
                      {act.action_type.replace("_", " ")}
                    </span>
                    {act.status_to && (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold border border-emerald-200">
                        Status: {act.status_to}
                      </span>
                    )}
                  </div>
                  {act.notes && (
                    <p className="text-[#1C1B18]/80 text-[11px] leading-relaxed pt-0.5">
                      {act.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <CrmUpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        customer={{
          id: customer.id,
          business_name: customer.business_name,
          contact_name: customer.contact_name,
          phone: customer.phone,
          lead_status: customer.lead_status,
          assigned_to_id: customer.assigned_to_id,
          assigned_to_name: customer.assigned_to_name,
          lead_notes: customer.lead_notes,
          offering_value: customer.offering_value,
          deal_value: customer.deal_value,
          closing_services: customer.closing_services,
        }}
        users={users}
      />

      <WhatsAppPitchModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        customer={{
          id: customer.id,
          business_name: customer.business_name,
          contact_name: customer.contact_name,
          phone: customer.phone,
          business_category: customer.business_category,
          sister_company: customer.sister_company,
          website_domain: customer.website_domain,
          instagram_username: customer.instagram_username,
        }}
      />
    </div>
  );
}
