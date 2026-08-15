import type { Component } from "solid-js";
import { omit } from "solid-js";
import { Group, type GroupProps } from "../group";
import { type ButtonProps, ButtonPropsProvider, VARIANT_KEYS } from "./button";

export interface ButtonGroupProps extends GroupProps {
  /**
   * The size every {@link Button} below takes, unless it sets its own.
   *
   * @default "md"
   */
  size?: ButtonProps["size"];
  /**
   * The variant every {@link Button} below takes, unless it sets its own.
   *
   * @default "solid"
   */
  variant?: ButtonProps["variant"];
}

/**
 * ButtonGroup — a {@link Group} that also sets `size` and `variant` for every Button inside it.
 *
 * It is the only writer to a props context in the library, and the two halves are independent: the
 * Group lays the row out and collapses the seams when `attached`, while the provider supplies the
 * variants. Chakra splits those variants off with `recipe.splitVariantProps(props)`; that spelling
 * destructures eagerly, so a `size` that changes would stop re-resolving below. The literal
 * `VARIANT_KEYS` tuple is imported from `button.tsx` rather than restated, so the two files cannot
 * disagree about which keys belong to the recipe.
 */
export const ButtonGroup: Component<ButtonGroupProps> = (props) => {
  // A named object of **getters**, never an inline `value={{ size: props.size }}`. Written inline,
  // Solid's compiler wraps the literal in a getter of its own, and the provider's own
  // `untrack(() => Object.keys(props.value))` then rebuilds it on every read — including reads from
  // outside a tracking scope, which is the `STRICT_READ_UNTRACKED` diagnostic `mount()` fails on
  // (measured). Passed as an identifier the object is stable, its key set enumerates without
  // reading anything, and each value stays lazy — which is what lets `<ButtonGroup size={size()}>`
  // re-resolve every Button below when the signal changes.
  const variantProps = {
    get size() {
      return props.size;
    },
    get variant() {
      return props.variant;
    },
  };

  // Named, and spread as an identifier. A **call expression** in a JSX spread is wrapped by Solid's
  // compiler in a function, `merge` turns a function source into a memo, and the receiving
  // component then reads that memo in its body — the `STRICT_READ_UNTRACKED` diagnostic `mount()`
  // fails on (measured). The same reason `Group` and `Loader` name theirs.
  const groupProps = omit(props, ...VARIANT_KEYS);

  return (
    <ButtonPropsProvider value={variantProps}>
      <Group {...groupProps} />
    </ButtonPropsProvider>
  );
};
