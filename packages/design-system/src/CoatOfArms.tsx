// Placeholder national emblem. The official Coat of Arms is determined by law
// and must be vendored from gov.rw/government/publications/national-symbols with
// provenance (see repo CLAUDE.md) — drop the real asset in here when available.
export function CoatOfArms({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" style={{ display: "block" }}>
      <circle cx="24" cy="24" r="22" fill="#F2F6FA" stroke="#B7C5D1" />
      <circle cx="24" cy="19" r="6" fill="#F7C948" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <line
            key={i}
            x1={24 + Math.cos(a) * 9}
            y1={19 + Math.sin(a) * 9}
            x2={24 + Math.cos(a) * 12}
            y2={19 + Math.sin(a) * 12}
            stroke="#E0A92E"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        );
      })}
      <path d="M12 34 Q24 28 36 34" fill="none" stroke="#1E7A46" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M14 39 Q24 34 34 39" fill="none" stroke="#0A66A8" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
