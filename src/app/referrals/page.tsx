import type { Metadata } from "next";
import { Backdrop } from "@/components/layout/Backdrop";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthGate } from "@/components/auth/AuthGate";
import { ReferralDirectory } from "@/components/referral/ReferralDirectory";

export const metadata: Metadata = {
  title: "Referrals",
  description:
    "Sample SatuSehat-style clinician records and a simulated referral flow.",
};

export default function ReferralsPage() {
  return (
    <>
      <Backdrop variant="app" />
      <Header />
      <main className="shell page">
        <AuthGate next="/referrals">
          <ReferralDirectory />
        </AuthGate>
      </main>
      <Footer />
    </>
  );
}
