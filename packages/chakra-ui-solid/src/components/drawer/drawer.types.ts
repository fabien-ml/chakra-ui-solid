import type {
  HTMLChakraProps,
  PresetVariant,
  PropsProviderProps,
  UnstyledProp,
} from "@chakra-ui-solid/core";
import type { ConditionalValue } from "@chakra-ui-solid/styled-system/types";
import type { JSX } from "@solidjs/web";
import type {
  CreateDialogProps,
  CreateDialogReturn,
  DialogElementIds,
  DialogFocusOutsideEvent,
  DialogInteractOutsideEvent,
  DialogOpenChangeDetails,
  DialogPointerDownOutsideEvent,
  DialogTriggerValueChangeDetails,
} from "../dialog/dialog.types";

// Everything down to `DrawerPresenceProps` is Dialog's, aliased rather than restated: a drawer runs
// the **same `@zag-js/dialog` machine** — Chakra's `drawer.tsx` imports `@ark-ui/react/dialog`, and
// its `index.ts` aliases `useDialog as useDrawer` for exactly this reason. Zag does ship a `drawer`
// machine, and Chakra does not use it. Restating twenty-four machine props here would be a second
// copy that drifts the first time Zag adds one.

/** The ids of the seven elements the machine addresses. Useful for composition. */
export interface DrawerElementIds extends DialogElementIds {}

/** What `onOpenChange` receives. */
export interface DrawerOpenChangeDetails extends DialogOpenChangeDetails {}

/** What `onTriggerValueChange` receives — the value and the element that carried it. */
export interface DrawerTriggerValueChangeDetails extends DialogTriggerValueChangeDetails {}

/** The event `onPointerDownOutside` receives. */
export type DrawerPointerDownOutsideEvent = DialogPointerDownOutsideEvent;

/** The event `onFocusOutside` receives. */
export type DrawerFocusOutsideEvent = DialogFocusOutsideEvent;

/** The event `onInteractOutside` receives — either of the two above. */
export type DrawerInteractOutsideEvent = DialogInteractOutsideEvent;

/**
 * Everything {@link createDrawer} takes — the dialog machine's own props, since that is the machine
 * a drawer runs. Hover {@link CreateDialogProps} for the twenty-four keys and what each does.
 */
export interface CreateDrawerProps extends CreateDialogProps {}

/**
 * The connected machine, as a stable object of reactive getters and delegating methods. Identical to
 * {@link CreateDialogReturn}, because it *is* the dialog machine.
 */
export interface CreateDrawerReturn extends CreateDialogReturn {}

/**
 * What the Root hands the presence machine that keeps the content in the DOM while its exit
 * animation runs, plus the two props that decide whether it is in the DOM at all.
 *
 * `lazyMount` and `unmountOnExit` are written out rather than inherited from `RenderStrategyProps`,
 * because a shared interface cannot state a per-component default and **Chakra defaults both to
 * `true` here**. It is the interface's own `@default` that a docs table prints.
 */
export interface DrawerPresenceProps {
  /**
   * Drive the content's presence from something other than the drawer's own `open` state — an
   * escape hatch for animating the surface independently of the machine.
   *
   * **It reaches the content and the positioner only.** The backdrop builds its own presence
   * straight from `open` and ignores this, so `present={true}` over a closed drawer slides the panel
   * in with no scrim behind it. That asymmetry is Ark's, reproduced rather than corrected.
   *
   * Resolved with `??`, so a wrapper forwarding an unset `present={props.present}` falls back to
   * `open` — parity rather than a fix, since Ark's own split drops an `undefined` before the merge
   * ever sees it.
   */
  present?: boolean;
  /**
   * Keep the content out of the DOM entirely until the drawer first opens.
   *
   * @default true
   */
  lazyMount?: boolean;
  /**
   * Take the content back out of the DOM once it has closed and its exit animation has finished,
   * rather than leaving it there hidden.
   *
   * @default true
   */
  unmountOnExit?: boolean;
  /** Called once the exit animation has finished and the content is fully gone. */
  onExitComplete?: VoidFunction;
  /** Apply an open/close change in the same frame rather than the next one. */
  immediate?: boolean;
  /**
   * Suppress the enter animation on the very first open, so a `defaultOpen` drawer does not slide in
   * as the page loads.
   *
   * @default false
   */
  skipAnimationOnMount?: boolean;
}

/**
 * The slot recipe's three variants, spelled out rather than inherited from the generated
 * `DrawerVariantProps`, so each carries a description a reader can use and a type they can read — a
 * generated type has neither. A variant renamed in the recipe is still caught: the
 * `createSlotClasses` call on the Root is typed against the generated one, so the call, not this
 * interface, is what stops drifting silently.
 *
 * **Three, where Dialog has four**, and only `size` overlaps by name: the drawer recipe has no
 * `scrollBehavior` and no `motionPreset` (its placement picks the slide animation), its `placement`
 * values are edges rather than Dialog's vertical alignments, and `contained` is its own.
 *
 * **No `@default` tag on any of the three.** The recipe's `defaultVariants` is
 * `{ size: "xs", placement: "end" }` and it resolves them itself, so restating one here would be a
 * second source of truth that drifts on a preset bump — the mirror of why `lazyMount` *does* carry
 * one ({@link DrawerPresenceProps}), which this component sets in its own `withDefaults` call.
 */
export interface DrawerVariantProps {
  /** How far the panel extends from its edge. `full` covers the viewport. */
  size?: ConditionalValue<
    "xs" | "sm" | "md" | "lg" | "xl" | "full" | PresetVariant<"drawer", "size">
  >;
  /**
   * Which edge the panel slides in from. `start` and `end` follow the writing direction, so `end` is
   * the right edge in LTR and the left in RTL.
   */
  placement?: ConditionalValue<
    "start" | "end" | "top" | "bottom" | PresetVariant<"drawer", "placement">
  >;
  /** Whether the panel is inset from the viewport edges and rounded, rather than flush against them. */
  contained?: ConditionalValue<boolean>;
}

/**
 * The Root's own props — what a `PropsProvider` above it may supply.
 *
 * `unstyled` arrives through `UnstyledProp` rather than as a member here, and the distinction is
 * the props table's: it is one of the three props every component in this library takes from
 * `ChakraStylingProps` (`as`, `render`, `unstyled`), and declaring one of them on a component's own
 * interface lists it as a prop the component added. A Drawer root renders no element, so it has no
 * `HTMLChakraProps` surface to inherit it from and names the one interface Chakra names.
 */
export interface DrawerRootBaseProps
  extends CreateDrawerProps,
    DrawerPresenceProps,
    DrawerVariantProps,
    UnstyledProp {}

/**
 * Neither Root renders a host element, so neither extends `HTMLChakraProps` — the anatomy has no
 * `root` part, and a wrapper `div` here would shift every hydration key after it in the consumer's
 * own markup. That also means there is no Root/RootProvider `id` split to make: `id` seeds the
 * machine on one and is simply absent from the other.
 */
export interface DrawerRootProps extends DrawerRootBaseProps {
  children?: JSX.Element;
}

/**
 * The variants and `unstyled` are repeated here rather than reached through
 * {@link DrawerRootBaseProps}, because this Root takes no machine props at all — it is handed a
 * machine instead. Chakra splits the two the same way, into `DrawerRootProviderBaseProps`.
 */
export interface DrawerRootProviderProps
  extends DrawerPresenceProps,
    DrawerVariantProps,
    UnstyledProp {
  /** A machine built by {@link createDrawer}, so the consumer owns it rather than the Root. */
  value: CreateDrawerReturn;
  children?: JSX.Element;
}

export interface DrawerPropsProviderProps extends PropsProviderProps<DrawerRootBaseProps> {}

export interface DrawerTriggerProps extends Omit<HTMLChakraProps<"button">, "value"> {
  /**
   * Identifies this trigger among several driving one drawer — it becomes the machine's
   * `triggerValue`, and `data-current` marks the one that opened it.
   *
   * It shadows the `button`'s own `value` attribute, which is Ark's split too: this is a machine
   * argument and never reaches the DOM.
   */
  value?: string;
}

export interface DrawerBackdropProps extends HTMLChakraProps<"div"> {}

export interface DrawerPositionerProps extends HTMLChakraProps<"div"> {}

export interface DrawerContentProps extends HTMLChakraProps<"div"> {}

export interface DrawerTitleProps extends HTMLChakraProps<"h2"> {}

export interface DrawerDescriptionProps extends HTMLChakraProps<"div"> {}

export interface DrawerCloseTriggerProps extends HTMLChakraProps<"button"> {}

export interface DrawerActionTriggerProps extends HTMLChakraProps<"button"> {}

export interface DrawerHeaderProps extends HTMLChakraProps<"div"> {}

export interface DrawerBodyProps extends HTMLChakraProps<"div"> {}

export interface DrawerFooterProps extends HTMLChakraProps<"div"> {}

export interface DrawerContextProps {
  /** Receives the machine, so a consumer can read its state without a component of their own. */
  children: (store: CreateDrawerReturn) => JSX.Element;
}
