import { createSignal, createUniqueId } from "solid-js";
import type {
  CreateFieldsetProps,
  CreateFieldsetReturn,
  FieldsetDataAttribute,
  FieldsetIds,
  FieldsetPartAttributes,
} from "./fieldset.types";

/** Chakra's `dataAttr`: present-and-empty when the state is on, absent when it is off. */
function dataAttribute(on: boolean): FieldsetDataAttribute {
  return on ? "" : undefined;
}

/**
 * The `data-scope` / `data-part` pair for one part. The part names are camelCase on the recipe and
 * kebab-case on the element — `helperText` is the slot, `helper-text` is what a `[data-part="…"]`
 * selector matches — which is why the two lists are written out separately.
 */
function partAttributes<Part extends string>(part: Part): FieldsetPartAttributes<Part> {
  return { "data-scope": "fieldset", "data-part": part };
}

/**
 * Starts a fieldset and hands back its ids, its two states and one prop getter per part.
 *
 * **Module-internal, like `createField`.** Chakra re-exports Ark's `useFieldsetContext` but neither
 * `Fieldset.RootProvider` nor `useFieldset`, so a consumer never owns the fieldset themselves —
 * `<Fieldset.Root>` calls this and shares the result through context.
 *
 * There is no machine behind it either: the two states are props, the one ARIA relationship depends
 * on whether its text is rendered, and the rest is an id scheme.
 */
export function createFieldset(props: CreateFieldsetProps = {}): CreateFieldsetReturn {
  // Unconditional, at the top of the body: under the server build this consumes a hydration child
  // id and under the hydrating client build a context id, both off one counter, so moving the call
  // site between the two renders desynchronises every `_hk` after it.
  const generatedId = createUniqueId();

  // What the two texts publish on mount and clear on cleanup, through `createRegisteredId`.
  // Upstream discovers the same two facts by running a `MutationObserver` over the root subtree and
  // calling `getElementById` on every mutation; a descendant telling its ancestor "I am here" needs
  // no DOM search in Solid.
  const [helperTextId, setHelperTextId] = createSignal<string | undefined>(undefined);
  const [errorTextId, setErrorTextId] = createSignal<string | undefined>(undefined);

  const id = () => props.id ?? generatedId;

  // `??` and never `merge`, which resolves a key by presence: a Root forwarding an unset
  // `invalid={props.invalid}` would otherwise win with `undefined` and delete the default.
  const disabled = () => props.disabled ?? false;
  const invalid = () => props.invalid ?? false;

  const ids: FieldsetIds = {
    get legend() {
      return `fieldset::${id()}::legend`;
    },
    get errorText() {
      return `fieldset::${id()}::error-text`;
    },
    get helperText() {
      return `fieldset::${id()}::helper-text`;
    },
  };

  /**
   * Both texts, error first, and only once each has actually mounted — an IDREF pointing at an
   * element that is not there is worse than the attribute's absence. The error text is dropped
   * again when the group is valid, because a valid group naming an error message reads as one that
   * is not.
   */
  const describedBy = (): string | undefined => {
    const named = [invalid() ? errorTextId() : undefined, helperTextId()].filter(
      (value): value is string => value !== undefined,
    );
    return named.length > 0 ? named.join(" ") : undefined;
  };

  return {
    get ids() {
      return ids;
    },
    get disabled() {
      return disabled();
    },
    get invalid() {
      return invalid();
    },
    getRootProps: () => ({
      ...partAttributes("root"),
      disabled: disabled(),
      "data-disabled": dataAttribute(disabled()),
      "data-invalid": dataAttribute(invalid()),
      "aria-labelledby": ids.legend,
      "aria-describedby": describedBy(),
    }),
    getLegendProps: () => ({
      ...partAttributes("legend"),
      id: ids.legend,
      "data-disabled": dataAttribute(disabled()),
      "data-invalid": dataAttribute(invalid()),
    }),
    getHelperTextProps: () => ({
      ...partAttributes("helper-text"),
      id: ids.helperText,
    }),
    getErrorTextProps: () => ({
      ...partAttributes("error-text"),
      id: ids.errorText,
      "aria-live": "polite",
    }),
    registerHelperText: setHelperTextId,
    registerErrorText: setErrorTextId,
  };
}
