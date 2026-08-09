// The `browser` project's stylesheet, and the reason every visual assertion in it can read a
// computed style.
//
// Panda's `css()` only computes class names — it never injects a rule — so without a stylesheet in
// the page every mounted element is unstyled and `getComputedStyle` returns the UA defaults, with
// nothing to say so. `packages/styled-system/styled-system/styles.css` is what `cssgen` writes from
// our own source, and Vite injects it into the test page from this import.
//
// It is imported by **relative path on purpose**. No package here exports a `.css` file and none
// ever will: this library publishes zero CSS, and `check:exports` asserts it. The dev stylesheet is
// a test and Storybook artifact, never a published one (`plan.md` §4.4).
//
// The path is not guarded with an existence check. A missing stylesheet must fail at import — the
// alternative is a green suite asserting against nothing, which is the failure the assertions
// exist to catch. `pnpm test:browser` runs `cssgen` first for this reason.
import "./packages/styled-system/styled-system/styles.css";

// `<html class="light">`, because the preset gives its semantic colour tokens **no base value**:
// `--colors-bg-panel` and its ~100 siblings are declared only inside `.light { … }` and
// `.dark { … }`, so with neither class on an ancestor every semantic colour resolves to an
// undefined custom property and computes to `transparent`.
//
// That is the consumer contract, not a test convenience — a page that ships neither class has no
// colours — so the test page is set up the way a real consumer's page has to be. `check:dark-selector`
// is what asserts the selector itself, and the light/dark cases in the browser suite toggle this
// class rather than relying on it.
document.documentElement.classList.add("light");
