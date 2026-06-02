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
    case "hoodlums":
      return (
        <svg {...props} width={size} height={size}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "protest":
      return (
        <svg {...props} width={size} height={size}>
          <line x1="4" y1="22" x2="4" y2="2" />
          <path d="M4 4h15l-3 4 3 4H4" />
        </svg>
      );
    case "kidnapping":
      return (
        <svg {...props} width={size} height={size}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 22a8 8 0 0 1 12-7" />
          <line x1="17" y1="17" x2="22" y2="22" />
          <line x1="22" y1="17" x2="17" y2="22" />
        </svg>
      );
    case "armed_robbery":
      return (
        <svg {...props} width={size} height={size}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 11h6" />
          <path d="M12 8v6" />
        </svg>
      );
    case "bandit":
      return (
        <svg {...props} width={size} height={size}>
          <path d="M2 12c0-2 1.5-3 4-3h12c2.5 0 4 1 4 3s-1.5 3-4 3h-2.5l-3.5-2-3.5 2H6c-2.5 0-4-1-4-3z" />
          <circle cx="7.5" cy="12" r="1.2" fill="currentColor" />
          <circle cx="16.5" cy="12" r="1.2" fill="currentColor" />
        </svg>
      );
    case "cultist":
      return (
        <svg {...props} width={size} height={size}>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "collapse":
      return (
        <svg {...props} width={size} height={size}>
          <rect x="4" y="3" width="16" height="18" rx="1" />
          <line x1="4" y1="21" x2="20" y2="21" />
          <line x1="8" y1="7" x2="8" y2="7.01" />
          <line x1="12" y1="7" x2="12" y2="7.01" />
          <line x1="16" y1="7" x2="16" y2="7.01" />
          <line x1="8" y1="12" x2="8" y2="12.01" />
          <line x1="12" y1="12" x2="12" y2="12.01" />
          <line x1="16" y1="12" x2="16" y2="12.01" />
        </svg>
      );
    case "boat_accident":
      return (
        <svg {...props} width={size} height={size}>
          <circle cx="12" cy="5" r="2.5" />
          <line x1="12" y1="22" x2="12" y2="7.5" />
          <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
          <line x1="8" y1="12" x2="16" y2="12" />
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
