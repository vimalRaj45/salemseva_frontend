import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * Accessible Custom Dropdown Select Component
 * Replaces standard select elements in compliance with design system guidelines.
 * Features full ARIA listbox semantics, keyboard navigation, and eight interactive states.
 */
export default function AdminCustomSelect({
  id,
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select option...',
  disabled = false,
  error = false,
  className = '',
  buttonClassName = '',
  dropdownClassName = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const listboxRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value) || null;

  // Handle outside click to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Sync focused index when opening
  useEffect(() => {
    if (isOpen) {
      const idx = options.findIndex(opt => opt.value === value);
      setFocusedIndex(idx >= 0 ? idx : 0);
    }
  }, [isOpen, options, value]);

  const handleKeyDown = (e) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen && focusedIndex >= 0 && focusedIndex < options.length) {
          onChange(options[focusedIndex].value);
          setIsOpen(false);
          buttonRef.current?.focus();
        } else {
          setIsOpen(true);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedIndex(prev => (prev < options.length - 1 ? prev + 1 : 0));
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedIndex(prev => (prev > 0 ? prev - 1 : options.length - 1));
        }
        break;
      case 'Home':
        if (isOpen) {
          e.preventDefault();
          setFocusedIndex(0);
        }
        break;
      case 'End':
        if (isOpen) {
          e.preventDefault();
          setFocusedIndex(options.length - 1);
        }
        break;
      case 'Escape':
        if (isOpen) {
          e.preventDefault();
          setIsOpen(false);
          buttonRef.current?.focus();
        }
        break;
      case 'Tab':
        if (isOpen) {
          setIsOpen(false);
        }
        break;
      default:
        // Simple typeahead support
        if (isOpen && e.key.length === 1) {
          const char = e.key.toLowerCase();
          const matchIdx = options.findIndex(opt => opt.label.toLowerCase().startsWith(char));
          if (matchIdx >= 0) {
            setFocusedIndex(matchIdx);
          }
        }
        break;
    }
  };

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`} id={id}>
      {label && (
        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
          {label}
        </label>
      )}

      {/* Button Trigger with all 8 states */}
      <button
        ref={buttonRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`${id || 'custom-select'}-listbox`}
        aria-label={label || placeholder}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(prev => !prev)}
        onKeyDown={handleKeyDown}
        className={`
          flex items-center justify-between gap-2 px-3 py-1.5 
          bg-white text-xs font-medium rounded-lg 
          border transition-all duration-150 select-none
          ${error 
            ? 'border-red-500 text-red-900 focus:ring-2 focus:ring-red-200' 
            : 'border-slate-300 text-slate-700 hover:border-slate-400 focus:border-[#123B32] focus:ring-2 focus:ring-[#123B32]/10'
          }
          ${disabled 
            ? 'opacity-50 cursor-not-allowed bg-slate-50 text-slate-400' 
            : 'cursor-pointer active:scale-[0.98]'
          }
          ${isOpen ? 'border-[#123B32] ring-2 ring-[#123B32]/10' : ''}
          ${buttonClassName}
        `}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-150 ${isOpen ? 'rotate-180 text-[#123B32]' : ''}`} 
          aria-hidden="true" 
        />
      </button>

      {/* Popover Listbox */}
      {isOpen && (
        <ul
          ref={listboxRef}
          id={`${id || 'custom-select'}-listbox`}
          role="listbox"
          tabIndex={-1}
          aria-activedescendant={focusedIndex >= 0 ? `${id || 'opt'}-${focusedIndex}` : undefined}
          className={`
            absolute left-0 mt-1 z-50 w-full min-w-[160px] 
            bg-white border border-slate-200 rounded-xl shadow-lg 
            py-1 max-h-60 overflow-y-auto text-xs text-slate-700
            animate-in fade-in zoom-in-95 duration-100
            ${dropdownClassName}
          `}
        >
          {options.map((opt, idx) => {
            const isSelected = opt.value === value;
            const isFocused = idx === focusedIndex;

            return (
              <li
                key={opt.value}
                id={`${id || 'opt'}-${idx}`}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                  buttonRef.current?.focus();
                }}
                onMouseEnter={() => setFocusedIndex(idx)}
                className={`
                  flex items-center justify-between px-3 py-2 cursor-pointer 
                  transition-colors select-none
                  ${isSelected ? 'bg-[#123B32]/10 text-[#123B32] font-semibold' : 'text-slate-700'}
                  ${isFocused && !isSelected ? 'bg-slate-100 text-slate-900' : ''}
                `}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-[#123B32] shrink-0" aria-hidden="true" />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
