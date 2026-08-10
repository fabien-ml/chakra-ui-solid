import { cx } from "@chakra-ui-solid/styled-system/css";
import type { JsxStyleProps } from "@chakra-ui-solid/styled-system/types";
import { chakra, type HTMLChakraProps } from "@chakra-ui-solid/system";
import { type ComponentProps, isServer } from "@solidjs/web";
import { type Component, children, createRenderEffect, merge, omit } from "solid-js";

const StyledGroup = chakra("div", {
  base: {
    display: "inline-flex",
    gap: "var(--group-gap, 0.5rem)",
    isolation: "isolate",
    position: "relative",
    "& [data-group-item]": {
      _focusVisible: { zIndex: 1 },
    },
  },
  variants: {
    orientation: {
      horizontal: { flexDirection: "row" },
      vertical: { flexDirection: "column" },
    },
    attached: {
      true: { gap: "0!" },
    },
    grow: {
      true: {
        display: "flex",
        "& > *": { flex: 1 },
      },
    },
    stacking: {
      "first-on-top": {
        "& > [data-group-item]": { zIndex: "calc(var(--group-count) - var(--group-index))" },
      },
      "last-on-top": {
        "& > [data-group-item]": { zIndex: "var(--group-index)" },
      },
    },
  },
  compoundVariants: [
    {
      orientation: "horizontal",
      attached: true,
      css: {
        "& > *[data-first]": { borderEndRadius: "0!", marginEnd: "-1px" },
        "& > *[data-between]": { borderRadius: "0!", marginEnd: "-1px" },
        "& > *[data-last]": { borderStartRadius: "0!" },
      },
    },
    {
      orientation: "vertical",
      attached: true,
      css: {
        "& > *[data-first]": { borderBottomRadius: "0!", marginBottom: "-1px" },
        "& > *[data-between]": { borderRadius: "0!", marginBottom: "-1px" },
        "& > *[data-last]": { borderTopRadius: "0!" },
      },
    },
  ],
  defaultVariants: {
    orientation: "horizontal",
  },
});

type GroupVariantProps = Omit<ComponentProps<typeof StyledGroup>, keyof HTMLChakraProps<"div">>;

export interface GroupProps extends HTMLChakraProps<"div">, GroupVariantProps {
  /** Shorthand for `alignItems`. @default "center" */
  align?: JsxStyleProps["alignItems"];
  /** Shorthand for `justifyContent`. @default "flex-start" */
  justify?: JsxStyleProps["justifyContent"];
  /** Shorthand for `flexWrap`. */
  wrap?: JsxStyleProps["flexWrap"];
  /** Children this predicate accepts are left undecorated and do not count towards the positions. */
  skip?: (child: Element) => boolean;
}

/** Chakra's `dataAttr`: present-and-empty when true, absent when false. */
function setFlag(element: Element, name: string, on: boolean): void {
  if (on) {
    element.setAttribute(name, "");
  } else {
    element.removeAttribute(name);
  }
}

/**
 * The Solid answer to `Children.toArray` + `cloneElement`.
 *
 * React re-creates each child with extra props. Solid has no equivalent and cannot grow one: a
 * Solid JSX element is an already-constructed DOM node by the time a parent sees it, so there is
 * nothing to clone and nothing to re-render. `children()` resolves the same list to those nodes,
 * and the decoration is written onto them — the recipe above then selects on `[data-first]` and
 * friends exactly as Chakra's does, unchanged.
 *
 * It runs in a **render** effect so the attributes are in place before paint, and re-runs whenever
 * the child list or `skip` changes, clearing what it previously set. The one thing it cannot do is
 * run on the server: server-rendered markup carries no `data-first` until the client takes over, so
 * an `attached` Group shows square corners for the first frame of an SSR page. That is the delta
 * this route costs, and it is the only one.
 */
function decorateChildren(items: Element[], skip: ((child: Element) => boolean) | undefined): void {
  // A lone child has no neighbours to be attached to, so Chakra leaves the list alone — including
  // the case where skipping reduces it to one.
  const positioned = items.filter((child) => skip?.(child) !== true);
  if (items.length < 2 || positioned.length < 2) {
    return;
  }

  for (const child of items) {
    const index = positioned.indexOf(child);
    if (index === -1) {
      continue;
    }
    child.setAttribute("data-group-item", "");
    setFlag(child, "data-first", index === 0);
    setFlag(child, "data-last", index === positioned.length - 1);
    setFlag(child, "data-between", index > 0 && index < positioned.length - 1);

    if (child instanceof HTMLElement || child instanceof SVGElement) {
      child.style.setProperty("--group-count", String(positioned.length));
      child.style.setProperty("--group-index", String(index));
    }
  }
}

/**
 * Group — the container that makes a row of controls read as one: an equal gap, or no gap at all
 * with the seam between neighbours collapsed (`attached`).
 *
 * `align`, `justify` and `wrap` are placed **before** the consumer's own props, so an explicit
 * `alignItems` overrides the shorthand. Their values arrive as props and no Panda pattern claims
 * the name `Group`, so the keywords they can take are pre-generated in the preset's `staticCss`.
 */
export const Group: Component<GroupProps> = (props) => {
  const resolved = children(() => props.children);

  // Not merely skipped on the server — **unreachable** there. A render effect runs during SSR, and
  // `child instanceof Element` reads a DOM global that does not exist in that runtime: the whole
  // page 500s with `Element is not defined`, which is how a docs page carrying a Group found it.
  // The decoration was always client-only (see `decorateChildren`), so this costs nothing beyond
  // what that route already costs.
  if (!isServer) {
    // Solid 2.0's two-callback form, and the split matters: everything reactive is read in the
    // compute callback, because the second one is a strict-read scope where a prop read would be a
    // diagnostic rather than a subscription.
    createRenderEffect(
      () => ({
        items: resolved.toArray().filter((child): child is Element => child instanceof Element),
        skip: props.skip,
      }),
      ({ items, skip }) => decorateChildren(items, skip),
    );
  }

  const elementProps = merge(
    {
      get alignItems() {
        return props.align ?? "center";
      },
      get justifyContent() {
        return props.justify ?? "flex-start";
      },
      get flexWrap() {
        return props.wrap;
      },
    },
    omit(props, "align", "justify", "wrap", "skip", "class", "children"),
    {
      get class() {
        return cx("chakra-group", props.class as string | undefined);
      },
      get children() {
        return resolved();
      },
    },
  );

  return <StyledGroup {...elementProps} />;
};
