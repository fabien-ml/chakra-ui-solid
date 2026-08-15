import type { RecipeShape } from "../index";
import { badgeShape } from "./badge";
import { buttonShape } from "./button";
import { checkmarkShape } from "./checkmark";
import { codeShape } from "./code";
import { colorSwatchShape } from "./color-swatch";
import { containerShape } from "./container";
import { headingShape } from "./heading";
import { iconShape } from "./icon";
import { inputShape } from "./input";
import { inputAddonShape } from "./input-addon";
import { kbdShape } from "./kbd";
import { linkShape } from "./link";
import { markShape } from "./mark";
import { radiomarkShape } from "./radiomark";
import { separatorShape } from "./separator";
import { skeletonShape } from "./skeleton";
import { skipNavLinkShape } from "./skip-nav-link";
import { spinnerShape } from "./spinner";
import { textareaShape } from "./textarea";

/**
 * The 19 atomic recipes — `button`, `input`, `heading`, … — one file each, named after the
 * vendored body it pins in `chakra/recipes/`, so a Chakra bump lands a changed body and its
 * contract row side by side. What a row means, and why these are typed out rather than read off the
 * loaded preset, is in `../index.ts`.
 *
 * **The key order is upstream's barrel order and is load-bearing** — `preset.ts` and `config.ts`
 * both walk it. `container`, the one key upstream's generator strips, holds the last position here
 * exactly as it does in `chakra/recipes/index.ts`.
 */
export const recipeContract = {
  badge: badgeShape,
  button: buttonShape,
  code: codeShape,
  heading: headingShape,
  input: inputShape,
  inputAddon: inputAddonShape,
  kbd: kbdShape,
  link: linkShape,
  mark: markShape,
  separator: separatorShape,
  skeleton: skeletonShape,
  skipNavLink: skipNavLinkShape,
  spinner: spinnerShape,
  textarea: textareaShape,
  icon: iconShape,
  checkmark: checkmarkShape,
  radiomark: radiomarkShape,
  colorSwatch: colorSwatchShape,
  container: containerShape,
} as const satisfies Record<string, RecipeShape>;
