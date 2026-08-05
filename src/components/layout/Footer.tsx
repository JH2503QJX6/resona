import Link from "next/link";
import { TB_FIGURES } from "@/lib/tb-data";

const PRODUCT = [
  { href: "/analyze", label: "Start screening" },
  { href: "/#how", label: "How it works" },
  { href: "/#science", label: "Science" },
  { href: "/transparency", label: "Transparency" },
] as const;

const TEAM = [
  "Jonathan Allen Hung",
  "David Lyon Sudirman",
  "Utkarsh Sandilya",
] as const;

export function Footer() {
  return (
    <footer className="footer">
      <div className="shell">
        <div className="footer__grid">
          <div>
            <p className="eyebrow">Resona</p>
            <p className="footer__blurb">
              A screening signal is a prompt to act, not an answer. Use it to decide
              what to do next — then confirm with a clinician.
            </p>
          </div>

          <div className="footer__col">
            <h3>Product</h3>
            <ul>
              {PRODUCT.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__col">
            <h3>Team</h3>
            <ul>
              {TEAM.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </div>

          <div className="footer__col">
            <h3>Sources</h3>
            <ul>
              {TB_FIGURES.map((figure) => (
                <li key={figure.sourceUrl}>
                  <a href={figure.sourceUrl} target="_blank" rel="noreferrer">
                    {figure.sourceTitle.replace("WHO Global Tuberculosis Report 2025 — ", "WHO · ")}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="footer__base">
          <p className="mono subtle">© {new Date().getFullYear()} Resona</p>
          <p className="note" style={{ margin: 0 }}>
            Not a medical device. Not a diagnosis. Seek professional care for any
            health concern.
          </p>
        </div>
      </div>
    </footer>
  );
}
