import type {
  HTMLChakraProps,
  PropsProviderProps,
  PropTypes,
  SkinVariant,
  UnstyledProp,
} from "@chakra-ui-solid/core";
import type { ConditionalValue } from "@chakra-ui-solid/styled-system/types";
import type { JSX } from "@solidjs/web";
import type * as dialog from "@zag-js/dialog";

/** The ids of the seven elements the machine addresses. Useful for composition. */
export interface DialogElementIds extends dialog.ElementIds {}

/** What `onOpenChange` receives. */
export interface DialogOpenChangeDetails extends dialog.OpenChangeDetails {}

/** What `onTriggerValueChange` receives — the value and the element that carried it. */
export interface DialogTriggerValueChangeDetails extends dialog.TriggerValueChangeDetails {}

/** The event `onPointerDownOutside` receives. */
export type DialogPointerDownOutsideEvent = dialog.PointerDownOutsideEvent;

/** The event `onFocusOutside` receives. */
export type DialogFocusOutsideEvent = dialog.FocusOutsideEvent;

/** The event `onInteractOutside` receives — either of the two above. */
export type DialogInteractOutsideEvent = dialog.InteractOutsideEvent;

/**
 * Everything {@link createDialog} takes: the machine's own props, minus the two the library injects.
 *
 * `dir` and `getRootNode` are those two, and they are missing because they come from the locale and
 * environment contexts rather than from the consumer — `@zag-js/dialog`'s `props.ts` lists
 * twenty-six keys, and these are the other twenty-four.
 *
 * `onExitComplete` is **not** here, unlike Collapsible's: Dialog's exit window belongs to a
 * `@zag-js/presence` machine the Root owns, not to this one, so the Root takes it and passes it
 * there ({@link DialogPresenceProps}).
 */
export interface CreateDialogProps {
  /**
   * Seeds every id the machine hands out — the content is `dialog:{id}:content`, the trigger
   * `dialog:{id}:trigger`, and so on for all seven parts. Defaults to a generated id. Pass `ids` to
   * name the elements themselves.
   */
  id?: string;
  /** Override individual element ids, for pointing an ARIA relationship at a specific one. */
  ids?: DialogElementIds;
  /** The controlled open state. Pass `undefined` for uncontrolled. */
  open?: boolean;
  /** The open state a fresh, uncontrolled dialog starts in. */
  defaultOpen?: boolean;
  /** Called whenever the open state changes, from either side. */
  onOpenChange?: (details: DialogOpenChangeDetails) => void;
  /**
   * Whether the content blocks the page behind it — pointer events off, everything else
   * `aria-hidden`.
   *
   * @default true
   */
  modal?: boolean;
  /**
   * The ARIA role the content carries. `alertdialog` is the interruptive one, for a destructive
   * confirmation.
   *
   * @default "dialog"
   */
  role?: "dialog" | "alertdialog";
  /**
   * Whether Tab is confined to the content while it is open.
   *
   * @default true
   */
  trapFocus?: boolean;
  /**
   * Whether the page behind the dialog stops scrolling while it is open.
   *
   * @default true
   */
  preventScroll?: boolean;
  /** Whether focus returns to whatever had it before the dialog opened. */
  restoreFocus?: boolean;
  /** The element that takes focus when the dialog opens, instead of the content itself. */
  initialFocusEl?: () => HTMLElement | null;
  /** The element that takes focus when the dialog closes. */
  finalFocusEl?: () => HTMLElement | null;
  /**
   * Whether a click outside the content closes the dialog.
   *
   * @default true
   */
  closeOnInteractOutside?: boolean;
  /**
   * Whether Escape closes the dialog.
   *
   * @default true
   */
  closeOnEscape?: boolean;
  /** A label for the dialog, for when no `<Dialog.Title>` is rendered. */
  "aria-label"?: string;
  /** Elements that keep their pointer events and do not count as "outside" — a toast, a tour step. */
  persistentElements?: Array<() => Element | null>;
  /** The controlled active trigger, for one dialog shared by several triggers. */
  triggerValue?: string | null;
  /** The active trigger a fresh, uncontrolled dialog starts with. */
  defaultTriggerValue?: string | null;
  /** Called whenever the active trigger changes. */
  onTriggerValueChange?: (details: DialogTriggerValueChangeDetails) => void;
  /** Called when Escape is pressed, before the dialog decides whether to close. */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  /** Called on a pointer press outside the content. */
  onPointerDownOutside?: (event: DialogPointerDownOutsideEvent) => void;
  /** Called when focus moves outside the content. */
  onFocusOutside?: (event: DialogFocusOutsideEvent) => void;
  /** Called on either of the two above. */
  onInteractOutside?: (event: DialogInteractOutsideEvent) => void;
  // Read off Zag rather than written out: `LayerDismissEvent` is the layer stack's own type and
  // `@zag-js/dialog` does not re-export it, so naming the parameter here would mean re-declaring a
  // `CustomEvent` detail that is not ours.
  /** Called when a parent layer closing takes this one with it. */
  onRequestDismiss?: dialog.Props["onRequestDismiss"];
}

/**
 * The connected machine, as a **stable object of reactive getters and delegating methods** rather
 * than the snapshot `{ ...api }` React can take. Each read goes back to the live machine, so
 * `<Show when={dialog.open}>` in a consumer's own tree tracks it.
 *
 * Nothing is added to it, where `CreateCollapsibleReturn` adds `unmounted`: Collapsible's machine
 * owns its own exit window, so its render strategy can be resolved beside the machine. Dialog's
 * belongs to a presence machine the **Root** creates, and two independently-mounted subtrees
 * (Content and Backdrop) each get their own — so `unmounted` is a fact about a part, not about the
 * machine, and it lives on the context instead.
 *
 * The members Zag ships are inherited rather than re-declared, so a member a Zag minor adds arrives
 * here for free and its own JSDoc is what a consumer hovers.
 */
export interface CreateDialogReturn extends Readonly<dialog.Api<PropTypes>> {}

/**
 * What the Root hands the presence machine that keeps the content in the DOM while its exit
 * animation runs, plus the two props that decide whether it is in the DOM at all.
 *
 * `lazyMount` and `unmountOnExit` are written out rather than inherited from `RenderStrategyProps`,
 * because a shared interface cannot state a per-component default and **Chakra defaults both to
 * `true` here** where it defaults both to `false` on Collapsible. It is the interface's own
 * `@default` that a docs table prints.
 *
 * One of Ark's presence props is absent: `hideMode`, whose `"activity"` value renders children
 * inside React 19's `<Activity>` and has no Solid equivalent. Ark's own Solid package omits it too.
 */
export interface DialogPresenceProps {
  /**
   * Drive the content's presence from something other than the dialog's own `open` state — an
   * escape hatch for animating the surface independently of the machine.
   *
   * **It reaches the content and the positioner only.** The backdrop builds its own presence
   * straight from `open` and ignores this, so `present={true}` over a closed dialog shows the
   * surface with no scrim behind it. That asymmetry is Ark's, reproduced rather than corrected —
   * `DialogBackdrop` hard-codes `present: dialog.open` where `DialogRoot` merges this prop in.
   *
   * Resolved with `??`, so a wrapper forwarding an unset `present={props.present}` falls back to
   * `open`. That is parity rather than a fix: Ark's `createSplitProps` drops an `undefined` before
   * the merge ever sees it, so the React version resolves this key by value too.
   */
  present?: boolean;
  /**
   * Keep the content out of the DOM entirely until the dialog first opens.
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
   * Suppress the enter animation on the very first open, so a `defaultOpen` dialog does not animate
   * in as the page loads.
   *
   * @default false
   */
  skipAnimationOnMount?: boolean;
}

/**
 * The slot recipe's four variants, spelled out rather than inherited from the generated
 * `DialogVariantProps`, so each carries a description a reader can use and a type they can read — a
 * generated type has neither. A variant renamed in the recipe is still caught: the
 * `createSlotClasses` call on the Root is typed against the generated one, so the call, not this
 * interface, is what stops drifting silently.
 *
 * **No `@default` tag on any of the four.** The recipe's `defaultVariants` is
 * `{ size: "md", scrollBehavior: "outside", placement: "top", motionPreset: "scale" }` and it
 * resolves them itself, so restating one here would be a second source of truth that drifts on a
 * preset bump — the mirror of why `lazyMount` *does* carry one ({@link DialogPresenceProps}), which
 * this component sets in its own `withDefaults` call.
 */
export interface DialogVariantProps {
  /** How wide the surface is allowed to grow. `cover` and `full` also change its height. */
  size?: ConditionalValue<
    "xs" | "sm" | "md" | "lg" | "xl" | "cover" | "full" | SkinVariant<"dialog", "size">
  >;
  /** Where the surface sits in the viewport. */
  placement?: ConditionalValue<"center" | "top" | "bottom" | SkinVariant<"dialog", "placement">>;
  /** Whether a dialog taller than the viewport scrolls its own body or the page behind it. */
  scrollBehavior?: ConditionalValue<"inside" | "outside" | SkinVariant<"dialog", "scrollBehavior">>;
  /** Which pair of enter/exit animations the surface plays. */
  motionPreset?: ConditionalValue<
    | "scale"
    | "slide-in-bottom"
    | "slide-in-top"
    | "slide-in-left"
    | "slide-in-right"
    | "none"
    | SkinVariant<"dialog", "motionPreset">
  >;
}

/**
 * The Root's own props — what a `PropsProvider` above it may supply.
 *
 * `unstyled` arrives through `UnstyledProp` rather than as a member here, and the distinction is
 * the props table's: it is one of the three props every component in this library takes from
 * `ChakraStylingProps` (`as`, `render`, `unstyled`), and declaring one of them on a component's own
 * interface lists it as a prop the component added. Collapsible inherits the same prop from
 * `HTMLChakraProps`; a Dialog root renders no element, so it has no such surface to inherit it
 * from and names the one interface Chakra names — `DialogRootBaseProps` there is
 * `Assign<ArkDialog.RootProps, SlotRecipeProps<"dialog">>, UnstyledProp`.
 */
export interface DialogRootBaseProps
  extends CreateDialogProps,
    DialogPresenceProps,
    DialogVariantProps,
    UnstyledProp {}

/**
 * Neither Root renders a host element, so neither extends `HTMLChakraProps` — `dialog.anatomy` has
 * no `root` part, and a wrapper `div` here would shift every hydration key after it in the
 * consumer's own markup. That also means there is no Root/RootProvider `id` split to make: `id`
 * seeds the machine on one and is simply absent from the other.
 */
export interface DialogRootProps extends DialogRootBaseProps {
  children?: JSX.Element;
}

/**
 * The variants and `unstyled` are repeated here rather than reached through
 * {@link DialogRootBaseProps}, because this Root takes no machine props at all — it is handed a
 * machine instead. Chakra splits the two the same way, into `DialogRootProviderBaseProps`.
 */
export interface DialogRootProviderProps
  extends DialogPresenceProps,
    DialogVariantProps,
    UnstyledProp {
  /** A machine built by {@link createDialog}, so the consumer owns it rather than the Root. */
  value: CreateDialogReturn;
  children?: JSX.Element;
}

export interface DialogPropsProviderProps extends PropsProviderProps<DialogRootBaseProps> {}

export interface DialogTriggerProps extends Omit<HTMLChakraProps<"button">, "value"> {
  /**
   * Identifies this trigger among several driving one dialog — it becomes the machine's
   * `triggerValue`, and `data-current` marks the one that opened it.
   *
   * It shadows the `button`'s own `value` attribute, which is Ark's split too: this is a machine
   * argument and never reaches the DOM.
   */
  value?: string;
}

export interface DialogBackdropProps extends HTMLChakraProps<"div"> {}

export interface DialogPositionerProps extends HTMLChakraProps<"div"> {}

export interface DialogContentProps extends HTMLChakraProps<"div"> {}

export interface DialogTitleProps extends HTMLChakraProps<"h2"> {}

export interface DialogDescriptionProps extends HTMLChakraProps<"div"> {}

export interface DialogCloseTriggerProps extends HTMLChakraProps<"button"> {}

export interface DialogActionTriggerProps extends HTMLChakraProps<"button"> {}

export interface DialogHeaderProps extends HTMLChakraProps<"div"> {}

export interface DialogBodyProps extends HTMLChakraProps<"div"> {}

export interface DialogFooterProps extends HTMLChakraProps<"div"> {}

export interface DialogContextProps {
  /** Receives the machine, so a consumer can read its state without a component of their own. */
  children: (store: CreateDialogReturn) => JSX.Element;
}
