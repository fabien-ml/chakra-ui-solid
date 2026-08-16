import {
  createComponentContext,
  createSlotRecipeContext,
  mergeProps,
  renderStyled,
  withContextDefaults,
} from "@chakra-ui-solid/core";
import type { NativeSelectVariantProps as NativeSelectRecipeVariants } from "@chakra-ui-solid/styled-system/recipes";
import type { ComponentProps, ValidComponent } from "@solidjs/web";
import { type Component, omit, Show } from "solid-js";
import { useOptionalFieldContext } from "../field/field-context";
import { ChevronDownIcon } from "../icons";
import { useInputGroupPadding } from "../input-group/input-group-context";
import type {
  NativeSelectFieldProps,
  NativeSelectIndicatorProps,
  NativeSelectRootBaseProps,
  NativeSelectRootProps,
  NativeSelectStates,
} from "./native-select.types";

type DivProps = ComponentProps<"div">;
type SelectProps = ComponentProps<"select">;

/**
 * The three slots the recipe carries.
 *
 * **They carry no `data-part`, and that is upstream too.** Chakra's `nativeSelectAnatomy` is
 * `createAnatomy("select")`, but the anatomy is only ever asked for its slot *keys* — no part
 * component applies `parts.*.attrs`, so nothing in this component's markup is addressable by
 * `[data-scope]`. The recipe's own selectors are classes and the `_disabled` / `_invalid`
 * conditions, which is why the two states below are written onto the elements by hand.
 */
export type NativeSelectSlot = "root" | "field" | "indicator";

/**
 * The two states, resolved once on the Root and read by both parts below.
 *
 * Non-strict, because that is the reader `createComponentContext` returns third and the parts need
 * nothing else from it — a `NativeSelect.Field` outside a Root still has the styling seam's own
 * named error to raise.
 */
const [NativeSelectStatesProvider, , useOptionalNativeSelectStates] =
  createComponentContext<NativeSelectStates>("NativeSelect");

const {
  StylesProvider: NativeSelectStylesProvider,
  useStyles: useNativeSelectStyles,
  resolveSlotClasses: resolveNativeSelectSlotClasses,
  useVariantKeys: useNativeSelectVariantKeys,
  PropsProvider,
  usePropsContext,
} = createSlotRecipeContext<
  NativeSelectSlot,
  NativeSelectRootBaseProps,
  NativeSelectRecipeVariants
>({
  name: "NativeSelect",
  recipe: "nativeSelect",
});

export { useNativeSelectStyles };

/**
 * The Root's own inputs, which are not the `div`'s. `disabled` and `invalid` are states the two
 * parts read from context — forwarded, `invalid` would reach the DOM as `invalid=""` on a `div`,
 * which is an attribute no element has.
 *
 * The recipe's variant names are **not** listed here. They come off the system's own `nativeSelect`
 * recipe at render time, so a consumer who adds a variant in their Panda config gets it partitioned
 * off too, where a hardcoded name would have put theirs on the `div` as an attribute.
 */
const ROOT_ONLY_KEYS = ["disabled", "invalid"] as const;

/**
 * NativeSelect.Root — the box a native `<select>` and its chevron sit in.
 *
 * It is the platform control, so the option list is the browser's own: on mobile that is the native
 * picker, and nothing here re-implements a listbox. Reach for `Select` when you need a styled
 * option list; reach for this when you want the one the reader's OS already knows.
 *
 * **Inside a `<Field.Root>` it adopts the field's `disabled` and `invalid`** — and the field wins
 * over this Root's own props, which is upstream's resolution rather than a choice here.
 */
export const NativeSelectRoot: Component<NativeSelectRootProps> = (props) => {
  const field = useOptionalFieldContext();

  // Context first, local props second, so a local prop wins — Chakra's order — and resolved by
  // value, not by presence.
  const merged = withContextDefaults<NativeSelectRootProps>(props, usePropsContext());

  const slots = resolveNativeSelectSlotClasses(merged);
  const variantKeys = useNativeSelectVariantKeys();

  // Getters, not a snapshot: a field whose `invalid` flips after mount has to repaint the border on
  // both parts, and an object read once here would freeze them at whatever they were at construction.
  const states: NativeSelectStates = {
    get disabled() {
      return Boolean(field?.disabled ?? merged.disabled);
    },
    get invalid() {
      return Boolean(field?.invalid ?? merged.invalid);
    },
  };

  return (
    <NativeSelectStatesProvider value={states}>
      <NativeSelectStylesProvider value={slots}>
        {renderStyled<DivProps, HTMLDivElement>({
          as: (merged.as ?? "div") as ValidComponent,
          props: omit(merged, ...variantKeys, ...ROOT_ONLY_KEYS) as DivProps,
          render: merged.render,
          recipeClass: () => slots().root,
        })}
      </NativeSelectStylesProvider>
    </NativeSelectStatesProvider>
  );
};

/**
 * The `select` itself.
 *
 * Its `disabled` comes from the Root and its `data-invalid` from the same place, so a consumer sets
 * both once on the Root (or on the surrounding `Field.Root`) rather than on the control. Inside a
 * field it also takes the control's id, `required`, `readonly` and the two ARIA IDREFs, exactly as
 * `Input` and `Textarea` do.
 *
 * `placeholder` is not the element's attribute — a `select` has none — so it is rendered as a
 * leading `<option value="">`, which is how the control can start on nothing chosen.
 */
export const NativeSelectField: Component<NativeSelectFieldProps> = (props) => {
  const field = useOptionalFieldContext();
  const groupPadding = useInputGroupPadding();
  const states = useOptionalNativeSelectStates();
  const styles = useNativeSelectStyles();

  // Four sources, lowest first: the surrounding `InputGroup`, then the surrounding field, then the
  // Root's resolved states, then the caller's own props. `mergeProps` resolves by value and calls
  // `getSelectProps()` on each read, so a field flipping `invalid` after mount reaches the element.
  //
  // The group is lowest for the same reason it is under `Input`: a consumer's own `ps` has to beat
  // the padding that clears a start element. The recipe already republishes `--input-height` as
  // `var(--select-field-height)` on this element, which is the scope the padding's `calc()` needs.
  const elementProps = mergeProps(
    groupPadding,
    () => field?.getSelectProps() ?? {},
    () => ({
      disabled: states?.disabled ?? false,
      "data-invalid": states?.invalid ? "" : undefined,
    }),
    omit(props, "placeholder"),
    {
      // Last, so it replaces the `children` the layer above carries — the caller's own options with
      // the placeholder `<option>` in front of them. Read once, by the element being built, so the
      // slot owes no `children()`.
      get children() {
        return (
          <>
            <Show when={props.placeholder}>{(text) => <option value="">{text()}</option>}</Show>
            {props.children}
          </>
        );
      },
    },
  ) as SelectProps;

  return renderStyled<SelectProps, HTMLSelectElement>({
    as: (props.as ?? "select") as ValidComponent,
    props: elementProps,
    render: props.render,
    recipeClass: () => styles().field,
  });
};

/**
 * The chevron, positioned over the control's trailing edge and `pointer-events: none`, so clicking
 * it opens the select underneath.
 *
 * It renders {@link ChevronDownIcon} when given no children of its own. The slot is read exactly
 * once — by the merged bag's getter, which is what the element consumes — so it owes no
 * `children()` (`CLAUDE.md`, *The second hazard*).
 */
export const NativeSelectIndicator: Component<NativeSelectIndicatorProps> = (props) => {
  const states = useOptionalNativeSelectStates();
  const styles = useNativeSelectStyles();

  const elementProps = mergeProps(props, {
    get "data-disabled"() {
      return states?.disabled ? "" : undefined;
    },
    get "data-invalid"() {
      return states?.invalid ? "" : undefined;
    },
    get children() {
      return props.children ?? <ChevronDownIcon />;
    },
  }) as DivProps;

  return renderStyled<DivProps, HTMLDivElement>({
    as: (props.as ?? "div") as ValidComponent,
    props: elementProps,
    render: props.render,
    recipeClass: () => styles().indicator,
  });
};

/**
 * Supplies props to every {@link NativeSelectRoot} below it — `<NativeSelect.PropsProvider
 * value={{ size: "sm" }}>` sizes a whole form the same way. A Root that passes the prop itself
 * still wins.
 */
export const NativeSelectPropsProvider = PropsProvider;
