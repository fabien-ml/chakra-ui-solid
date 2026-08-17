import {
  createMachineStore,
  normalizeProps,
  useEnvironmentContext,
  useLocaleContext,
  useMachine,
} from "@chakra-ui-solid/core";
import * as zagRadioGroup from "@zag-js/radio-group";
import { createMemo, createUniqueId } from "solid-js";
import { useOptionalFieldsetContext } from "../fieldset/fieldset-context";
import type { CreateRadioGroupProps, CreateRadioGroupReturn } from "./radio-group.types";

/**
 * Starts the `@zag-js/radio-group` machine and hands back its connected API.
 *
 * Call it to own the machine yourself and drive a `<RadioGroup.RootProvider value={…}>` from
 * outside; `<RadioGroup.Root>` calls it for you and is the shorter way to the same thing.
 *
 * ```tsx
 * const framework = createRadioGroup({ defaultValue: "solid" });
 * <button onClick={() => framework.setValue("vue")}>Pick Vue</button>
 * <RadioGroup.RootProvider value={framework}>…</RadioGroup.RootProvider>
 * ```
 *
 * **One machine drives every radio in the group.** There is no per-item machine and no per-item
 * store: an item is identified by its `value`, and every prop getter takes that identity as an
 * argument — `getItemControlProps({ value: "solid" })`.
 *
 * **It adopts what surrounds it**: a `<Fieldset.Root>` above it supplies the legend's id plus
 * `disabled` and `invalid`. Those are **defaults** — a prop passed here still wins. A `Field.Root`
 * supplies nothing, unlike Checkbox and Switch: a group of radios is a fieldset with a legend, not a
 * single labelled control.
 */
export function createRadioGroup(props: CreateRadioGroupProps = {}): CreateRadioGroupReturn {
  const locale = useLocaleContext();
  const environment = useEnvironmentContext();
  const fieldset = useOptionalFieldsetContext();

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
  // The fieldset's contribution is spelled with `??` rather than left to the spread the React
  // version uses: `merge` resolves a key by presence, so a wrapper forwarding an unset
  // `disabled={props.disabled}` would otherwise beat the surrounding `<Fieldset.Root disabled>` with
  // `undefined` (`CLAUDE.md`, *The third hazard*).
  const service = useMachine(zagRadioGroup.machine, () => ({
    id: props.id ?? generatedId,
    dir: locale().dir,
    getRootNode: environment().getRootNode,
    // Whole-object, not per-key: a consumer naming any id at all takes the fieldset's with it, which
    // is the React version's `...props` over its own `ids` literal. The legend id is what makes a
    // `<Fieldset.Legend>` name this group through `aria-labelledby`.
    ids: props.ids ?? { label: fieldset?.ids.legend },
    value: props.value,
    defaultValue: props.defaultValue,
    onValueChange: props.onValueChange,
    disabled: props.disabled ?? fieldset?.disabled,
    invalid: props.invalid ?? fieldset?.invalid,
    readOnly: props.readOnly,
    required: props.required,
    name: props.name,
    form: props.form,
    orientation: props.orientation,
  }));

  const api = createMemo(() => zagRadioGroup.connect(service, normalizeProps));

  return createMachineStore(api, {});
}
