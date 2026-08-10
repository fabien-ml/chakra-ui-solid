import { type MountedElement, mountElement } from "@chakra-ui-solid/internal-test-utils";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { Flex } from "../flex";

let mounted: MountedElement | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

describe("Flex", () => {
  it("is a flex container by default", () => {
    mounted = mountElement(() => <Flex>content</Flex>);
    expect(getComputedStyle(mounted.element).display).toBe("flex");
  });

  it("maps every shorthand to its flexbox property", () => {
    mounted = mountElement(() => (
      <Flex direction="column" align="center" justify="space-between" wrap="wrap" basis="auto">
        content
      </Flex>
    ));
    const style = getComputedStyle(mounted.element);

    expect(style.flexDirection).toBe("column");
    expect(style.alignItems).toBe("center");
    expect(style.justifyContent).toBe("space-between");
    expect(style.flexWrap).toBe("wrap");
    expect(style.flexBasis).toBe("auto");
  });

  it("flips to `inline-flex` when `inline` is set", () => {
    mounted = mountElement(() => <Flex inline>content</Flex>);
    expect(getComputedStyle(mounted.element).display).toBe("inline-flex");
  });

  it("keeps `direction` off the element, where it is a real CSS property", () => {
    // `direction` is `ltr`/`rtl` in CSS, so a shorthand forwarded verbatim would both set the
    // wrong property and lose the flex direction.
    mounted = mountElement(() => <Flex direction="row-reverse">content</Flex>);

    expect(mounted.element.hasAttribute("direction")).toBe(false);
    expect(getComputedStyle(mounted.element).direction).toBe("ltr");
    expect(getComputedStyle(mounted.element).flexDirection).toBe("row-reverse");
  });

  it("tracks a reactive shorthand", () => {
    const [direction, setDirection] = createSignal<"row" | "column">("column");
    mounted = mountElement(() => <Flex direction={direction()}>content</Flex>);

    expect(getComputedStyle(mounted.element).flexDirection).toBe("column");
    flush(() => setDirection("row"));
    expect(getComputedStyle(mounted.element).flexDirection).toBe("row");
  });

  it("lets the consumer's `css` beat the shorthand", () => {
    mounted = mountElement(() => (
      <Flex direction="row" css={{ flexDirection: "column" }}>
        content
      </Flex>
    ));
    expect(getComputedStyle(mounted.element).flexDirection).toBe("column");
  });
});
