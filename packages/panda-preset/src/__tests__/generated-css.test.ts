/**
 * What our preset makes Panda *emit* — read off the generated stylesheet, not off the config.
 *
 * Every assertion here failed silently before it existed: a page renders, nothing errors, and the
 * styling is simply absent. They read the sheet rather than the config because what a config
 * declares and what Panda emits are two different things.
 *
 * `pnpm test:unit` runs `cssgen` first, so the artifacts below are always current.
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const stylesheetPath = join(repoRoot, "packages/styled-system/styled-system/styles.css");
const isValidPropPath = join(
  repoRoot,
  "packages/styled-system/styled-system/jsx/is-valid-prop.mjs",
);

if (!existsSync(stylesheetPath)) {
  throw new Error(
    `The generated stylesheet is missing at ${stylesheetPath}. Run \`pnpm cssgen\` — these tests ` +
      "read what Panda actually emitted, and there is nothing to read yet.",
  );
}

const css = readFileSync(stylesheetPath, "utf8");

describe("the generated stylesheet", () => {
  it("lets `[hidden]` beat a recipe's own `display`", () => {
    // Zag emits `hidden` on parts it considers closed. `[hidden] { display: none }` is only a UA
    // rule, and any explicit `display` beats it — while a slot recipe sets `display` on most slots.
    // Without `!important`, a closed dialog leaves a full-viewport backdrop over the page.
    //
    // The rule may come from Panda's own `preflight: true` or from a `globalCss` line in our
    // preset. This asserts the outcome, so it is correct either way — what it must not do is pass
    // when neither supplies it.
    expect(css).toMatch(/\[hidden\][^{]*\{[^}]*display:\s*none\s*!important/);
  });

  it("keys its semantic colours off the `.light` and `.dark` classes the docs name", () => {
    // The preset gives semantic colours **no base value**: `--chakra-colors-bg-panel` and its ~100
    // siblings are declared only inside `.light { … }` and `.dark { … }`. A page carrying neither
    // class has no colours at all — every semantic token resolves to an undefined custom property
    // and computes to `transparent`, with no error anywhere. So the selector is the whole
    // colour-mode contract, and this library ships no provider, hook or toggle.
    expect(css).toMatch(/\.light\s*\{[^}]*--chakra-colors-/);
    expect(css).toMatch(/\.dark\s*\{[^}]*--chakra-colors-/);

    const scopes = [...css.matchAll(/([^{};\n]+)\{[^}]*--chakra-colors-bg-panel:/g)].map((match) =>
      (match[1] ?? "").trim().split(/\s+/).pop(),
    );
    expect(scopes).toContain(".light");
    expect(scopes).toContain(".dark");
  });

  it("resolves the Switch cursor our one-key delta restores", () => {
    // `@chakra-ui/panda-preset` registers the Switch `cursor` token under the misspelled key
    // `swittch` while its own Switch recipe references `cursor: "switch"`. Panda emits the raw
    // value when a token does not resolve, so upstream emits `cursor: switch` — which no browser
    // parses. `@chakra-ui/react`'s runtime theme spells both `switch` and loses nothing, which
    // makes this a preset defect rather than Chakra behavior, so inheriting it would be a
    // divergence from the thing we are porting. Our preset adds one token key, `cursor.switch`.
    expect(css).toMatch(/--chakra-cursor-switch:/);
    expect(css).not.toMatch(/cursor:\s*switch\s*[;}]/);
  });

  it("compiles Chakra's `currentBg` keyword instead of emitting it verbatim", () => {
    // `currentBg` is a Chakra keyword, not CSS: it means "the background of the nearest ancestor
    // that set one". `@chakra-ui/panda-preset` **uses** it and ships no utility resolving it, so
    // Panda emitted `background: currentBg` and the browser dropped the declaration — measured as
    // `rgba(0, 0, 0, 0)` on a Timeline's outline indicator, against `rgb(255, 255, 255)` on
    // chakra-ui.com, with the separator painting straight through the circles.
    expect(css).not.toMatch(/:\s*currentBg\s*[;}]/);

    // The two recipes in the whole preset that write it, and the reference both now carry.
    expect(css).toMatch(
      /\.timeline__indicator--variant_outline\s*\{[^}]*background:\s*var\(--bg-currentcolor\)/,
    );
    expect(css).toMatch(
      /\.tabs__trigger--variant_outline[^{]*\{[^}]*background:\s*var\(--bg-currentcolor\)/,
    );
  });

  it("publishes `--bg-currentcolor` beside the page background and not on a form control", () => {
    // The other half of the keyword: every ordinary background declaration publishes what it
    // resolved to, custom properties inherit, and `currentBg` reads the nearest published value.
    // Chakra's own `globalCss` puts a background on `html`, which is what the two recipes above
    // ultimately read.
    expect(css).toMatch(/\bhtml\s*\{[^}]*--bg-currentcolor:\s*var\(--chakra-colors-bg\)/);

    // **`transparent` publishes nothing**, and this is the assertion that pins why. Panda's
    // preflight declares `background: transparent` on every form control, and it goes through the
    // same utility — so publishing unconditionally would give a `tabs.trigger`, which is a
    // `button`, its own transparent value instead of the page's. chakra-ui.com emits that reset as
    // plain CSS and never reaches its transform: measured, a bare `<button>` there inherits the
    // page background where ours would have read `transparent`.
    const formControlReset = css.match(/\bbutton,input,optgroup,select,textarea[^{]*\{[^}]*\}/);
    expect(formControlReset?.[0]).toMatch(/background:\s*var\(--chakra-colors-transparent\)/);
    expect(formControlReset?.[0]).not.toMatch(/--bg-currentcolor/);
  });
});

describe("the generated `isCssProperty` vocabulary", () => {
  // Chakra's 95 style-prop shorthands, pinned to the version we port. They live in an Emotion
  // runtime we do not port, and Panda's own utilities cover most but not all of them; the
  // remainder are what `src/alias-utilities.ts` exists to add.
  //
  // A dropped shorthand does not error — it stops being a style prop and starts being a DOM
  // attribute, so `<Box gapX="4">` renders an element with a `gapx="4"` attribute and no column gap.
  const CHAKRA_SHORTHANDS = [
    "bg",
    "bgAttachment",
    "bgBlendMode",
    "bgClip",
    "bgColor",
    "bgGradient",
    "bgImage",
    "bgImg",
    "bgPos",
    "bgRepeat",
    "bgSize",
    "blendMode",
    "borderBottomEndRadius",
    "borderBottomStartRadius",
    "borderEnd",
    "borderEndColor",
    "borderEndRadius",
    "borderEndStyle",
    "borderEndWidth",
    "borderStart",
    "borderStartColor",
    "borderStartRadius",
    "borderStartStyle",
    "borderStartWidth",
    "borderTopEndRadius",
    "borderTopStartRadius",
    "borderX",
    "borderXWidth",
    "borderY",
    "borderYWidth",
    "flexDir",
    "gapX",
    "gapY",
    "h",
    "insetEnd",
    "insetStart",
    "insetX",
    "insetY",
    "listStyleImg",
    "listStylePos",
    "m",
    "marginEnd",
    "marginStart",
    "marginX",
    "marginY",
    "maxH",
    "maxW",
    "mb",
    "me",
    "minH",
    "minW",
    "ml",
    "mr",
    "ms",
    "mt",
    "mx",
    "my",
    "overscroll",
    "overscrollX",
    "overscrollY",
    "p",
    "paddingEnd",
    "paddingStart",
    "paddingX",
    "paddingY",
    "pb",
    "pe",
    "pl",
    "pos",
    "pr",
    "ps",
    "pt",
    "px",
    "py",
    "rounded",
    "roundedBottom",
    "roundedBottomLeft",
    "roundedBottomRight",
    "roundedEnd",
    "roundedEndEnd",
    "roundedEndStart",
    "roundedLeft",
    "roundedRight",
    "roundedStart",
    "roundedStartEnd",
    "roundedStartStart",
    "roundedTop",
    "roundedTopLeft",
    "roundedTopRight",
    "scrollPaddingX",
    "scrollPaddingY",
    "shadow",
    "shadowColor",
    "textDecor",
    "w",
  ];

  it("carries all 95 of Chakra's style-prop shorthands", async () => {
    const { isCssProperty } = (await import(pathToFileURL(isValidPropPath).href)) as {
      isCssProperty: (name: string) => boolean;
    };

    expect(CHAKRA_SHORTHANDS).toHaveLength(95);
    expect(CHAKRA_SHORTHANDS.filter((name) => !isCssProperty(name))).toEqual([]);
  });
});
