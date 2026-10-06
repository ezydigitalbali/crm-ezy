"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, AlertCircle, Shield, Loader2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";

export default function LoginPage() {
  const router = useRouter();
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.error || "Email atau kata sandi tidak sesuai";
        setError(errorMsg);
        showErrorToast(errorMsg, "Login Gagal");
        setLoading(false);
        return;
      }

      showSuccessToast(
        `Selamat datang kembali, ${data.user?.name || "Tim EZY"}! Mengalihkan ke dashboard...`,
        "Login Berhasil"
      );

      // Sinkronkan cookie sesi dan redirect mulus
      router.push("/dashboard");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 350);
    } catch (err: any) {
      const errorMsg = err?.message || "Terjadi kendala koneksi ke server";
      setError(errorMsg);
      showErrorToast(errorMsg, "Gagal Masuk");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFBF0] flex flex-col justify-center items-center p-4">
      {/* Brand Header */}
      <div className="w-full max-w-sm mb-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#002236] p-2.5 shadow-sm border border-white/10 mb-4">
          <Image
            src="/logo.png"
            alt="EZY Digital Logo"
            width={48}
            height={48}
            className="object-contain"
            priority
          />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1C1B18]">
          EZY Digital Tracker
        </h1>
        <p className="text-xs text-[#1C1B18]/60 mt-1 font-medium">
          Internal Customer Digital Presence Intelligence
        </p>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl p-7 border border-[#1C1B18]/10 shadow-xs space-y-6">
        <div className="border-b border-[#1C1B18]/8 pb-4">
          <h2 className="text-base font-bold text-[#1C1B18]">
            Sign In to Intelligence Portal
          </h2>
          <p className="text-xs text-[#1C1B18]/50 mt-0.5">
            Enter your EZY Digital company credentials.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#1C1B18] mb-1.5">
              Work Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#1C1B18]/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@ezydigitalbali.com"
                className="w-full h-10 pl-9 pr-3 text-xs bg-white border border-[#1C1B18]/15 rounded-lg focus:outline-none focus:border-[#FF7800] focus:ring-1 focus:ring-[#FF7800]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#1C1B18] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#1C1B18]/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-10 pl-9 pr-3 text-xs bg-white border border-[#1C1B18]/15 rounded-lg focus:outline-none focus:border-[#FF7800] focus:ring-1 focus:ring-[#FF7800]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 mt-3 inline-flex items-center justify-center gap-2 rounded-lg bg-[#FF7800] text-white text-xs font-bold hover:bg-[#e66c00] transition-colors shadow-xs disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin text-white" />
                <span>Memverifikasi akun...</span>
              </>
            ) : (
              <>
                <span>Masuk ke Dashboard</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>
      </div>

      <div className="mt-8 text-[11px] text-[#1C1B18]/45 flex items-center gap-1.5">
        <Shield size={12} className="text-[#1C1B18]/40" />
        <span>EZY Digital Bali • Authorized Internal Access Only</span>
      </div>
    </div>
  );
}
