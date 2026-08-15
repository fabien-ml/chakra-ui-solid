/**
 * @license
 * Derived from Chakra UI (`@chakra-ui/panda-preset`,
 * `packages/panda-preset/src/recipes/index.ts`).
 * Copyright (c) 2019 Chakra Systems Inc.
 * https://github.com/chakra-ui/chakra-ui
 *
 * Licensed under the MIT License. A copy of the license is distributed with this package
 * as LICENSE, and is available at https://opensource.org/licenses/MIT
 *
 * This file has been modified from the original.
 */

import { containerRecipe } from "../../container-recipe";
import { badgeRecipe } from "./badge";
import { buttonRecipe } from "./button";
import { checkmarkRecipe } from "./checkmark";
import { codeRecipe } from "./code";
import { colorSwatchRecipe } from "./color-swatch";
import { headingRecipe } from "./heading";
import { iconRecipe } from "./icon";
import { inputRecipe } from "./input";
import { inputAddonRecipe } from "./input-addon";
import { kbdRecipe } from "./kbd";
import { linkRecipe } from "./link";
import { markRecipe } from "./mark";
import { radiomarkRecipe } from "./radiomark";
import { separatorRecipe } from "./separator";
import { skeletonRecipe } from "./skeleton";
import { skipNavLinkRecipe } from "./skip-nav-link";
import { spinnerRecipe } from "./spinner";
import { textareaRecipe } from "./textarea";

export const recipes = {
  badge: badgeRecipe,
  button: buttonRecipe,
  code: codeRecipe,
  heading: headingRecipe,
  input: inputRecipe,
  inputAddon: inputAddonRecipe,
  kbd: kbdRecipe,
  link: linkRecipe,
  mark: markRecipe,
  separator: separatorRecipe,
  skeleton: skeletonRecipe,
  skipNavLink: skipNavLinkRecipe,
  spinner: spinnerRecipe,
  textarea: textareaRecipe,
  icon: iconRecipe,
  checkmark: checkmarkRecipe,
  radiomark: radiomarkRecipe,
  colorSwatch: colorSwatchRecipe,

  // The one key upstream's own `scripts/sync.ts` deletes on its way out of `@chakra-ui/react`,
  // because Panda ships a `container` *pattern* and the generated preset would collide with it.
  // Chakra's theme defines the recipe all the same, so the body is reproduced one directory up and
  // registered here — last, which is where it already sat once `theme.extend` had appended it.
  container: containerRecipe,
};
