import { expectNoA11yViolations, mount } from "@chakra-ui-solid/internal-test-utils";
import type { Component } from "solid-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
// The docs app's **own** generated stylesheet — the one the site ships, produced by its own Panda
// run over its own source. Without it every example mounts unstyled, and axe's colour-contrast
// rule has nothing to resolve, so it reports `incomplete` on markup that is actually fine.
import "../../../styled-system/styles.css";

/**
 * Every docs example mounts.
 *
 * This is the test that inherited `prior-art.md` §8.1's fourth rule — *a deliverable verified by a
 * file-existence check is verified in name only*. Its origin is ZagListbox: stories that were
 * written, typechecked, linted and committed, every one of which crashed, because nobody opened
 * them. **The rule stands and its subject moved** (`decisions-ledger.md` D-133): a story renders a
 * component in a harness we control, and an example renders it the way a consumer writes it.
 *
 * Four assertions per example, and the middle two are the ones a typecheck cannot make:
 *
 *   1. the module has a default export that is a component
 *   2. it mounts without throwing
 *   3. it renders something — a non-empty root
 *   4. it logs no console error, and passes axe
 *
 * `mount()` adds a fifth for free: a Solid reactivity diagnostic (`STRICT_READ_UNTRACKED`,
 * `REACTIVE_WRITE_IN_OWNED_SCOPE`) fails the test at `dispose()`.
 */
const exampleModules = import.meta.glob<{ default: Component }>("../*.tsx", { eager: true });

/**
 * The axe rules that are *undecidable* in a particular example rather than passing in it — named
 * per example, with the reason, which is what `expectNoA11yViolations` asks for instead of
 * silencing a category. A violation is never allowed here; only an `incomplete`.
 *
 * - `color-contrast` on the two overlay examples: their subject is content deliberately covered by
 *   a translucent layer, so axe reports `bgOverlap` and cannot compute a ratio at all.
 * - `frame-tested` on the two embeds: axe cannot enter a cross-origin frame, and what is inside
 *   YouTube's and Google's iframes is not ours to fix.
 * - `color-contrast` on every {@link LABELLED_DECORATIVE_BOXES} example — see below.
 */

/**
 * The examples whose `DecorativeBox` carries a label rather than standing empty.
 *
 * A `DecorativeBox` paints a hatched SVG behind its text, and axe will not sample a backdrop it
 * cannot rasterize: `background-image` makes the check report `bgImage` and decline, whatever the
 * image actually is. The ratio here is `fg` on `bg.emphasized` — the hatch is a 0.2-alpha wash over
 * it — so the answer is decidable by a human and only by a human. The empty ones hold no text and
 * so are not asked the question.
 *
 * Adding a decorated example with a label means adding it here; that is the intended cost of a
 * per-example allowance over a silenced rule.
 */
const LABELLED_DECORATIVE_BOXES = [
  "aspect-ratio-responsive",
  "bleed-basic",
  "bleed-vertical",
  "bleed-with-direction",
  "container-basic",
  "container-with-fluid",
  "container-with-sizes",
  "flex-with-justify",
  "flex-with-order",
  "grid-spanning-columns",
  "group-basic",
  "simple-grid-with-col-span",
];

const ALLOWED_INCOMPLETE: Record<string, readonly string[]> = {
  "absolute-center-with-overlay": ["color-contrast"],
  "aspect-ratio-with-video": ["frame-tested"],
  "aspect-ratio-with-map": ["frame-tested"],
  "spinner-with-overlay": ["color-contrast"],
  ...Object.fromEntries(LABELLED_DECORATIVE_BOXES.map((name) => [name, ["color-contrast"]])),
};

const examples = Object.entries(exampleModules)
  .map(([key, module]) => ({ name: key.replace("../", "").replace(/\.tsx$/, ""), module }))
  .sort((a, b) => a.name.localeCompare(b.name));

describe("docs examples", () => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // `mount()`'s own guard swallows Solid's two diagnostics and re-raises them at `dispose()`;
    // this catches everything else — a failed fetch, a thrown effect Solid logged rather than
    // rethrew, a dev warning from a dependency. An example that logs an error is an example a
    // reader will copy into an app that then logs it too.
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it("finds at least one example to mount", () => {
    // A glob that matched nothing would make every assertion below vacuous, and a suite of zero
    // passing cases looks exactly like a suite of many.
    expect(examples.length).toBeGreaterThan(0);
  });

  for (const { name, module } of examples) {
    it(`${name} mounts, renders and is accessible`, async () => {
      expect(typeof module.default).toBe("function");

      const mounted = mount(() => module.default({}));
      try {
        expect(mounted.container.innerHTML.trim()).not.toBe("");
        expect(consoleError).not.toHaveBeenCalled();
        await expectNoA11yViolations(mounted.container, {
          allowIncomplete: ALLOWED_INCOMPLETE[name],
        });
      } finally {
        mounted.dispose();
      }
    });
  }
});
