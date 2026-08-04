const STEPS = [
  {
    title: "Record",
    body: "Cough or breathe into your device for a few seconds. Any phone or laptop microphone works — no clinical hardware, no app to install.",
  },
  {
    title: "Transform",
    body: "The audio is decoded, windowed, and turned into a mel-style frequency map. You see exactly what the model sees, not a black box.",
  },
  {
    title: "Decide",
    body: "You get a signal, its limits stated plainly, and a concrete next step — including a referral path when the signal warrants one.",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how" className="shell section scroll-anchor">
      <header className="section-head">
        <p className="eyebrow">How it works</p>
        <h2>Three steps, from sound to a decision you can act on.</h2>
        <p>
          Resona is deliberately short. The value is in what happens after the
          reading — not in the reading itself.
        </p>
      </header>

      <ol className="steps">
        {STEPS.map((step, index) => (
          <li className="card step" key={step.title}>
            <span className="step__index">{String(index + 1).padStart(2, "0")}</span>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
