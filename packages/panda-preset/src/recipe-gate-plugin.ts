import type { Config } from "@pandacss/dev";
import { componentRecipes, exportRecipes } from "./component-recipes";

/**
 * `PandaPlugin` is imported by `@pandacss/dev` but not re-exported from it, and a consumer holding
 * only the peer dependency cannot resolve `@pandacss/types` — so the type is read off `Config`,
 * which is the one type that boundary does export.
 */
type Plugin = NonNullable<Config["plugins"]>[number];
type StaticCssOption = NonNullable<Config["staticCss"]>;
type RecipeRules = NonNullable<StaticCssOption["recipes"]>;
/** `[{ size: ["*"] }]` — the rule list a single recipe carries, once `"*"` is off the table. */
type RecipeRuleList = Exclude<RecipeRules, "*">[string];

type RecipeRegistry = Record<string, { variants?: Record<string, Record<string, unknown>> }>;
type ResolvedTheme = { recipes?: RecipeRegistry; slotRecipes?: RecipeRegistry } | undefined;

/**
 * The two modules whose *named bindings* are component names — the barrel a consumer imports and
 * the package it re-exports. `@chakra-ui-solid/core` has one export and no subpaths.
 */
const BARREL_MODULES = ["chakra-ui-solid", "@chakra-ui-solid/core"];
/** The package whose *subpath* is an entry — its exports map is `"./*"`. */
const SUBPATH_PACKAGE = "chakra-ui-solid";

/**
 * The union of every entry's recipes, and the only place the whole library is named at once.
 *
 * `"."` is the root barrel, so phase 1's generator already computed this union from the import
 * graph — reading it here rather than concatenating the other 63 entries is what keeps a new
 * component out of this file.
 */
const everyRecipe: readonly string[] = componentRecipes["."] ?? [];

/**
 * Every `import`/`export … from "…"` statement, split into its binding clause and its module.
 *
 * `[^;]*?` is what keeps the match inside one statement: lazy, so the engine takes the nearest
 * `from` rather than reaching across an earlier import written without a semicolon.
 *
 * **Comments are not stripped first, and that is deliberate.** A commented-out import is read as
 * real and widens the sheet by one component; a comment-stripper that mis-parses a string
 * containing `//` would *drop* a real import instead, and a recipe missing from the sheet is a
 * component that renders with no styles and no error (`CLAUDE.md`, *silent unstyling*). Only one of
 * those two failure modes is visible, so the scan errs toward the visible one everywhere.
 */
const IMPORT_STATEMENT = /\b(?:import|export)\b([^;]*?)\bfrom\s*["']([^"']+)["']/g;

/**
 * Which recipe bodies the consumer's stylesheet needs, decided by what their source **imports**.
 *
 * Panda generates CSS by scanning source files, and no recipe variant this library emits is ever
 * written in a consumer's source: they write `<Button size="lg">` and never import the generated
 * recipe module, and where a variant comes from a prop (`slots({ size: props.size })`) it is not a
 * literal to find in the first place. The preset used to answer that by declaring `staticCss: ["*"]`
 * on all 75 recipes, which is correct and costs a Button-only app 354 kB of CSS — 43 `.dialog__*`
 * rules in an app that never imports Dialog.
 *
 * An **import specifier** is the one signal that survives everything a component name does not.
 * You cannot render a component without importing it; `import { Button as Btn }` still writes
 * `Button` in the specifier; `<Dialog.Trigger>` needs `Dialog` imported; and a consumer's own
 * wrapper imports at the top of *their* file, which their `include` already scans. That is why this
 * reads specifiers rather than Panda's `jsx` hints, which match a JSX element name and break
 * silently on all four (`plan.md` §1.6).
 *
 * Three lookups, and there is no fourth:
 *
 * - `chakra-ui-solid/<subpath>` → that entry's recipes
 * - `chakra-ui-solid` / `@chakra-ui-solid/core` → each named binding's recipes
 * - nothing found in any parsed file → every recipe, because a scan that found nothing is a broken
 *   `include`, not an empty app
 *
 * A name the manifest does not carry contributes nothing rather than widening: `chakra` and
 * `ButtonProps` are both absent from it, and both really do need no recipe. What keeps that safe is
 * `check:component-recipes`, which regenerates the manifest and fails if the import graph moved.
 */
export function recipeGatePlugin(widenToComponents: readonly string[] = []): Plugin {
  const detectedComponents = new Set<string>();
  const detectedRecipes = new Set<string>();
  const recipesByFile = new Map<string, string[]>();
  const variantDataCache = new Map<string, Array<Record<string, string>>>();

  let theme: ResolvedTheme;
  /** The live `staticCss.recipes` object this plugin installed on the resolved config. */
  let gatedRules: Record<string, RecipeRuleList> | undefined;
  /** The keys of {@link gatedRules} that are the broken-scan fallback and nothing else. */
  let fallbackKeys: string[] = [];
  let sawOurImport = false;
  let lastReport = "";

  function dropFallback() {
    if (fallbackKeys.length === 0) {
      return;
    }
    for (const key of fallbackKeys) {
      delete gatedRules?.[key];
    }
    fallbackKeys = [];
  }

  function variantData(recipeKey: string): Array<Record<string, string>> {
    const cached = variantDataCache.get(recipeKey);
    if (cached) {
      return cached;
    }

    const variants = (theme?.recipes?.[recipeKey] ?? theme?.slotRecipes?.[recipeKey])?.variants;
    // The empty object is the recipe's base plus its `defaultVariants`, which Panda merges into
    // every entry here for free — so listing each pair reproduces `staticCss: ["*"]` exactly.
    const data: Array<Record<string, string>> = [{}];
    for (const [variant, values] of Object.entries(variants ?? {})) {
      for (const value of Object.keys(values ?? {})) {
        data.push({ [variant]: value });
      }
    }

    variantDataCache.set(recipeKey, data);
    return data;
  }

  function scan(content: string): string[] {
    const found = new Set<string>();

    for (const statement of content.matchAll(IMPORT_STATEMENT)) {
      const clause = statement[1] ?? "";
      const module = statement[2] ?? "";
      const subpath = subpathOf(module);
      const isOurs = subpath !== undefined || BARREL_MODULES.includes(module);
      if (!isOurs) {
        continue;
      }

      sawOurImport = true;

      if (subpath !== undefined) {
        // An entry no manifest knows is a stale manifest or a path that will not resolve; widening
        // is the half of that pair whose failure a consumer can see.
        const forEntry = componentRecipes[subpath];
        for (const key of forEntry ?? everyRecipe) {
          found.add(key);
        }
        if (forEntry !== undefined) {
          // The entry name, so a subpath import is one of the components the run reports. It is
          // spelled as the consumer wrote it — `chakra-ui-solid/color-swatch`, not `ColorSwatch`.
          detectedComponents.add(subpath);
        }
        continue;
      }

      const { names, opaque } = bindingsIn(clause);
      // `import * as Chakra` and `export * from` bind one name for the whole barrel, so there is
      // nothing to look up and every component is reachable through it.
      if (opaque) {
        for (const key of everyRecipe) {
          found.add(key);
        }
        continue;
      }
      for (const name of names) {
        if (exportRecipes[name] !== undefined) {
          detectedComponents.add(name);
        }
        for (const key of exportRecipes[name] ?? []) {
          found.add(key);
        }
      }
    }

    for (const key of found) {
      detectedRecipes.add(key);
    }
    return [...found];
  }

  return {
    name: "chakra-ui-solid:recipe-gate",
    hooks: {
      /**
       * The resolved config is where the variant **values** live — the preset's recipes merged with
       * whatever the consumer's `theme.extend` added to them. Reading them off the imported preset
       * instead would generate nothing for a variant value a consumer declared themselves, which is
       * an unstyled component in their own app.
       *
       * It is also where the broken-scan fallback is installed, and the timing is the whole reason
       * it can be: Panda processes `staticCss` **after** every file is parsed, so this object is
       * still writable while the scan is running. Nothing here is a decision yet — the first import
       * found anywhere takes it back out.
       */
      "config:resolved": ({ config }) => {
        theme = config.theme as ResolvedTheme;
        variantDataCache.clear();

        const staticCss = (config.staticCss ?? {}) as StaticCssOption;
        // `"*"` already asks for every recipe at every value, so there is nothing to widen and
        // nothing a fallback could add.
        if (staticCss.recipes === "*") {
          return;
        }

        const rules = { ...(staticCss.recipes ?? {}) } as NonNullable<typeof gatedRules>;
        for (const component of widenToComponents) {
          for (const key of exportRecipes[component] ?? []) {
            rules[key] = ["*"];
          }
        }
        const unrecognized = widenToComponents.filter((name) => exportRecipes[name] === undefined);
        if (unrecognized.length > 0) {
          console.warn(
            `[chakra-ui-solid] \`components: [${unrecognized.map((name) => `"${name}"`).join(", ")}]\` ` +
              "names nothing this library exports, so it widens nothing. It takes component names " +
              'as they are imported — `"Menu"`, not `"menu"` and not a recipe key.',
          );
        }

        fallbackKeys = everyRecipe.filter((key) => rules[key] === undefined);
        for (const key of fallbackKeys) {
          rules[key] = ["*"];
        }

        gatedRules = rules;
        return { ...config, staticCss: { ...staticCss, recipes: rules } };
      },

      /** The only hook that carries a file's text; `parser:after` carries the result to write to. */
      "parser:before": ({ filePath, content }) => {
        const recipeKeys = scan(content);
        if (sawOurImport) {
          dropFallback();
        }
        if (recipeKeys.length > 0) {
          recipesByFile.set(filePath, recipeKeys);
        } else {
          recipesByFile.delete(filePath);
        }
      },

      /**
       * `setRecipe` on this file's own result, which is what makes an edit in watch mode land: the
       * file is re-parsed, so its recipes are re-registered with it. The result is typed optional
       * and really is absent for a file Panda declined to parse; it is also frequently *empty*,
       * which is the case that matters — a consumer file that imports us and writes no style prop
       * of its own extracts nothing, and a recipe set on that empty result still reaches the sheet.
       */
      "parser:after": ({ filePath, result }) => {
        const recipeKeys = recipesByFile.get(filePath);
        if (result === undefined || recipeKeys === undefined) {
          return;
        }
        for (const key of recipeKeys) {
          result.setRecipe(key, { data: variantData(key) });
        }
      },

      /**
       * One line, so the gate is never invisible. This is the last hook of a run, and the only one
       * that can see the whole scan; the CSS is already written, so it reports and returns nothing.
       */
      "cssgen:done": ({ artifact }) => {
        if (artifact !== "styles.css") {
          return;
        }
        const report = sawOurImport
          ? `🐼 chakra-ui-solid  ${count(detectedComponents.size, "component")} → ` +
            `${count(detectedRecipes.size, "recipe")}${listOf(detectedComponents)}`
          : "🐼 chakra-ui-solid  0 components detected — generating all recipes.\n" +
            '   Nothing in `include` imports from "chakra-ui-solid". Check your `include` globs.';

        // Watch mode re-runs this on every rebuild, and the answer is the same until an import
        // changes — which is the only time the line is worth reading again.
        if (report !== lastReport) {
          console.log(report);
          lastReport = report;
        }
      },
    },
  };
}

/** `chakra-ui-solid/button` → `button`; anything else → `undefined`. */
function subpathOf(module: string): string | undefined {
  return module.startsWith(`${SUBPATH_PACKAGE}/`)
    ? module.slice(SUBPATH_PACKAGE.length + 1)
    : undefined;
}

/**
 * The names an import clause binds, and whether it binds anything this cannot name.
 *
 * `opaque` covers `* as Chakra` and `export * from` — one binding for the whole barrel, so every
 * component behind it is reachable and none of them is written down.
 */
function bindingsIn(clause: string): { names: string[]; opaque: boolean } {
  const braced = clause.match(/\{([\s\S]*)\}/);
  const names = (braced?.[1] ?? "")
    .split(",")
    .map(importedName)
    .filter((name) => name.length > 0);

  const outside = clause
    .replace(/\{[\s\S]*\}/, " ")
    .replace(/\btype\b/g, " ")
    .replace(/,/g, " ")
    .trim();

  return { names, opaque: outside.length > 0 };
}

/** `Button as Btn` → `Button`, `type ButtonProps` → `ButtonProps`. The specifier, never the alias. */
function importedName(part: string): string {
  return (
    part
      .trim()
      .replace(/^type\s+/, "")
      .split(/\s+as\s+/)[0]
      ?.trim() ?? ""
  );
}

function count(total: number, noun: string): string {
  return `${total} ${noun}${total === 1 ? "" : "s"}`;
}

/** The detected components, capped — a docs site imports hundreds and the line has to stay one. */
function listOf(components: Set<string>): string {
  if (components.size === 0) {
    return "";
  }
  const sorted = [...components].sort();
  const shown = sorted.slice(0, 10);
  const rest = sorted.length - shown.length;
  return `: ${shown.join(", ")}${rest > 0 ? ` and ${rest} more` : ""}`;
}
