"use client";

import { useState } from "react";
import { useReferral } from "@/hooks/useReferral";
import type { Doctor } from "@/models/referral";

export function ReferralDirectory({ scenario = "Higher signal" }: { scenario?: string }) {
  const { doctors, status, referral, error, refer, reset } = useReferral();
  const [selected, setSelected] = useState<string | null>(null);

  if (status === "sent" && referral) {
    return (
      <section className="panel receipt" aria-labelledby="receipt-title">
        <p className="eyebrow">Referral created</p>
        <h1 id="receipt-title" style={{ fontSize: "var(--text-xl)", marginTop: "var(--space-sm)" }}>
          Sent — sandbox only
        </h1>

        <dl className="receipt__rows">
          <div>
            <dt>Reference</dt>
            <dd className="mono">{referral.id}</dd>
          </div>
          <div>
            <dt>Clinician</dt>
            <dd>{referral.doctorName}</dd>
          </div>
          <div>
            <dt>Facility</dt>
            <dd>{referral.facility}</dd>
          </div>
          <div>
            <dt>Context</dt>
            <dd>{referral.scenario}</dd>
          </div>
        </dl>

        <p className="note">
          This is a sample referral, not a real appointment. To be seen, contact an
          official health facility directly.
        </p>

        <button
          type="button"
          className="btn btn--ghost"
          style={{ marginTop: "var(--space-lg)" }}
          onClick={() => {
            reset();
            setSelected(null);
          }}
        >
          Create another
        </button>
      </section>
    );
  }

  return (
    <div className="stack">
      <header className="section-head" style={{ marginBottom: 0 }}>
        <p className="eyebrow">Referrals</p>
        <h1 style={{ fontSize: "var(--text-2xl)" }}>Choose a clinician</h1>
        <p>
          Sample SatuSehat-style records for a <strong>{scenario.toLowerCase()}</strong>{" "}
          reading. These are fictional sandbox entries, not real facilities, and this
          is not a diagnosis.
        </p>
      </header>

      <div className="doctors">
        {doctors.map((doctor) => (
          <DoctorCard
            key={doctor.id}
            doctor={doctor}
            pending={status === "sending" && selected === doctor.id}
            disabled={status === "sending"}
            onRefer={() => {
              setSelected(doctor.id);
              void refer({ doctorId: doctor.id, scenario });
            }}
          />
        ))}
      </div>

      {error ? (
        <p role="alert" className="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

interface DoctorCardProps {
  doctor: Doctor;
  pending: boolean;
  disabled: boolean;
  onRefer: () => void;
}

function DoctorCard({ doctor, pending, disabled, onRefer }: DoctorCardProps) {
  return (
    <article className="card doctor">
      <div className="doctor__head">
        <h3>{doctor.name}</h3>
        <span className="pill">Sandbox</span>
      </div>
      <p className="doctor__specialty">{doctor.specialty}</p>
      <p className="doctor__facility">
        {doctor.facility} · {doctor.city}
      </p>
      <div className="doctor__meta">
        <span>{doctor.distanceKm} km</span>
        <span>{doctor.availability}</span>
      </div>
      <button type="button" className="btn btn--primary" onClick={onRefer} disabled={disabled}>
        {pending ? "Sending…" : "Refer here"}
      </button>
    </article>
  );
}
