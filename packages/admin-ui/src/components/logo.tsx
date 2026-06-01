import * as React from "react";

export interface LogoMarkProps {
  size?: number;
  radius?: number;
}

/** Stacked-layers mark: gradient tile, sun-yellow top layer over descending
 *  white chevrons. Reads as structured content + nation. */
export function LogoMark({ size = 30, radius }: LogoMarkProps) {
  const r = radius != null ? radius : Math.round(size * 0.27);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      style={{ display: "block", flex: "none" }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="gcm" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--accent-2, #2B96D8)" />
          <stop offset="1" stopColor="var(--accent, #0E72B8)" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx={r} fill="url(#gcm)" />
      <path d="M20 8.5 30.5 14 20 19.5 9.5 14 20 8.5Z" fill="#F7C948" />
      <path
        d="M9.5 19 20 24.5 30.5 19"
        fill="none"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity="0.95"
      />
      <path
        d="M9.5 24 20 29.5 30.5 24"
        fill="none"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}

export interface LogoProps {
  size?: number;
  showWord?: boolean;
}

/** Full brand lockup: mark + "govcms" wordmark (serif, "cms" in accent). */
export function Logo({ size = 30, showWord = true }: LogoProps) {
  return (
    <div className="brand" style={{ padding: 0 }}>
      <LogoMark size={size} />
      {showWord && (
        <span className="wm">
          gov<b>cms</b>
        </span>
      )}
    </div>
  );
}
