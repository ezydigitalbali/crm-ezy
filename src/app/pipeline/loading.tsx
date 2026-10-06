import React from "react";
import { Loader2, TrendingUp } from "lucide-react";

export default function PipelineLoading() {
  return (
    <div className="space-y-6 w-full animate-in fade-in duration-150">
      {/* Top Floating Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF7800] via-[#FF9E40] to-[#002236] animate-pulse z-[9999]" />

      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-72 bg-[#1C1B18]/10 rounded-lg animate-pulse" />
          <div className="h-4 w-96 max-w-full bg-[#1C1B18]/5 rounded-lg animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-32 bg-white border border-[#1C1B18]/15 rounded-lg animate-pulse" />
          <div className="h-9 w-36 bg-[#FF7800]/25 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Leaderboard Dark Box Skeleton */}
      <div className="bg-[#002236] rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FF7800]/30 animate-pulse" />
            <div className="space-y-1">
              <div className="h-4 w-52 bg-white/20 rounded animate-pulse" />
              <div className="h-3 w-72 bg-white/10 rounded animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/50">
            <Loader2 size={14} className="animate-spin text-[#FF7800]" />
            <span>Sinkronisasi Pipeline...</span>
          </div>
        </div>

        {/* 4 Sales Leaderboard Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/20 animate-pulse" />
                  <div className="h-3.5 w-20 bg-white/20 rounded animate-pulse" />
                </div>
                <div className="h-5 w-14 rounded-full bg-emerald-500/20 animate-pulse" />
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
                <div className="h-6 bg-white/10 rounded animate-pulse" />
                <div className="h-6 bg-white/10 rounded animate-pulse" />
                <div className="h-6 bg-white/10 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Kanban Board Columns Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
        {["New Lead", "Contacted", "Follow Up", "Negotiation", "Won / Closing"].map((col, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-[#1C1B18]/10 p-3 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1C1B18]/10">
              <span className="text-xs font-bold text-[#1C1B18]/60">{col}</span>
              <div className="w-5 h-5 rounded-full bg-[#1C1B18]/10 animate-pulse" />
            </div>
            <div className="space-y-2">
              {[1, 2, 3].map((card) => (
                <div key={card} className="h-20 rounded-lg bg-[#FCFBF0] border border-[#1C1B18]/10 p-2.5 space-y-2 animate-pulse">
                  <div className="h-3.5 w-3/4 bg-[#1C1B18]/15 rounded" />
                  <div className="h-2.5 w-1/2 bg-[#1C1B18]/8 rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
