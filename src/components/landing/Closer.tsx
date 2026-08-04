import Link from "next/link";

export function Closer() {
  return (
    <section className="shell section">
      <div className="card closer">
        <p className="eyebrow">Try it</p>
        <h2>It takes about ten seconds to find out whether to get checked.</h2>
        <p>
          Recording runs in your browser. If no model backend is connected, the
          result is clearly labelled as a demo — nothing is presented as clinical.
        </p>
        <Link className="btn btn--primary" href="/analyze">
          Record a cough
        </Link>
      </div>
    </section>
  );
}
