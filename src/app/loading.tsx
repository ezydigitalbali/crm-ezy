import React from "react";
import { Loader2 } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200">
      {/* Top Floating Progress Accent */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF7800] via-[#FF9E40] to-[#002236] animate-pulse z-[9999]" />

      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-64 bg-[#1C1B18]/10 rounded-lg animate-pulse" />
          <div className="h-4 w-96 max-w-full bg-[#1C1B18]/5 rounded-lg animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-28 bg-[#1C1B18]/10 rounded-lg animate-pulse" />
          <div className="h-9 w-32 bg-[#FF7800]/20 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-white border border-[#1C1B18]/10 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 bg-[#1C1B18]/10 rounded animate-pulse" />
              <div className="w-7 h-7 rounded-lg bg-[#1C1B18]/5 animate-pulse" />
            </div>
            <div className="h-7 w-24 bg-[#1C1B18]/15 rounded-md animate-pulse" />
            <div className="h-2.5 w-16 bg-[#1C1B18]/5 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="bg-white rounded-2xl border border-[#1C1B18]/10 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-[#1C1B18]/8">
          <div className="h-5 w-40 bg-[#1C1B18]/10 rounded animate-pulse" />
          <div className="flex items-center gap-2 text-xs text-[#1C1B18]/50">
            <Loader2 size={14} className="animate-spin text-[#FF7800]" />
            <span>Memuat data intelijen...</span>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-12 w-full rounded-xl bg-[#FCFBF0]/80 border border-[#1C1B18]/5 animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
