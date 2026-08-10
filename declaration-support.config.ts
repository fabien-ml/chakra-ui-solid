/**
 * The register of declarations `check:declaration-support` is allowed to find in the generated
 * stylesheets and not fail on — one row per emitted declaration, each with the reason it exists and
 * what deletes it (`testing.md` §8.4).
 *
 * **A row is not a repair.** Every entry below is a declaration a browser will not parse, so the
 * property it was meant to set is absent at render time. What a row records is that the declaration
 * is **not ours to fix**: it comes from Panda's own preflight or from a recipe body inside
 * `@chakra-ui/panda-preset`, which `CLAUDE.md` says we depend on and never vendor. Nothing is filed
 * and nobody is contacted — this is an independent port (`decisions.md` **D-110**).
 *
 * **Scoping is per selector, not per row.** One upstream mistake reaches several recipes —
 * `transitionDuration: "normal"` is in four of them — and a preset bump repairs recipes one at a
 * time. Each `selectors` entry is matched separately, and an entry that matches nothing fails the
 * check on its own.
 *
 * **A row that stops matching fails the check.** The preset is a version we upgrade; when a bump
 * repairs one of these, the entry is deleted in the same commit. That is the only arrangement in
 * which anyone notices a fix, and it is `context-budget.config.ts`'s `stale-allowance` rule one
 * register over.
 *
 * **What must not be added:** a row for a declaration our own source produced. A style prop whose
 * value does not resolve is the failure this check exists for, and an allowance for it is the check
 * deleted with extra steps. The repair is the value.
 *
 * `DeclarationAllowance` below is documentation rather than enforcement: the root `tsconfig.json`
 * sets `"files": []`, so no `tsc` pass in this repo reads a root config file. The check validates
 * every row's shape at runtime.
 */

export interface DeclarationAllowance {
  /** The property exactly as the stylesheet spells it. */
  property: string;
  /** The value exactly as the stylesheet spells it, `!important` stripped and spaces collapsed. */
  value: string;
  /**
   * Substrings of the selectors this declaration is forgiven under — one per emitting rule. They
   * scope the allowance: `background: currentBg` is forgiven inside two upstream recipes and
   * nowhere else.
   */
  selectors: string[];
  /** Why the declaration is there, and why it is not ours to repair. */
  reason: string;
  /** What has to become true for the row to be deleted. */
  expiresWhen: string;
}

export const declarationAllowances: DeclarationAllowance[] = [
  {
    property: "-moz-osx-font-smoothing",
    value: "grayscale",
    selectors: ["html"],
    reason:
      "Panda's own preflight, aimed at Firefox on macOS. Chromium has never implemented the " +
      "property, so the oracle rejects a declaration that is correct for the engine it targets",
    expiresWhen: "Panda's preflight stops emitting it — re-derived on each Panda minor",
  },
  {
    property: "-moz-tab-size",
    value: "4",
    selectors: ["html"],
    reason:
      "Panda's preflight again, paired with the standard `tab-size` on the same rule. The prefixed " +
      "half is for Firefox and the unprefixed half is what Chromium reads",
    expiresWhen: "Panda's preflight stops emitting it — re-derived on each Panda minor",
  },
  {
    property: "-webkit-overflow-scrolling",
    value: "touch",
    selectors: [".scroll-area__viewport"],
    reason:
      "`@chakra-ui/panda-preset`'s ScrollArea recipe. The property was iOS Safari's momentum-scroll " +
      "switch and is obsolete — Chromium never shipped it, and modern WebKit ignores it",
    expiresWhen: "the preset's `scroll-area` recipe drops it — re-derived on each preset bump",
  },
  {
    property: "-webkit-backdrop-filter",
    value: "blur(2px)",
    selectors: ["bkdp_blur"],
    reason:
      "Panda's `backdropFilter` utility emits the WebKit alias and the standard property as a pair, " +
      "and the standard half — `backdrop-filter: blur(2px)`, on the same rule — is accepted, so " +
      "nothing is lost here. The prefixed half is for the Safari versions that shipped only the " +
      "alias, which is the same shape as the two `-moz-` rows above rather than a value of ours " +
      "that fails to resolve",
    expiresWhen: "Panda stops pairing the alias, or the docs example that uses it goes",
  },
  {
    property: "transition-duration",
    value: "normal",
    selectors: [".editable__input", ".tags-input__control", ".tree-view__branchIndicator"],
    reason:
      'the preset writes `transitionDuration: "normal"` while its own `durations` scale registers ' +
      "`fastest` … `slowest` and no `normal`. Panda emits the unresolved token name verbatim — the " +
      "same silent degradation `check:preset-token-resolution` measured for `cursor`, at a key our " +
      "preset does not patch",
    expiresWhen: "the preset registers `durations.normal`, or stops referencing it",
  },
  {
    property: "transition-timing-function",
    value: "default",
    selectors: [".tree-view__branchIndicator"],
    reason:
      "the same shape one scale over: the preset references an `easings` token named `default` and " +
      "registers `ease-in`, `ease-out`, `ease-in-out`, `ease-in-smooth`",
    expiresWhen: "the preset registers `easings.default`, or stops referencing it",
  },
  {
    property: "font-feature-settings",
    value: "pnum",
    selectors: [".number-input__valueText", ".stat__valueText"],
    reason:
      'the property takes quoted OpenType feature tags — `"pnum"` — and the preset writes the tag ' +
      "bare in both recipes. Proportional numerals are simply not applied",
    expiresWhen: "the preset quotes the tag",
  },
  {
    property: "background",
    value: "currentBg",
    selectors: [".tabs__trigger--variant_outline", ".timeline__indicator--variant_outline"],
    reason:
      "`currentBg` is a Chakra runtime-theme value with no Panda token behind it. It is neither a " +
      "colour nor a token reference, so the selected tab keeps whatever background it already had",
    expiresWhen: "the preset resolves it to a token or a colour",
  },
  {
    property: "not-last",
    value: "var(--line-offset)",
    selectors: [".tabs__trigger--variant_outline"],
    reason:
      "not a CSS property at all. The preset's Tabs recipe writes `marginEnd: { _notLast: … }`, and " +
      "`_notLast` is not one of the conditions this config's Panda knows — an unknown condition key " +
      "is emitted as a kebab-cased property, and the `margin-inline-end` it was guarding is lost. " +
      "The sheet carries no `:not(:last-child)` rule anywhere, which is how it was found",
    expiresWhen:
      "the preset stops using `_notLast`, or a preset in the chain declares it as a condition",
  },
];
