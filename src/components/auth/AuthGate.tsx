"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export function AuthGate({ next, children }: { next: string; children: ReactNode }) {
  const router = useRouter();
  const { user, ready } = useAuth();

  useEffect(() => {
    if (ready && !user) router.replace(`/login?next=${encodeURIComponent(next)}`);
  }, [ready, user, next, router]);

  if (!ready) {
    return (
      <p className="auth__status" role="status">
        Checking your session…
      </p>
    );
  }

  if (!user) {
    return (
      <p className="auth__status" role="status">
        Redirecting to sign in…
      </p>
    );
  }

  return <>{children}</>;
}
