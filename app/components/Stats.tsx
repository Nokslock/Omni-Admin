const stats = [
  { value: "12s", label: "Median report-to-alert" },
  { value: "4,218", label: "Active reporters" },
  { value: "98.4%", label: "Verification accuracy" },
  { value: "37,621", label: "Incidents reported" },
];

export function Stats() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid grid-cols-2 divide-x divide-y divide-border border-l border-r border-border md:grid-cols-4 md:divide-y-0">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`p-6 md:p-8 ${i < 2 ? "border-b border-border md:border-b-0" : ""}`}
            >
              <div className="font-mono text-3xl font-semibold tracking-tight sm:text-4xl">
                {s.value}
              </div>
              <div className="mt-1.5 text-xs uppercase tracking-wider text-fg-muted">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
