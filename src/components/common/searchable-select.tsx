"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";

import { cn } from "@/lib/utils";

export type SearchableOption = {
  value: string;
  label: string;
  /** Optional extra text included in the search match (not displayed). */
  keywords?: string;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: SearchableOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  /** Accessible name for the trigger button. */
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
  emptyText?: string;
};

/**
 * Lightweight searchable single-select (combobox). Keyboard: type to filter,
 * ↑/↓ to move, Enter to pick, Esc to close. Closes on outside click.
 * Built on plain elements (no native <select>) so the option list can be typed
 * into — the design system has no shadcn `command`/combobox primitive.
 */
export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  ariaLabel,
  className,
  disabled,
  emptyText = "No matches",
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const selected = options.find((option) => option.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(q) ||
        option.value.toLowerCase().includes(q) ||
        (option.keywords?.toLowerCase().includes(q) ?? false),
    );
  }, [options, query]);

  // Clamp during render so we never need an effect to fix a stale index.
  const activeSafe = Math.min(activeIndex, Math.max(0, filtered.length - 1));

  // Focus-only effect (no state writes) — move the cursor into the search box.
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [open]);

  // Close on outside pointer-down.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function toggle() {
    setOpen((isOpen) => {
      const next = !isOpen;
      if (next) {
        setQuery("");
        setActiveIndex(0);
      }
      return next;
    });
  }

  function commit(option: SearchableOption) {
    onChange(option.value);
    setOpen(false);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex(Math.min(activeSafe + 1, filtered.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(Math.max(activeSafe - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const option = filtered[activeSafe];
      if (option) commit(option);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={toggle}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-border bg-white px-3 text-left text-sm text-ink-900 transition-colors hover:border-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 disabled:cursor-not-allowed disabled:opacity-60",
          open && "border-brand-400 ring-2 ring-brand-400",
        )}
      >
        <span className={cn("truncate", !selected && "text-ink-400")}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronsUpDown
          aria-hidden="true"
          className="size-4 shrink-0 text-ink-400"
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full min-w-56 overflow-hidden rounded-xl border border-border bg-white shadow-(--shadow-pop)">
          <div className="flex items-center gap-2 border-b border-border/70 px-3">
            <Search
              aria-hidden="true"
              className="size-3.5 shrink-0 text-ink-400"
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={onKeyDown}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              aria-controls={listId}
              className="h-10 w-full border-0 bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400"
            />
          </div>

          <ul
            id={listId}
            role="listbox"
            className="max-h-64 overflow-y-auto p-1"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-6 text-center text-xs text-ink-400">
                {emptyText}
              </li>
            ) : (
              filtered.map((option, index) => {
                const isSelected = option.value === value;
                const isActive = index === activeSafe;
                return (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <button
                      type="button"
                      onClick={() => commit(option)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                        isActive
                          ? "bg-brand-50 text-brand-800"
                          : "text-ink-700",
                        isSelected && "font-semibold",
                      )}
                    >
                      <span className="truncate">{option.label}</span>
                      {isSelected && (
                        <Check
                          aria-hidden="true"
                          className="size-4 shrink-0 text-brand-600"
                        />
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
