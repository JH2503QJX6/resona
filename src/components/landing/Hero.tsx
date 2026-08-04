import Link from "next/link";
import type { CSSProperties } from "react";

/** Deterministic bar profile — same on server and client, no hydration drift. */
const BARS = Array.from({ length: 40 }, (_, i) => ({
  height: `${Math.round((0.22 + Math.abs(Math.sin(i * 0.42)) * 0.55 + Math.abs(Math.sin(i * 0.17 + 1.2)) * 0.2) * 100)}%`,
  delay: `${(i * -0.08).toFixed(2)}s`,
  speed: `${(1.6 + (i % 7) * 0.14).toFixed(2)}s`,
}));

export function Hero() {
  return (
    <section className="shell hero">
      <div className="hero__grid">
        <div>
          <p className="eyebrow">Acoustic pre-screening</p>

          <h1 className="hero__title">
            Screening that <em>listens</em>.
          </h1>

          <p className="hero__lede">
            Tuberculosis changes how a cough sounds long before most people reach a
            clinic. Resona records that cough in the browser, turns it into a
            readable frequency signal, and shows you what to do next.
          </p>

          <div className="hero__actions">
            <Link className="btn btn--primary" href="/analyze">
              Record a cough
            </Link>
            <Link className="link-arrow" href="#how">
              See how it works
            </Link>
          </div>

          <div className="hero__proof">
            <span className="pill">No app install</span>
            <span className="pill">Runs in the browser</span>
            <span className="pill">Open source</span>
          </div>
        </div>

        <SignalCard />
      </div>
    </section>
  );
}

function SignalCard() {
  return (
    <div className="card signal" aria-hidden="true">
      <div className="signal__head">
        <span className="pill pill--accent">
          <span className="pill__dot pill__dot--live" />
          Signal
        </span>
        <span className="mono subtle">44.1 kHz · mono</span>
      </div>

      <div className="signal__stage">
        <svg className="signal__trace" viewBox="0 0 1600 200" preserveAspectRatio="none">
          <path d="M0 118 Q 200 156 400 118 T 800 118 T 1200 118 T 1600 118" />
          <path d="M0 100 Q 200 46 400 100 T 800 100 T 1200 100 T 1600 100" />
        </svg>
        <div className="signal__bars">
          {BARS.map((bar, i) => (
            <span
              key={i}
              className="signal__bar"
              style={
                { "--h": bar.height, "--delay": bar.delay, "--speed": bar.speed } as CSSProperties
              }
            />
          ))}
        </div>
      </div>

      <dl className="signal__readout">
        <div>
          <dt>Window</dt>
          <dd>512</dd>
        </div>
        <div>
          <dt>Bands</dt>
          <dd>24</dd>
        </div>
        <div>
          <dt>Frames</dt>
          <dd>32</dd>
        </div>
      </dl>
    </div>
  );
}
