import { useRecipeVariantKeys } from "@chakra-ui-solid/core";
import { type Component, omit } from "solid-js";
import { Group } from "../group";
import type { AvatarGroupProps } from "./avatar.types";
import { AvatarPropsProvider } from "./avatar-root";

/**
 * AvatarGroup — a row of overlapping avatars, each ringed against the page behind it.
 *
 * It is a {@link Group} with the gap closed and a negative inline offset, plus the avatar variants
 * supplied to everything inside it: `<AvatarGroup size="lg">` sizes the whole row, and an avatar
 * that passes `size` itself still wins.
 *
 * **The ring is `Group`'s doing, not this component's**, which is why a plain `<Group>` of avatars
 * gets one too — Chakra's does the same, and its own overflow example is written that way.
 *
 * It is **not** part of the `Avatar` namespace. Chakra exports it standalone, so `<AvatarGroup>` is
 * the only spelling and `<Avatar.Group>` is not one.
 */
export const AvatarGroup: Component<AvatarGroupProps> = (props) => {
  // A named object of **getters**, never an inline `value={{ size: props.size }}`. Written inline,
  // Solid's compiler wraps the literal in a getter of its own and the provider's
  // `untrack(() => Object.keys(props.value))` rebuilds it on every read — the
  // `STRICT_READ_UNTRACKED` diagnostic `mount()` fails on. Passed as an identifier the object is
  // stable, its key set enumerates without reading anything, and each value stays lazy, which is
  // what lets `<AvatarGroup size={size()}>` re-resolve every avatar below when the signal changes.
  const variantProps = {
    get size() {
      return props.size;
    },
    get variant() {
      return props.variant;
    },
    get shape() {
      return props.shape;
    },
    get borderless() {
      return props.borderless;
    },
  };

  // Named, and spread as an identifier. A **call expression** in a JSX spread is wrapped by Solid's
  // compiler in a function, `merge` turns a function source into a memo, and `Group` then reads that
  // memo in its body — the same diagnostic. The keys come off the same `avatar` recipe the Root
  // resolves, so the two files cannot disagree about them; Chakra splits them with
  // `recipe.splitVariantProps(props)`, which destructures eagerly and would stop re-resolving.
  const groupProps = omit(props, ...useRecipeVariantKeys<AvatarGroupProps>("avatar"));

  return (
    <AvatarPropsProvider value={variantProps}>
      {/* Both style props sit **before** the spread, which is Chakra's order and carries Chakra's
          hazard with it: a consumer forwarding an unset `gap={props.gap}` deletes the `0`, because
          a compiled spread merges by presence in either library. They stay JSX attributes rather
          than becoming a `withDefaults` pair because that is what keeps them statically extractable
          — a value inside a plain object literal is not a call site Panda reads, and the rule would
          never be generated (`CLAUDE.md`, *The third hazard*). */}
      <Group gap="0" spaceX="-3" {...groupProps} />
    </AvatarPropsProvider>
  );
};
