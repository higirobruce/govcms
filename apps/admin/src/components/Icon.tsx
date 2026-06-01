// Minimal line-icon set (24x24, stroke). Just what the admin needs.
const P: Record<string, string> = {
  dashboard: "M4 13h7V4H4v9Zm9 7h7v-9h-7v9ZM4 20h7v-5H4v5Zm9-13h7V4h-7v3Z",
  pages: "M7 3h7l5 5v13H7V3Z M14 3v5h5",
  news: "M4 5h13v14H4zM8 9h5M8 13h5M8 17h3",
  services: "M12 3l2.5 5 5.5.8-4 3.9 1 5.5L12 16l-5 2.6 1-5.5-4-3.9 5.5-.8z",
  media: "M4 5h16v14H4zM4 15l4-4 4 4 3-3 5 5",
  review: "M9 11l3 3 7-7M4 12a8 8 0 1 0 16 0 8 8 0 0 0-16 0",
  types: "M4 6h16M4 12h16M4 18h10",
  members: "M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 20a6 6 0 0 1 12 0M17 11a3 3 0 1 0 0-6M16 14a6 6 0 0 1 6 6",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19 12l2-1-2-4-2 .6a7 7 0 0 0-1.8-1L15 4H9l-.5 2.6a7 7 0 0 0-1.8 1L5 7 3 11l2 1-2 1 2 4 2-.6a7 7 0 0 0 1.8 1L9 20h6l.5-2.6a7 7 0 0 0 1.8-1l2 .6 2-4-2-1Z",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM21 21l-5-5",
  plus: "M12 5v14M5 12h14",
  caret: "M6 9l6 6 6-6",
  right: "M9 6l6 6-6 6",
  back: "M15 18l-6-6 6-6",
  x: "M6 6l12 12M18 6L6 18",
  check: "M5 12l5 5L20 7",
};

export function Icon({
  name,
  size = 18,
  className,
}: {
  name: keyof typeof P | string;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={P[name] ?? ""} />
    </svg>
  );
}
