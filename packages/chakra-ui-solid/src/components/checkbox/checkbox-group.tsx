import { chakra } from "@chakra-ui-solid/core";
import { type Component, createSignal, omit } from "solid-js";
import { useOptionalFieldsetContext } from "../fieldset/fieldset-context";
import type {
  CheckboxGroupItemProps,
  CheckboxGroupItemState,
  CheckboxGroupProps,
  CreateCheckboxGroupProps,
  CreateCheckboxGroupReturn,
} from "./checkbox.types";
import { CheckboxGroupProvider } from "./checkbox-context";

/**
 * The group's own inputs, which drive the state rather than the `div`. Literal keys rather than a
 * derived list, because `omit` narrows the returned props by the keys it is handed and a `string[]`
 * narrows nothing; `satisfies` is what keeps this list and the interface one list.
 *
 * There are no recipe variants to omit beside them: a group carries no slot class at all — the
 * `checkbox` recipe's `group` slot has no body, and the group sits *outside* every Root, so there is
 * no resolved class map above it to read one from.
 */
const GROUP_OWN_KEYS = [
  "defaultValue",
  "value",
  "name",
  "onValueChange",
  "disabled",
  "readOnly",
  "invalid",
  "maxSelectedValues",
] as const satisfies readonly (keyof CreateCheckboxGroupProps)[];

/**
 * Holds the set of ticked values a column of checkboxes shares.
 *
 * **There is no Zag machine here, and none is missing**: `@zag-js/checkbox` drives one box, and a
 * group of them is an array of strings, a controlled predicate and a ceiling. So this is plain
 * signals and getters where a machine component is `useMachine` + `connect`.
 *
 * ```tsx
 * const frameworks = createCheckboxGroup({ defaultValue: ["solid"] });
 * <Code>{frameworks.value.join(", ")}</Code>
 * ```
 */
export function createCheckboxGroup(
  props: CreateCheckboxGroupProps = {},
): CreateCheckboxGroupReturn {
  // The surrounding `<Fieldset.Root disabled>`, if there is one. Read through the **non-strict**
  // reader: a group outside any fieldset is the ordinary case, not an error.
  const fieldset = useOptionalFieldsetContext();

  const [uncontrolled, setUncontrolled] = createSignal<string[]>(props.defaultValue ?? []);

  // `!== undefined` and never a loose check: `value={null}` is not a spelling this prop accepts, and
  // an empty array is a controlled group with nothing ticked rather than an uncontrolled one
  // (`component-blueprint.md` §2.6).
  const isControlled = () => props.value !== undefined;
  const value = () => props.value ?? uncontrolled();

  // Possibly `undefined`, and deliberately so: it travels into a checkbox's machine props, where an
  // `undefined` is what lets a surrounding `<Field.Root>`'s own state through.
  const disabled = () => props.disabled ?? fieldset?.disabled;
  const invalid = () => props.invalid ?? fieldset?.invalid;

  const interactive = () => !(disabled() === true || props.readOnly === true);
  const isChecked = (candidate: string | undefined) =>
    value().some((each) => String(each) === String(candidate));

  const isAtMax = () =>
    props.maxSelectedValues !== undefined && value().length >= props.maxSelectedValues;

  const setValue = (next: string[]) => {
    if (!isControlled()) {
      setUncontrolled(next);
    }
    props.onValueChange?.(next);
  };

  const addValue = (candidate: string) => {
    if (!interactive() || isChecked(candidate) || isAtMax()) {
      return;
    }
    setValue([...value(), candidate]);
  };

  const removeValue = (candidate: string) => {
    if (!interactive()) {
      return;
    }
    setValue(value().filter((each) => String(each) !== String(candidate)));
  };

  const toggleValue = (candidate: string) => {
    if (isChecked(candidate)) {
      removeValue(candidate);
      return;
    }
    addValue(candidate);
  };

  const getItemProps = (itemProps: CheckboxGroupItemProps): CheckboxGroupItemState => {
    const checked = itemProps.value === undefined ? undefined : isChecked(itemProps.value);
    return {
      checked,
      onCheckedChange() {
        const candidate = itemProps.value;
        if (candidate !== undefined) {
          toggleValue(candidate);
        }
      },
      name: props.name,
      // At the ceiling every *unticked* box disables itself, so a reader can still untick one to
      // make room. The three states below stay possibly-`undefined`, which is what lets a
      // surrounding Field supply them instead.
      disabled: disabled() || (isAtMax() && !checked),
      readOnly: props.readOnly,
      invalid: invalid(),
    };
  };

  // Getters, never a snapshot: every member below is derived from a signal, and a spread would
  // freeze a consumer's `group.value` at whatever was ticked when they read it.
  return {
    isChecked,
    get value() {
      return value();
    },
    get name() {
      return props.name;
    },
    get disabled() {
      return disabled() === true;
    },
    get readOnly() {
      return props.readOnly === true;
    },
    get invalid() {
      return invalid() === true;
    },
    setValue,
    addValue,
    toggleValue,
    getItemProps,
  };
}

/**
 * The three declarations the React version gives this element through its styled factory, in the
 * one seam that survives a consumer forwarding an unset style prop: a `chakra()` config is a recipe
 * base rather than a JSX attribute before a spread, so `<CheckboxGroup gap={undefined}>` keeps the
 * gap where a literal attribute would lose it (`CLAUDE.md`, *The third hazard*).
 *
 * It is also the channel that makes the values extractable — a `chakra()` config object is a call
 * site Panda reads, where the same object handed to a `withDefaults` or a `baseStyles` accessor is
 * not, and the column would ship with no gap and no error.
 */
const StyledCheckboxGroup = chakra("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5",
  },
});

/**
 * CheckboxGroup — a column of checkboxes sharing one `name` and one array of ticked values.
 *
 * Each `<Checkbox.Root value="…">` below it is driven by the group: it reads its own `checked` out
 * of the array, reports a toggle back, and inherits `name`, `disabled`, `readOnly` and `invalid`. A
 * checkbox that passes one of those itself still wins.
 *
 * ```tsx
 * <CheckboxGroup defaultValue={["solid"]} name="framework">
 *   <Checkbox.Root value="solid">…</Checkbox.Root>
 *   <Checkbox.Root value="react">…</Checkbox.Root>
 * </CheckboxGroup>
 * ```
 *
 * **Wrap it in a `<Fieldset.Root>`, not a `<Field.Root>`** — a set of related options is a fieldset
 * with a legend, and a field is one control with one label. The group inherits `disabled` and
 * `invalid` from the fieldset above it.
 *
 * It starts no machine, so it takes no `id`/`ids` and publishes no slot classes.
 */
export const CheckboxGroup: Component<CheckboxGroupProps> = (props) => {
  const group = createCheckboxGroup(props);

  // `omit` on a lazy props source stays lazy, so `value` and the rest never reach the `div` while
  // `children` and every style prop still do.
  const elementProps = omit(props, ...GROUP_OWN_KEYS);

  return (
    <CheckboxGroupProvider value={group}>
      {/* `role` before the spread and the anatomy pair after it — Ark's own order, and the split
          matters: a consumer may relabel the landmark, and nobody may take the scope off it. */}
      <StyledCheckboxGroup role="group" {...elementProps} data-scope="checkbox" data-part="group" />
    </CheckboxGroupProvider>
  );
};
