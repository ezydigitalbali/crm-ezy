import React from "react";
import { Loader2, Users } from "lucide-react";

export default function CustomersLoading() {
  return (
    <div className="space-y-4 w-full animate-in fade-in duration-150">
      {/* Top Floating Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF7800] via-[#FF9E40] to-[#002236] animate-pulse z-[9999]" />

      {/* Quick Filter Pills Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-8 w-28 rounded-lg bg-white border border-[#1C1B18]/10 animate-pulse"
            />
          ))}
        </div>
        <div className="h-8 w-36 rounded-lg bg-[#FF7800]/20 animate-pulse" />
      </div>

      {/* Filter Bar Skeleton */}
      <div className="bg-white rounded-xl p-4 border border-[#1C1B18]/10 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2.5 min-w-[280px]">
          <div className="h-9 w-60 rounded-lg bg-[#FCFBF0] border border-[#1C1B18]/10 animate-pulse" />
          <div className="h-9 w-36 rounded-lg bg-[#FCFBF0] border border-[#1C1B18]/10 animate-pulse" />
          <div className="h-9 w-32 rounded-lg bg-[#FCFBF0] border border-[#1C1B18]/10 animate-pulse" />
          <div className="h-9 w-32 rounded-lg bg-[#FCFBF0] border border-[#1C1B18]/10 animate-pulse" />
        </div>
        <div className="h-4 w-36 bg-[#1C1B18]/10 rounded animate-pulse" />
      </div>

      {/* Counter bar above table */}
      <div className="flex items-center justify-between px-1">
        <div className="h-4 w-48 bg-[#1C1B18]/10 rounded animate-pulse" />
        <div className="h-4 w-24 bg-[#1C1B18]/10 rounded animate-pulse" />
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-xl border border-[#1C1B18]/10 shadow-xs overflow-hidden">
        <div className="p-3.5 bg-[#FCFBF0]/80 border-b border-[#1C1B18]/10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1C1B18]/60">
            <Loader2 size={14} className="animate-spin text-[#FF7800]" />
            <span>Memuat database prospek...</span>
          </div>
          <div className="h-3 w-28 bg-[#1C1B18]/10 rounded animate-pulse" />
        </div>

        <div className="divide-y divide-[#1C1B18]/5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="p-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-4 h-4 rounded bg-[#1C1B18]/10 animate-pulse shrink-0" />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="h-4 w-44 bg-[#1C1B18]/15 rounded animate-pulse" />
                  <div className="h-3 w-24 bg-[#1C1B18]/8 rounded animate-pulse" />
                </div>
              </div>
              <div className="hidden sm:block h-6 w-24 rounded-full bg-[#1C1B18]/5 animate-pulse" />
              <div className="hidden md:block h-4 w-28 bg-[#1C1B18]/10 rounded animate-pulse" />
              <div className="hidden lg:block h-6 w-20 rounded bg-emerald-500/10 animate-pulse" />
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="w-7 h-7 rounded bg-[#1C1B18]/10 animate-pulse" />
                <div className="w-7 h-7 rounded bg-[#1C1B18]/10 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
