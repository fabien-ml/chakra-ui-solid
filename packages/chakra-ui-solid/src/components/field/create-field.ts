import { type Accessor, createSignal, createUniqueId } from "solid-js";
import { useOptionalFieldsetContext } from "../fieldset/fieldset-context";
import type {
  CreateFieldProps,
  CreateFieldReturn,
  FieldControlAttributes,
  FieldDataAttribute,
  FieldIds,
  FieldItemIds,
  FieldItemOverrides,
  FieldPartAttributes,
} from "./field.types";

/** Chakra's `dataAttr`: present-and-empty when the state is on, absent when it is off. */
function dataAttribute(on: boolean): FieldDataAttribute {
  return on ? "" : undefined;
}

/**
 * The `data-scope` / `data-part` pair for one part.
 *
 * The part **names** are camelCase and the attribute **values** are kebab-case, and the two are not
 * interchangeable: `helperText` is the slot key the recipe carries, `helper-text` is what the
 * element wears and what a `[data-part="…"]` selector matches. Zag's `createAnatomy` does the same
 * conversion for every machine component; this one has no machine, so it is written out.
 */
function partAttributes<Part extends string>(part: Part): FieldPartAttributes<Part> {
  return { "data-scope": "field", "data-part": part };
}

/**
 * Starts a field and hands back its ids, its state and one prop getter per part.
 *
 * **Module-internal, and deliberately.** Upstream ships no `Field.RootProvider` and exports no
 * `useField`, so a consumer never owns the field themselves — `<Field.Root>` calls this and shares
 * the result through context. Every other multi-part component here exports its `create…` because
 * upstream exports the hook behind it; this one does not, because upstream does not.
 *
 * It is also the first multi-part component in this library with **no Zag machine** behind it.
 * There is nothing to transition: the four states are props, the two ARIA relationships depend on
 * whether their text is rendered, and the rest is an id scheme. So this is plain signals and
 * getters where a machine component is `useMachine` + `connect`.
 */
export function createField(props: CreateFieldProps = {}): CreateFieldReturn {
  // Called unconditionally, at the top of the body, and never behind a `??` or inside a memo. Under
  // the server build `createUniqueId()` consumes a hydration child id and under the hydrating client
  // build it consumes a context id, both off one counter — so moving the call site between the two
  // renders desynchronises every `_hk` after it, and the tree hydrates against the wrong nodes with
  // no error.
  const generatedId = createUniqueId();

  // The surrounding `<Fieldset.Root disabled>`, if there is one. Read through the **non-strict**
  // reader: a field outside any fieldset is the ordinary case, not an error.
  const fieldset = useOptionalFieldsetContext();

  // What the two texts publish on mount and clear on cleanup, through `createRegisteredId`.
  // Upstream discovers the same two facts by running a `MutationObserver` over the root subtree and
  // calling `getElementById` on every mutation; a descendant telling its ancestor "I am here" needs
  // no DOM search in Solid, and the registration is the whole of it.
  //
  // Neither runs on the server — `onSettled` does not, and React's `useState(false)` plus a layout
  // effect does not either — so neither side emits `aria-describedby` in server markup. The two
  // agree, which is what hydration needs.
  const [helperTextId, setHelperTextId] = createSignal<string | undefined>(undefined);
  const [errorTextId, setErrorTextId] = createSignal<string | undefined>(undefined);

  const id = () => props.id ?? generatedId;

  // `??` and never `merge`, which resolves a key by presence: a Root forwarding an unset
  // `invalid={props.invalid}` would otherwise win with `undefined` and delete the default.
  // The fieldset's `disabled` is a **default**, not an override: the field's own prop still wins,
  // so a `<Field.Root disabled={false}>` inside a disabled fieldset is live — which is upstream's
  // resolution (`disabled = Boolean(fieldset?.disabled)` as the destructuring default) and the
  // reason the read is `??` rather than `||`. It is a getter over the fieldset's own getter, so a
  // group that is disabled after mount disables the fields under it.
  const disabled = () => props.disabled ?? Boolean(fieldset?.disabled);
  const invalid = () => props.invalid ?? false;
  const readOnly = () => props.readOnly ?? false;
  const required = () => props.required ?? false;

  const ids: FieldIds = {
    get root() {
      return props.ids?.root ?? `field::${id()}`;
    },
    get control() {
      return props.ids?.control ?? id();
    },
    get label() {
      return props.ids?.label ?? `field::${id()}::label`;
    },
    get errorText() {
      return props.ids?.errorText ?? `field::${id()}::error-text`;
    },
    get helperText() {
      return props.ids?.helperText ?? `field::${id()}::helper-text`;
    },
  };

  const itemIds = (value: string): FieldItemIds => {
    const control = `field::${ids.control}::item::${value}`;
    return { control, label: `${control}::label` };
  };

  const getControlProps = (): FieldControlAttributes => ({
    id: ids.control,
    required: required(),
    disabled: disabled(),
    readonly: readOnly(),
    "aria-invalid": invalid() ? "true" : undefined,
    // Only once the text is actually on the page. Emitting it from the first render would point an
    // IDREF at an element that may never exist, which is worse than the attribute's absence.
    "aria-describedby": helperTextId(),
    // Both conditions, because an error text is routinely rendered under a `Show` that is already
    // false, and a valid field naming an error message reads as one that is not.
    "aria-errormessage": invalid() ? errorTextId() : undefined,
    "data-invalid": dataAttribute(invalid()),
    "data-required": dataAttribute(required()),
    "data-readonly": dataAttribute(readOnly()),
  });

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
    get readOnly() {
      return readOnly();
    },
    get required() {
      return required();
    },
    getRootProps: () => ({
      ...partAttributes("root"),
      id: ids.root,
      role: "group",
      "data-disabled": dataAttribute(disabled()),
      "data-invalid": dataAttribute(invalid()),
      "data-readonly": dataAttribute(readOnly()),
    }),
    getLabelProps: () => ({
      ...partAttributes("label"),
      id: ids.label,
      // A field whose label heads a set of controls points it at the named item instead, since a
      // `for` can only ever name one element.
      for: props.target === undefined ? ids.control : itemIds(props.target).control,
      "data-disabled": dataAttribute(disabled()),
      "data-invalid": dataAttribute(invalid()),
      "data-readonly": dataAttribute(readOnly()),
      "data-required": dataAttribute(required()),
    }),
    getControlProps,
    getInputProps: () => ({ ...getControlProps(), ...partAttributes("input") }),
    getTextareaProps: () => ({ ...getControlProps(), ...partAttributes("textarea") }),
    getSelectProps: () => ({ ...getControlProps(), ...partAttributes("select") }),
    getHelperTextProps: () => ({
      ...partAttributes("helper-text"),
      id: ids.helperText,
      "data-disabled": dataAttribute(disabled()),
    }),
    getErrorTextProps: () => ({
      ...partAttributes("error-text"),
      id: ids.errorText,
      "aria-live": "polite",
    }),
    // **No `data-scope` / `data-part` here, and that is upstream's own surface.** Every other part
    // takes its attributes from Ark's component; this is the one Chakra hand-writes as a plain
    // `chakra.span`, so Ark's pair never reaches the DOM there. Parity is what a consumer observes.
    getRequiredIndicatorProps: () => ({ "aria-hidden": "true" }),
    getItemIds: itemIds,
    registerHelperText: setHelperTextId,
    registerErrorText: setErrorTextId,
  };
}

/**
 * The members a `<Field.Item value="…">` replaces on the field it inherits: its own control id, its
 * own label id, and a label that points at that control rather than at the Root's.
 *
 * Layered with `merge(field, deriveFieldItem(field, () => props.value))` rather than spread into a
 * new object — the field is getters over live signals, and a spread would read every one of them
 * once and freeze the Item's context at whatever the state was when it mounted.
 */
export function deriveFieldItem(
  field: CreateFieldReturn,
  value: Accessor<string>,
): FieldItemOverrides {
  const ids: FieldIds = {
    get root() {
      return field.ids.root;
    },
    get control() {
      return field.getItemIds(value()).control;
    },
    get label() {
      return field.getItemIds(value()).label;
    },
    get errorText() {
      return field.ids.errorText;
    },
    get helperText() {
      return field.ids.helperText;
    },
  };

  const getControlProps = (): FieldControlAttributes => ({
    ...field.getControlProps(),
    id: ids.control,
  });

  return {
    get ids() {
      return ids;
    },
    getLabelProps: () => ({
      ...field.getLabelProps(),
      id: ids.label,
      for: ids.control,
    }),
    getControlProps,
    getInputProps: () => ({ ...getControlProps(), ...partAttributes("input") }),
    getTextareaProps: () => ({ ...getControlProps(), ...partAttributes("textarea") }),
    getSelectProps: () => ({ ...getControlProps(), ...partAttributes("select") }),
  };
}
