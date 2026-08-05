export interface TbFigure {
  value: string;
  label: string;
  definition: string;
  year: number;
  sourceTitle: string;
  sourceUrl: string;
  note?: string;
}

/**
 * WHO Global Tuberculosis Report 2025, reporting on calendar year 2024 — the
 * most recent figures published. WHO releases each report in the autumn
 * covering the year before, so 2025 data does not exist until late 2026.
 *
 * Every figure ships with the year and the definition it was measured under —
 * incidence estimates and diagnoses are not the same quantity, and the page
 * should never let them read as if they were.
 */
export const TB_FIGURES: readonly TbFigure[] = [
  {
    value: "10.7M",
    label: "People estimated to have fallen ill with TB worldwide",
    definition:
      "Estimated incident cases — not the count of diagnoses that were actually reported.",
    year: 2024,
    note: "Uncertainty interval 9.9–11.5M · 131 incident cases per 100,000. Down 1% from 2023 — the first fall since 2020.",
    sourceTitle: "WHO Global Tuberculosis Report 2025 — TB incidence",
    sourceUrl:
      "https://www.who.int/teams/global-programme-on-tuberculosis-and-lung-health/tb-reports/global-tuberculosis-report-2025/tb-disease-burden/1-1-tb-incidence",
  },
  {
    value: "8.3M",
    label: "People newly diagnosed with TB who accessed treatment",
    definition:
      "About 78% of those who fell ill that year. The rest were never diagnosed, or never reached care.",
    year: 2024,
    sourceTitle: "WHO Global Tuberculosis Report 2025 — Diagnosis and treatment",
    sourceUrl:
      "https://www.who.int/teams/global-programme-on-tuberculosis-and-lung-health/tb-reports/global-tuberculosis-report-2025/tb-diagnosis-and-treatment",
  },
  {
    value: "10%",
    label: "Share of global incident TB cases in Indonesia",
    definition:
      "The second-largest national burden, after India at 25%. Eight countries account for about two thirds of cases worldwide.",
    year: 2024,
    sourceTitle: "WHO Global Tuberculosis Report 2025 — TB incidence",
    sourceUrl:
      "https://www.who.int/teams/global-programme-on-tuberculosis-and-lung-health/tb-reports/global-tuberculosis-report-2025/tb-disease-burden/1-1-tb-incidence",
  },
] as const;
