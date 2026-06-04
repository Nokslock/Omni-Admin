import { ImageResponse } from "next/og";
import { siteConfig } from "./lib/site";

// Tells Next this file is the global OG card. Twitter falls back to this when
// no twitter-image is provided. No request-time data is read, so we let Next
// prerender it as a static PNG at build time (cacheable, no cold start).
export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          color: "#f5f7fa",
          background:
            "radial-gradient(circle at 30% 20%, #1a1f2b 0%, #0a0c10 60%, #050608 100%)",
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
        }}
      >
        {/* Brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "radial-gradient(circle at 35% 30%, #2a2f38 0%, #0a0c10 100%)",
              border: "2px solid rgba(255,255,255,0.08)",
              boxShadow:
                "inset 0 0 40px rgba(232,64,64,0.10), 0 0 80px rgba(232,64,64,0.08)",
            }}
          >
            <div
              style={{
                fontSize: 44,
                fontWeight: 900,
                color: "#f5f7fa",
                lineHeight: 1,
              }}
            >
              K
            </div>
          </div>
          <div
            style={{
              fontSize: 34,
              fontWeight: 700,
              letterSpacing: -0.5,
              color: "#f5f7fa",
            }}
          >
            {siteConfig.name}
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 92,
              fontWeight: 800,
              letterSpacing: -2,
              lineHeight: 1.05,
              color: "#ffffff",
              maxWidth: 980,
            }}
          >
            Immediate community safety alerts.
          </div>
          <div
            style={{
              fontSize: 30,
              lineHeight: 1.35,
              color: "#9aa3b2",
              maxWidth: 880,
            }}
          >
            Spot, report, and monitor critical incidents in your area in real
            time.
          </div>
        </div>

        {/* Footer row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 20,
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            style={{
              fontSize: 24,
              color: "#9aa3b2",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            }}
          >
            kasalaalert.com
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 22,
              color: "#e84040",
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 9999,
                background: "#e84040",
                boxShadow: "0 0 24px rgba(232,64,64,0.7)",
              }}
            />
            <div>Live · Nigeria-wide</div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
