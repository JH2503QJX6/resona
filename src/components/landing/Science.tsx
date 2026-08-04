import Image from "next/image";

const POINTS = [
  "Audio is resampled to mono and encoded as 16-bit WAV before it leaves the browser.",
  "A short-time Fourier transform produces a 24-band × 32-frame magnitude map.",
  "Clinical metadata is fused with the acoustic branch inside the CNN.",
  "Saliency maps show which frequency regions moved the score.",
] as const;

export function Science() {
  return (
    <section id="science" className="shell section scroll-anchor">
      <div className="science">
        <figure className="science__frame">
          <Image
            src="/images/test_xai_output.png"
            alt="Explainability output from a tuberculosis cough-audio model experiment"
            width={4470}
            height={2955}
            sizes="(max-width: 56rem) calc(100vw - 3rem), 40rem"
            priority={false}
          />
          <figcaption>
            Explainability output from a model experiment. Illustrative — not
            clinical evidence.
          </figcaption>
        </figure>

        <div className="science__copy">
          <p className="eyebrow">The science</p>
          <h2>A cough is data. We just make it legible.</h2>
          <p>
            Sound carries structure. The pipeline below converts a recording into a
            frequency representation a convolutional model can read, then surfaces
            the regions that drove the output.
          </p>
          <ul className="science__list">
            {POINTS.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <p className="note" style={{ marginTop: "var(--space-lg)" }}>
            Clinical validation is not complete. No accuracy, sensitivity, or
            specificity figures are claimed until dataset validation, calibration,
            and clinical evaluation are documented.
          </p>
        </div>
      </div>
    </section>
  );
}
