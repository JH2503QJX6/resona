"use client";

import {
  COUNTRIES,
  HIV_STATUSES,
  SYMPTOMS,
  TB_HISTORY,
  isModelledSite,
  type ClinicalIntake,
  type HivStatus,
  type TbHistory,
} from "@/lib/clinical";
import type { BiologicalSex } from "@/lib/types";

interface ClinicalFormProps {
  value: ClinicalIntake;
  onChange: (next: ClinicalIntake) => void;
  disabled?: boolean;
}

const NUMERIC_FIELDS = [
  { key: "age", label: "Age", unit: "years", min: 0, max: 120 },
  { key: "coughDurationDays", label: "Cough duration", unit: "days", min: 0, max: 365 },
  { key: "height", label: "Height", unit: "cm", min: 50, max: 250 },
  { key: "weight", label: "Weight", unit: "kg", min: 10, max: 300 },
  { key: "heartRate", label: "Heart rate", unit: "bpm", min: 30, max: 220 },
  { key: "temperature", label: "Temperature", unit: "°C", min: 30, max: 45 },
] as const;

export function ClinicalForm({ value, onChange, disabled }: ClinicalFormProps) {
  const set = <K extends keyof ClinicalIntake>(key: K, next: ClinicalIntake[K]) =>
    onChange({ ...value, [key]: next });

  return (
    <div className="intake">
      <fieldset className="choice" disabled={disabled}>
        <legend>Biological sex</legend>
        <div className="choice__options">
          {(["female", "male"] as BiologicalSex[]).map((option) => (
            <label key={option} className="choice__option">
              <input
                type="radio"
                name="sex"
                checked={value.sex === option}
                onChange={() => set("sex", option)}
              />
              <span>{option === "female" ? "Female" : "Male"}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="intake__grid">
        {NUMERIC_FIELDS.map((field) => (
          <div key={field.key}>
            <label className="field-label" htmlFor={`intake-${field.key}`}>
              {field.label} <span className="intake__unit">{field.unit}</span>
            </label>
            <input
              id={`intake-${field.key}`}
              className="input"
              type="number"
              inputMode="decimal"
              min={field.min}
              max={field.max}
              step="any"
              placeholder="—"
              disabled={disabled}
              value={value[field.key]}
              onChange={(event) => set(field.key, event.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="intake__grid">
        <div>
          <label className="field-label" htmlFor="intake-country">
            Screening location
          </label>
          <select
            id="intake-country"
            className="input"
            disabled={disabled}
            value={value.country}
            aria-describedby="intake-country-hint"
            onChange={(event) => set("country", event.target.value)}
          >
            <option value="">Somewhere else</option>
            {COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="intake-hiv">
            HIV status
          </label>
          <select
            id="intake-hiv"
            className="input"
            disabled={disabled}
            value={value.hivStatus}
            onChange={(event) => set("hivStatus", event.target.value as HivStatus)}
          >
            {HIV_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="intake-tb">
            Previous TB
          </label>
          <select
            id="intake-tb"
            className="input"
            disabled={disabled}
            value={value.tbHistory}
            onChange={(event) => set("tbHistory", event.target.value as TbHistory)}
          >
            {TB_HISTORY.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="note" id="intake-country-hint">
        {isModelledSite(value.country)
          ? "The model was trained at seven clinics and uses the site as a base-rate prior, so this choice moves the score noticeably."
          : "The model was trained at seven clinics only. Screening anywhere else leaves that input unmodelled, and the score is correspondingly less reliable."}
      </p>

      <fieldset className="intake__symptoms" disabled={disabled}>
        <legend className="field-label">Symptoms</legend>
        <div className="intake__chips">
          {SYMPTOMS.map((symptom) => (
            <label key={symptom.key} className="toggle-chip">
              <input
                type="checkbox"
                checked={value.symptoms[symptom.key]}
                onChange={(event) =>
                  set("symptoms", { ...value.symptoms, [symptom.key]: event.target.checked })
                }
              />
              <span>{symptom.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
