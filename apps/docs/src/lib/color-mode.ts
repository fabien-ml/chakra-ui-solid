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
 *    ones. (`decisions-ledger.md` D-113.)
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

/**
 * What the OS asks for — the pre-paint script's own fallback, and what a *cleared* preference goes
 * back to.
 */
function preferredColorMode(): ColorMode {
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// Seeded from the constant the **server** renders, on both sides — never from the document, even
// on the client where the document is right there.
//
// Reading it here is the obvious form and it is the bug it looks like the fix for. Solid trusts the
// markup it hydrates: claiming a node subscribes an attribute expression without re-applying it, so
// a prerendered attribute is only ever corrected by a later *change*. Seed this to what the page
// already says and there is no change left to make — the toggle keeps the light-mode wording of its
// `aria-label` under a dark document until the first click, which is the one thing this signal has
// to get right. So both sides start at the server's guess and {@link syncColorMode} publishes the
// real one once the tree is mounted.
//
// On the server there is no document and this module is never written, so the constant is all any
// request ever sees.
const [colorMode, setColorModeSignal] = createSignal<ColorMode>("light");

export { colorMode };

/** Paint it and publish it: the half of a mode change that is not persistence. */
function applyColorMode(mode: ColorMode) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(mode);
  root.style.colorScheme = mode;
  setColorModeSignal(mode);
}

/** Paint it, remember it, publish it — in that order, so the page never lags the store. */
export function setColorMode(mode: ColorMode) {
  if (isServer) {
    return;
  }
  applyColorMode(mode);
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Same unavailable-storage case the pre-paint script guards. Persistence is best-effort; the
    // class on the document is not, and it is already written above.
  }
}

export function toggleColorMode() {
  setColorMode(colorMode() === "dark" ? "light" : "dark");
}

/**
 * Publish what the pre-paint script decided, as a change rather than as a seed.
 *
 * Called from `__root.tsx` on mount, which is the earliest point a write reaches an attribute the
 * server already rendered — see the seed above for why the write has to happen at all. It never
 * persists: following `prefers-color-scheme` is not the same as choosing a mode, and writing it
 * down here would pin the first visit's OS setting forever.
 */
export function syncColorMode() {
  if (isServer) {
    return;
  }
  setColorModeSignal(readFromDocument());
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
    // A **removed** key is the preference being cleared, not a choice of light — this tab goes back
    // under `prefers-color-scheme`, the way a first visit does. Reading it as light was a loop as
    // well as a wrong answer: `setColorMode` persists, so one tab clearing the key had every other
    // tab write `"light"` straight back, and the clear became a preference nobody expressed.
    //
    // `applyColorMode` rather than `setColorMode` for the same reason. The tab that made the change
    // has already stored it; a second write here only races the first.
    applyColorMode(
      event.newValue === "dark" || event.newValue === "light"
        ? event.newValue
        : preferredColorMode(),
    );
  });
}
