import { type MountedElement, mountElement } from "@chakra-ui-solid/internal-test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { Circle } from "../circle";

let mounted: MountedElement | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

describe("Circle", () => {
  it("is a Square with its corners rounded away", () => {
    mounted = mountElement(() => <Circle size="10" />);
    const style = getComputedStyle(mounted.element);

    expect(style.width).toBe("40px");
    expect(style.height).toBe("40px");
    expect(style.borderRadius).toBe("9999px");
  });

  it("lets a consumer's `borderRadius` override it", () => {
    // A `withDefaults` entry resolves by value, so this is the precedence Chakra gives it.
    mounted = mountElement(() => <Circle size="10" borderRadius="0" />);
    expect(getComputedStyle(mounted.element).borderRadius).toBe("0px");
  });

  it("keeps the default when a wrapper forwards `borderRadius` unset", () => {
    // The measurement behind the `withDefaults` call. Written as `borderRadius="9999px"
    // {...props}` the default is *gone* here: a JSX spread is a presence merge, so the forwarded
    // `undefined` wins, `css()` receives `undefined`, and no rule is emitted (`CLAUDE.md`, *The
    // third hazard*).
    const Forwarding = (props: { borderRadius?: string }) => (
      <Circle size="10" borderRadius={props.borderRadius} />
    );

    mounted = mountElement(() => <Forwarding />);

    expect(getComputedStyle(mounted.element).borderRadius).toBe("9999px");
  });
});
