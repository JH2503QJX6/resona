import type { Metadata } from "next";
import Link from "next/link";
import { Backdrop } from "@/components/layout/Backdrop";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { TB_FIGURES } from "@/lib/tb-data";

export const metadata: Metadata = {
  title: "Transparency",
  description:
    "What Resona does with your audio, what demo mode means, where the data comes from, asset licences, and the medical limits of this prototype.",
};

export default function TransparencyPage() {
  return (
    <>
      <Backdrop variant="doc" />
      <Header />
      <main className="shell page">
        <article className="doc">
          <p className="eyebrow">Document</p>
          <h1>Transparency</h1>

          <p className="doc__callout">
            Resona is a research prototype for acoustic pre-screening. It is not a
            medical device and it does not diagnose. For symptoms or health
            concerns, consult a qualified clinician.
          </p>

          <section>
            <h2>What this is</h2>
            <p>
              Resona is an open reference implementation of a browser-based
              acoustic screening flow. The model pipeline is still under
              development, so the interface can run in demo mode without
              analysing any medical pattern at all.
            </p>
          </section>

          <section>
            <h2>What happens to your audio</h2>
            <p>
              The browser posts your recording to <code>/api/analyze</code>. Without{" "}
              <code>BACKEND_API_URL</code> set, that route returns a deterministic
              placeholder derived from file size. With it set, the route forwards the
              file to the model service&rsquo;s <code>/predict</code> endpoint. This
              prototype does not guarantee local-only processing or automatic
              deletion — treat any recording as leaving your device.
            </p>
          </section>

          <section>
            <h2>Demo mode versus a live model</h2>
            <p>
              In demo mode, results are labelled as a simulation and carry no
              clinical risk meaning. When a validated backend is connected, the model
              output is shown as-is, with no calibration claims until the team
              documents them.
            </p>
          </section>

          <section>
            <h2>Where the numbers come from</h2>
            <ul>
              {TB_FIGURES.map((figure) => (
                <li key={figure.sourceUrl}>
                  <a href={figure.sourceUrl} target="_blank" rel="noreferrer">
                    {figure.sourceTitle}
                  </a>{" "}
                  — {figure.value} ({figure.year}).
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2>Assets and licences</h2>
            <dl>
              <div>
                <dt>Explainability image</dt>
                <dd>
                  Supplied from a model experiment for illustration. Generation
                  metadata was not recorded.
                </dd>
              </div>
              <div>
                <dt>Typography</dt>
                <dd>Geist and Geist Mono (OFL-1.1), served via next/font.</dd>
              </div>
              <div>
                <dt>Everything else</dt>
                <dd>Drawn in code — no stock imagery, no icon library.</dd>
              </div>
            </dl>
          </section>

          <section>
            <h2>Referral data</h2>
            <p>
              The clinician list is fictional sandbox data styled after SatuSehat. It
              is not connected to the real SatuSehat API and creates no real
              appointment.
            </p>
          </section>

          <section>
            <h2>Medical limits</h2>
            <p>
              One early signal is not a diagnosis. A screening result does not replace
              a clinical examination, sputum testing, molecular testing, or a chest
              X-ray.
            </p>
          </section>

          <Link className="link-arrow" href="/" style={{ marginTop: "var(--space-2xl)" }}>
            Back to home
          </Link>
        </article>
      </main>
      <Footer />
    </>
  );
}
