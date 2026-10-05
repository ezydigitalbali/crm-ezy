"use client";

import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export default function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  className = "",
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startItem = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endItem = Math.min(safeCurrentPage * pageSize, totalItems);

  // Generate page numbers to display with smart sliding window
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (safeCurrentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (safeCurrentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  if (totalItems === 0) return null;

  return (
    <div
      className={`flex flex-col md:flex-row items-center justify-between gap-3 py-3 px-4 bg-white border border-[#1C1B18]/10 rounded-xl shadow-2xs ${className}`}
    >
      {/* Left: Info counter & Segmented Per-Page Pills */}
      <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 w-full md:w-auto text-xs text-[#1C1B18]/60">
        <span className="whitespace-nowrap">
          Menampilkan <strong className="text-[#002236] font-number">{startItem}</strong>–
          <strong className="text-[#002236] font-number">{endItem}</strong> dari{" "}
          <strong className="text-[#002236] font-number">{totalItems}</strong> data
        </span>

        {/* Clean Segmented Control: 1-Click, No Dropdown Clipping */}
        <div className="inline-flex items-center gap-1.5 bg-[#FCFBF0] pl-2.5 pr-1 py-1 rounded-lg border border-[#1C1B18]/12">
          <span className="text-[11px] font-semibold text-[#1C1B18]/50 whitespace-nowrap">
            Per halaman:
          </span>
          <div className="inline-flex rounded-md bg-white border border-[#1C1B18]/12 p-0.5 shadow-2xs">
            {pageSizeOptions.map((sz) => {
              const isSelected = sz === pageSize;
              return (
                <button
                  key={sz}
                  type="button"
                  onClick={() => {
                    onPageSizeChange(sz);
                    onPageChange(1);
                  }}
                  className={`px-2 py-0.5 text-[11px] font-bold font-number rounded transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#002236] text-white shadow-2xs"
                      : "text-[#1C1B18]/60 hover:text-[#002236] hover:bg-[#FCFBF0]"
                  }`}
                  title={`Tampilkan ${sz} data per halaman`}
                >
                  {sz}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right: Page Navigation (Mobile Compact & Desktop Full Numbers) */}
      <div className="flex items-center justify-center gap-1 w-full md:w-auto select-none">
        {/* Mobile View: Simple Prev / Page Info / Next */}
        <div className="flex sm:hidden items-center gap-1.5">
          <button
            type="button"
            onClick={() => onPageChange(safeCurrentPage - 1)}
            disabled={safeCurrentPage === 1}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#1C1B18]/12 bg-white text-[#1C1B18] text-xs font-semibold hover:bg-[#FCFBF0] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={13} />
            <span>Prev</span>
          </button>

          <span className="px-3 py-1 text-xs font-bold text-[#002236] font-number bg-[#FCFBF0] rounded-lg border border-[#1C1B18]/10">
            Hal {safeCurrentPage} / {totalPages}
          </span>

          <button
            type="button"
            onClick={() => onPageChange(safeCurrentPage + 1)}
            disabled={safeCurrentPage === totalPages}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#1C1B18]/12 bg-white text-[#1C1B18] text-xs font-semibold hover:bg-[#FCFBF0] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <span>Next</span>
            <ChevronRight size={13} />
          </button>
        </div>

        {/* Tablet & Desktop View: Full Numbered Buttons */}
        <div className="hidden sm:flex items-center gap-1">
          {/* First Button */}
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={safeCurrentPage === 1}
            className="p-1.5 rounded-lg border border-[#1C1B18]/12 bg-white text-[#1C1B18]/70 hover:bg-[#FCFBF0] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Halaman Pertama"
          >
            <ChevronsLeft size={14} />
          </button>

          {/* Prev Button */}
          <button
            type="button"
            onClick={() => onPageChange(safeCurrentPage - 1)}
            disabled={safeCurrentPage === 1}
            className="p-1.5 rounded-lg border border-[#1C1B18]/12 bg-white text-[#1C1B18]/70 hover:bg-[#FCFBF0] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Halaman Sebelumnya"
          >
            <ChevronLeft size={14} />
          </button>

          {/* Number Buttons */}
          <div className="flex items-center gap-1 px-0.5">
            {getPageNumbers().map((pg, idx) => {
              if (pg === "...") {
                return (
                  <span key={`dots-${idx}`} className="px-1.5 text-xs text-[#1C1B18]/40">
                    ...
                  </span>
                );
              }
              const isCurrent = pg === safeCurrentPage;
              return (
                <button
                  key={`page-${pg}`}
                  type="button"
                  onClick={() => onPageChange(Number(pg))}
                  className={`w-8 h-8 rounded-lg text-xs font-bold font-number transition-all cursor-pointer ${
                    isCurrent
                      ? "bg-[#FF7800] text-white shadow-xs"
                      : "bg-white border border-[#1C1B18]/12 text-[#1C1B18]/70 hover:bg-[#FCFBF0] hover:text-[#002236]"
                  }`}
                >
                  {pg}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <button
            type="button"
            onClick={() => onPageChange(safeCurrentPage + 1)}
            disabled={safeCurrentPage === totalPages}
            className="p-1.5 rounded-lg border border-[#1C1B18]/12 bg-white text-[#1C1B18]/70 hover:bg-[#FCFBF0] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Halaman Berikutnya"
          >
            <ChevronRight size={14} />
          </button>

          {/* Last Button */}
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={safeCurrentPage === totalPages}
            className="p-1.5 rounded-lg border border-[#1C1B18]/12 bg-white text-[#1C1B18]/70 hover:bg-[#FCFBF0] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Halaman Terakhir"
          >
            <ChevronsRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
