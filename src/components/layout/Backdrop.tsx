export type BackdropVariant = "landing" | "app" | "doc";

/**
 * Whole-page ambience in two pseudo-elements: a pair of soft accent lights and
 * a masked blueprint grid. Purely CSS — no DOM nodes per bar, no JS.
 */
export function Backdrop({ variant = "landing" }: { variant?: BackdropVariant }) {
  return <div className="backdrop" data-variant={variant} aria-hidden="true" />;
}
