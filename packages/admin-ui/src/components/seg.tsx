import * as React from "react";
import { cn } from "../lib/cn";

export type SegOption = string | { value: string; label: React.ReactNode };

export interface SegProps {
  options: SegOption[];
  value: string;
  onChange?: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

/** Segmented control — used for the locale switcher (EN / RW / FR). */
export function Seg({ options, value, onChange, className, style }: SegProps) {
  return (
    <div className={cn("seg", className)} style={style}>
      {options.map((o) => {
        const val = typeof o === "string" ? o : o.value;
        const label = typeof o === "string" ? o : o.label;
        return (
          <button
            key={val}
            type="button"
            className={val === value ? "on" : ""}
            onClick={() => onChange?.(val)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
