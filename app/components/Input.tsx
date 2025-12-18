import React from 'react';

interface InputProps {
  type?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  label?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

export default function Input({
  type = 'text',
  placeholder = '',
  icon,
  label,
  value,
  defaultValue,
  onChange,
  required = false,
}: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-zinc-300 text-sm font-medium">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-[1rem] top-1/2 -translate-y-1/2 text-zinc-500">
            {icon}
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          required={required}
          className={`w-full bg-zinc-900/30 border border-zinc-700/50 rounded-lg py-[0.875rem] ${
            icon ? 'pl-[3rem]' : 'pl-[1rem]'
          } pr-[1rem] text-white text-[clamp(0.875rem,1.5vw,1rem)] placeholder:text-zinc-400 focus:outline-none focus:border-yellow-500 transition-colors`}
        />
      </div>
    </div>
  );
}
