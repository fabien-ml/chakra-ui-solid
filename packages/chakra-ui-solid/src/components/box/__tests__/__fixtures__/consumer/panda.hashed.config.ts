import { defineChakraConfig } from "@chakra-ui-solid/panda-preset";

/**
 * The same consumer, with `hash: true` — the one knob whose failure used to be unconstructable only
 * because we forbade it.
 *
 * A hashed run names every class and every CSS variable with a digest of its own config: `p_4`
 * becomes `AxhTk`, `--chakra-spacing-4` becomes `--chakra-hIimNX`. Nothing precompiled anywhere else
 * can guess either, so this sheet and a runtime from any other run have **no name in common** — and
 * a component rendered against the wrong pair does not error, it simply computes classes that match
 * nothing and renders naked.
 *
 * That is why the assertions its tests make are all computed styles. Every one of them is
 * unreachable unless the class names on the element and the rules in this sheet came out of this
 * single Panda run, which is the whole claim: the consumer owns the styled-system, and hands it to
 * us through `<ChakraProvider>`.
 *
 * Everything else is deliberately identical to `panda.config.ts` beside it — same source scanned,
 * same absurd token overrides, same three additions of the consumer's own — so `hash` is the only
 * variable between the two.
 *
 * **Identical is now a requirement rather than a tidiness.** Each run writes a `chakra-system-types.d.ts`
 * that augments `chakra-ui-solid`, and TypeScript merges every augmentation in a program into one
 * interface: two outdirs in one program may declare the same member, but not two *different* types
 * for it. So a utility, a condition or a variant added to one of these files and not the other is a
 * duplicate-declaration error naming a generated file — which is the shape of the real constraint on
 * the plan's "two systems in one app", and the reason this file repeats rather than trims.
 */
export default defineChakraConfig({
  include: ["./src/**/*.tsx", "../../../../*/*.tsx"],
  outdir: "styled-system-hashed",

  hash: true,

  utilities: {
    extend: {
      elevation: {
        className: "elevation",
        values: ["low", "high"],
        transform: (value: string) => ({
          boxShadow: value === "high" ? "0 0 0 8px #00ff00" : "0 0 0 2px #00ff00",
        }),
      },
    },
  },

  conditions: {
    extend: { supportsGrid: "@supports (display: grid)" },
  },

  theme: {
    extend: {
      tokens: {
        spacing: { 4: { value: "99px" } },
        colors: { red: { 500: { value: "#00ff00" } } },
      },
      recipes: {
        button: { variants: { tone: { brand: { background: "red.500" } } } },
      },
    },
  },
});
