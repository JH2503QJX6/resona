# Asset provenance

Every third-party or generated asset used by Resona is recorded here before it
ships. If an asset is not listed, it was drawn in code.

## Images

| Asset | Source | Notes | Used in |
|---|---|---|---|
| `public/images/test_xai_output.png` | Model experiment output supplied by the team | Generation metadata was not recorded. The figure's rendered title band was blanked during the 1.0 rebrand; all plot data is untouched. Regenerate from `tb_cough_xai_notebook.py` when convenient for a clean title. | Landing page, Science section |

## Typography

| Font | License | Source |
|---|---|---|
| Geist | OFL-1.1 | [Vercel](https://vercel.com/font) |
| Geist Mono | OFL-1.1 | [Vercel](https://vercel.com/font) |

Both are served through `next/font/google`, so they are self-hosted at build
time and no request leaves the user's browser for a font.

## Everything else

- **Icons** — no icon library. The handful of glyphs (wordmark, theme toggle,
  FAQ chevron) are inline SVG or CSS borders.
- **Illustration** — the hero signal card, the page backdrop, the live scope,
  and the spectrogram are all drawn in CSS or on a canvas from real data.
- **3D** — the previous lung model (`public/models/lung.glb`, Human Reference
  Atlas / NIH Visible Human Male, CC-BY 4.0) and its Three.js runtime were
  removed in the 1.0 rebuild. Nothing in the current build depends on them.
- **Design references** — `assets/` holds private layout studies. They are not
  imported by the app and are excluded from the Docker build context.

## Data

- Landing-page statistics: **WHO Global Tuberculosis Report 2025**, cited inline
  with year, definition, and a direct link per figure.
- Model dataset: **CODA-TB** — openly documented but **access-controlled**, not
  public. Obtaining it requires a Synapse Certified and Validated account and an
  Intended Data Use Statement approved by the data access team. Its terms
  prohibit redistribution, so no participant record is included here. See the
  header of `deploy/model-space/download_coda_solicited.py`.
- Referral directory: **fictional sandbox records** styled after SatuSehat. Not
  real facilities, not connected to the SatuSehat API.

## Disclosures

- Resona is a research prototype and does not provide a medical diagnosis.
- No accuracy, sensitivity, or specificity figure is claimed anywhere in the
  product until clinical validation is completed and published.
- Attribution is surfaced to users on `/transparency` and in the site footer.
