import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import postcss, { type AtRule, type ChildNode, type Node, type Root } from "postcss";

/**
 * Reads declarations back out of the **generated** stylesheet, for the `ssr` project — the one
 * place a style assertion has to be made without a DOM.
 *
 * Why this exists rather than an assertion on the class name: under Panda, `css()` only computes a
 * class string and never injects a rule, so a class whose CSS was never generated renders nothing
 * and raises no error. `expect(html).toContain("p_4")` therefore passes on a completely unstyled
 * element. Resolving the class through the sheet asks the question that matters — *what does this
 * element actually get?* — which is the same question `getComputedStyle` asks in the browser
 * project (`testing.md` §2).
 *
 * It is not a CSS engine: it reads the declarations a rule carries, and it does not resolve the
 * cascade, custom properties, or shorthand expansion. The browser project is where those are real.
 */

const require = createRequire(import.meta.url);

/** `@chakra-ui-solid/styled-system`'s generated stylesheet, resolved through the package rather than by a relative path that breaks when a test moves. */
function stylesheetPath(): string {
  const packageRoot = dirname(require.resolve("@chakra-ui-solid/styled-system/package.json"));
  return join(packageRoot, "styled-system", "styles.css");
}

let parsed: Root | undefined;

function stylesheet(): Root {
  if (parsed !== undefined) {
    return parsed;
  }

  const path = stylesheetPath();
  if (!existsSync(path)) {
    throw new Error(
      `The generated stylesheet is missing at ${path}.\n\n` +
        "Run `pnpm cssgen` first. Without it every style assertion in this project would be " +
        "asserting against nothing — which is the exact failure the assertion exists to catch.",
    );
  }

  parsed = postcss.parse(readFileSync(path, "utf8"));
  return parsed;
}

/** Panda escapes `.`, `{`, `}` and friends in a class selector; comparisons are made unescaped. */
function unescapeSelector(selector: string): string {
  return selector.replace(/\\/g, "");
}

/** `@layer` wraps almost everything Panda emits and imposes no condition; a `@media` or `@supports` ancestor does. */
function isConditional(node: ChildNode): boolean {
  let ancestor: Node | undefined = node.parent;
  while (ancestor !== undefined) {
    if (ancestor.type === "atrule" && (ancestor as AtRule).name !== "layer") {
      return true;
    }
    ancestor = ancestor.parent;
  }
  return false;
}

/**
 * Every declaration the generated stylesheet applies to `.<className>` unconditionally — no
 * `@media`, no `@supports`. Returns `{}` when the class has no rule at all, which is the failure
 * worth reporting.
 */
export function declarationsForClass(className: string): Record<string, string> {
  const wanted = `.${className}`;
  const declarations: Record<string, string> = {};

  stylesheet().walkRules((rule) => {
    if (isConditional(rule)) {
      return;
    }
    const matches = rule.selectors.some((selector) => unescapeSelector(selector) === wanted);
    if (!matches) {
      return;
    }
    rule.walkDecls((declaration) => {
      declarations[declaration.prop] = declaration.value;
    });
  });

  return declarations;
}

/**
 * The union of every unconditional declaration a whitespace-separated class string resolves to.
 *
 * The order of the classes in the string is **not** the cascade — Panda's cascade is the order of
 * the rules in the sheet — so this is a coarse answer, and precise cascade questions belong in the
 * browser project where the engine answers them.
 */
export function declarationsForClassList(classList: string): Record<string, string> {
  return classList
    .split(/\s+/)
    .filter(Boolean)
    .reduce<Record<string, string>>(
      (all, className) => Object.assign(all, declarationsForClass(className)),
      {},
    );
}
