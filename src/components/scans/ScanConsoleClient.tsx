"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Play, CheckCircle2, AlertTriangle, XCircle, Clock, Radar, AlertCircle } from "lucide-react";

interface ScanJobItem {
  id: string;
  type: string;
  status: string;
  total: number;
  processed: number;
  successful: number;
  needs_review: number;
  failed: number;
  created_by: string;
  started_at: string | null;
  completed_at: string | null;
}

// Format waktu dan tanggal yang deterministik agar identik antara server (SSR) dan client
function formatDateSafely(dateStr: string | null | undefined): string {
  if (!dateStr) return "Recently";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "Recently";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const mins = String(d.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year}, ${hours}:${mins}`;
}

function formatTimeSafely(dateStr: string | null | undefined): string {
  if (!dateStr) return "baru saja";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "baru saja";
  const hours = String(d.getHours()).padStart(2, "0");
  const mins = String(d.getMinutes()).padStart(2, "0");
  return `${hours}:${mins}`;
}

export default function ScanConsoleClient({
  recentJobs,
  totalCustomers,
}: {
  recentJobs: ScanJobItem[];
  totalCustomers: number;
}) {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(recentJobs[0]?.status === "RUNNING");
  const [progress, setProgress] = useState(
    recentJobs[0]
      ? recentJobs[0].status === "RUNNING"
        ? Math.round((recentJobs[0].processed / (recentJobs[0].total || 1)) * 100)
        : 100
      : 0
  );
  const [currentJob, setCurrentJob] = useState<ScanJobItem | null>(recentJobs[0] || null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const pollStatus = async (jobId: string) => {
    try {
      const res = await fetch(`/api/scans/status?jobId=${encodeURIComponent(jobId)}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.job) {
        setCurrentJob(data.job);
        const total = data.job.total || totalCustomers;
        const pct = total > 0 ? Math.round((data.job.processed / total) * 100) : 0;
        setProgress(pct);

        if (data.job.status === "COMPLETED") {
          stopPolling();
          setIsScanning(false);
          setProgress(100);
          setSuccessMessage(
            `Scan ${data.job.type} berhasil selesai! Memproses ${data.job.processed} customer (${data.job.successful} sukses, ${data.job.needs_review} perlu review, ${data.job.failed} gagal).`
          );
          router.refresh();
        } else if (data.job.status === "FAILED") {
          stopPolling();
          setIsScanning(false);
          setErrorMessage("Proses scan dihentikan atau terjadi kendala pada server.");
        }
      }
    } catch (err) {
      console.error("Polling error:", err);
    }
  };

  useEffect(() => {
    // Jika scan masih berjalan saat halaman pertama kali dibuka / direfresh
    if (recentJobs[0]?.status === "RUNNING") {
      setIsScanning(true);
      const j = recentJobs[0];
      const pct = j.total > 0 ? Math.round((j.processed / j.total) * 100) : 0;
      setProgress(pct);

      stopPolling();
      pollIntervalRef.current = setInterval(() => {
        pollStatus(j.id);
      }, 1500);
    }

    return () => {
      stopPolling();
    };
  }, []);

  const handleStartScan = async (scanType: string) => {
    stopPolling();
    setIsScanning(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setProgress(0);

    try {
      const res = await fetch("/api/scans/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanType }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Terjadi kesalahan saat memulai scan.");
      }

      if (data.job) {
        setCurrentJob(data.job);
        const initialPct =
          data.job.total > 0
            ? Math.round((data.job.processed / data.job.total) * 100)
            : 0;
        setProgress(initialPct);

        // Mulai polling real-time dari database
        pollIntervalRef.current = setInterval(() => {
          pollStatus(data.job.id);
        }, 1500);
      }
    } catch (e: any) {
      console.error("Start scan error:", e);
      setErrorMessage(e.message || "Gagal menghubungkan ke server scanning.");
      setIsScanning(false);
    }
  };

  const activeTotal = currentJob?.total || totalCustomers;
  const activeProcessed = currentJob?.processed ?? 0;
  const activeSuccessful = currentJob ? currentJob.successful : 0;
  const activeNeedsReview = currentJob ? currentJob.needs_review : 0;
  const activeFailed = currentJob ? currentJob.failed : 0;
  const displayPercentage = isScanning
    ? progress
    : currentJob && currentJob.total > 0
    ? Math.round((currentJob.processed / currentJob.total) * 100)
    : 100;

  return (
    <div className="space-y-6">
      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 shadow-xs">
          <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">Gagal Menjalankan Scan</span>
            <p className="text-rose-700/90">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-3 shadow-xs">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">Scan Selesai</span>
            <p className="text-emerald-700/90">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Active Scan Status Banner */}
      <div className="bg-white rounded-xl p-6 border border-[#1C1B18]/10 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Radar size={18} className={`text-[#FF7800] ${isScanning ? "animate-spin" : ""}`} />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#1C1B18]/80">
                Website & Instagram Intelligence Scan
              </h3>
            </div>
            <p className="text-xs text-[#1C1B18]/55 mt-0.5">
              {isScanning
                ? "Sedang memverifikasi website DNS/HTTP, mendeteksi Instagram, & mengevaluasi peluang divisi Production secara real-time..."
                : currentJob
                ? `Idle. Scan terakhir (${currentJob.type}) selesai pada ${
                    currentJob.completed_at
                      ? formatTimeSafely(currentJob.completed_at)
                      : "baru saja"
                  }.`
                : "Idle. Siap menjalankan scan customer 1 per 1."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={isScanning}
              onClick={() => handleStartScan("ALL")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FF7800] text-white text-xs font-semibold hover:bg-[#e66c00] transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Play size={13} fill="currentColor" />
              <span>{isScanning ? "Scanning..." : "Start Full Scan"}</span>
            </button>
            <button
              disabled={isScanning}
              onClick={() => handleStartScan("WEBSITE")}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#1C1B18]/15 text-xs font-semibold text-[#1C1B18] hover:bg-[#FCFBF0] transition-colors disabled:opacity-50 cursor-pointer"
            >
              <span>Websites Only</span>
            </button>
            <button
              disabled={isScanning}
              onClick={() => handleStartScan("INSTAGRAM")}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#1C1B18]/15 text-xs font-semibold text-[#1C1B18] hover:bg-[#FCFBF0] transition-colors disabled:opacity-50 cursor-pointer"
            >
              <span>Instagram Only</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-[#1C1B18]/70">
              Database Coverage Progress
            </span>
            <span className="font-number font-bold text-sm text-[#FF7800]">
              {displayPercentage}%
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-[#1C1B18]/8 overflow-hidden">
            <div
              className="h-full bg-[#FF7800] transition-all duration-300 rounded-full"
              style={{ width: `${displayPercentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#1C1B18]/60 pt-1">
            <span className="font-number">
              {activeProcessed} / {activeTotal} customers processed
            </span>
            <span className="font-number">
              Concurrency: 4 workers (Realtime Background Sync)
            </span>
          </div>
        </div>

        {/* Breakdown Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#1C1B18]/8">
          <div className="p-3 rounded-lg bg-[#FCFBF0] border border-[#1C1B18]/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span className="text-xs font-medium text-[#1C1B18]">Successful</span>
            </div>
            <span className="font-number font-bold text-sm text-[#1C1B18]">
              {activeSuccessful}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#FCFBF0] border border-[#1C1B18]/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-[#FF7800]" />
              <span className="text-xs font-medium text-[#1C1B18]">Needs Review</span>
            </div>
            <span className="font-number font-bold text-sm text-[#FF7800]">
              {activeNeedsReview}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#FCFBF0] border border-[#1C1B18]/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XCircle size={16} className="text-rose-600" />
              <span className="text-xs font-medium text-[#1C1B18]">Scan Failed</span>
            </div>
            <span className="font-number font-bold text-sm text-rose-600">
              {activeFailed}
            </span>
          </div>
        </div>
      </div>

      {/* History of Scan Jobs */}
      <div className="bg-white rounded-xl border border-[#1C1B18]/10 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#1C1B18]/10 bg-[#FCFBF0]/60 flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1B18]/80">
            Recent Scan Jobs Log
          </h4>
          <span className="text-[11px] text-[#1C1B18]/50">
            Automated Recheck: Every 7 days
          </span>
        </div>

        <div className="divide-y divide-[#1C1B18]/8 text-xs">
          {recentJobs.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#1C1B18]/50">
              No previous scan jobs logged.
            </div>
          ) : (
            recentJobs.map((j) => (
              <div key={j.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FCFBF0]/40 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-[#1C1B18]">
                      Scan Type: {j.type}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        j.status === "COMPLETED"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : j.status === "RUNNING"
                          ? "bg-amber-50 text-amber-800 border border-amber-200 animate-pulse"
                          : "bg-rose-50 text-rose-800 border border-rose-200"
                      }`}
                    >
                      {j.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#1C1B18]/50 font-number flex items-center gap-2">
                    <Clock size={12} />
                    <span suppressHydrationWarning>
                      {formatDateSafely(j.started_at)}
                    </span>
                    <span>•</span>
                    <span>Initiated by: {j.created_by}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-number">
                  <div>
                    <span className="text-[#1C1B18]/50 block text-[10px]">TOTAL</span>
                    <span className="font-semibold text-[#1C1B18]">{j.total}</span>
                  </div>
                  <div>
                    <span className="text-emerald-700 block text-[10px]">SUCCESS</span>
                    <span className="font-semibold text-emerald-700">{j.successful}</span>
                  </div>
                  <div>
                    <span className="text-[#FF7800] block text-[10px]">REVIEW</span>
                    <span className="font-semibold text-[#FF7800]">{j.needs_review}</span>
                  </div>
                  <div>
                    <span className="text-rose-600 block text-[10px]">FAILED</span>
                    <span className="font-semibold text-rose-600">{j.failed}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
