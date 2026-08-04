import { TB_FIGURES } from "@/lib/tb-data";

export function Numbers() {
  return (
    <section id="numbers" className="shell section scroll-anchor">
      <header className="section-head">
        <p className="eyebrow">The gap</p>
        <h2>Every number arrives with the definition it was measured under.</h2>
        <p>
          Incidence estimates, notified diagnoses, and country share measure
          different things. The year and the definition stay attached to each one.
        </p>
      </header>

      <div className="figures">
        {TB_FIGURES.map((figure) => (
          <article className="card figure" key={figure.label}>
            <p className="mono subtle">WHO · {figure.year}</p>
            <p className="figure__value">{figure.value}</p>
            <h3>{figure.label}</h3>
            <p>{figure.definition}</p>
            {figure.note ? <p className="note">{figure.note}</p> : null}
            <a
              className="figure__source"
              href={figure.sourceUrl}
              target="_blank"
              rel="noreferrer"
            >
              Source ↗
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
