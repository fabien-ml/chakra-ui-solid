import { isServer } from "@solidjs/web";
import { createSignal } from "solid-js";

/**
 * The docs app's colour mode.
 *
 * **This is app code today and library API at step 3c**, which is why it is written from the
 * contract rather than from a reference — there is no reference. Chakra ships colour mode as a CLI
 * snippet over `next-themes`, and `next-themes` has no SolidJS equivalent, so porting the
 * composition faithfully would ship a wrapper around nothing.
 *
 * Three things bind it, and the first is the one that makes this a feature rather than a nicety:
 *
 * 1. **The pre-paint script is the product.** `@chakra-ui/panda-preset` gives its ~100 semantic
 *    colour tokens **no base value** — they are declared only inside `.light { … }` and
 *    `.dark { … }` — so a page carrying neither class resolves every one of them to an undefined
 *    custom property and computes `transparent`. Without a blocking script that writes the class
 *    before first paint, the prerendered page has **no colours at all**, not merely the wrong
 *    ones. (`decisions.md` D-113.)
 * 2. **Class strategy only**, because that is what `_dark` compiles to (`.dark &`), measured.
 *    `color-scheme` rides along as an inline `style` attribute on the root — explicitly allowed,
 *    and the reason native controls and scrollbars follow the page instead of staying light
 *    (`plan.md` §0.3).
 * 3. **No provider.** The source of truth is the DOM class plus storage, so a module-level signal
 *    beats a `<ThemeProvider>` that would exist only to re-publish what the document already says.
 *    The hazard that buys is module-level state shared across server requests, so this module is
 *    **write-never on the server** — every write path below is behind `isServer`.
 */
export type ColorMode = "light" | "dark";

const STORAGE_KEY = "chakra-ui-solid-color-mode";

/**
 * A blocking inline `<head>` script, rendered by `__root.tsx`. It runs before the first paint and
 * before any module of ours is evaluated, which is the whole point.
 *
 * It is a **string** rather than a function so nothing about it can depend on module scope: the
 * only things it shares with the code below are the two constants interpolated into it, which is
 * what keeps the key it reads and the key we write from drifting apart.
 *
 * The `catch` is not defensive padding. `localStorage` throws outright in some privacy modes, and
 * an uncaught throw here leaves the document with **no** colour-mode class — the colourless page
 * above, arriving through the one code path that exists to prevent it.
 */
export const colorModePrePaintScript = `(function(){var m;try{var s=localStorage.getItem(${JSON.stringify(
  STORAGE_KEY,
)});m=s==="dark"||s==="light"?s:matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}catch(e){m="light"}var r=document.documentElement;r.classList.remove("light","dark");r.classList.add(m);r.style.colorScheme=m})()`;

/** What the pre-paint script already decided, read back off the document. */
function readFromDocument(): ColorMode {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

// Seeded from the document on the client and from a constant on the server. Reading the document
// is what makes the signal agree with the paint on the very first client render: the pre-paint
// script has already run by the time this module is evaluated, so there is no tick during which
// the signal says one thing and the page shows another.
//
// On the server there is no document, and this module is never written, so the constant is all any
// request ever sees. A prerendered attribute that depends on the mode is therefore rendered light
// and corrected during hydration — Solid re-runs the attribute expression when it claims the node,
// and an attribute is not a paint.
const [colorMode, setColorModeSignal] = createSignal<ColorMode>(
  isServer ? "light" : readFromDocument(),
);

export { colorMode };

/** Paint it, remember it, publish it — in that order, so the page never lags the store. */
export function setColorMode(mode: ColorMode) {
  if (isServer) {
    return;
  }
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(mode);
  root.style.colorScheme = mode;
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Same unavailable-storage case the pre-paint script guards. Persistence is best-effort; the
    // class on the document is not, and it is already written above.
  }
  setColorModeSignal(mode);
}

export function toggleColorMode() {
  setColorMode(colorMode() === "dark" ? "light" : "dark");
}

// Cross-tab sync. The `storage` event fires in every *other* tab of the origin, so two open docs
// tabs cannot disagree about the mode after one of them toggles. Registered at module scope
// because the source of truth is the document rather than a component's lifetime — there is no
// provider to mount it in, and nothing to unmount it from.
if (!isServer) {
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) {
      return;
    }
    setColorMode(event.newValue === "dark" ? "dark" : "light");
  });
}
