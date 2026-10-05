"use client";

import { useState } from "react";
import { Check, X, Sparkles, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

interface CandidateItem {
  id: string;
  type: "website" | "instagram";
  identifier: string;
  title?: string;
  confidenceScore: number;
}

export default function ManualVerificationSection({
  customerId,
  websiteCandidates,
  instagramCandidates,
}: {
  customerId: string;
  websiteCandidates: any[];
  instagramCandidates: any[];
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleConfirm = async (type: "website" | "instagram", candidateId: string) => {
    setLoadingId(candidateId);
    try {
      const res = await fetch(`/api/customers/${customerId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, candidateId, action: "CONFIRM" }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (type: "website" | "instagram", candidateId: string) => {
    setLoadingId(candidateId);
    try {
      const res = await fetch(`/api/customers/${customerId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, candidateId, action: "REJECT" }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
    }
  };

  if (websiteCandidates.length === 0 && instagramCandidates.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl p-6 border-2 border-[#002236]/20 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#002236] animate-pulse"></div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#002236]">
            Manual Human Verification Required
          </h3>
        </div>
        <span className="text-[11px] font-bold text-[#002236] bg-[#002236]/10 px-2.5 py-0.5 rounded font-number">
          {websiteCandidates.length + instagramCandidates.length} Candidates
        </span>
      </div>

      <p className="text-xs text-[#1C1B18]/65">
        Automated intelligence matched candidate profiles with moderate confidence. Confirm the official profile to lock the discovery.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Website candidates */}
        {websiteCandidates.map((wc) => (
          <div
            key={wc.id}
            className="p-4 rounded-lg bg-[#FCFBF0] border border-[#1C1B18]/15 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#1A75FF]">
                  Website Candidate
                </span>
                <span className="text-xs font-number font-bold text-[#1C1B18] bg-white px-2 py-0.5 rounded border border-[#1C1B18]/10">
                  Score {wc.confidence_score}
                </span>
              </div>
              <div className="font-semibold text-xs text-[#1C1B18] truncate">{wc.domain}</div>
              <a
                href={wc.url}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-[#1A75FF] hover:underline flex items-center gap-1 mt-0.5 truncate"
              >
                <span>{wc.url}</span>
                <ExternalLink size={10} />
              </a>
            </div>

            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#1C1B18]/10">
              <button
                disabled={loadingId === wc.id}
                onClick={() => handleConfirm("website", wc.id)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-[#FF7800] text-white text-xs font-semibold hover:bg-[#e66c00] transition-colors cursor-pointer"
              >
                <Check size={13} />
                <span>Confirm</span>
              </button>
              <button
                disabled={loadingId === wc.id}
                onClick={() => handleReject("website", wc.id)}
                className="px-3 py-1.5 rounded-md bg-white border border-[#1C1B18]/15 text-[#1C1B18]/70 text-xs font-semibold hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <X size={13} />
                <span>Reject</span>
              </button>
            </div>
          </div>
        ))}

        {/* Instagram candidates */}
        {instagramCandidates.map((ic) => (
          <div
            key={ic.id}
            className="p-4 rounded-lg bg-[#FCFBF0] border border-[#1C1B18]/15 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#FF7800]">
                  Instagram Candidate
                </span>
                <span className="text-xs font-number font-bold text-[#1C1B18] bg-white px-2 py-0.5 rounded border border-[#1C1B18]/10">
                  Score {ic.confidence_score}
                </span>
              </div>
              <div className="font-semibold text-xs text-[#1C1B18] truncate">
                @{ic.username}
              </div>
              <div className="text-[11px] text-[#1C1B18]/60 truncate">
                {ic.display_name || "Profile"}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#1C1B18]/10">
              <button
                disabled={loadingId === ic.id}
                onClick={() => handleConfirm("instagram", ic.id)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-[#FF7800] text-white text-xs font-semibold hover:bg-[#e66c00] transition-colors cursor-pointer"
              >
                <Check size={13} />
                <span>Confirm</span>
              </button>
              <button
                disabled={loadingId === ic.id}
                onClick={() => handleReject("instagram", ic.id)}
                className="px-3 py-1.5 rounded-md bg-white border border-[#1C1B18]/15 text-[#1C1B18]/70 text-xs font-semibold hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <X size={13} />
                <span>Reject</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
