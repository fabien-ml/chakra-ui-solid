import type { Config } from "@pandacss/dev";
import { describe, expect, it, vi } from "vitest";
import { componentRecipes } from "../component-recipes";
import { recipeGatePlugin } from "../recipe-gate-plugin";

/**
 * The four cases `plan.md` §1.6 is right about and the gate has to survive anyway: an alias, a
 * namespaced part, a subpath entry, and a consumer's own wrapper. All four break a `jsx` tracking
 * hint, which matches a component *name*; all four still write the specifier the gate reads.
 *
 * The assertion is which recipes were **set on the parser result**, because that is the whole of
 * what the gate does — everything downstream of it is Panda generating the same rules
 * `staticCss: ["*"]` used to. Whether those rules then reach a stylesheet is asserted by the
 * browser suite, on computed styles.
 */

type Hooks = NonNullable<NonNullable<Config["plugins"]>[number]["hooks"]>;

/** A theme with the two variant shapes the data has to cover: one recipe, one slot recipe. */
const THEME = {
  recipes: {
    button: { variants: { size: { sm: {}, lg: {} }, variant: { solid: {}, ghost: {} } } },
    spinner: { variants: { size: { md: {} } } },
  },
  slotRecipes: {
    dialog: { variants: { size: { md: { content: {} }, cover: { content: {} } } } },
  },
};

function gate(options?: { components?: string[]; staticCss?: Config["staticCss"] }) {
  const hooks = recipeGatePlugin(options?.components).hooks as Hooks;
  const resolved = hooks["config:resolved"]?.({
    config: { theme: THEME, staticCss: options?.staticCss } as never,
  } as never) as Config | undefined;

  const setRecipes: string[] = [];
  const data: Record<string, Array<Record<string, string>>> = {};

  return {
    /** What the config would ask Panda for if no parsed file ever named us. */
    fallback: () => (resolved?.staticCss?.recipes ?? {}) as Record<string, unknown>,
    /** Undefined when the hook left the config alone. */
    resolved,
    parse(content: string, filePath = "/app/src/App.tsx") {
      hooks["parser:before"]?.({ filePath, content } as never);
      hooks["parser:after"]?.({
        filePath,
        result: {
          setRecipe: (name: string, result: { data: Array<Record<string, string>> }) => {
            setRecipes.push(name);
            data[name] = result.data;
          },
        },
      } as never);
      return setRecipes;
    },
    data,
  };
}

describe("the import gate — the four forms a jsx hint cannot see", () => {
  it("reads a namespaced import through the one name it binds", () => {
    const scan = gate();
    expect(scan.parse('import { Dialog } from "chakra-ui-solid";\n<Dialog.Trigger />;')).toEqual([
      "dialog",
    ]);
  });

  it("reads the specifier, never the alias", () => {
    const scan = gate();
    expect(scan.parse('import { Button as Btn } from "chakra-ui-solid";')).toEqual([
      "button",
      "spinner",
    ]);
  });

  it("reads a subpath import as the entry it names", () => {
    const scan = gate();
    expect(scan.parse('import { Button } from "chakra-ui-solid/button";')).toEqual([
      "button",
      "spinner",
    ]);
  });

  it("reads a consumer's wrapper file, where the import is, not the use site", () => {
    const scan = gate();
    scan.parse(
      'import { Button, type ButtonProps } from "chakra-ui-solid";\n' +
        "export const SaveButton = (props: ButtonProps) => <Button {...props} />;",
      "/app/src/save-button.tsx",
    );
    // The file that only uses the wrapper names nothing of ours, and needs nothing added.
    expect(scan.parse('import { SaveButton } from "./save-button";', "/app/src/App.tsx")).toEqual([
      "button",
      "spinner",
    ]);
  });
});

describe("the import gate — what it widens on and what it does not", () => {
  it("widens to everything on a namespace import, which binds one name for the barrel", () => {
    const scan = gate();
    expect(scan.parse('import * as Chakra from "chakra-ui-solid";')).toEqual(
      componentRecipes["."] as string[],
    );
  });

  it("widens to everything on a re-export, for the same reason", () => {
    const scan = gate();
    expect(scan.parse('export * from "chakra-ui-solid";')).toEqual(
      componentRecipes["."] as string[],
    );
  });

  it("adds nothing for a name that reaches no recipe", () => {
    // `chakra` and `ButtonProps` are both absent from the manifest, and both really do need no
    // recipe — a factory call and a type. Absent means nothing, never "unknown, widen".
    const scan = gate();
    expect(scan.parse('import { chakra } from "chakra-ui-solid";')).toEqual([]);
    expect(scan.parse('import type { ButtonProps } from "chakra-ui-solid";')).toEqual([]);
  });

  it("adds nothing for a module that is not ours", () => {
    const scan = gate();
    expect(scan.parse('import { Button } from "some-other-kit";')).toEqual([]);
  });

  it("reads `@chakra-ui-solid/core` the same way as the root barrel", () => {
    const scan = gate();
    expect(scan.parse('import { Button } from "@chakra-ui-solid/core";')).toEqual([
      "button",
      "spinner",
    ]);
  });
});

describe("the import gate — the data it hands Panda", () => {
  it("lists every variant key/value pair, plus the base", () => {
    const scan = gate();
    scan.parse('import { Button } from "chakra-ui-solid";');

    // The empty object is the base: Panda merges `defaultVariants` into every entry itself, which
    // is what makes this list reproduce `staticCss: ["*"]` rather than approximate it.
    expect(scan.data.button).toEqual([
      {},
      { size: "sm" },
      { size: "lg" },
      { variant: "solid" },
      { variant: "ghost" },
    ]);
  });

  it("reads a slot recipe's variants off the resolved theme too", () => {
    const scan = gate();
    scan.parse('import { Dialog } from "chakra-ui-solid";');
    expect(scan.data.dialog).toEqual([{}, { size: "md" }, { size: "cover" }]);
  });
});

describe("the import gate — the broken scan, and the escape hatch", () => {
  it("asks for every recipe until a parsed file names us", () => {
    // A scan that found nothing is a broken `include`, not an empty app — so the config it installs
    // is the full manifest union, and Panda reads that key only after every file is parsed.
    const scan = gate();
    expect(Object.keys(scan.fallback())).toEqual(componentRecipes["."] as string[]);

    scan.parse('import { Button } from "chakra-ui-solid";');
    expect(Object.keys(scan.fallback())).toEqual([]);
  });

  it("keeps a `components` entry when the fallback is withdrawn", () => {
    const scan = gate({ components: ["Dialog"] });
    scan.parse('import { Button } from "chakra-ui-solid";');

    // Only widens: the scan found Button, and Dialog stays because the consumer named it.
    expect(scan.fallback()).toEqual({ dialog: ["*"] });
  });

  it("keeps a consumer's own `staticCss.recipes` entry too", () => {
    const scan = gate({ staticCss: { recipes: { button: [{ size: ["*"] }] } } });
    scan.parse('import { Button } from "chakra-ui-solid";');

    expect(scan.fallback()).toEqual({ button: [{ size: ["*"] }] });
  });

  it("says so when a `components` entry names nothing this library exports", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    gate({ components: ["Menu", "button"] });

    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0]?.[0]).toContain('"Menu", "button"');
    warn.mockRestore();
  });

  it("leaves the config alone when the consumer already asked for every recipe", () => {
    // `staticCss: { recipes: "*" }` is every recipe at every value; there is nothing to fall back
    // to, and nothing the gate could add that `"*"` does not already carry.
    expect(gate({ staticCss: { recipes: "*" } }).resolved).toBeUndefined();
  });
});
