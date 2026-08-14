import { mount } from "@chakra-ui-solid/internal-test-utils";
import type { Component } from "solid-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
// The docs app's **own** generated stylesheet — the one the site ships, produced by its own Panda
// run over its own source. Without it every example mounts unstyled, which is indistinguishable
// from a Panda class whose CSS was never generated.
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
 *   4. it logs no console error
 *
 * `mount()` adds a fifth for free: a Solid reactivity diagnostic (`STRICT_READ_UNTRACKED`,
 * `REACTIVE_WRITE_IN_OWNED_SCOPE`) fails the test at `dispose()`.
 *
 * **No axe here, and that is scoped to this suite deliberately.** The components themselves are
 * audited where they are built — `packages/core` and `packages/chakra-ui-solid` still run
 * `expectNoA11yViolations`, and that is where an accessibility defect of *ours* would live. What
 * these files hold is the React version's example content, ported 1:1, so a finding here is
 * upstream's design decision arriving intact: `variant="solid"` on `green` is white on a 600 step,
 * 3.30:1 against AA's 4.5 and Lc 65 against APCA's body-text floor, and no palette in the set
 * clears APCA at 12px anyway. The port rule leaves us nothing to do with that but diverge from the
 * content we are copying, so the check was only ever able to produce friction here.
 */
// One directory per component, and the negation is load-bearing: this file sits in a sibling
// directory that `../*/*.tsx` matches, so without it the suite eagerly imports itself and asserts
// that a test module has a default export.
const exampleModules = import.meta.glob<{ default: Component }>(
  ["../*/*.tsx", "!../__tests__/**"],
  { eager: true },
);

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
    it(`${name} mounts and renders`, () => {
      expect(typeof module.default).toBe("function");

      const mounted = mount(() => module.default({}));
      try {
        expect(mounted.container.innerHTML.trim()).not.toBe("");
        expect(consoleError).not.toHaveBeenCalled();
      } finally {
        mounted.dispose();
      }
    });
  }
});
