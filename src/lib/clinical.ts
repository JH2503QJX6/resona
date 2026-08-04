import type { BiologicalSex } from "./types";

/* The model fuses a clinical branch with the acoustic one, and the service says
 * clinical metadata contributes strongly to the prediction. Blank numeric fields
 * fall back to the training mean inside the backend, so they are genuinely
 * optional — but the more that is filled in, the more the score means. */

/**
 * The seven CODA-TB collection sites — not a general country list.
 *
 * This feature encodes the site a recording came from, and the model uses it as
 * a base-rate prior: TB prevalence across the training split ranged from 9.6%
 * (Philippines) to 47.8% (Madagascar), and the site's effect on the score
 * tracks that prevalence closely (Spearman rho = 0.89). Any location outside
 * these seven leaves all site features at zero, which is not a neutral
 * midpoint — it is simply unmodelled.
 *
 * Note: `SA` is the dataset's own code for South Africa. It is not the ISO
 * code (which is `ZA`), so it must be sent exactly as written here.
 */
export const COUNTRIES = [
  { code: "IN", label: "India" },
  { code: "MG", label: "Madagascar" },
  { code: "PH", label: "Philippines" },
  { code: "SA", label: "South Africa" },
  { code: "TZ", label: "Tanzania" },
  { code: "UG", label: "Uganda" },
  { code: "VN", label: "Vietnam" },
] as const;

export const MODELLED_SITE_CODES: readonly string[] = COUNTRIES.map((c) => c.code);

/** True when the chosen location is one the model was actually trained on. */
export function isModelledSite(country: string): boolean {
  return MODELLED_SITE_CODES.includes(country);
}

export const HIV_STATUSES = ["Unknown", "Negative", "Positive"] as const;
export type HivStatus = (typeof HIV_STATUSES)[number];

export const TB_HISTORY = [
  { value: "none", label: "No previous TB" },
  { value: "pulmonary", label: "Pulmonary TB" },
  { value: "extrapulmonary", label: "Extrapulmonary TB" },
  { value: "unknown", label: "Not sure" },
] as const;
export type TbHistory = (typeof TB_HISTORY)[number]["value"];

/** Yes/no symptom questions, in the order they are shown. */
export const SYMPTOMS = [
  { key: "fever", label: "Fever" },
  { key: "night_sweats", label: "Night sweats" },
  { key: "weight_loss", label: "Unintended weight loss" },
  { key: "hemoptysis", label: "Coughing up blood" },
  { key: "smoke_lweek", label: "Smoked in the last week" },
] as const;
export type SymptomKey = (typeof SYMPTOMS)[number]["key"];

export interface ClinicalIntake {
  sex: BiologicalSex | null;
  age: string;
  height: string;
  weight: string;
  coughDurationDays: string;
  heartRate: string;
  temperature: string;
  country: string;
  hivStatus: HivStatus;
  tbHistory: TbHistory;
  symptoms: Record<SymptomKey, boolean>;
}

export const EMPTY_INTAKE: ClinicalIntake = {
  sex: null,
  age: "",
  height: "",
  weight: "",
  coughDurationDays: "",
  heartRate: "",
  temperature: "",
  country: "",
  hivStatus: "Unknown",
  tbHistory: "none",
  symptoms: {
    fever: false,
    night_sweats: false,
    weight_loss: false,
    hemoptysis: false,
    smoke_lweek: false,
  },
};

const yesNo = (value: boolean) => (value ? "Yes" : "No");

/** Omit blanks entirely so the backend applies its own training-mean fallback. */
const numeric = (value: string) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

/**
 * Serialises to the exact field names `preprocessing.encode_clinical_metadata`
 * reads. Keys that would be blank are dropped rather than sent as empty strings.
 */
export function toModelMetadata(intake: ClinicalIntake): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    sex: intake.sex === "male" ? "Male" : "Female",
    tb_prior: yesNo(intake.tbHistory !== "none"),
    tb_prior_Pul: yesNo(intake.tbHistory === "pulmonary"),
    tb_prior_Extrapul: yesNo(intake.tbHistory === "extrapulmonary"),
    tb_prior_Unknown: yesNo(intake.tbHistory === "unknown"),
    HIVstatus: intake.hivStatus,
  };

  for (const symptom of SYMPTOMS) {
    payload[symptom.key] = yesNo(intake.symptoms[symptom.key]);
  }

  const numerics: Array<[string, string]> = [
    ["age", intake.age],
    ["height", intake.height],
    ["weight", intake.weight],
    ["reported_cough_dur", intake.coughDurationDays],
    ["heart_rate", intake.heartRate],
    ["temperature", intake.temperature],
  ];
  for (const [field, raw] of numerics) {
    const value = numeric(raw);
    if (value !== undefined) payload[field] = value;
  }

  if (intake.country) payload.Country = intake.country;

  return payload;
}

/** How much of the optional clinical picture the user has supplied, 0–1. */
export function intakeCompleteness(intake: ClinicalIntake): number {
  const optional = [
    intake.age,
    intake.height,
    intake.weight,
    intake.coughDurationDays,
    intake.heartRate,
    intake.temperature,
    intake.country,
  ];
  return optional.filter(Boolean).length / optional.length;
}
