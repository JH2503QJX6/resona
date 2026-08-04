"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const NAV = [
  { href: "/#how", label: "How it works" },
  { href: "/#science", label: "Science" },
  { href: "/#numbers", label: "Numbers" },
  { href: "/#faq", label: "FAQ" },
] as const;

export function Header() {
  const pathname = usePathname();
  const sheetRef = useRef<HTMLDialogElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onAnalyze = pathname === "/analyze";
  const ctaHref = onAnalyze ? "/" : "/analyze";
  const ctaLabel = onAnalyze ? "Home" : "Start screening";

  const closeSheet = () => sheetRef.current?.close();
  const onBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === sheetRef.current) closeSheet();
  };

  return (
    <>
      <header className="header" data-stuck={stuck}>
        <div className="shell header__bar">
          <Link href="/" className="wordmark" aria-label="Resona home">
            <Wordmark />
          </Link>

          <nav className="header__nav" aria-label="Primary">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="header__actions">
            <ThemeToggle />
            <Link className="btn btn--primary header__cta" href={ctaHref}>
              {ctaLabel}
            </Link>
            <button
              ref={menuRef}
              type="button"
              className="header__menu"
              aria-controls="mobile-nav"
              onClick={() => sheetRef.current?.showModal()}
            >
              Menu
            </button>
          </div>
        </div>
      </header>

      <dialog
        ref={sheetRef}
        id="mobile-nav"
        className="sheet"
        onClick={onBackdropClick}
        onClose={() => menuRef.current?.focus()}
      >
        <div className="sheet__panel">
          <div className="shell">
            <div className="sheet__top">
              <Wordmark />
              <button type="button" className="header__menu" onClick={closeSheet}>
                Close
              </button>
            </div>
            <div className="sheet__links">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} onClick={closeSheet}>
                  {item.label}
                </Link>
              ))}
            </div>
            <Link
              className="btn btn--primary"
              href={ctaHref}
              onClick={closeSheet}
              style={{ marginTop: "var(--space-lg)", width: "100%" }}
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      </dialog>
    </>
  );
}

function Wordmark() {
  return (
    <span className="wordmark">
      <span className="wordmark__glyph" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          <path d="M3 12h2.5l2.5-7 4 14 3-9 2 4h4" />
        </svg>
      </span>
      Resona
    </span>
  );
}
