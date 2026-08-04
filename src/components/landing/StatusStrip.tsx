const FACTS = [
  { term: "Status", detail: "Open research prototype" },
  { term: "Scope", detail: "Pre-screening signal, not a diagnosis" },
  { term: "Data", detail: "WHO 2024 · CODA-TB" },
  { term: "Model", detail: "Multimodal CNN · demo mode when offline" },
] as const;

export function StatusStrip() {
  return (
    <section className="marquee-strip" aria-label="Project status">
      <dl className="shell marquee-strip__row">
        {FACTS.map((fact) => (
          <div className="marquee-strip__cell" key={fact.term}>
            <dt>{fact.term}</dt>
            <dd>{fact.detail}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
