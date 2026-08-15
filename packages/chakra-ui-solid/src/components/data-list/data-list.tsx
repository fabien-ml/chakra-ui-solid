import {
  createSlotRecipeContext,
  type HTMLChakraProps,
  type PresetVariant,
  type PropsProviderProps,
} from "@chakra-ui-solid/core";
import type { DataListVariantProps as DataListRecipeVariants } from "@chakra-ui-solid/styled-system/recipes";
import type { ConditionalValue } from "@chakra-ui-solid/styled-system/types";
import type { Component } from "solid-js";

/** The four names the slot recipe carries — the anatomy's parts exactly. */
export type DataListSlot = "root" | "item" | "itemLabel" | "itemValue";

/**
 * The recipe's three variants, spelled out rather than inherited from the generated
 * `DataListVariantProps`, so each carries a description a reader can use.
 *
 * **No `@default` tag on any of them.** The recipe's `defaultVariants` resolves `vertical`, `md`
 * and `subtle` from `undefined` itself.
 */
export interface DataListVariantProps {
  /** Whether a label sits above its value or beside it, in a 120px-wide column. */
  orientation?: ConditionalValue<
    "horizontal" | "vertical" | PresetVariant<"dataList", "orientation">
  >;
  /** The type scale of an item, and the gap between items. */
  size?: ConditionalValue<"sm" | "md" | "lg" | PresetVariant<"dataList", "size">>;
  /** Which half is muted — `subtle` dims the label, `bold` dims the value and weights the label. */
  variant?: ConditionalValue<"subtle" | "bold" | PresetVariant<"dataList", "variant">>;
}

/** The Root's own props, without the `dl`'s — what a `DataList.PropsProvider` may supply. */
export interface DataListRootBaseProps extends DataListVariantProps {}

export interface DataListRootProps extends HTMLChakraProps<"dl">, DataListRootBaseProps {}

export interface DataListPropsProviderProps extends PropsProviderProps<DataListRootBaseProps> {}

export interface DataListItemProps extends HTMLChakraProps<"div"> {}

export interface DataListItemLabelProps extends HTMLChakraProps<"dt"> {}

export interface DataListItemValueProps extends HTMLChakraProps<"dd"> {}

const { withProvider, withContext, useStyles, PropsProvider } = createSlotRecipeContext<
  DataListSlot,
  DataListRootProps,
  DataListRecipeVariants
>({
  name: "DataList",
  recipe: "dataList",
});

/** The classes the nearest {@link DataListRoot} resolved, one per slot. */
export const useDataListStyles = useStyles;

/**
 * DataList.Root — a description list: labelled facts about one subject, laid out consistently.
 *
 * A real `dl`, so a screen reader pairs each label with its value. Items repeat: one
 * {@link DataListItem} per fact, and nothing about the part is per-instance.
 */
export const DataListRoot = withProvider("dl", "root");

/**
 * Supplies props to every {@link DataListRoot} below it. A Root that passes the prop itself still
 * wins.
 */
export const DataListPropsProvider: Component<DataListPropsProviderProps> = PropsProvider;

/**
 * One label/value pair, as the `div` wrapper a `dl` is allowed to group them with. It is what
 * carries `orientation` — a column on `vertical`, an inline row on `horizontal`.
 */
export const DataListItem = withContext<DataListItemProps>("div", "item");

/** The fact's name, as a real `dt`. On `horizontal` it holds a 120px column. */
export const DataListItemLabel = withContext<DataListItemLabelProps>("dt", "itemLabel");

/** The fact itself, as a real `dd`. It takes the remaining width and may truncate. */
export const DataListItemValue = withContext<DataListItemValueProps>("dd", "itemValue");
