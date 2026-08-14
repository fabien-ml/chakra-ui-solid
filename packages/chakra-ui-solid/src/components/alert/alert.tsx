import {
  createComponentContext,
  createSlotRecipeContext,
  type HTMLChakraProps,
  type PropsProviderProps,
  renderStyled,
} from "@chakra-ui-solid/core";
import {
  type AlertVariantProps as AlertRecipeVariants,
  alert as alertRecipe,
} from "@chakra-ui-solid/styled-system/recipes";
import type { ConditionalValue } from "@chakra-ui-solid/styled-system/types";
import type { ComponentProps, JSX, ValidComponent } from "@solidjs/web";
import { Dynamic } from "@solidjs/web";
import { type Component, merge, Show } from "solid-js";
import { CheckCircleIcon, InfoIcon, WarningIcon } from "../icons";

/** The five names the slot recipe carries — the anatomy's parts exactly. */
export type AlertSlot = "root" | "title" | "description" | "content" | "indicator";

/** What the alert is telling the reader. It picks both the palette and the default glyph. */
export type AlertStatus = "info" | "warning" | "success" | "error" | "neutral";

/**
 * The recipe's four variants, spelled out rather than inherited from the generated
 * `AlertVariantProps`, so each carries a description a reader can use.
 *
 * **No `@default` tag on any of them.** The recipe's `defaultVariants` resolves `info`, `false`,
 * `subtle` and `md` from `undefined` itself.
 */
export interface AlertVariantProps {
  /**
   * What the alert is telling the reader. It is a recipe variant *and* the value
   * {@link AlertIndicator} reads to pick its glyph — the one thing the styling seam cannot supply,
   * and the reason this Root opens a context of its own.
   */
  status?: ConditionalValue<AlertStatus>;
  /** Whether the title and description sit on one line rather than stacking. */
  inline?: ConditionalValue<boolean>;
  /** How much of the palette the alert spends — a tint, a tint plus a ring, a ring, or a fill. */
  variant?: ConditionalValue<"subtle" | "surface" | "outline" | "solid">;
  /** The padding, the gap and the type scale together. */
  size?: ConditionalValue<"sm" | "md" | "lg">;
}

/** The Root's own props, without the `div`'s — what an `Alert.RootPropsProvider` may supply. */
export interface AlertRootBaseProps extends AlertVariantProps {}

export interface AlertRootProps extends HTMLChakraProps<"div">, AlertRootBaseProps {}

export interface AlertPropsProviderProps extends PropsProviderProps<AlertRootBaseProps> {}

export interface AlertContentProps extends HTMLChakraProps<"div"> {}

export interface AlertTitleProps extends HTMLChakraProps<"div"> {}

export interface AlertDescriptionProps extends HTMLChakraProps<"div"> {}

export interface AlertIndicatorProps extends HTMLChakraProps<"span"> {}

/**
 * What the Root publishes beyond its slot classes: the status, as a live getter rather than a
 * snapshot, so an alert whose status changes redraws its glyph.
 */
export interface AlertStatusContextValue {
  readonly status: ConditionalValue<AlertStatus>;
}

const [AlertStatusProvider, useAlertStatusContext] =
  createComponentContext<AlertStatusContextValue>("Alert");

export { useAlertStatusContext };

const { withProvider, withContext, useStyles, PropsProvider } = createSlotRecipeContext<
  AlertSlot,
  AlertRootProps,
  AlertRecipeVariants
>({
  name: "Alert",
  recipe: alertRecipe,
  variantKeys: ["status", "inline", "variant", "size"],
});

/** The classes the nearest {@link AlertRoot} resolved, one per slot. */
export const useAlertStyles = useStyles;

/**
 * Alert.Root — a message about the state of the page, the feature or the system.
 *
 * The only Root in this family of five that wraps its element in a context of its own. `status` is
 * a recipe variant like the other three, so it never reaches the DOM — but it is also the value
 * {@link AlertIndicator} needs to choose a glyph, and a class cannot carry that.
 */
export const AlertRoot = withProvider("div", "root", {
  wrapElement(element, props) {
    return (
      <AlertStatusProvider
        value={{
          // A getter, so the glyph follows a status that changes. `??` rather than a `merge`
          // default: `merge` resolves by presence, and a wrapper forwarding an unset `status` would
          // otherwise win with `undefined`.
          get status() {
            return props.status ?? "info";
          },
        }}
      >
        {element()}
      </AlertStatusProvider>
    );
  },
});

/**
 * Supplies props to every {@link AlertRoot} below it. A Root that passes the prop itself still
 * wins.
 */
export const AlertPropsProvider: Component<AlertPropsProviderProps> = PropsProvider;

/** The column holding the title and the description. Only needed when there are both. */
export const AlertContent = withContext<AlertContentProps>("div", "content");

/** The headline. The `medium` weight is all that separates it from the description. */
export const AlertTitle = withContext<AlertTitleProps>("div", "title");

/** The detail under the title. It is `display: inline`, so it flows after an inline title. */
export const AlertDescription = withContext<AlertDescriptionProps>("div", "description");

/** One glyph per status. `error` and `warning` share the triangle; `neutral` takes `info`'s. */
const STATUS_ICONS: Record<AlertStatus, typeof InfoIcon> = {
  info: InfoIcon,
  warning: WarningIcon,
  success: CheckCircleIcon,
  error: WarningIcon,
  neutral: InfoIcon,
};

/**
 * The Root's status drawn as a glyph.
 *
 * A **responsive** `status` names no single glyph, so nothing is drawn — upstream renders a
 * `Fragment` in that case, which is the same absence one indirection later.
 */
function AlertStatusIcon(): JSX.Element {
  const alert = useAlertStatusContext();
  const glyph = () => (typeof alert.status === "string" ? STATUS_ICONS[alert.status] : undefined);

  return <Show when={glyph()}>{(Icon) => <Dynamic component={Icon()} />}</Show>;
}

type SpanProps = ComponentProps<"span">;

/**
 * The box at the start of the alert holding the glyph — a `span` sized `1em`, which is what makes
 * the glyph track the alert's own type scale.
 *
 * The one part `withContext` cannot mint, because its default children depend on the Root's status.
 * A consumer's own child replaces the glyph entirely, which is how the spinner and custom-icon
 * examples work.
 */
export const AlertIndicator: Component<AlertIndicatorProps> = (props) => {
  const styles = useStyles();

  const elementProps = merge(props, {
    // Read exactly once, so no `children()` is owed — `??` evaluates its left side one time, and
    // the glyph is built only when there is nothing to fall back from.
    get children() {
      return props.children ?? <AlertStatusIcon />;
    },
  }) as SpanProps;

  return renderStyled<SpanProps, HTMLSpanElement>({
    as: (props.as ?? "span") as ValidComponent,
    props: elementProps,
    render: props.render,
    recipeClass: () => styles().indicator,
  });
};
