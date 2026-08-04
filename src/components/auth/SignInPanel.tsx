"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export function SignInPanel({ next }: { next: string }) {
  const router = useRouter();
  const { user, ready, configured, signIn, signUp } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace(next);
  }, [ready, user, next, router]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      if (mode === "signin") await signIn(email, password);
      else await signUp(email, password);
      router.replace(next);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Sign in failed. Check your email and password.",
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="auth">
      <p className="eyebrow">Referrals</p>
      <h1 style={{ fontSize: "var(--text-2xl)", marginTop: "var(--space-sm)" }}>
        Sign in to refer
      </h1>
      <p className="muted" style={{ marginTop: "var(--space-sm)", fontSize: "var(--text-sm)" }}>
        An account is only needed for the referral flow. Screening works without one.
      </p>

      {!configured ? (
        <div className="panel auth__form" role="status">
          <p style={{ fontWeight: 540, fontSize: "var(--text-sm)" }}>
            Authentication is not configured
          </p>
          <p className="note">
            Set the <code>NEXT_PUBLIC_FIREBASE_*</code> variables in{" "}
            <code>.env.local</code> to enable email sign in. Everything else in the
            app still works.
          </p>
        </div>
      ) : (
        <form className="panel auth__form" onSubmit={submit} noValidate>
          <div>
            <label className="field-label" htmlFor="auth-email">
              Email
            </label>
            <input
              id="auth-email"
              className="input"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div>
            <label className="field-label" htmlFor="auth-password">
              Password
            </label>
            <input
              id="auth-password"
              className="input"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {error ? (
            <p role="alert" className="alert">
              {error}
            </p>
          ) : null}

          <p className="note">
            Without Firebase credentials, accounts are stored only in this browser.
          </p>

          <button type="submit" className="btn btn--primary" disabled={pending}>
            {pending ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>

          <button
            type="button"
            className="btn--quiet"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
            }}
          >
            {mode === "signin" ? "No account? Create one" : "Already have an account? Sign in"}
          </button>
        </form>
      )}
    </div>
  );
}
