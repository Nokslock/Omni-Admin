import { CountUp } from "./CountUp";
import { Reveal } from "./Reveal";

const stats = [
  { value: 12, suffix: "s", label: "Median report-to-alert" },
  { value: 4218, suffix: "", label: "Reporters worldwide" },
  { value: 98.4, suffix: "%", decimals: 1, label: "Verification accuracy" },
  { value: 37621, suffix: "", label: "Incidents reported" },
];

export function Stats() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid grid-cols-2 divide-x divide-y divide-border border-l border-r border-border md:grid-cols-4 md:divide-y-0">
          {stats.map((s, i) => (
            <Reveal
              key={s.label}
              delay={i * 80}
              className={`p-6 md:p-8 ${i < 2 ? "border-b border-border md:border-b-0" : ""}`}
            >
              <div className="font-mono text-3xl font-semibold tracking-tight sm:text-4xl">
                <CountUp to={s.value} suffix={s.suffix} decimals={s.decimals ?? 0} />
              </div>
              <div className="mt-1.5 text-xs uppercase tracking-wider text-fg-muted">
                {s.label}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
