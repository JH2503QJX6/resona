import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Backdrop } from "@/components/layout/Backdrop";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

// The recorder needs microphone and Web Audio APIs, so it is client-only.
const Workbench = dynamic(
  () => import("@/components/analyze/Workbench").then((m) => m.Workbench),
  {
    loading: () => (
      <div className="panel" style={{ minHeight: "28rem" }} aria-hidden="true" />
    ),
  },
);

export const metadata: Metadata = {
  title: "Record a cough",
  description:
    "Record or upload a cough and turn it into a readable acoustic signal. Screening output only — not a diagnosis.",
};

export default function AnalyzePage() {
  return (
    <>
      <Backdrop variant="app" />
      <Header />
      <main className="shell page">
        <header className="section-head">
          <p className="eyebrow">Screening</p>
          <h1 style={{ fontSize: "var(--text-2xl)" }}>Record a cough.</h1>
          <p>
            A few seconds of audio is enough. You will see the signal that was
            extracted, its limits, and what to do next.
          </p>
        </header>
        <Workbench />
      </main>
      <Footer />
    </>
  );
}
