"use client";

import React, { useState, useEffect, useRef } from "react";
import { useScreenSize, getResponsiveValues } from "@/app/hooks/useScreenSize";

interface Option {
  value: string;
  label: string;
  subtext?: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  label: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  label,
  required = false,
  placeholder = "Select...",
  disabled = false,
}: SearchableSelectProps) {
  const { width, height } = useScreenSize();
  const responsive = getResponsiveValues(width, height);
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter options based on search term
  const filteredOptions = options.filter((option) => {
    const search = searchTerm.toLowerCase();
    return (
      option.label.toLowerCase().includes(search) ||
      (option.subtext && option.subtext.toLowerCase().includes(search))
    );
  });

  // Get selected option label
  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  const toggleDropdown = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  return (
    <div className="flex flex-col gap-2 relative" ref={containerRef}>
      <label className="text-zinc-300 text-sm font-medium">
        {label} {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      
      {/* Trigger Button */}
      <div
        onClick={toggleDropdown}
        className={`
          w-full bg-zinc-800 border border-zinc-700 rounded-lg py-[0.875rem] px-[1rem] 
          text-white text-[clamp(0.875rem,1.5vw,1rem)] 
          flex items-center justify-between cursor-pointer transition-all
          ${isOpen ? "ring-2 ring-yellow-400/20 border-yellow-400" : ""}
          ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-zinc-750"}
        `}
      >
        <div className="truncate text-white">
          {selectedOption ? selectedOption.label : <span className="text-zinc-400">{placeholder}</span>}
        </div>
        <svg 
          className={`w-5 h-5 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-[calc(100%+0.5rem)] left-0 w-full bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-50 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-zinc-700 sticky top-0 bg-zinc-800">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`
                    px-4 py-3 cursor-pointer transition-colors flex flex-col justify-center
                    ${value === option.value ? "bg-yellow-400/10 text-yellow-400" : "text-white hover:bg-zinc-700"}
                  `}
                >
                  <div className="font-medium">{option.label}</div>
                  {option.subtext && (
                    <div className="text-xs text-zinc-500 mt-0.5">{option.subtext}</div>
                  )}
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-zinc-500 text-center text-sm">
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
