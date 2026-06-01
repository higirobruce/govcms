import * as React from "react";
import { cn } from "../lib/cn";

const AV_COLORS = [
  "#0E72B8",
  "#1E9E57",
  "#D99100",
  "#7A5AC9",
  "#C2547A",
  "#0E8F8F",
  "#C26A2B",
];

function pickColor(s: string): string {
  let n = 0;
  for (let i = 0; i < s.length; i++) n = (n + s.charCodeAt(i)) % AV_COLORS.length;
  return AV_COLORS[n];
}

export interface AvatarProps {
  name?: string;
  src?: string;
  size?: number;
  color?: string;
  className?: string;
}

export function Avatar({
  name = "",
  src,
  size = 30,
  color,
  className,
}: AvatarProps) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  return (
    <span
      className={cn("avatar", className)}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.4),
        background: src ? "transparent" : color ?? pickColor(name),
      }}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        initials
      )}
    </span>
  );
}
