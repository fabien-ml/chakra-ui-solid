import {
  createMachineStore,
  mergeProps,
  normalizeProps,
  useEnvironmentContext,
  useLocaleContext,
  useMachine,
} from "@chakra-ui-solid/core";
import * as checkbox from "@zag-js/checkbox";
import { createMemo, createUniqueId } from "solid-js";
import { useOptionalFieldContext } from "../field/field-context";
import type { CreateCheckboxProps, CreateCheckboxReturn } from "./checkbox.types";
import { useCheckboxGroupContext } from "./checkbox-context";

/**
 * Starts the `@zag-js/checkbox` machine and hands back its connected API.
 *
 * Call it to own the machine yourself and drive a `<Checkbox.RootProvider value={…}>` from outside;
 * `<Checkbox.Root>` calls it for you and is the shorter way to the same thing.
 *
 * ```tsx
 * const terms = createCheckbox();
 * <button onClick={() => terms.setChecked(true)}>Accept</button>
 * <Checkbox.RootProvider value={terms}>…</Checkbox.RootProvider>
 * ```
 *
 * **It adopts what surrounds it**, which is the whole reason a checkbox composes: a
 * `<CheckboxGroup>` above it supplies `checked`, `name`, `disabled`, `readOnly`, `invalid` and the
 * toggle handler for the `value` it was given, and a `<Field.Root>` above it supplies the label and
 * control ids plus the same four states. Both are **defaults** — a prop passed here still wins.
 */
export function createCheckbox(props: CreateCheckboxProps = {}): CreateCheckboxReturn {
  const locale = useLocaleContext();
  const environment = useEnvironmentContext();
  const group = useCheckboxGroupContext();
  const field = useOptionalFieldContext();

  // Called unconditionally, at the top of the body, and never behind a `??` or inside a memo. Under
  // the server build `createUniqueId()` consumes a hydration child id and under the hydrating client
  // build it consumes a context id, both off one counter — so moving the call site between the two
  // renders desynchronises every `_hk` after it, and the tree hydrates against the wrong nodes with
  // no error.
  const generatedId = createUniqueId();

  // The group's item props sit **under** the consumer's own, so `<Checkbox.Root disabled>` inside a
  // live group is still disabled and `<Checkbox.Root onCheckedChange={…}>` inside one runs beside
  // the group's toggle rather than instead of it — `mergeProps` composes `on*` keys and resolves
  // everything else to the last defined value.
  //
  // A lazy source, so `getItemProps` is re-read on every access instead of once here: the group's
  // `checked` is the array it holds, and an object of live state read at construction would freeze
  // every box in the group at whatever was ticked when it mounted.
  const merged = mergeProps(
    () => (group === undefined ? {} : group.getItemProps({ value: props.value })),
    props,
  ) as CreateCheckboxProps;

  // Bare, with no `untrack` around it: the adapter's `seedFromProps` absorbs the machine's one-shot
  // construction reads, so a `[STRICT_READ_UNTRACKED]` here would be a real bug in this body or in
  // the machine's `watch`, and wrapping the call would hide exactly that.
  //
  // The field's contribution is spelled with `??` rather than left to the spread the React version
  // uses: `merge` resolves a key by presence, so a wrapper forwarding an unset
  // `disabled={props.disabled}` would otherwise beat the surrounding `<Field.Root disabled>` with
  // `undefined` (`CLAUDE.md`, *The third hazard*).
  const service = useMachine(checkbox.machine, () => ({
    id: props.id ?? generatedId,
    dir: locale().dir,
    getRootNode: environment().getRootNode,
    // Whole-object, not per-key: a consumer naming any id at all takes the field's two with it,
    // which is the React version's `...props` over its own `ids` literal. The label id is what
    // makes a `<Field.Label>` name this checkbox, and the input id what makes its `for` reach one.
    ids: props.ids ?? { label: field?.ids.label, hiddenInput: field?.ids.control },
    checked: merged.checked,
    defaultChecked: merged.defaultChecked,
    onCheckedChange: merged.onCheckedChange,
    disabled: merged.disabled ?? field?.disabled,
    invalid: merged.invalid ?? field?.invalid,
    readOnly: merged.readOnly ?? field?.readOnly,
    required: merged.required ?? field?.required,
    name: merged.name,
    form: merged.form,
    value: merged.value,
  }));

  const api = createMemo(() => checkbox.connect(service, normalizeProps));

  return createMachineStore(api, {});
}
