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
 * same absurd token overrides — so `hash` is the only variable between the two.
 */
export default defineChakraConfig({
  include: ["./src/**/*.tsx", "../../../../*/*.tsx"],
  outdir: "styled-system-hashed",

  hash: true,

  theme: {
    extend: {
      tokens: {
        spacing: { 4: { value: "99px" } },
        colors: { red: { 500: { value: "#00ff00" } } },
      },
    },
  },
});
