import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

interface OpportunityCardProps {
  title: string;
  count: number;
  description: string;
  tag: string;
  href: string;
  accent?: "orange" | "blue";
}

export default function OpportunityCard({
  title,
  count,
  description,
  tag,
  href,
  accent = "orange",
}: OpportunityCardProps) {
  const isOrange = accent === "orange";

  return (
    <div className={`bg-white rounded-xl p-6 border shadow-xs flex flex-col justify-between ${
      isOrange ? "border-[#FF7800]/30 hover:border-[#FF7800]/50" : "border-[#1A75FF]/30 hover:border-[#1A75FF]/50"
    } transition-colors`}>
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#1C1B18]/60">
            {title}
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
            isOrange ? "bg-[#FF7800]/15 text-[#c25900] border border-[#FF7800]/25" : "bg-[#1A75FF]/15 text-[#004dc7] border border-[#1A75FF]/25"
          }`}>
            {tag}
          </span>
        </div>

        <div className="my-2">
          <span className={`text-4xl font-number font-bold tracking-tight ${isOrange ? "text-[#FF7800]" : "text-[#1A75FF]"}`}>
            {count.toLocaleString("en-US")}
          </span>
        </div>

        <p className="text-xs text-[#1C1B18]/65 leading-relaxed font-medium mt-1">
          {description}
        </p>
      </div>

      <div className="pt-5 mt-3 border-t border-[#1C1B18]/8">
        <Link
          href={href}
          className={`inline-flex items-center justify-between w-full px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
            isOrange 
              ? "bg-[#FF7800] text-white hover:bg-[#e66c00]"
              : "bg-[#002236] text-white hover:bg-[#00314d]"
          }`}
        >
          <span>View Lead Targets</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
