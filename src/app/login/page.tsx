import type { Metadata } from "next";
import { Backdrop } from "@/components/layout/Backdrop";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SignInPanel } from "@/components/auth/SignInPanel";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to browse referral options and create a sample referral.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  // Only accept same-origin paths, so `next` can never become an open redirect.
  const next =
    typeof params.next === "string" && /^\/(?!\/)/.test(params.next)
      ? params.next
      : "/referrals";

  return (
    <>
      <Backdrop variant="app" />
      <Header />
      <main className="shell page">
        <SignInPanel next={next} />
      </main>
      <Footer />
    </>
  );
}
