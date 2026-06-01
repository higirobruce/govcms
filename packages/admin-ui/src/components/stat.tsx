import * as React from "react";
import { cn } from "../lib/cn";

export interface StatProps extends React.HTMLAttributes<HTMLDivElement> {
  num: React.ReactNode;
  label: React.ReactNode;
  /** Color of the left accent line — pass a CSS color or var(). */
  accent?: string;
}

export function Stat({ num, label, accent, className, ...props }: StatProps) {
  return (
    <div className={cn("stat", className)} {...props}>
      {accent && (
        <span className="accent-line" style={{ background: accent }} />
      )}
      <div className="num serif">{num}</div>
      <div className="lbl">{label}</div>
    </div>
  );
}
