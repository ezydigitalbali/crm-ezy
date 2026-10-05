import React from "react";

interface KpiCardProps {
  label: string;
  value: number | string;
  subtext?: string;
  accentColor?: "orange" | "blue" | "dark" | "default";
  icon?: React.ReactNode;
}

export default function KpiCard({ label, value, subtext, accentColor = "default", icon }: KpiCardProps) {
  const getAccentBorder = () => {
    switch (accentColor) {
      case "orange": return "border-l-4 border-l-[#FF7800]";
      case "blue": return "border-l-4 border-l-[#1A75FF]";
      case "dark": return "border-l-4 border-l-[#002236]";
      default: return "";
    }
  };

  return (
    <div className={`bg-white rounded-xl p-5 border border-[#1C1B18]/10 shadow-xs flex flex-col justify-between ${getAccentBorder()}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[12px] font-semibold tracking-wider uppercase text-[#1C1B18]/60">
          {label}
        </span>
        {icon && <div className="text-[#1C1B18]/40">{icon}</div>}
      </div>

      <div className="my-1">
        <span className="text-3xl font-number font-semibold text-[#1C1B18] tracking-tight">
          {typeof value === "number" ? value.toLocaleString("en-US") : value}
        </span>
      </div>

      {subtext && (
        <div className="text-[12px] text-[#1C1B18]/55 mt-1 font-medium">
          {subtext}
        </div>
      )}
    </div>
  );
}
