import React from "react";
import { Loader2 } from "lucide-react";

export default function OpportunitiesLoading() {
  return (
    <div className="space-y-6 w-full animate-in fade-in duration-150">
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF7800] via-[#FF9E40] to-[#002236] animate-pulse z-[9999]" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-64 bg-[#1C1B18]/10 rounded-lg animate-pulse" />
          <div className="h-4 w-96 max-w-full bg-[#1C1B18]/5 rounded-lg animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <Loader2 size={14} className="animate-spin text-[#FF7800]" />
          <span className="text-xs text-[#1C1B18]/60">Menganalisis peluang pitching...</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-xl bg-white border border-[#1C1B18]/10 shadow-xs space-y-3">
            <div className="h-4 w-32 bg-[#1C1B18]/15 rounded animate-pulse" />
            <div className="h-8 w-24 bg-[#FF7800]/20 rounded-md animate-pulse" />
            <div className="h-3 w-40 bg-[#1C1B18]/10 rounded animate-pulse" />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-[#1C1B18]/10 p-5 shadow-xs space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 rounded-lg bg-[#FCFBF0] border border-[#1C1B18]/5 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
