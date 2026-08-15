// Carried from hope-ui `main` (1dc059f), `packages/internal-test-utils/src/mount/mount.ts`. Same
// author, MIT — ours, forked on copy (`CLAUDE.md`, *Reference use*).

import { ChakraProvider } from "@chakra-ui-solid/core";
import type { JSX } from "@solidjs/web";
import { render as solidRender } from "@solidjs/web";
import { Errored } from "solid-js";
import { testSystem } from "../system";

export interface MountedComponent {
  container: HTMLElement;
  dispose: () => void;
}

export interface MountedElement<El extends HTMLElement | SVGElement = HTMLElement>
  extends MountedComponent {
  /**
   * The single element the tree rendered — what a styled primitive's computed-style assertion reads.
   *
   * Defaulted to `HTMLElement`, which is what all but one component renders. `Icon` renders an
   * `svg`, and an `svg` is **not** an `HTMLElement`, so its test asks for the other one by name:
   * `mountElement<SVGElement>(…)`. A plain union here instead of the parameter would have cost every
   * existing test its `HTMLElement`, and `getBoundingClientRect` with it.
   */
  element: El;
}

/**
 * The two SolidJS dev diagnostics this codebase has hit for real, and that a *passing* test would
 * otherwise print by the hundred without failing:
 *
 * - `STRICT_READ_UNTRACKED` — a reactive value read outside a tracking scope. This is what catches
 *   the ref race: a primitive that reads a conditionally-rendered element's ref without tracking it
 *   gets `undefined` forever, and Escape or outside-click silently stop working. A deliberate
 *   untracked read is spelled `untrack(...)` and emits nothing, so any warning left is unreviewed.
 * - `REACTIVE_WRITE_IN_OWNED_SCOPE` — a descendant writing a signal owned by an ancestor from its
 *   render body. Solid throws on that, so a test normally fails by itself; it is listed here for the
 *   case where the write happens inside an effect, which Solid catches and merely `console.error`s.
 */
const DIAGNOSTIC_CODES = ["STRICT_READ_UNTRACKED", "REACTIVE_WRITE_IN_OWNED_SCOPE"] as const;

let installCount = 0;
let originalConsole: { warn: typeof console.warn; error: typeof console.error } | undefined;
let recorded: string[] = [];

/** Solid logs diagnostics as a plain string, except an effect's caught throw (an `Error`). */
function diagnosticIn(args: unknown[]): string | undefined {
  for (const arg of args) {
    const message = typeof arg === "string" ? arg : arg instanceof Error ? arg.message : undefined;
    if (message === undefined) {
      continue;
    }
    if (DIAGNOSTIC_CODES.some((code) => message.includes(`[${code}]`))) {
      return message;
    }
  }
  return undefined;
}

/**
 * Records rather than throwing on sight. A throw from inside `console.warn` would land in whatever
 * call stack Solid happens to be in — a component body, an effect flush, an effect *cleanup*. Solid
 * catches an effect's throw and, after a second failure, halts reactivity process-wide, which would
 * poison every later test in the file. `dispose()` is a checkpoint the test owns, outside any flush.
 */
function installConsoleGuard(): void {
  if (installCount++ > 0) {
    return;
  }

  // Stored unbound, and restored unbound. `console.warn.bind(console)` would restore a *different
  // function object* than the one taken, leaving an extra wrapper behind on every install/uninstall
  // cycle — and a test asserting on `console.warn`'s identity, or calling `mockRestore()`, would then
  // be looking at the wrong function.
  const warn = console.warn;
  const error = console.error;
  originalConsole = { warn, error };

  const intercept =
    (forward: (...args: unknown[]) => void) =>
    (...args: unknown[]) => {
      const diagnostic = diagnosticIn(args);
      if (diagnostic !== undefined) {
        // Swallowed, not forwarded: `dispose()` is about to raise it as a test failure carrying the
        // full text, so printing it too would only bury it in the scrollback again — and would keep
        // grepping a run's output for these codes from ever reaching zero.
        recorded.push(diagnostic);
        return;
      }
      // Everything else passes straight through, so a `vi.spyOn(console, "error")` the test itself
      // installed keeps seeing exactly what it spied on.
      forward.call(console, ...args);
    };

  console.warn = intercept(warn);
  console.error = intercept(error);
}

function uninstallConsoleGuard(): void {
  if (--installCount > 0) {
    return;
  }
  if (originalConsole === undefined) {
    return;
  }
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  originalConsole = undefined;
}

function takeRecordedDiagnostics(): string[] {
  const diagnostics = recorded;
  recorded = [];
  return diagnostics;
}

function assertNoDiagnostics(): void {
  const diagnostics = takeRecordedDiagnostics();
  if (diagnostics.length === 0) {
    return;
  }

  const unique = [...new Set(diagnostics)];
  const summary = unique.map((message) => `  - ${message}`).join("\n");
  throw new Error(
    `SolidJS emitted ${diagnostics.length} reactivity diagnostic(s) while this tree was mounted:\n${summary}\n\n` +
      "These are load-bearing, not noise — see `__internal__/internal-test-utils/mount.md`. Fix " +
      "the read/write, or spell a deliberate untracked read as `untrack(...)`.",
  );
}

/**
 * Mounts a Solid component tree into its own container appended to `document.body`, and returns a
 * `dispose()` that unmounts and removes it.
 *
 * The tree is wrapped in a `<ChakraProvider>` carrying the repo's own generated styled-system,
 * because nothing styled renders without one. A test that wants a different system nests its own
 * provider inside — the inner one wins.
 *
 * A throw from the tree still comes back out of this call, so `expect(() => mount(…)).toThrow()`
 * reads the same as ever — the error boundary below is why it takes a detour to get here.
 *
 * `dispose()` **throws** if SolidJS emitted a `STRICT_READ_UNTRACKED` or
 * `REACTIVE_WRITE_IN_OWNED_SCOPE` diagnostic while the tree was mounted. Full rationale in
 * `__internal__/internal-test-utils/mount.md`; it is a gate line in its own right
 * (`testing.md` §1.4, `definition-of-done.md` §1 rule 1.9).
 */
export function mount(ui: () => JSX.Element): MountedComponent {
  // Nothing should be pending here. If something is, an earlier tree emitted a diagnostic and was
  // never disposed — surface it now instead of failing whichever test disposes next.
  assertNoDiagnostics();

  installConsoleGuard();

  let disposeSolid: () => void;
  let caught: { error: unknown } | undefined;
  const container = document.createElement("div");
  document.body.appendChild(container);

  try {
    // The boundary is what keeps ONE deliberate throw from taking the rest of the file with it.
    // Under a provider the tree is built inside a memo, so a component that throws while rendering
    // — `<Table.Row />` with no Root above it, and every other "names the family" test — raises
    // inside the reactive graph. An error that reaches the root queue unhandled makes SolidJS 2.0
    // halt reactivity **process-wide** (`[REACTIVITY_HALTED]`), and every later tree in the same
    // page then renders nothing, with a failure that names the innocent test. A boundary handles
    // it, so nothing halts, and the error is rethrown below where the caller expects it.
    disposeSolid = solidRender(
      () => (
        <Errored
          fallback={(error) => {
            caught = { error: error() };
            return undefined;
          }}
        >
          <ChakraProvider value={testSystem}>{ui()}</ChakraProvider>
        </Errored>
      ),
      container,
    );
  } catch (error) {
    uninstallConsoleGuard();
    container.remove();
    throw error;
  }

  if (caught !== undefined) {
    disposeSolid();
    uninstallConsoleGuard();
    container.remove();
    throw caught.error;
  }

  return {
    container,
    dispose() {
      try {
        disposeSolid();
      } finally {
        container.remove();
        uninstallConsoleGuard();
      }
      assertNoDiagnostics();
      // A throw after the tree mounted — from an effect, or a signal write that re-ran a body —
      // renders the fallback and would otherwise leave a test green against an empty container.
      if (caught !== undefined) {
        throw caught.error;
      }
    },
  };
}

/**
 * {@link mount} for a component that renders exactly one element, with that element resolved.
 *
 * Every styled primitive's test wants the same three lines — mount, reach for
 * `container.firstElementChild`, narrow it to a styleable element — and a test that skipped the
 * narrowing would read `getComputedStyle(null)` and fail somewhere unhelpful.
 */
export function mountElement<El extends HTMLElement | SVGElement = HTMLElement>(
  ui: () => JSX.Element,
): MountedElement<El> {
  const mounted = mount(ui);
  const element = mounted.container.firstElementChild;
  if (!(element instanceof HTMLElement) && !(element instanceof SVGElement)) {
    mounted.dispose();
    throw new Error("expected the tree to render exactly one HTML or SVG element");
  }
  return { ...mounted, element: element as El };
}
