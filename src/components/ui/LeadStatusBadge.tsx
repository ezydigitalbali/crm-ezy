import React from "react";
import { MessageSquare, Clock, Handshake, CheckCircle2, XCircle, Sparkles } from "lucide-react";

export type LeadStatusType = 
  | "NEW_LEAD" 
  | "CONTACTED" 
  | "FOLLOW_UP" 
  | "NEGOTIATION" 
  | "SUCCESS" 
  | "FAILED";

export const LEAD_STATUS_CONFIG: Record<LeadStatusType, { label: string; bg: string; text: string; border: string; icon: any }> = {
  NEW_LEAD: {
    label: "Belum Dihubungi",
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
    icon: Sparkles,
  },
  CONTACTED: {
    label: "Sudah Dihubungi (WA)",
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
    icon: MessageSquare,
  },
  FOLLOW_UP: {
    label: "Sedang Follow Up",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    icon: Clock,
  },
  NEGOTIATION: {
    label: "Negosiasi Proposal",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    icon: Handshake,
  },
  SUCCESS: {
    label: "Deal Closing (Won)",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-300",
    icon: CheckCircle2,
  },
  FAILED: {
    label: "Gagal / Batal",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    icon: XCircle,
  },
};

export default function LeadStatusBadge({ 
  status = "NEW_LEAD",
  size = "md"
}: { 
  status?: string | null;
  size?: "sm" | "md";
}) {
  const normalized = (status || "NEW_LEAD") as LeadStatusType;
  const config = LEAD_STATUS_CONFIG[normalized] || LEAD_STATUS_CONFIG.NEW_LEAD;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${config.bg} ${config.text} ${config.border} ${
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
      }`}
    >
      <Icon size={size === "sm" ? 11 : 13} className="shrink-0" />
      <span>{config.label}</span>
    </span>
  );
}
