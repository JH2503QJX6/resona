export function Meter({ label, value }: { label: string; value: number }) {
  const percent = Math.round(Math.min(1, Math.max(0, value)) * 100);

  return (
    <div className="meter">
      <div className="meter__head">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div
        className="meter__track"
        role="meter"
        aria-label={label}
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="meter__fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
