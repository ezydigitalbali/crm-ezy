"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, AlertTriangle, Clock, ArrowRight, RefreshCw, X, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import WhatsAppPitchModal, { PitchCustomerData } from "@/components/common/WhatsAppPitchModal";

interface ReminderItem {
  id: string;
  business_name: string;
  contact_name: string | null;
  phone: string | null;
  sister_company: string | null;
  assigned_to_id: string | null;
  assigned_to_name: string | null;
  lead_status: string;
  last_contacted_at: string | null;
  days_remaining: number;
  days_since_contact: number;
  status: "CRITICAL" | "WARNING" | "NOTICE";
}

export default function NotificationBell() {
  const [items, setItems] = useState<ReminderItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pitchCustomer, setPitchCustomer] = useState<PitchCustomerData | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/crm/reminders");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (e) {
      console.error("Failed to fetch reminders", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
    // Refresh setiap 2 menit
    const interval = setInterval(fetchReminders, 120000);
    return () => clearInterval(interval);
  }, []);

  // Tutup popup jika klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const criticalCount = items.filter((i) => i.status === "CRITICAL").length;
  const totalCount = items.length;

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          title={totalCount > 0 ? `${totalCount} prospek perlu di-follow up` : "Notifikasi & Pengingat"}
          className={`relative p-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center ${
            totalCount > 0
              ? criticalCount > 0
                ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
                : "bg-amber-50 text-amber-600 hover:bg-amber-100"
              : "text-[#1C1B18]/60 hover:bg-[#1C1B18]/5 hover:text-[#1C1B18]"
          }`}
        >
          <Bell size={18} className={totalCount > 0 ? "animate-wiggle" : ""} />
          
          {totalCount > 0 && (
            <span
              className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold font-number flex items-center justify-center text-white ring-2 ring-white ${
                criticalCount > 0 ? "bg-rose-600 animate-pulse" : "bg-[#FF7800]"
              }`}
            >
              {totalCount > 99 ? "99+" : totalCount}
            </span>
          )}
        </button>

        {/* Dropdown Popup Panel */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-[#1C1B18]/10 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Header */}
            <div className="p-3.5 border-b border-[#1C1B18]/8 bg-[#FCFBF0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white ${
                  criticalCount > 0 ? "bg-rose-600" : "bg-[#FF7800]"
                }`}>
                  <Bell size={14} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#002236]">
                    Pengingat Follow Up Pipeline
                  </h4>
                  <p className="text-[10px] text-[#1C1B18]/60">
                    {totalCount > 0 
                      ? `${totalCount} prospek mendekati batas kadaluarsa 7 hari` 
                      : "Semua prospek aman & aktif"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={fetchReminders}
                  disabled={loading}
                  title="Segarkan data"
                  className="p-1 rounded hover:bg-[#1C1B18]/5 text-[#1C1B18]/50 hover:text-[#1C1B18] transition-colors"
                >
                  <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded hover:bg-[#1C1B18]/5 text-[#1C1B18]/50 hover:text-[#1C1B18] transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-[#1C1B18]/5">
              {items.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#1C1B18]/50">
                  <Clock size={28} className="mx-auto mb-2 text-emerald-500 stroke-[1.5]" />
                  <p className="font-semibold text-[#002236]">Tidak ada prospek yang mau expired</p>
                  <p className="text-[11px] mt-0.5 text-[#1C1B18]/45">
                    Semua data follow up masih aktif dalam rentang &lt; 3 hari kontak terakhir.
                  </p>
                </div>
              ) : (
                items.map((item) => {
                  const isCritical = item.status === "CRITICAL";
                  return (
                    <div
                      key={item.id}
                      className={`p-3 transition-colors hover:bg-slate-50 flex flex-col gap-2 ${
                        isCritical ? "bg-rose-50/40" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link
                            href={`/customers/${item.id}`}
                            onClick={() => setIsOpen(false)}
                            className="font-bold text-xs text-[#002236] hover:text-[#FF7800] truncate block"
                          >
                            {item.business_name}
                          </Link>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#1C1B18]/60">
                            {item.contact_name && <span>PIC: {item.contact_name}</span>}
                            {item.assigned_to_name && (
                              <span className="font-medium text-[#FF7800]">
                                ({item.assigned_to_name})
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Sisa Hari Badge */}
                        <div className="shrink-0 text-right">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-number border ${
                              isCritical
                                ? "bg-rose-100 text-rose-700 border-rose-300"
                                : item.status === "WARNING"
                                ? "bg-amber-100 text-amber-800 border-amber-300"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >
                            <AlertTriangle size={10} />
                            <span>
                              {item.days_remaining === 0
                                ? "Expired Hari Ini!"
                                : `Sisa ${item.days_remaining} Hari`}
                            </span>
                          </span>
                          <span className="block text-[9px] text-[#1C1B18]/40 mt-0.5">
                            {item.days_since_contact} hari tanpa respon
                          </span>
                        </div>
                      </div>

                      {/* Action cepat: Follow up via WA langsung */}
                      <div className="flex items-center justify-between pt-1 border-t border-[#1C1B18]/5 text-[10px]">
                        <span className="text-[#1C1B18]/50 italic">
                          Akan otomatis FAILED jika 7 hari
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          {item.phone && (
                            <button
                              onClick={() => {
                                setPitchCustomer({
                                  id: item.id,
                                  business_name: item.business_name,
                                  contact_name: item.contact_name,
                                  phone: item.phone,
                                  business_category: null,
                                  sister_company: item.sister_company,
                                });
                              }}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                            >
                              <MessageSquare size={10} />
                              <span>WA Sekarang</span>
                            </button>
                          )}
                          <Link
                            href={`/customers/${item.id}`}
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center gap-0.5 text-[#002236] hover:text-[#FF7800] font-semibold"
                          >
                            <span>Buka</span>
                            <ArrowRight size={10} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-2.5 bg-[#FCFBF0] border-t border-[#1C1B18]/8 text-center">
                <Link
                  href="/pipeline?status=FOLLOW_UP"
                  onClick={() => setIsOpen(false)}
                  className="text-xs font-bold text-[#FF7800] hover:text-[#e66c00] flex items-center justify-center gap-1"
                >
                  <span>Lihat Semua Prospek Follow Up</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* WhatsApp Modal Trigger */}
      {pitchCustomer && (
        <WhatsAppPitchModal
          isOpen={true}
          onClose={() => {
            setPitchCustomer(null);
            fetchReminders();
            router.refresh();
          }}
          customer={pitchCustomer}
        />
      )}
    </>
  );
}

