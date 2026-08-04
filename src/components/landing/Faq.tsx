const FAQS = [
  {
    q: "Is this a medical diagnosis?",
    a: "No. Resona is a pre-screening prototype. It does not replace a clinician, sputum testing, molecular testing, or a chest X-ray, and it never will on its own.",
  },
  {
    q: "Where does my audio go?",
    a: "Your recording is posted to /api/analyze. If a backend is configured, that route forwards the file to the model service. This prototype does not yet guarantee local-only processing or automatic deletion — assume the recording leaves your device.",
  },
  {
    q: "What is demo mode?",
    a: "When no model backend is connected, the interface returns a deterministic placeholder derived from file size so the flow stays explorable. Your audio is not analysed for TB patterns in that state, and the result is labelled as such.",
  },
  {
    q: "How accurate is it?",
    a: "No accuracy figure is claimed. Dataset validation, calibration, and clinical evaluation have to be completed and published before any score here can be interpreted as performance.",
  },
  {
    q: "Who is it for?",
    a: "Anyone with a persistent cough who wants a nudge toward getting checked, and researchers who want a working reference implementation of a browser-based acoustic screening flow.",
  },
] as const;

export function Faq() {
  return (
    <section id="faq" className="shell section scroll-anchor">
      <header className="section-head">
        <p className="eyebrow">Straight answers</p>
        <h2>What to know before you try it.</h2>
      </header>

      <div className="faq">
        {FAQS.map((faq) => (
          <details key={faq.q}>
            <summary>{faq.q}</summary>
            <p>{faq.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
