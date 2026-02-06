import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SGFSelectOption {
  value: string;
  label: string;
  icon?: React.ElementType;
}

export interface SGFSelectProps {
  label?: string;
  error?: string;
  hint?: string;
  options: SGFSelectOption[];
  fullWidth?: boolean;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
  name?: string;
  id?: string;
}

export const SGFSelect = React.forwardRef<HTMLDivElement, SGFSelectProps>(
  (
    {
      label,
      error,
      hint,
      options,
      fullWidth = false,
      value: controlledValue,
      defaultValue,
      placeholder = 'Selecione...',
      onChange,
      className = '',
      id,
      disabled,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [internalValue, setInternalValue] = useState(defaultValue || '');
    const containerRef = useRef<HTMLDivElement>(null);
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    const currentValue = controlledValue !== undefined ? controlledValue : internalValue;
    const selectedOption = options.find((opt) => opt.value === currentValue);

    // Close on click outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue: string) => {
      if (disabled) return;
      setInternalValue(optionValue);
      onChange?.(optionValue);
      setIsOpen(false);
    };

    return (
      <div
        ref={containerRef}
        className={cn('flex flex-col relative', fullWidth && 'w-full', className)}
      >
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-semibold text-[var(--sgf-text-primary)] mb-2"
          >
            {label}
          </label>
        )}

        <div
          ref={ref}
          id={selectId}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            'group relative flex w-full items-center justify-between px-4 py-2.5 text-sm bg-white border rounded-xl transition-all duration-300 outline-none cursor-pointer',
            'hover:border-emerald-500/50 hover:bg-slate-50/50',
            isOpen ? 'ring-4 ring-emerald-500/10 border-[var(--sgf-primary)] bg-white' : 'border-slate-200 shadow-sm shadow-slate-100/50',
            disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : '',
            error && 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
          )}
        >
          <span className={cn('flex items-center gap-2 truncate pr-2', selectedOption ? 'text-slate-900 font-medium' : 'text-slate-400')}>
            {selectedOption?.icon && <selectedOption.icon className="h-4 w-4 shrink-0 text-slate-400" />}
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            size={16}
            className={cn(
              "text-slate-400 transition-transform duration-300 shrink-0",
              isOpen && 'transform rotate-180 text-emerald-600'
            )}
          />
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 z-[100] bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="max-h-64 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {options.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    'relative flex w-full cursor-pointer select-none items-center rounded-xl py-2.5 px-3 text-sm outline-none transition-all duration-200',
                    'hover:bg-emerald-50 hover:text-emerald-900',
                    currentValue === option.value
                      ? 'bg-emerald-50/80 text-emerald-700 font-bold'
                      : 'text-slate-600 font-medium'
                  )}
                >
                  <span className="flex-1 flex items-center gap-3 truncate">
                    {option.icon && (
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                        currentValue === option.value ? "bg-emerald-100 text-emerald-600" : "bg-slate-50 text-slate-400"
                      )}>
                        <option.icon className="h-4 w-4" />
                      </div>
                    )}
                    {option.label}
                  </span>
                  {currentValue === option.value && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 shadow-sm animate-in zoom-in-50 duration-300">
                      <Check className="h-3 w-3 text-white stroke-[3]" />
                    </div>
                  )}
                </div>
              ))}
              {options.length === 0 && (
                <div className="py-8 px-4 text-center">
                  <p className="text-sm font-medium text-slate-400 italic">Nenhuma opção disponível</p>
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <p className="mt-2 text-xs font-medium text-red-600">{error}</p>
        )}

        {!error && hint && <p className="mt-2 text-xs text-slate-500">{hint}</p>}
      </div>
    );
  }
);

SGFSelect.displayName = 'SGFSelect';
