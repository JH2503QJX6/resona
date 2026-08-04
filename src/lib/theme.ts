export const THEME_STORAGE_KEY = "resona:theme";

export type Theme = "light" | "dark";

/**
 * Runs before first paint. Reads the stored preference and stamps it on <html>
 * so `color-scheme` — and therefore every light-dark() token — resolves
 * correctly on the very first frame. No stored value means "follow the OS".
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}})()`;

export function resolveTheme(): Theme {
  const stored = document.documentElement.dataset.theme;
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage can be unavailable (private mode); the in-page theme still applies.
  }
}
