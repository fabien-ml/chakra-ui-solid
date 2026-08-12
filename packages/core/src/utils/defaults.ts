// Carried from hope-ui `main` (1dc059f), `packages/primitives/src/utils/defaults.ts`. Same author,
// MIT — ours, forked on copy (`CLAUDE.md`, *Reference use*).

import { merge } from "solid-js";

/** `Props`, with every key that has a default made non-optional. */
export type WithDefaults<Props extends object, Defaults extends Partial<Props>> = Omit<
  Props,
  keyof Defaults
> & {
  [K in keyof Defaults & keyof Props]-?: Exclude<Props[K], undefined>;
};

/**
 * Applies default values to a props object, resolving each defaulted key with `??`.
 *
 * The obvious spelling — `merge({ modal: true }, props)` — is wrong under SolidJS 2.0. `merge`
 * resolves a key by *presence*, not by value: a later source wins as soon as it has the key at
 * all, even when the value is `undefined`. So `<Dialog.Root modal={undefined}>` beats the default
 * and renders a non-modal dialog, which is exactly what a wrapper forwarding an unset optional
 * prop (`modal={props.modal}`) produces. Reading `props[key] ?? defaults[key]` instead means only
 * a present, non-nullish value overrides; an explicit `false` or `0` still wins.
 *
 * Defaults are exposed as getters, so reads stay lazy and happen inside whatever reactive scope
 * reads them. A default value of `undefined` is meaningless — omit the key instead.
 */
export function withDefaults<Props extends object, Defaults extends Partial<Props>>(
  props: Props,
  defaults: Defaults,
): WithDefaults<Props, Defaults> {
  const descriptors: PropertyDescriptorMap = {};

  for (const key of Object.keys(defaults)) {
    descriptors[key] = {
      get: () =>
        (props as Record<string, unknown>)[key] ?? (defaults as Record<string, unknown>)[key],
      enumerable: true,
      configurable: true,
    };
  }

  return merge(props, Object.defineProperties({}, descriptors)) as WithDefaults<Props, Defaults>;
}

/**
 * The same resolution for a **props context** — the bag a `PropsProvider` supplies to every
 * component below it, which a local prop overrides.
 *
 * That is a default with a dynamic key set, not a precedence chain, so `merge(context, props)` has
 * the presence bug above: `<Button size={props.size}>` inside a `<ButtonGroup size="sm">` forwards a
 * present `undefined` and the group's size is lost. Chakra resolves the same merge by value
 * (`packages/react/src/merge-props.ts`), so presence here is a divergence too.
 *
 * Separate from {@link withDefaults} only for the return type: `WithDefaults<Props, Partial<Props>>`
 * marks *every* key required and non-nullish, which is right for a literal defaults object and a lie
 * for a context bag, where any key may be absent.
 */
export function withContextDefaults<Props extends object>(
  props: Props,
  context: Partial<Props>,
): Props {
  return withDefaults(props, context) as Props;
}
