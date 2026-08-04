import { Backdrop } from "@/components/layout/Backdrop";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { StatusStrip } from "@/components/landing/StatusStrip";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Science } from "@/components/landing/Science";
import { Numbers } from "@/components/landing/Numbers";
import { Faq } from "@/components/landing/Faq";
import { Closer } from "@/components/landing/Closer";

export default function HomePage() {
  return (
    <>
      <Backdrop variant="landing" />
      <Header />
      <main>
        <Hero />
        <StatusStrip />
        <HowItWorks />
        <Science />
        <Numbers />
        <Faq />
        <Closer />
      </main>
      <Footer />
    </>
  );
}
