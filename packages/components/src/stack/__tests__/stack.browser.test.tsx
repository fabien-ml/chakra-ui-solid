import { type MountedElement, mountElement } from "@chakra-ui-solid/internal-test-utils";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { HStack, Stack, VStack } from "../stack";
import { StackSeparator } from "../stack-separator";

let mounted: MountedElement | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

const Item = (props: { size?: string }) => (
  <div data-item="" style={{ width: props.size ?? "20px", height: props.size ?? "20px" }} />
);

const childrenOf = (stack: HTMLElement) => [...stack.children] as HTMLElement[];
const separatorsOf = (stack: HTMLElement) =>
  childrenOf(stack).filter((child) => !child.hasAttribute("data-item"));

/** A missing child is a failed expectation, not a case to handle — `noUncheckedIndexedAccess` is on. */
function at(elements: HTMLElement[], index: number): HTMLElement {
  const element = elements[index];
  if (element === undefined) {
    throw new Error(`the stack rendered ${elements.length} children, so there is none at ${index}`);
  }
  return element;
}

describe("Stack", () => {
  it("stacks downwards with Chakra's default gap", () => {
    mounted = mountElement(() => <Stack>content</Stack>);
    const style = getComputedStyle(mounted.element);

    expect(style.display).toBe("flex");
    expect(style.flexDirection).toBe("column");
    // `0.5rem`, which is the same computed length as Panda's `stack` pattern default of `8px` only
    // while the root font size is 16px — and the pattern's default is the one class our sheet has
    // no rule for, which is why the mapping goes through `flex.raw` instead.
    expect(style.gap).toBe("8px");
  });

  it("takes a direction the build cannot see", () => {
    // Held in a signal so no literal is extractable from this file: the rule can only come from the
    // preset's `staticCss`, which is what a consumer's own `<Stack direction="row">` relies on too.
    const [direction] = createSignal<"row">("row");
    mounted = mountElement(() => <Stack direction={direction()}>content</Stack>);

    expect(getComputedStyle(mounted.element).flexDirection).toBe("row");
  });

  it("maps `align`, `justify` and `wrap`", () => {
    mounted = mountElement(() => (
      <Stack align="center" justify="space-between" wrap="wrap">
        content
      </Stack>
    ));
    const style = getComputedStyle(mounted.element);

    expect(style.alignItems).toBe("center");
    expect(style.justifyContent).toBe("space-between");
    expect(style.flexWrap).toBe("wrap");
  });

  it("lets a style prop passed alongside a shorthand lose to it", () => {
    mounted = mountElement(() => <Stack direction="row" flexDirection="column" />);

    expect(getComputedStyle(mounted.element).flexDirection).toBe("row");
  });

  it("carries Chakra's marker class alongside the computed one", () => {
    mounted = mountElement(() => <Stack class="mine">content</Stack>);

    expect(mounted.element.classList.contains("chakra-stack")).toBe(true);
    expect(mounted.element.classList.contains("mine")).toBe(true);
  });
});

describe("HStack and VStack", () => {
  it("runs across, centred", () => {
    mounted = mountElement(() => <HStack>content</HStack>);
    const style = getComputedStyle(mounted.element);

    expect(style.flexDirection).toBe("row");
    expect(style.alignItems).toBe("center");
  });

  it("runs down, centred", () => {
    mounted = mountElement(() => <VStack>content</VStack>);
    const style = getComputedStyle(mounted.element);

    expect(style.flexDirection).toBe("column");
    expect(style.alignItems).toBe("center");
  });

  it("takes an `align` override but not a `direction` one", () => {
    // Chakra's own prop order: `align` before the spread so a consumer can beat it, `direction`
    // after so they cannot.
    //
    // The signal is not decoration. `HStack` is not a Panda pattern name where `Stack` is, so a
    // literal `direction="column"` written on one is extracted as the CSS property of that name —
    // `direction: column`, which no browser parses and `check:declaration-support` rejects. It is
    // the same artefact Wrap's `direction` leaves in a consumer's sheet, and keeping it out of
    // ours is what this spelling is for.
    const [direction] = createSignal<"column">("column");
    mounted = mountElement(() => <HStack align="flex-end" direction={direction()} />);
    const style = getComputedStyle(mounted.element);

    expect(style.alignItems).toBe("flex-end");
    expect(style.flexDirection).toBe("row");
  });
});

describe("the separator", () => {
  it("renders N−1 of them, each its own element", () => {
    mounted = mountElement(() => (
      <Stack separator={StackSeparator}>
        <Item />
        <Item />
        <Item />
      </Stack>
    ));

    const separators = separatorsOf(mounted.element);
    expect(separators).toHaveLength(2);
    // The whole reason `separator` takes a component: one already-constructed node inserted twice
    // *moves*, and a single separator at the last gap looks like a layout choice rather than a bug.
    expect(separators[0]).not.toBe(separators[1]);
    expect(childrenOf(mounted.element).map((child) => child.hasAttribute("data-item"))).toEqual([
      true,
      false,
      true,
      false,
      true,
    ]);
  });

  it("renders none without one, and none between a lone child", () => {
    mounted = mountElement(() => (
      <Stack>
        <Item />
        <Item />
      </Stack>
    ));
    expect(separatorsOf(mounted.element)).toHaveLength(0);
    mounted.dispose();

    mounted = mountElement(() => (
      <Stack separator={StackSeparator}>
        <Item />
      </Stack>
    ));
    expect(separatorsOf(mounted.element)).toHaveLength(0);
  });

  it("draws the line across a column stack and down a row one", () => {
    // The assertion the whole context route exists for, and it is also what proves the base's
    // `border-width: 0` does not outrank the longhand that draws the line — two atomic classes on
    // one element, decided by the order Panda wrote them in.
    mounted = mountElement(() => (
      <Stack separator={StackSeparator}>
        <Item />
        <Item />
      </Stack>
    ));
    let style = getComputedStyle(at(separatorsOf(mounted.element), 0));
    expect(style.borderTopWidth).toBe("1px");
    expect(style.borderInlineStartWidth).toBe("0px");
    mounted.dispose();

    mounted = mountElement(() => (
      <Stack direction="row" separator={StackSeparator}>
        <Item />
        <Item />
      </Stack>
    ));
    style = getComputedStyle(at(separatorsOf(mounted.element), 0));
    expect(style.borderTopWidth).toBe("0px");
    expect(style.borderInlineStartWidth).toBe("1px");
  });

  it("redraws it when the direction changes under it", () => {
    const [direction, setDirection] = createSignal<"column" | "row">("column");
    mounted = mountElement(() => (
      <Stack direction={direction()} separator={StackSeparator}>
        <Item />
        <Item />
      </Stack>
    ));

    flush(() => setDirection("row"));
    const style = getComputedStyle(at(separatorsOf(mounted.element), 0));
    expect(style.borderInlineStartWidth).toBe("1px");
    expect(style.borderTopWidth).toBe("0px");
  });

  it("stretches across the stack rather than shrinking to its content", () => {
    mounted = mountElement(() => (
      <Stack width="200px" separator={StackSeparator}>
        <Item />
        <Item />
      </Stack>
    ));

    expect(at(separatorsOf(mounted.element), 0).getBoundingClientRect().width).toBe(200);
  });

  it("leaves a gap either side of the line, which is the spacing Chakra's margins buy", () => {
    // The measurement behind the one divergence: Chakra unsets the flex `gap` and gives the
    // separator `marginY: gap`, and this library keeps the gap and gives it no margins, because
    // the gap's value arrives as a prop and no stylesheet has a rule for it. Both come to the same
    // geometry — `gap` + the line + `gap` — and that is what is asserted rather than the mechanism.
    mounted = mountElement(() => (
      <Stack gap="4" separator={StackSeparator}>
        <Item />
        <Item />
      </Stack>
    ));

    const items = childrenOf(mounted.element);
    const [first, separator, second] = [at(items, 0), at(items, 1), at(items, 2)];
    const gap = 16;
    expect(separator.getBoundingClientRect().top - first.getBoundingClientRect().bottom).toBe(gap);
    expect(second.getBoundingClientRect().top - separator.getBoundingClientRect().bottom).toBe(gap);
    expect(second.getBoundingClientRect().top - first.getBoundingClientRect().bottom).toBe(
      gap + 1 + gap,
    );
  });
});

describe("StackSeparator", () => {
  it("draws a column stack's line when it has no stack to ask", () => {
    // Chakra's default direction, reached through the context's default rather than a second copy
    // of it — a separator rendered outside a Stack is still a horizontal rule.
    mounted = mountElement(() => <StackSeparator />);
    const style = getComputedStyle(mounted.element);

    expect(style.borderTopWidth).toBe("1px");
    expect(style.alignSelf).toBe("stretch");
  });

  it("takes a border colour from the consumer", () => {
    mounted = mountElement(() => <StackSeparator borderColor="red.500" />);

    expect(getComputedStyle(mounted.element).borderTopColor).toBe("rgb(239, 68, 68)");
  });
});
