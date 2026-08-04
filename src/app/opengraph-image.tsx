import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Resona — screening that listens";

/** Rendered at build time; keeps link previews from showing a blank card. */
export default function OpengraphImage() {
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
          background: "#0f1115",
          backgroundImage:
            "radial-gradient(900px 500px at 12% 0%, rgba(56,189,190,0.20), transparent 65%), radial-gradient(900px 500px at 95% 30%, rgba(56,189,190,0.13), transparent 60%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#38bdbe",
            }}
          >
            <svg width="34" height="34" viewBox="0 0 32 32" fill="none">
              <path
                d="M4 16h3.2l3.2-8.5 5.1 17 3.9-11 2.6 5H28"
                stroke="#0f1115"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div style={{ fontSize: 40, fontWeight: 600, color: "#f5f7fa", letterSpacing: -1 }}>
            Resona
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 92,
              fontWeight: 600,
              color: "#f5f7fa",
              letterSpacing: -3.5,
              lineHeight: 1.05,
            }}
          >
            Screening that listens.
          </div>
          <div
            style={{
              marginTop: 26,
              fontSize: 32,
              color: "#9aa7b4",
              maxWidth: 900,
              lineHeight: 1.4,
            }}
          >
            Acoustic pre-screening for tuberculosis. Record a cough, see the
            signal, understand the next step.
          </div>
        </div>

        <div style={{ display: "flex", gap: 14 }}>
          {["Runs in the browser", "Open source", "Not a diagnosis"].map((tag) => (
            <div
              key={tag}
              style={{
                display: "flex",
                padding: "10px 22px",
                borderRadius: 999,
                border: "1px solid rgba(245,247,250,0.18)",
                color: "#c7d0da",
                fontSize: 24,
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
