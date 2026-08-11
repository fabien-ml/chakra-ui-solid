import { type CssProp, chakra, composeCss, type HTMLChakraProps } from "@chakra-ui-solid/core";
import { cx } from "@chakra-ui-solid/styled-system/css";
import { flex } from "@chakra-ui-solid/styled-system/patterns";
import type { ConditionalValue, SystemStyleObject } from "@chakra-ui-solid/styled-system/types";
import { Dynamic } from "@solidjs/web";
import { type Accessor, type Component, children, createContext, merge, omit } from "solid-js";

/** The four axes a Stack can run along, in Panda's conditional form so `{ base, md }` is spellable. */
export type StackDirection = ConditionalValue<"row" | "column" | "row-reverse" | "column-reverse">;

export interface StackOptions {
  /** Shorthand for `alignItems`. */
  align?: SystemStyleObject["alignItems"];
  /** Shorthand for `justifyContent`. */
  justify?: SystemStyleObject["justifyContent"];
  /** Shorthand for `flexWrap`. */
  wrap?: SystemStyleObject["flexWrap"];
  /** The direction to stack the items. @default "column" */
  direction?: StackDirection;
  /**
   * Rendered between each pair of children — usually {@link StackSeparator}.
   *
   * A **component**, where Chakra takes an element, and that is the one API change Stack makes.
   * See the note on {@link Stack}.
   */
  separator?: Component;
}

export interface StackProps extends Omit<HTMLChakraProps<"div">, "direction">, StackOptions {}

const OPTIONS = ["align", "justify", "wrap", "direction", "separator"] as const;

/** Chakra's default gap, spelled here so the value is a literal a consumer's build can extract. */
const DEFAULT_GAP = "0.5rem";

const StyledStack = chakra("div", {
  base: { display: "flex", gap: DEFAULT_GAP },
});

/**
 * The Stack's direction, for the separator between its children to read.
 *
 * A separator is passed *in*, so it cannot be handed the direction as a prop without changing what
 * a consumer writes. Context is how it learns which of its two borders to draw — and unlike Group's
 * route of writing onto the resolved child, this one costs no SSR: the separator computes its own
 * class in its own render, so the server markup already carries it.
 */
export const StackDirectionContext = createContext<Accessor<StackDirection>>(() => "column");

/**
 * Stack — a flex container that lays its children out in a line, vertically by default, with a gap
 * between them and an optional separator.
 *
 * **`separator` takes a component, not an element** — `separator={() => <StackSeparator />}` or
 * `separator={StackSeparator}`, where Chakra writes `separator={<StackSeparator />}` and clones it
 * N−1 times. Solid has no `cloneElement`: by the time a parent sees a child it is one constructed
 * DOM node, and inserting one node in N−1 places *moves* it, leaving a single separator at the
 * last gap. Measured — the inline spelling happens to survive, because Solid compiles JSX in a prop
 * position to a getter that builds a fresh node per read, but hoisting it to a `const` first is a
 * silent one-separator render. A component is the spelling that cannot be written wrongly, and it
 * makes the element spelling a type error rather than a layout that is quietly missing.
 *
 * The shorthand → property mapping is Panda's `flex` pattern rather than its `stack` pattern:
 * `stack.raw` injects `gap: 8px` as a default, a class no source in this library spells, so our
 * sheet would have no rule for it. `flex.raw` maps `direction` / `align` / `justify` / `wrap`
 * identically and injects nothing, and Chakra's own `0.5rem` default is declared in the base above.
 * A consumer's `<Stack direction="row">` still goes through Panda's `stack` pattern, which claims
 * that JSX name and maps `direction` to the same `flexDirection` — so the class we compute and the
 * rule their build emits are the same one. `wrap` is the exception that pattern has no answer for;
 * its keywords come from the preset's `staticCss`.
 */
export const Stack: Component<StackProps> = (props) => {
  const direction = () => props.direction ?? "column";
  const resolved = children(() => props.children);

  const withSeparators = () => {
    const separator = props.separator;
    if (separator === undefined) {
      return resolved();
    }
    // Every resolved child, where Chakra interleaves only the *valid elements* and drops the rest.
    // Reproducing that here would mean deleting a text child from the page — `children()` has
    // already resolved it to a node, so there is nothing invalid left to filter.
    const items = resolved.toArray();
    return items.flatMap((child, index) =>
      index === items.length - 1 ? [child] : [child, <Dynamic component={separator} />],
    );
  };

  const elementProps = merge(omit(props, ...OPTIONS, "css", "class", "children"), {
    get css(): CssProp {
      return composeCss(
        flex.raw({
          direction: direction(),
          align: props.align,
          justify: props.justify,
          wrap: props.wrap,
        }),
        props.css,
      );
    },
    get class() {
      return cx("chakra-stack", props.class as string | undefined);
    },
  });

  return (
    <StyledStack {...elementProps}>
      {/* The separators are built inside the provider on purpose: Solid resolves context through
          the owner that created a component, so one built in the body above would read the
          default direction and draw the wrong border. */}
      <StackDirectionContext value={direction}>{withSeparators()}</StackDirectionContext>
    </StyledStack>
  );
};

/** HStack — a {@link Stack} that runs across, with its children centred on the cross axis. */
export const HStack: Component<StackProps> = (props) => (
  <Stack align="center" {...props} direction="row" />
);

/** VStack — a {@link Stack} that runs down, with its children centred on the cross axis. */
export const VStack: Component<StackProps> = (props) => (
  <Stack align="center" {...props} direction="column" />
);
