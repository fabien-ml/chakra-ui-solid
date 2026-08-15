import type {
  HTMLChakraProps,
  PresetVariant,
  PresetVariantProps,
  PropsProviderProps,
  PropTypes,
  UnstyledProp,
} from "@chakra-ui-solid/core";
import type { ConditionalValue } from "@chakra-ui-solid/styled-system/types";
import type { JSX } from "@solidjs/web";
import type * as popover from "@zag-js/popover";

/** The ids of the eight elements the machine addresses. Useful for composition. */
export interface PopoverElementIds extends popover.ElementIds {}

/** What `onOpenChange` receives. */
export interface PopoverOpenChangeDetails extends popover.OpenChangeDetails {}

/** What `onTriggerValueChange` receives — the value and the element that carried it. */
export interface PopoverTriggerValueChangeDetails extends popover.TriggerValueChangeDetails {}

/** The strings a screen reader reads for controls the machine labels itself. */
export interface PopoverIntlTranslations extends popover.IntlTranslations {}

/** Where the content sits relative to whatever it is anchored to. */
export type PopoverPlacement = popover.Placement;

/**
 * Everything `positioning` accepts — the placement, the gap and shift offsets, whether the content
 * flips when it runs out of room, and how often it repositions.
 *
 * Re-exported under a Popover name rather than left to `@zag-js/popper`, because that package is
 * not a dependency a consumer of this one has: the React version reaches the same type through
 * Ark's root barrel, so naming it here is parity rather than an addition.
 */
export interface PopoverPositioningOptions extends popover.PositioningOptions {}

/** The event `onPointerDownOutside` receives. */
export type PopoverPointerDownOutsideEvent = popover.PointerDownOutsideEvent;

/** The event `onFocusOutside` receives. */
export type PopoverFocusOutsideEvent = popover.FocusOutsideEvent;

/** The event `onInteractOutside` receives — either of the two above. */
export type PopoverInteractOutsideEvent = popover.InteractOutsideEvent;

/**
 * Everything {@link createPopover} takes: the machine's own props, minus the two the library
 * injects.
 *
 * `dir` and `getRootNode` are those two, and they are missing because they come from the locale and
 * environment contexts rather than from the consumer — `@zag-js/popover`'s `props.ts` lists
 * twenty-six keys, and these are the other twenty-four.
 *
 * `onExitComplete` is **not** here: the exit window belongs to a `@zag-js/presence` machine the
 * Root owns rather than to this one, so the Root takes it and passes it there
 * ({@link PopoverPresenceProps}).
 */
export interface CreatePopoverProps {
  /**
   * Seeds every id the machine hands out — the content is `popover:{id}:content`, the trigger
   * `popover:{id}:trigger`, and so on for all eight parts. Defaults to a generated id. Pass `ids`
   * to name the elements themselves.
   */
  id?: string;
  /** Override individual element ids, for pointing an ARIA relationship at a specific one. */
  ids?: PopoverElementIds;
  /** The controlled open state. Pass `undefined` for uncontrolled. */
  open?: boolean;
  /** The open state a fresh, uncontrolled popover starts in. */
  defaultOpen?: boolean;
  /** Called whenever the open state changes, from either side. */
  onOpenChange?: (details: PopoverOpenChangeDetails) => void;
  /**
   * Whether the content blocks the page behind it — pointer events off, scrolling locked,
   * everything else `aria-hidden`, and Tab confined to the content.
   *
   * @default false
   */
  modal?: boolean;
  /**
   * Whether Tab moves out of the content into whatever follows the **trigger**, rather than
   * whatever follows the content in the DOM. Leave it on when the content is inside a `<Portal>`,
   * which is the usual arrangement.
   *
   * @default true
   */
  portalled?: boolean;
  /**
   * Whether opening moves focus into the content — to the first focusable thing in it, or to the
   * content itself when there is none.
   *
   * @default true
   */
  autoFocus?: boolean;
  /** The element that takes focus when the popover opens, instead of the content itself. */
  initialFocusEl?: () => HTMLElement | null;
  /** The element that takes focus when the popover closes. */
  finalFocusEl?: () => HTMLElement | null;
  /**
   * Whether focus returns to whatever had it before the popover opened.
   *
   * @default true
   */
  restoreFocus?: boolean;
  /**
   * Whether a click outside the content closes the popover.
   *
   * @default true
   */
  closeOnInteractOutside?: boolean;
  /**
   * Whether Escape closes the popover.
   *
   * @default true
   */
  closeOnEscape?: boolean;
  /**
   * Where the content is placed and how it reacts to running out of room. The machine merges what
   * you pass over its own `{ placement: "bottom" }`.
   */
  positioning?: PopoverPositioningOptions;
  /** Elements that keep their pointer events and do not count as "outside" — a toast, a tour step. */
  persistentElements?: Array<() => Element | null>;
  /** The strings the machine's own controls are labelled with. */
  translations?: PopoverIntlTranslations;
  /** The controlled active trigger, for one popover shared by several triggers. */
  triggerValue?: string | null;
  /** The active trigger a fresh, uncontrolled popover starts with. */
  defaultTriggerValue?: string | null;
  /** Called whenever the active trigger changes. */
  onTriggerValueChange?: (details: PopoverTriggerValueChangeDetails) => void;
  /** Called when Escape is pressed, before the popover decides whether to close. */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  /** Called on a pointer press outside the content. */
  onPointerDownOutside?: (event: PopoverPointerDownOutsideEvent) => void;
  /** Called when focus moves outside the content. */
  onFocusOutside?: (event: PopoverFocusOutsideEvent) => void;
  /** Called on either of the two above. */
  onInteractOutside?: (event: PopoverInteractOutsideEvent) => void;
  // Read off Zag rather than written out: `LayerDismissEvent` is the layer stack's own type and
  // `@zag-js/popover` does not re-export it, so naming the parameter here would mean re-declaring a
  // `CustomEvent` detail that is not ours.
  /** Called when a parent layer closing takes this one with it. */
  onRequestDismiss?: popover.Props["onRequestDismiss"];
}

/**
 * The connected machine, as a **stable object of reactive getters and delegating methods** rather
 * than the snapshot `{ ...api }` React can take. Each read goes back to the live machine, so
 * `<Show when={popover.open}>` in a consumer's own tree tracks it.
 *
 * The members Zag ships are inherited rather than re-declared, so a member a Zag minor adds arrives
 * here for free and its own JSDoc is what a consumer hovers. `reposition()` is the one worth
 * knowing about: call it after moving whatever the content is anchored to.
 */
export interface CreatePopoverReturn extends Readonly<popover.Api<PropTypes>> {}

/**
 * What the Root hands the presence machine that keeps the content in the DOM while its exit
 * animation runs, plus the two props that decide whether it is in the DOM at all.
 *
 * `lazyMount` and `unmountOnExit` are written out rather than inherited from `RenderStrategyProps`,
 * because a shared interface cannot state a per-component default and it lives in another package,
 * outside the directory the props table is generated from. **Both default to `false` here**, where
 * Dialog defaults both to `true`: Chakra's `PopoverRoot` is `withRootProvider(ArkPopover.Root)`
 * with no options object at all, so nothing overrides the render strategy's own answer, and a
 * closed popover's content is in the DOM from the first render.
 *
 * One of Ark's presence props is absent: `hideMode`, whose `"activity"` value renders children
 * inside React 19's `<Activity>` and has no Solid equivalent.
 */
export interface PopoverPresenceProps {
  /**
   * Drive the content's presence from something other than the popover's own `open` state — an
   * escape hatch for animating the surface independently of the machine.
   *
   * Resolved with `??`, so a wrapper forwarding an unset `present={props.present}` falls back to
   * `open`.
   */
  present?: boolean;
  /**
   * Keep the content out of the DOM entirely until the popover first opens.
   *
   * @default false
   */
  lazyMount?: boolean;
  /**
   * Take the content back out of the DOM once it has closed and its exit animation has finished,
   * rather than leaving it there hidden.
   *
   * @default false
   */
  unmountOnExit?: boolean;
  /** Called once the exit animation has finished and the content is fully gone. */
  onExitComplete?: VoidFunction;
  /** Apply an open/close change in the same frame rather than the next one. */
  immediate?: boolean;
  /**
   * Suppress the enter animation on the very first open, so a `defaultOpen` popover does not
   * animate in as the page loads.
   *
   * @default false
   */
  skipAnimationOnMount?: boolean;
}

/**
 * The slot recipe's one variant, spelled out rather than inherited from the generated
 * `PopoverVariantProps`, so it carries a description a reader can use and a type they can read — a
 * generated type has neither. A variant renamed in the recipe is still caught: the
 * `createSlotClasses` call on the Root is typed against the generated one, so the call, not this
 * interface, is what stops drifting silently.
 *
 * **No `@default` tag.** The recipe's `defaultVariants` is `{ size: "md" }` and it resolves that
 * itself, so restating it here would be a second source of truth that drifts on a preset bump.
 */
export interface PopoverVariantProps extends PresetVariantProps<"popover"> {
  /** How wide the content is and how much padding it carries. */
  size?: ConditionalValue<"xs" | "sm" | "md" | "lg" | PresetVariant<"popover", "size">>;
}

/**
 * The Root's own props — what a `PopoverPropsProvider` above it may supply.
 *
 * `unstyled` arrives through `UnstyledProp` rather than as a member here: it is one of the three
 * props every component in this library takes (`as`, `render`, `unstyled`), and declaring one of
 * them on a component's own interface would list it as a prop this component added.
 */
export interface PopoverRootBaseProps
  extends CreatePopoverProps,
    PopoverPresenceProps,
    PopoverVariantProps,
    UnstyledProp {}

/**
 * Neither Root renders a host element, so neither extends `HTMLChakraProps` — `popover.anatomy`
 * has no `root` part, and a wrapper `div` here would shift every hydration key after it in the
 * consumer's own markup.
 */
export interface PopoverRootProps extends PopoverRootBaseProps {
  children?: JSX.Element;
}

/**
 * The variant and `unstyled` are repeated here rather than reached through
 * {@link PopoverRootBaseProps}, because this Root takes no machine props at all — it is handed a
 * machine instead. Chakra splits the two the same way, into `PopoverRootProviderBaseProps`.
 */
export interface PopoverRootProviderProps
  extends PopoverPresenceProps,
    PopoverVariantProps,
    UnstyledProp {
  /** A machine built by {@link createPopover}, so the consumer owns it rather than the Root. */
  value: CreatePopoverReturn;
  children?: JSX.Element;
}

export interface PopoverPropsProviderProps extends PropsProviderProps<PopoverRootBaseProps> {}

export interface PopoverTriggerProps extends Omit<HTMLChakraProps<"button">, "value"> {
  /**
   * Identifies this trigger among several driving one popover — it becomes the machine's
   * `triggerValue`, and `data-current` marks the one that opened it.
   *
   * It shadows the `button`'s own `value` attribute, which is Ark's split too: this is a machine
   * argument and never reaches the DOM.
   */
  value?: string;
}

export interface PopoverAnchorProps extends HTMLChakraProps<"div"> {}

export interface PopoverPositionerProps extends HTMLChakraProps<"div"> {}

export interface PopoverContentProps extends HTMLChakraProps<"div"> {}

export interface PopoverArrowProps extends HTMLChakraProps<"div"> {}

export interface PopoverArrowTipProps extends HTMLChakraProps<"div"> {}

export interface PopoverTitleProps extends HTMLChakraProps<"div"> {}

export interface PopoverDescriptionProps extends HTMLChakraProps<"div"> {}

export interface PopoverCloseTriggerProps extends HTMLChakraProps<"button"> {}

// Typed off the element each one renders rather than off Chakra's declaration, which says `div`
// for the header: `PopoverHeader` is minted from the string `"header"`, and the DOM is what a
// recipe selector, a snapshot and a screen reader all see. Dialog's Content made the same call.
export interface PopoverHeaderProps extends HTMLChakraProps<"header"> {}

export interface PopoverBodyProps extends HTMLChakraProps<"div"> {}

export interface PopoverFooterProps extends HTMLChakraProps<"footer"> {}

export interface PopoverContextProps {
  /** Receives the machine, so a consumer can read its state without a component of their own. */
  children: (store: CreatePopoverReturn) => JSX.Element;
}
