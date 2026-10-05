import React from "react";

type BadgeType = 
  | "website-active"
  | "website-not-found"
  | "website-inactive"
  | "website-needs-review"
  | "website-scan-failed"
  | "instagram-active"
  | "instagram-cooling"
  | "instagram-inactive"
  | "instagram-dormant"
  | "instagram-not-found"
  | "instagram-needs-review"
  | "instagram-scan-failed"
  | "opportunity-high-website"
  | "opportunity-website"
  | "opportunity-social"
  | "opportunity-seo"
  | "opportunity-presence"
  | "opportunity-production"
  | "needs-review";

interface StatusBadgeProps {
  type: BadgeType;
  label?: string;
  className?: string;
}

export default function StatusBadge({ type, label, className = "" }: StatusBadgeProps) {
  switch (type) {
    // Website Badges
    case "website-active":
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[12px] font-medium bg-[#1A75FF]/10 text-[#004dc7] border border-[#1A75FF]/20 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#1A75FF]" />
          {label || "Active"}
        </span>
      );
    case "website-not-found":
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[12px] font-medium bg-[#FF7800]/10 text-[#c25900] border border-[#FF7800]/25 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF7800]" />
          {label || "Not Found"}
        </span>
      );
    case "website-needs-review":
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[12px] font-medium bg-[#002236]/10 text-[#002236] border border-[#002236]/25 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#002236]" />
          {label || "Needs Review"}
        </span>
      );
    case "website-inactive":
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[12px] font-medium bg-[#1C1B18]/5 text-[#1C1B18]/70 border border-[#1C1B18]/15 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#1C1B18]/40" />
          {label || "Inactive"}
        </span>
      );
    case "website-scan-failed":
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[12px] font-medium bg-rose-50 text-rose-700 border border-rose-200 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          {label || "Failed"}
        </span>
      );

    // Instagram Badges
    case "instagram-active":
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[12px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {label || "Active"}
        </span>
      );
    case "instagram-cooling":
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[12px] font-medium bg-[#FF7800]/10 text-[#c25900] border border-[#FF7800]/25 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF7800]" />
          {label || "Cooling"}
        </span>
      );
    case "instagram-inactive":
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[12px] font-medium bg-[#1C1B18]/5 text-[#1C1B18]/70 border border-[#1C1B18]/15 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#1C1B18]/40" />
          {label || "Inactive"}
        </span>
      );
    case "instagram-dormant":
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[12px] font-medium bg-zinc-100 text-zinc-700 border border-zinc-300 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
          {label || "Dormant"}
        </span>
      );
    case "instagram-not-found":
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[12px] font-medium bg-zinc-100 text-zinc-500 border border-zinc-200 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
          {label || "Not Found"}
        </span>
      );
    case "instagram-needs-review":
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[12px] font-medium bg-[#002236]/10 text-[#002236] border border-[#002236]/25 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#002236]" />
          {label || "Needs Review"}
        </span>
      );
    case "instagram-scan-failed":
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[12px] font-medium bg-rose-50 text-rose-700 border border-rose-200 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          {label || "Failed"}
        </span>
      );

    // Opportunity Badges
    case "opportunity-high-website":
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-[11px] font-bold uppercase tracking-wider bg-[#FF7800] text-white shadow-xs ${className}`}>
          Website Dev (High)
        </span>
      );
    case "opportunity-website":
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-[11px] font-bold uppercase tracking-wider bg-[#FF7800]/15 text-[#c25900] border border-[#FF7800]/30 ${className}`}>
          Website Dev
        </span>
      );
    case "opportunity-social":
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-[11px] font-bold uppercase tracking-wider bg-[#1A75FF]/15 text-[#004dc7] border border-[#1A75FF]/30 ${className}`}>
          Social / Content
        </span>
      );
    case "opportunity-seo":
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-[11px] font-bold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200 ${className}`}>
          SEO Candidate
        </span>
      );
    case "opportunity-presence":
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-[11px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-700 border border-zinc-300 ${className}`}>
          Digital Presence
        </span>
      );
    case "opportunity-production":
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-[11px] font-bold uppercase tracking-wider bg-[#002236] text-white shadow-xs ${className}`}>
          Production / Media
        </span>
      );
    case "needs-review":
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-[11px] font-bold uppercase tracking-wider bg-purple-50 text-purple-800 border border-purple-200 ${className}`}>
          {label || "Needs Review"}
        </span>
      );
  }
}
