import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface MatrixData {
  webActive_igActive: number;
  webActive_igInactive: number;
  webActive_igNotFound: number;
  webMissing_igActive: number; // High Website Opportunity!
  webMissing_igInactive: number;
  webMissing_igNotFound: number;
}

export default function DigitalPresenceMatrix({ data }: { data: MatrixData }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-[#1C1B18]/10 shadow-xs">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#1C1B18]/80">
            Digital Presence Matrix
          </h3>
          <p className="text-xs text-[#1C1B18]/50 mt-0.5">
            Cross-tabulation of Website availability against Instagram activity
          </p>
        </div>
        <span className="text-[11px] font-semibold text-[#1A75FF] bg-[#1A75FF]/10 px-2 py-0.5 rounded">
          Operational View
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1C1B18]/10">
              <th className="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-[#1C1B18]/45">
                Instagram \ Website
              </th>
              <th className="py-2.5 px-4 text-[12px] font-bold uppercase tracking-wider text-[#1A75FF] text-center bg-[#1A75FF]/5 rounded-t-md">
                Website Active
              </th>
              <th className="py-2.5 px-4 text-[12px] font-bold uppercase tracking-wider text-[#FF7800] text-center bg-[#FF7800]/5 rounded-t-md">
                Website Missing / Not Found
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1C1B18]/8 text-sm">
            {/* Row 1: IG Active */}
            <tr className="hover:bg-[#FCFBF0]/60 transition-colors">
              <td className="py-3 px-3 font-semibold text-xs text-[#1C1B18] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Active (≤30d)</span>
              </td>
              <td className="py-3 px-4 text-center font-number font-semibold text-base text-[#1C1B18]">
                <Link
                  href="/customers?website=ACTIVE&instagram=ACTIVE"
                  className="hover:text-[#1A75FF] hover:underline"
                >
                  {data.webActive_igActive}
                </Link>
              </td>
              <td className="py-3 px-4 text-center bg-[#FF7800]/10 font-number font-bold text-lg text-[#FF7800] border-l-2 border-r-2 border-[#FF7800]/20">
                <Link
                  href="/opportunities"
                  className="inline-flex items-center gap-1.5 hover:underline"
                >
                  <span>{data.webMissing_igActive}</span>
                  <span className="text-[10px] uppercase font-sans font-extrabold px-1.5 py-0.5 rounded bg-[#FF7800] text-white">
                    High Lead
                  </span>
                </Link>
              </td>
            </tr>

            {/* Row 2: IG Inactive / Dormant */}
            <tr className="hover:bg-[#FCFBF0]/60 transition-colors">
              <td className="py-3 px-3 font-semibold text-xs text-[#1C1B18] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-zinc-400"></span>
                <span>Inactive / Dormant (&gt;30d)</span>
              </td>
              <td className="py-3 px-4 text-center font-number font-semibold text-base text-[#1C1B18] bg-[#1A75FF]/5 border-l-2 border-r-2 border-[#1A75FF]/20">
                <Link
                  href="/opportunities?tab=social"
                  className="inline-flex items-center gap-1.5 hover:underline text-[#1A75FF]"
                >
                  <span>{data.webActive_igInactive}</span>
                  <span className="text-[10px] uppercase font-sans font-bold px-1.5 py-0.5 rounded bg-[#1A75FF]/20 text-[#004dc7]">
                    Social Lead
                  </span>
                </Link>
              </td>
              <td className="py-3 px-4 text-center font-number font-semibold text-base text-[#1C1B18]/70">
                <Link
                  href="/customers?website=NOT_FOUND&instagram=INACTIVE"
                  className="hover:underline"
                >
                  {data.webMissing_igInactive}
                </Link>
              </td>
            </tr>

            {/* Row 3: IG Not Found */}
            <tr className="hover:bg-[#FCFBF0]/60 transition-colors">
              <td className="py-3 px-3 font-semibold text-xs text-[#1C1B18]/60 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-zinc-300"></span>
                <span>Not Found</span>
              </td>
              <td className="py-3 px-4 text-center font-number font-semibold text-base text-[#1C1B18]/60">
                <Link
                  href="/customers?website=ACTIVE&instagram=NOT_FOUND"
                  className="hover:underline"
                >
                  {data.webActive_igNotFound}
                </Link>
              </td>
              <td className="py-3 px-4 text-center font-number font-semibold text-base text-[#1C1B18]/60">
                <Link
                  href="/opportunities?tab=presence"
                  className="hover:underline"
                >
                  {data.webMissing_igNotFound}
                </Link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
