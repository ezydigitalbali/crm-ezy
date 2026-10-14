"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function CustomerDetailBackButton() {
  const router = useRouter();

  const handleBack = () => {
    // If the user arrived from another page within the application, use native history back
    if (
      typeof window !== "undefined" &&
      window.history.length > 1 &&
      document.referrer &&
      document.referrer.includes(window.location.host)
    ) {
      router.back();
    } else {
      router.push("/customers");
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1C1B18]/60 hover:text-[#FF7800] transition-colors cursor-pointer group py-1"
      title="Kembali ke halaman sebelumnya"
    >
      <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
      <span>Kembali ke Daftar Customer</span>
    </button>
  );
}
