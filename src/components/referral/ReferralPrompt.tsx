"use client";

interface ReferralPromptProps {
  label: string;
  onClose: () => void;
  onRefer: () => void;
  onDetail: () => void;
}

export function ReferralPrompt({ label, onClose, onRefer, onDetail }: ReferralPromptProps) {
  return (
    <section className="panel aside-panel" aria-labelledby="referral-prompt-title">
      <header className="aside-panel__head">
        <div>
          <p className="eyebrow">{label}</p>
          <h2 id="referral-prompt-title">Worth getting checked</h2>
        </div>
      </header>

      <p className="muted" style={{ fontSize: "var(--text-sm)", maxWidth: "52ch" }}>
        This reading is not a diagnosis and cannot rule TB in or out. What it can do
        is tell you a proper check is worth your time. Browse referral options now,
        or look at the signal detail first.
      </p>

      <dl className="verdict__advice" style={{ marginTop: "var(--space-lg)" }}>
        <dt>If symptoms are severe</dt>
        <dd>
          Coughing up blood, severe breathlessness, or chest pain means seek medical
          help immediately rather than waiting on a referral.
        </dd>
      </dl>

      <div className="aside-panel__foot">
        <button type="button" className="btn btn--primary" onClick={onRefer}>
          Find a clinician
        </button>
        <button type="button" className="btn btn--ghost" onClick={onDetail}>
          Signal detail
        </button>
        <button type="button" className="btn--quiet" onClick={onClose}>
          Dismiss
        </button>
      </div>
    </section>
  );
}
