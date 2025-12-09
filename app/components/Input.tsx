import React from 'react';

interface InputProps {
  type: string;
  placeholder: string;
  icon: React.ReactNode;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Input({ type, placeholder, icon, value, onChange }: InputProps) {
  return (
    <div className="relative">
      <div className="absolute left-[1rem] top-1/2 -translate-y-1/2 text-zinc-500">
        {icon}
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full bg-zinc-900/30 border border-zinc-700/50 rounded-lg py-[0.875rem] pl-[3rem] pr-[1rem] text-white text-[clamp(0.875rem,1.5vw,1rem)] placeholder:text-zinc-400 focus:outline-none focus:border-yellow-500 transition-colors"
      />
    </div>
  );
}
