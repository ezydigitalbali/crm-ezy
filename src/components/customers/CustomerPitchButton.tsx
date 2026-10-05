"use client";

import React, { useState } from "react";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import WhatsAppPitchModal, { PitchCustomerData } from "@/components/common/WhatsAppPitchModal";
import { MessageSquareText } from "lucide-react";

export default function CustomerPitchButton({
  customer,
  variant = "primary",
}: {
  customer: PitchCustomerData;
  variant?: "primary" | "secondary" | "pill";
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {variant === "primary" ? (
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#25D366] text-white text-xs font-bold hover:bg-[#20ba59] transition-all shadow-xs cursor-pointer active:scale-95"
        >
          <WhatsAppIcon size={16} />
          <span>Chat WhatsApp & Pitching</span>
        </button>
      ) : variant === "secondary" ? (
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-[#25D366]/40 text-[#0f8b3c] hover:bg-[#25D366]/10 text-xs font-bold transition-all shadow-2xs cursor-pointer"
        >
          <WhatsAppIcon size={15} />
          <span>Buka Template WA</span>
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#25D366]/15 hover:bg-[#25D366] text-[#0f8b3c] hover:text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
        >
          <WhatsAppIcon size={13} />
          <span>Kirim WA</span>
        </button>
      )}

      <WhatsAppPitchModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        customer={customer}
      />
    </>
  );
}
