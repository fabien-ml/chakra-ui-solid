import { type MountedComponent, mount } from "@chakra-ui-solid/internal-test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
// The docs app's **own** generated stylesheet: the content group's border is asserted as a computed
// style, and without this it reads the UA default and the assertion measures nothing.
import "../../../../styled-system/styles.css";
// The same text the component's `?raw` glob hands the copy button, taken from the file itself so
// the assertion cannot pass against a stale transcription.
import spinnerSource from "../../../examples/spinner/spinner-with-label.tsx?raw";
import { Example } from "../example";

/**
 * The Preview/Code split every docs example wears.
 *
 * The interesting half is what is **not** in the tree: `lazyMount unmountOnExit` means the code
 * panel — the highlighted source, the raw copy of it, and the copy button — is absent from the
 * prerendered HTML until a reader asks for it. That is the decision this split was taken for, so it
 * is asserted rather than worked around.
 */
let mounted: MountedComponent | undefined;
let clipboardDescriptor: PropertyDescriptor | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
  if (clipboardDescriptor === undefined) {
    Reflect.deleteProperty(navigator, "clipboard");
  } else {
    Object.defineProperty(navigator, "clipboard", clipboardDescriptor);
  }
  clipboardDescriptor = undefined;
});

/**
 * The tabs machine defers every `send` by a microtask, and each panel runs a `@zag-js/presence`
 * machine of its own on top of that — so a click has landed only after two turns.
 */
const settle = async () => {
  await new Promise<void>((resolve) => queueMicrotask(resolve));
  await new Promise<void>((resolve) => queueMicrotask(resolve));
};

function mountExample(): HTMLElement {
  mounted = mount(() => <Example name="spinner-with-label" />);
  return mounted.container;
}

function query(root: ParentNode, selector: string): HTMLElement {
  const element = root.querySelector(selector);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`nothing in the mounted tree matched \`${selector}\``);
  }
  return element;
}

const panels = (root: ParentNode) => [...root.querySelectorAll('[data-part="content"]')];

const copyButton = (root: ParentNode) => root.querySelector("button[aria-label]:not([data-part])");

/** Chromium exposes `navigator.clipboard` as a prototype getter, so the stub is an own property. */
function stubClipboard(writeText: (text: string) => Promise<void>) {
  clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, "clipboard");
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
    writable: true,
  });
}

async function openCode(container: HTMLElement) {
  query(container, '[data-part="trigger"][data-value="code"]').click();
  await settle();
}

describe("the preview/code split", () => {
  it("opens on the preview, with the example live in it", () => {
    const container = mountExample();

    expect(query(container, '[data-part="trigger"][data-value="preview"]')).toHaveProperty(
      "ariaSelected",
      "true",
    );
    expect(panels(container)).toHaveLength(1);
    expect(container.textContent).toContain("Loading...");
  });

  it("keeps the preview panel a block container", () => {
    // A flex column blockifies its children, and an example whose root is intrinsically sized — a
    // lone `rounded="full"` IconButton — then renders as a pill.
    const container = mountExample();

    expect(getComputedStyle(panels(container)[0] as HTMLElement).display).toBe("block");
  });

  it("leaves the code panel out of the DOM until Code is clicked", async () => {
    const container = mountExample();

    expect(copyButton(container)).toBeNull();
    expect(container.textContent).not.toContain("SpinnerWithLabel");

    await openCode(container);

    expect(copyButton(container)).not.toBeNull();
    // `vi.waitFor`, not a fixed number of turns: the presence machine reads the leaving panel's
    // computed `animation-name` inside a `raf` before it decides whether to suspend the unmount.
    await vi.waitFor(() => expect(panels(container)).toHaveLength(1));
  });

  it("takes the code panel back out again when Preview is reselected", async () => {
    const container = mountExample();
    await openCode(container);

    query(container, '[data-part="trigger"][data-value="preview"]').click();

    await vi.waitFor(() => expect(copyButton(container)).toBeNull());
  });

  it("draws one border around both panels, on the group", async () => {
    // Computed styles, never class names — `classList.contains("tabs__contentGroup")` passes on an
    // element whose CSS was never generated (`CLAUDE.md`, *silent unstyling*).
    const container = mountExample();
    const group = query(container, ".tabs__contentGroup");
    const style = getComputedStyle(group);

    expect(style.borderTopWidth).toBe("1px");
    expect(style.borderTopStyle).toBe("solid");
    expect(style.borderTopLeftRadius).not.toBe("0px");
    expect(style.overflow).toBe("hidden");

    // And the panels themselves draw none, so the two halves cannot disagree about a corner.
    await openCode(container);
    expect(getComputedStyle(panels(container)[0] as HTMLElement).borderTopWidth).toBe("0px");
  });
});

describe("the copy button", () => {
  it("writes the example's own source, not the highlighted markup", async () => {
    const writeText = vi.fn(async () => {});
    stubClipboard(writeText);

    const container = mountExample();
    await openCode(container);

    const button = copyButton(container);
    if (!(button instanceof HTMLElement)) {
      throw new Error("expected the code panel to render a copy button");
    }
    button.click();
    await vi.waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));

    expect(writeText).toHaveBeenCalledWith(spinnerSource);
    expect(spinnerSource).toContain("export default function SpinnerWithLabel");
    expect(spinnerSource).not.toContain("<span");
  });

  it("says so once the write resolves", async () => {
    stubClipboard(async () => {});

    const container = mountExample();
    await openCode(container);

    const button = copyButton(container);
    if (!(button instanceof HTMLElement)) {
      throw new Error("expected the code panel to render a copy button");
    }
    expect(button.getAttribute("aria-label")).toBe("Copy code");

    button.click();
    await vi.waitFor(() => expect(button.getAttribute("aria-label")).toBe("Copied"));
  });
});
