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
 * Every figure ships with the year and the definition it was measured under —
 * incidence estimates and notified cases are not the same quantity, and the
 * page should never let them read as if they were.
 */
export const TB_FIGURES: readonly TbFigure[] = [
  {
    value: "10.8M",
    label: "People estimated to have fallen ill with TB worldwide",
    definition:
      "Estimated incident cases — not the count of diagnoses that were actually reported.",
    year: 2023,
    note: "Uncertainty interval 10.1–11.7M · 134 incident cases per 100,000 population.",
    sourceTitle: "WHO Global Tuberculosis Report 2024 — TB incidence",
    sourceUrl:
      "https://www.who.int/teams/global-programme-on-tuberculosis-and-lung-health/tb-reports/global-tuberculosis-report-2024/tb-disease-burden/1-1-tb-incidence",
  },
  {
    value: "8.2M",
    label: "People diagnosed and notified with new or relapse TB",
    definition:
      "New and relapse cases that reached a health system and were reported — a subset of total incidence.",
    year: 2023,
    sourceTitle: "WHO Global Tuberculosis Report 2024 — Case notifications",
    sourceUrl:
      "https://www.who.int/teams/global-programme-on-tuberculosis-and-lung-health/tb-reports/global-tuberculosis-report-2024/tb-diagnosis-and-treatment/2-1-case-notifications",
  },
  {
    value: "10%",
    label: "Share of global incident TB cases attributed to Indonesia",
    definition:
      "Proportion of estimated global incident TB cases that WHO attributes to Indonesia.",
    year: 2023,
    sourceTitle: "WHO — Tuberculosis resurges as top infectious disease killer",
    sourceUrl:
      "https://www.who.int/news/item/29-10-2024-tuberculosis-resurges-as-top-infectious-disease-killer",
  },
] as const;
