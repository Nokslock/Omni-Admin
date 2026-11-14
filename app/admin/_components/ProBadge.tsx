/**
 * The gold Kasala Pro check mark, the same one the app shows beside a
 * subscriber's name (users.verified, which the database keeps equal to
 * "has Pro").
 */
export function ProBadge({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-label="Kasala Pro member"
      className="shrink-0"
    >
      <title>Kasala Pro member</title>
      <path
        fill="#E0A526"
        d="M23 12l-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.82L8.6 22.5l3.4-1.47 3.4 1.46 1.89-3.19 3.61-.82-.34-3.69L23 12z"
      />
      <path
        fill="none"
        stroke="#1A1300"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 12.2l2.6 2.6L16.2 9.2"
      />
    </svg>
  );
}
