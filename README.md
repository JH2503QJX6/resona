<div align="center">

# Resona

**Screening that listens.**

Tuberculosis changes how a cough sounds long before most people reach a clinic.
Resona records that cough in the browser, turns it into a readable frequency
signal, and shows you what to do next.

[Getting started](#getting-started) · [How it works](#how-it-works) · [Configuration](#configuration) · [Deployment](#deployment)

</div>

---

> [!IMPORTANT]
> Resona is an open research prototype, not a medical device. It does not
> diagnose tuberculosis and it cannot rule it in or out. For symptoms or health
> concerns, consult a qualified clinician.

## What it does

|                      |                                                                                                             |
| -------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Record anywhere**  | Any phone or laptop microphone. No app install, no clinical hardware.                                       |
| **Show the signal**  | Audio is decoded, windowed, and rendered as a 24-band × 32-frame spectrogram — you see what the model sees. |
| **State the limits** | Every number ships with its definition. Demo output is labelled as demo.                                    |
| **Route to care**    | A high signal leads to a referral flow, not to a scary number on its own.                                   |

## How it works

```
 Browser                          Next.js server              Model service
┌──────────────────────┐        ┌──────────────────┐        ┌──────────────────┐
│ MediaRecorder        │        │                  │        │  FastAPI         │
│   ↓                  │        │  /api/analyze    │        │  + PyTorch CNN   │
│ decodeAudioData      │──────▶ │    ├─ validate   │──────▶ │    /predict      │
│   ↓ downmix to mono  │  WAV   │    ├─ forward    │        │                  │
│   ↓ STFT (24×32)     │        │    └─ or demo    │ ◀──────│  risk band +     │
│   ↓ 16-bit WAV       │        │                  │        │  probability     │
└──────────────────────┘        └──────────────────┘        └──────────────────┘
```

**Cough segmentation matters.** The model was trained on individually segmented
coughs and crops every clip to its first **0.55 s**, so handing it one long
recording would show it half a second of silence. The browser therefore runs
energy-based onset detection over the recording, cuts out each cough (with a
250 ms refractory gap so one cough yields one clip), and uploads them as
separate parts. `accepted_clips` in the response tells you how many survived the
backend's own quality checks.

**Clinical metadata matters too.** The model fuses an acoustic branch with a
27-feature clinical branch. Blank numeric fields fall back to training means
inside the service, so the intake form is optional — but the more of it is
filled in, the more the score is worth.

The spectrogram is computed **client-side** from the exact audio the browser
sends, so the visualisation is always faithful to the input — even when the
model backend is absent and the risk value is a placeholder.

**Demo mode.** With no `BACKEND_API_URL` configured, `/api/analyze` returns a
deterministic placeholder derived from file size. The UI labels it clearly, and
no audio is analysed for TB patterns in that state.

## Getting started

```bash
git clone https://github.com/dtcmunyie/resona.git
cd resona
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). This runs in **demo mode** —
the flow works end to end, but the risk value is a labelled placeholder.

### Running the real model

To get actual predictions, start the bundled inference service. Any **Python
3.9 or newer** works — dependencies are floored, not pinned, so pip picks a
build that matches your interpreter.

```bash
npm run model:setup    # one-off: venv + PyTorch, librosa, FastAPI (~2 GB)
npm run model:check    # verifies the checkpoint loads and scores
npm run model:dev      # serves on http://127.0.0.1:7860
```

Then point the app at it and restart `npm run dev`:

```bash
echo 'BACKEND_API_URL=http://127.0.0.1:7860' >> .env.local
```

The result badge switches from **Demo mode** to a real risk band, and the detail
panel shows the model name, version, and inference time.

### Scripts

| Command               | Does                                             |
| --------------------- | ------------------------------------------------ |
| `npm run dev`         | Dev server with hot reload                       |
| `npm run build`       | Production build (standalone output)             |
| `npm start`           | Serve the production build                       |
| `npm run lint`        | ESLint                                           |
| `npm run typecheck`   | `tsc --noEmit`                                   |
| `npm run model:setup` | Create the Python venv for the inference service |
| `npm run model:check` | Smoke-test that the checkpoint loads             |
| `npm run model:dev`   | Run the inference service on port 7860           |

## Configuration

All variables are optional. Each unset feature degrades to a clearly labelled
state rather than an error.

Create `.env.local`:

```env
# Model backend. Unset → /api/analyze returns labelled demo output.
BACKEND_API_URL=https://your-model-service.example.com

# Firebase email/password auth for the referral flow.
# Unset → sign-in falls back to a browser-local sandbox account.
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Design system

Resona ships one stylesheet and no UI framework.

- **Colour** — every token is declared once with CSS `light-dark()`. The theme
  toggle flips `color-scheme` on `<html>`; nothing else has to know about themes.
- **Type** — Geist and Geist Mono, self-hosted through `next/font`. Two families,
  a fluid `clamp()` scale, no other webfonts.
- **Motion** — one animated element on the marketing page. Everything collapses
  under `prefers-reduced-motion`.
- **No runtime CSS-in-JS, no icon library, no animation library.**

## Architecture

```
src/
├── app/
│   ├── page.tsx              Landing
│   ├── analyze/              Recorder + result flow
│   ├── referrals/            Sandbox referral directory (auth-gated)
│   ├── login/                Sign in
│   ├── transparency/         Limits, data sources, licences
│   ├── api/analyze/          Model proxy, or labelled demo output
│   └── globals.css           The design system
├── components/
│   ├── layout/               Header, Footer, Backdrop, ThemeToggle
│   ├── landing/              Marketing sections
│   ├── analyze/              Workbench, Scope, ClinicalForm, ResultPanel
│   ├── auth/  referral/
├── hooks/                    Recorder, analysis, result flow, auth
├── lib/                      Audio DSP, API client, types, theme, WHO data
├── models/                   Domain types
└── services/                 Auth, referral
deploy/model-space/           FastAPI + PyTorch inference service
```

## Deployment

**Frontend** — any Node host. The build emits Next.js standalone output.

```bash
docker build -t resona .
docker run -p 7860:7860 -e BACKEND_API_URL=https://your-model-service resona
```

**Model service** — see [`deploy/model-space`](deploy/model-space).

```bash
cd deploy/model-space
pip install -r requirements.txt
python export_deployment_config.py
uvicorn app:app --host 0.0.0.0 --port 7860
```

`POST /predict` takes an `audio` file plus a `metadata` JSON string and returns
`tb_risk_probability`, `risk_band`, and `accepted_clips`.

## Data and sources

> [!IMPORTANT]
> **CODA-TB is access-controlled, and its records are not in this repository.**
>
> The dataset holds real patient records — including HIV status and
> microbiological TB results — from clinics in seven countries. Access is not
> self-service. You need a Synapse account that is both Certified and
> Validated, plus an **Intended Data Use Statement reviewed and approved** by
> the CODA data access team. Approval is scoped to the use you describe.
>
> The terms bind you personally and prohibit redistribution. Do not commit the
> files, attach them to a submission, or serve them from a deployed site. This
> repository's `.gitignore` already excludes them.
>
> Once approved, run `deploy/model-space/download_coda_solicited.py` with your
> own Synapse token. Start at
> [syn31472953](https://www.synapse.org/Synapse:syn31472953).

Landing-page statistics come from the **WHO Global Tuberculosis Report 2025**.
Incidence estimates and notified cases measure different things, so each figure
carries its year and definition in the UI. Model training uses the public
**CODA-TB** dataset.

The referral directory is **fictional sandbox data** styled after SatuSehat. It
is not connected to the real SatuSehat API and creates no real appointment.
Production integration would require registration at the
[SatuSehat Developer Portal](https://satusehat.kemkes.go.id/), OAuth2 client
credentials, and FHIR R4 endpoints for Practitioner, Organization, and Encounter.

## Reproducibility

Be aware of what this repository does and does not let you do.

**Inference is fully self-contained.** The checkpoint and the derived
normalisation statistics in `deployment_config.json` are committed, so
`npm run model:dev` gives real predictions with nothing else to fetch.

**Training is not reproducible from this repository.** No cough audio ships
here — the five WAV files under `deploy/model-space` are one-second synthetic
test signals for smoke-testing the service, not training data. The checkpoint
came from an external training run against CODA-TB.

To retrain or audit the model you need the source data:

| Dataset | Access | Fits this pipeline |
|---|---|---|
| [CODA-TB](https://www.synapse.org/Synapse:syn31472953) — 733k coughs, 2,143 participants, microbiologically confirmed | Free, but requires a Synapse Certified + Validated account and a reviewed Intended Data Use Statement | **Yes** — its clinical variables are exactly the 27 features this model expects |
| [TBscreen](https://zenodo.org/records/10431329) — 33k passive coughs, 149 TB / 46 controls | CC-BY 4.0, direct download, 395 GB | Partly — real TB labels, but a different metadata schema needs remapping |
| [COUGHVID](https://zenodo.org/records/7024894) — 30k coughs | CC-BY 4.0, 2.3 GB | No TB labels; useful only for pretraining or augmentation |

CODA-TB withholds its validation split and scores submissions through its own
mechanism, so retraining locally does not by itself produce reportable
performance figures.

## Validation status

No accuracy, sensitivity, or specificity figure is claimed. Dataset validation,
calibration, and clinical evaluation must be completed and published before any
score in this interface can be read as performance. The UI is written to hold
that line throughout.

## Team

Jonathan Allen Hung · David Lyon Sudirman · Utkarsh Sandilya

## Credits

| | License | Source |
|---|---|---|
| [Next.js](https://nextjs.org/) 16 | MIT | Vercel |
| [React](https://react.dev/) 19 | MIT | Meta |
| [Tailwind CSS](https://tailwindcss.com/) 4 | MIT | Tailwind Labs |
| [Firebase](https://firebase.google.com/) | Apache-2.0 | Google |
| [clsx](https://github.com/lukeed/clsx) · [tailwind-merge](https://github.com/dcastil/tailwind-merge) | MIT | Luke Edwards · Dany Castillo |
| [Geist / Geist Mono](https://vercel.com/font) | OFL-1.1 | Vercel |
| [PyTorch](https://pytorch.org/) | BSD-3-Clause | Meta AI |
| [FastAPI](https://fastapi.tiangolo.com/) | MIT | Sebastián Ramírez |
| [librosa](https://librosa.org/) | ISC | librosa contributors |

Asset provenance is tracked in [`docs/assets.md`](docs/assets.md).

## License

[MIT](LICENSE). The licence covers the source code in this repository. It does
not cover the CODA-TB dataset, which is distributed separately under its own
data use agreement and is not redistributed here, nor individual assets that
carry their own terms — see [`docs/assets.md`](docs/assets.md).
