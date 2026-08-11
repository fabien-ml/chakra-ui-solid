import { type MountedElement, mountElement } from "@chakra-ui-solid/internal-test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { Text, TextPropsProvider } from "../text";

let mounted: MountedElement | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

describe("Text", () => {
  it("renders a paragraph carrying its style props", () => {
    mounted = mountElement(() => <Text fontWeight="bold">Sphinx of black quartz</Text>);

    expect(mounted.element.tagName).toBe("P");
    expect(getComputedStyle(mounted.element).fontWeight).toBe("700");
  });

  it("resolves `textStyle` to a real font size", () => {
    // Text has no recipe, so `textStyle` is the whole of its sizing story — an unresolved one would
    // leave the element at the browser's 16px with nothing to say so.
    mounted = mountElement(() => <Text textStyle="2xl">Sphinx of black quartz</Text>);

    expect(getComputedStyle(mounted.element).fontSize).toBe("24px");
  });

  it("takes props from a provider above it", () => {
    mounted = mountElement(() => (
      <TextPropsProvider value={{ textStyle: "2xl" }}>
        <Text>Sphinx of black quartz</Text>
      </TextPropsProvider>
    ));

    expect(getComputedStyle(mounted.element).fontSize).toBe("24px");
  });

  it("lets a local prop beat the provider", () => {
    mounted = mountElement(() => (
      <TextPropsProvider value={{ textStyle: "2xl" }}>
        <Text textStyle="sm">Sphinx of black quartz</Text>
      </TextPropsProvider>
    ));

    expect(getComputedStyle(mounted.element).fontSize).toBe("14px");
  });
});
