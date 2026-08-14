import { type MountedElement, mountElement } from "@chakra-ui-solid/internal-test-utils";
import { textarea } from "@chakra-ui-solid/styled-system/recipes";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Textarea, TextareaPropsProvider } from "../textarea";

let mounted: MountedElement<HTMLTextAreaElement> | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

describe("Textarea", () => {
  it("renders a textarea at the recipe's defaults", () => {
    // A bare `textarea` is `resize: both` at a UA font size with a UA border, so all four of these
    // are the recipe answering: `md` is the default step and `outline` the default variant.
    mounted = mountElement<HTMLTextAreaElement>(() => <Textarea />);
    const style = getComputedStyle(mounted.element);

    expect(mounted.element.tagName).toBe("TEXTAREA");
    expect(style.fontSize).toBe("14px");
    expect(style.borderBottomWidth).toBe("1px");
    expect(style.width).toBe(`${mounted.container.clientWidth}px`);
  });

  it("tracks a size that changes", () => {
    const [size, setSize] = createSignal<"xs" | "xl">("xs");
    mounted = mountElement<HTMLTextAreaElement>(() => <Textarea size={size()} />);

    const small = getComputedStyle(mounted.element).fontSize;
    flush(() => setSize("xl"));
    expect(getComputedStyle(mounted.element).fontSize).not.toBe(small);
  });

  it("keeps only the bottom edge when flushed", () => {
    mounted = mountElement<HTMLTextAreaElement>(() => <Textarea variant="flushed" />);
    const style = getComputedStyle(mounted.element);

    expect(style.borderRadius).toBe("0px");
    expect(style.paddingLeft).toBe("0px");
    expect(style.borderBottomWidth).toBe("1px");
  });

  it("fills instead of outlining when subtle", () => {
    mounted = mountElement<HTMLTextAreaElement>(() => <Textarea variant="subtle" />);

    expect(getComputedStyle(mounted.element).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
  });

  it("lets a style prop beat the recipe, which is what the recipes layer buys", () => {
    mounted = mountElement<HTMLTextAreaElement>(() => <Textarea fontSize="2xl" />);

    expect(getComputedStyle(mounted.element).fontSize).toBe("24px");
  });

  it("drops the recipe entirely when unstyled, and keeps the style props", () => {
    mounted = mountElement<HTMLTextAreaElement>(() => <Textarea unstyled fontSize="2xl" />);
    const style = getComputedStyle(mounted.element);

    expect(style.borderBottomWidth).not.toBe("1px");
    expect(style.fontSize).toBe("24px");
  });

  it("takes the CSS custom property that recolours the focus ring", () => {
    mounted = mountElement<HTMLTextAreaElement>(() => (
      <Textarea css={{ "--focus-color": "lime" }} />
    ));

    expect(getComputedStyle(mounted.element).getPropertyValue("--focus-color")).toBe("lime");
  });

  it("keeps the recipe's variant props off the element", () => {
    mounted = mountElement<HTMLTextAreaElement>(() => <Textarea size="lg" variant="subtle" />);

    expect(mounted.element.hasAttribute("size")).toBe(false);
    expect(mounted.element.hasAttribute("variant")).toBe(false);
    // The seam omits those keys by literal name, so the tuple and the recipe have to stay one list.
    expect(textarea.variantKeys).toEqual(["size", "variant"]);
  });

  it("forwards the native attributes a textarea is for", () => {
    mounted = mountElement<HTMLTextAreaElement>(() => (
      <Textarea rows={4} placeholder="Comment..." disabled />
    ));

    expect(mounted.element.rows).toBe(4);
    expect(mounted.element.placeholder).toBe("Comment...");
    expect(mounted.element.disabled).toBe(true);
  });

  it("takes props from a provider above it, and lets a local prop win", () => {
    mounted = mountElement<HTMLTextAreaElement>(() => (
      <TextareaPropsProvider value={{ size: "xl" }}>
        <Textarea />
      </TextareaPropsProvider>
    ));
    const fromProvider = getComputedStyle(mounted.element).fontSize;
    mounted.dispose();

    mounted = mountElement<HTMLTextAreaElement>(() => (
      <TextareaPropsProvider value={{ size: "xl" }}>
        <Textarea size="xs" />
      </TextareaPropsProvider>
    ));

    expect(getComputedStyle(mounted.element).fontSize).not.toBe(fromProvider);
  });

  it("keeps the provider's value when a wrapper forwards an unset `size`", () => {
    // The seam's merge resolves by *value*, not by presence. Spelled `merge(context, props)` it
    // resolves by presence, and `<Textarea size={props.size}>` in a wrapper with nothing set beats
    // the provider with `undefined` — the subtree silently drops back to the recipe's `md`.
    mounted = mountElement<HTMLTextAreaElement>(() => (
      <TextareaPropsProvider value={{ size: "xl" }}>
        <Textarea size={undefined} />
      </TextareaPropsProvider>
    ));
    const forwarded = getComputedStyle(mounted.element).fontSize;
    mounted.dispose();

    mounted = mountElement<HTMLTextAreaElement>(() => (
      <TextareaPropsProvider value={{ size: "xl" }}>
        <Textarea />
      </TextareaPropsProvider>
    ));

    expect(forwarded).toBe(getComputedStyle(mounted.element).fontSize);
  });
});

describe("Textarea — autoresize", () => {
  it("takes the drag handle away, and keeps `autoresize` off the element", () => {
    mounted = mountElement<HTMLTextAreaElement>(() => <Textarea autoresize />);

    expect(getComputedStyle(mounted.element).resize).toBe("none");
    expect(mounted.element.hasAttribute("autoresize")).toBe(false);
  });

  it("leaves the handle alone without it", () => {
    mounted = mountElement<HTMLTextAreaElement>(() => <Textarea />);

    expect(getComputedStyle(mounted.element).resize).not.toBe("none");
  });

  it("grows to fit the value as it is typed", async () => {
    mounted = mountElement<HTMLTextAreaElement>(() => <Textarea autoresize />);
    const element = mounted.element;
    const initial = await vi.waitFor(() => {
      const height = element.getBoundingClientRect().height;
      // Zag's primitive writes the height inside a `requestAnimationFrame`, so the first measurable
      // value is the one it wrote rather than the one the layout started at.
      expect(element.style.height).not.toBe("");
      return height;
    });

    element.value = "one\ntwo\nthree\nfour\nfive\nsix";
    element.dispatchEvent(new Event("input", { bubbles: true }));

    await vi.waitFor(() => {
      expect(element.getBoundingClientRect().height).toBeGreaterThan(initial);
    });
  });

  it("stops at a `maxHeight`, and hands the overflow back to a scrollbar", async () => {
    mounted = mountElement<HTMLTextAreaElement>(() => <Textarea autoresize maxHeight="5lh" />);
    const element = mounted.element;

    element.value = Array.from({ length: 20 }, (_, line) => `line ${line}`).join("\n");
    element.dispatchEvent(new Event("input", { bubbles: true }));

    await vi.waitFor(() => {
      const style = getComputedStyle(element);
      expect(element.getBoundingClientRect().height).toBeCloseTo(
        Number.parseFloat(style.maxHeight),
        0,
      );
      // Zag only forces `scroll` when the box was `hidden`; this one is already `auto`, so the
      // overflow is a scrollbar either way and the primitive leaves the declaration alone.
      expect(style.overflowY).not.toBe("hidden");
      expect(element.scrollHeight).toBeGreaterThan(element.clientHeight);
    });
  });

  it("subscribes only once it is turned on", async () => {
    const [autoresize, setAutoresize] = createSignal(false);
    mounted = mountElement<HTMLTextAreaElement>(() => <Textarea autoresize={autoresize()} />);
    const element = mounted.element;

    // Nothing has written an inline height while it is off — `onSettled` would have registered a
    // single fire at mount and never come back, which is why this is a tracked effect.
    expect(element.style.height).toBe("");

    flush(() => setAutoresize(true));
    await vi.waitFor(() => expect(element.style.height).not.toBe(""));
  });
});
