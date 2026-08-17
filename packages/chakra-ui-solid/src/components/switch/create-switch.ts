import {
  createMachineStore,
  normalizeProps,
  useEnvironmentContext,
  useLocaleContext,
  useMachine,
} from "@chakra-ui-solid/core";
import * as zagSwitch from "@zag-js/switch";
import { createMemo, createUniqueId } from "solid-js";
import { useOptionalFieldContext } from "../field/field-context";
import type { CreateSwitchProps, CreateSwitchReturn } from "./switch.types";

/**
 * Starts the `@zag-js/switch` machine and hands back its connected API.
 *
 * Call it to own the machine yourself and drive a `<Switch.RootProvider value={…}>` from outside;
 * `<Switch.Root>` calls it for you and is the shorter way to the same thing.
 *
 * ```tsx
 * const notifications = createSwitch();
 * <button onClick={() => notifications.setChecked(true)}>Enable</button>
 * <Switch.RootProvider value={notifications}>…</Switch.RootProvider>
 * ```
 *
 * **It adopts what surrounds it**: a `<Field.Root>` above it supplies the label and control ids plus
 * `disabled`, `invalid`, `readOnly` and `required`. Those are **defaults** — a prop passed here
 * still wins. There is no group here, where a checkbox has one: Chakra ships no `SwitchGroup`.
 */
export function createSwitch(props: CreateSwitchProps = {}): CreateSwitchReturn {
  const locale = useLocaleContext();
  const environment = useEnvironmentContext();
  const field = useOptionalFieldContext();

  // Called unconditionally, at the top of the body, and never behind a `??` or inside a memo. Under
  // the server build `createUniqueId()` consumes a hydration child id and under the hydrating client
  // build it consumes a context id, both off one counter — so moving the call site between the two
  // renders desynchronises every `_hk` after it, and the tree hydrates against the wrong nodes with
  // no error.
  const generatedId = createUniqueId();

  // Bare, with no `untrack` around it: the adapter's `seedFromProps` absorbs the machine's one-shot
  // construction reads, so a `[STRICT_READ_UNTRACKED]` here would be a real bug in this body or in
  // the machine's `watch`, and wrapping the call would hide exactly that.
  //
  // The field's contribution is spelled with `??` rather than left to the spread the React version
  // uses: `merge` resolves a key by presence, so a wrapper forwarding an unset
  // `disabled={props.disabled}` would otherwise beat the surrounding `<Field.Root disabled>` with
  // `undefined` (`CLAUDE.md`, *The third hazard*).
  const service = useMachine(zagSwitch.machine, () => ({
    id: props.id ?? generatedId,
    dir: locale().dir,
    getRootNode: environment().getRootNode,
    // Whole-object, not per-key: a consumer naming any id at all takes the field's two with it,
    // which is the React version's `...props` over its own `ids` literal. The label id is what
    // makes a `<Field.Label>` name this switch, and the input id what makes its `for` reach one.
    ids: props.ids ?? { label: field?.ids.label, hiddenInput: field?.ids.control },
    label: props.label,
    checked: props.checked,
    defaultChecked: props.defaultChecked,
    onCheckedChange: props.onCheckedChange,
    disabled: props.disabled ?? field?.disabled,
    invalid: props.invalid ?? field?.invalid,
    readOnly: props.readOnly ?? field?.readOnly,
    required: props.required ?? field?.required,
    name: props.name,
    form: props.form,
    value: props.value,
  }));

  const api = createMemo(() => zagSwitch.connect(service, normalizeProps));

  return createMachineStore(api, {});
}
