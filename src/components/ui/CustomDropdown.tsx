"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
}

interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  prefix?: string;
  className?: string;
  buttonClassName?: string;
  menuWidth?: string;
  size?: "sm" | "md";
  direction?: "down" | "up";
  align?: "left" | "right";
}

export default function CustomDropdown({
  value,
  onChange,
  options,
  placeholder = "Pilih...",
  prefix = "",
  className = "",
  buttonClassName = "",
  menuWidth = "w-full min-w-[180px]",
  size = "md",
  direction = "down",
  align = "left",
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const isSmall = size === "sm";

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center justify-between gap-2 rounded-lg border transition-all cursor-pointer font-medium select-none ${
          isSmall ? "h-8 px-2.5 text-[11px]" : "h-9 px-3 text-xs"
        } ${
          isOpen
            ? "border-[#FF7800] ring-2 ring-[#FF7800]/20 bg-white text-[#002236]"
            : "border-[#1C1B18]/15 bg-white text-[#1C1B18] hover:border-[#1C1B18]/30 hover:bg-[#FCFBF0]/60 shadow-2xs"
        } ${buttonClassName}`}
      >
        <span className="truncate flex items-center gap-1.5">
          {prefix && <span className="text-[#1C1B18]/50 font-normal">{prefix}:</span>}
          {selectedOption?.icon}
          <span className="font-semibold text-[#002236]">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-[#FF7800]/15 text-[#FF7800] font-bold font-number">
              {selectedOption.badge}
            </span>
          )}
        </span>
        <ChevronDown
          size={isSmall ? 12 : 13}
          className={`shrink-0 text-[#1C1B18]/40 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#FF7800]" : ""
          }`}
        />
      </button>

      {/* Dropdown Popup Menu */}
      {isOpen && (
        <div
          className={`absolute ${align === "right" ? "right-0" : "left-0"} ${
            direction === "up" ? "bottom-full mb-1.5" : "top-full mt-1.5"
          } ${menuWidth} z-50 rounded-xl bg-white border border-[#1C1B18]/12 shadow-xl py-1 animate-in fade-in zoom-in-95 duration-100 max-h-64 overflow-y-auto`}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`w-full px-3 py-2 text-left flex items-center justify-between gap-2 text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-[#FF7800]/10 text-[#c25900] font-bold"
                    : "text-[#1C1B18] hover:bg-[#FCFBF0] hover:text-[#002236]"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {opt.icon}
                  <span className="truncate">{opt.label}</span>
                  {opt.badge && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-[#1C1B18]/10 text-[#1C1B18] font-bold font-number">
                      {opt.badge}
                    </span>
                  )}
                </div>
                {isSelected && <Check size={14} className="text-[#FF7800] shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
