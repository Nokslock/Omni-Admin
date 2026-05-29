import type { IncidentType } from "./incidents";

const props = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function TypeIcon({ type, size = 16 }: { type: IncidentType; size?: number }) {
  switch (type) {
    case "fire":
      return (
        <svg {...props} width={size} height={size}>
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.4 0 2.5-1.1 2.5-2.5 0-1.4-2.5-3-2.5-3s-2.5 1.6-2.5 3z" />
          <path d="M19.5 14.5c0 4.1-3.4 7.5-7.5 7.5S4.5 18.6 4.5 14.5c0-1.6.5-3.1 1.4-4.4 1.7-2.6 5.6-3.6 6.1-7.1.5 1.5 1.5 2.5 3.5 3.5 2.4 1.2 4 3.6 4 7.5z" />
        </svg>
      );
    case "armed":
      return (
        <svg {...props} width={size} height={size}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
    case "crash":
      return (
        <svg {...props} width={size} height={size}>
          <path d="M5 17h14" />
          <path d="M5 17l2-5h10l2 5" />
          <circle cx="7.5" cy="17.5" r="1.5" />
          <circle cx="16.5" cy="17.5" r="1.5" />
          <path d="M12 3l-1 4M16 3l-2 4M8 3l1 4" />
        </svg>
      );
    case "medical":
      return (
        <svg {...props} width={size} height={size}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case "flood":
      return (
        <svg {...props} width={size} height={size}>
          <path d="M2 13c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5" />
          <path d="M2 18c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5" />
          <path d="M2 8c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5" />
        </svg>
      );
    case "traffic":
      return (
        <svg {...props} width={size} height={size}>
          <rect x="6" y="2" width="12" height="20" rx="3" />
          <circle cx="12" cy="7" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="17" r="1.5" />
        </svg>
      );
    case "other":
    default:
      return (
        <svg {...props} width={size} height={size}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
  }
}
