import radioCardServerHtml from "virtual:hydration-fixture?id=radio-card";
import {
  expectNoA11yViolations,
  hydrateFixture,
  type MountedComponent,
  mount,
} from "@chakra-ui-solid/internal-test-utils";
import type { ComponentProps } from "@solidjs/web";
import { createSignal, For } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Fieldset } from "../../fieldset";
import type {
  CreateRadioCardReturn,
  RadioCardItemState,
  RadioCardValueChangeDetails,
} from "../index";
import { createRadioCard, RadioCard } from "../index";
import { Tree } from "./radio-card.ssr-entry";

let mounted: MountedComponent | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

/**
 * The machine defers every `send` by a microtask, and a radio card group runs exactly one machine
 * for N cards — no presence, no per-card service — so one turn of the queue is the whole wait.
 */
const settle = () => new Promise<void>((resolve) => queueMicrotask(resolve));

/**
 * An element by part, **scope-qualified**: a card's anatomy is the machine's, so its parts announce
 * themselves as `radio-group`, and several trees below nest one inside a `fieldset`.
 */
function partOf(container: ParentNode, part: string, scope = "radio-group"): HTMLElement {
  const element = container.querySelector(`[data-scope="${scope}"][data-part="${part}"]`);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`expected the tree to render a [data-part="${part}"] element`);
  }
  return element;
}

/** Every element of one part, in document order — the shape a repeated part is tested in. */
function partsOf(container: ParentNode, part: string): HTMLElement[] {
  return [...container.querySelectorAll(`[data-scope="radio-group"][data-part="${part}"]`)].filter(
    (element): element is HTMLElement => element instanceof HTMLElement,
  );
}

/**
 * One of the five slots with **no anatomy pair at all** — `itemControl`, `itemContent`,
 * `itemDescription`, `itemAddon` and `itemIndicator` are none of them machine parts, so a
 * `data-testid` is the only handle on them.
 */
function testId(container: ParentNode, id: string): HTMLElement {
  const element = container.querySelector(`[data-testid="${id}"]`);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`expected the tree to render a [data-testid="${id}"] element`);
  }
  return element;
}

function testIds(container: ParentNode, id: string): HTMLElement[] {
  return [...container.querySelectorAll(`[data-testid="${id}"]`)].filter(
    (element): element is HTMLElement => element instanceof HTMLElement,
  );
}

/** The real controls — the only things a click, a form and a screen reader actually touch. */
function inputsIn(container: ParentNode): HTMLInputElement[] {
  return [...container.querySelectorAll("input[type=radio]")].filter(
    (element): element is HTMLInputElement => element instanceof HTMLInputElement,
  );
}

function inputForValue(container: ParentNode, value: string): HTMLInputElement {
  const found = inputsIn(container).find((input) => input.value === value);
  if (found === undefined) {
    throw new Error(`expected a radio input with value "${value}"`);
  }
  return found;
}

/** One card's element of a part, found by the card's own id rather than by position. */
function partForValue(container: ParentNode, part: string, value: string): HTMLElement {
  const found = partsOf(container, part).find((element) => element.id.endsWith(`:${value}`));
  if (found === undefined) {
    throw new Error(`expected a [data-part="${part}"] element for the "${value}" card`);
  }
  return found;
}

const FRAMEWORKS = ["next", "vite", "astro"];

/**
 * Every prop is forwarded **by name** rather than spread, which is what puts each of them on the
 * forwarded-`undefined` path on every test in this file.
 */
function Basic(props: {
  align?: "start" | "end" | "center";
  defaultValue?: string | null;
  disabled?: boolean;
  invalid?: boolean;
  itemDisabled?: boolean;
  itemInvalid?: boolean;
  justify?: "start" | "end" | "center";
  name?: string;
  onValueChange?: (details: RadioCardValueChangeDetails) => void;
  orientation?: "horizontal" | "vertical";
  readOnly?: boolean;
  required?: boolean;
  size?: "sm" | "md" | "lg";
  unstyled?: boolean;
  value?: string | null;
  variant?: "surface" | "subtle" | "outline" | "solid";
}) {
  return (
    <RadioCard.Root
      align={props.align}
      defaultValue={props.defaultValue}
      disabled={props.disabled}
      invalid={props.invalid}
      justify={props.justify}
      name={props.name}
      onValueChange={props.onValueChange}
      orientation={props.orientation}
      readOnly={props.readOnly}
      required={props.required}
      size={props.size}
      unstyled={props.unstyled}
      value={props.value}
      variant={props.variant}
    >
      <RadioCard.Label>Select framework</RadioCard.Label>
      <For each={FRAMEWORKS}>
        {(framework) => (
          <RadioCard.Item
            value={framework}
            disabled={framework === "vite" ? props.itemDisabled : undefined}
            invalid={framework === "vite" ? props.itemInvalid : undefined}
          >
            <RadioCard.ItemHiddenInput />
            <RadioCard.ItemControl data-testid={`control-${framework}`}>
              <RadioCard.ItemContent data-testid={`content-${framework}`}>
                <RadioCard.ItemText>{framework}</RadioCard.ItemText>
                <RadioCard.ItemDescription data-testid={`description-${framework}`}>
                  Best for {framework}
                </RadioCard.ItemDescription>
              </RadioCard.ItemContent>
              <RadioCard.ItemIndicator data-testid={`indicator-${framework}`} />
            </RadioCard.ItemControl>
            <RadioCard.ItemAddon data-testid={`addon-${framework}`}>Free</RadioCard.ItemAddon>
          </RadioCard.Item>
        )}
      </For>
    </RadioCard.Root>
  );
}

describe("RadioCard — a real machine through the adapter", () => {
  it("picks a card on a click anywhere in it, because each item is a label", async () => {
    mounted = mount(() => <Basic />);
    const { container } = mounted;

    partForValue(container, "item", "vite").click();
    await settle();

    expect(inputForValue(container, "vite").checked).toBe(true);
    expect(partForValue(container, "item", "vite").dataset.state).toBe("checked");
    expect(testId(container, "control-vite").dataset.state).toBe("checked");
    expect(testId(container, "control-next").dataset.state).toBe("unchecked");
  });

  it("moves the picked state between cards rather than accumulating it", async () => {
    mounted = mount(() => <Basic defaultValue="next" />);
    const { container } = mounted;

    partForValue(container, "item", "astro").click();
    await settle();

    expect(inputsIn(container).filter((input) => input.checked)).toHaveLength(1);
    expect(inputForValue(container, "astro").checked).toBe(true);
  });

  it("reports a controlled change upward rather than making it itself", async () => {
    const onValueChange = vi.fn();
    mounted = mount(() => <Basic value="next" onValueChange={onValueChange} />);
    const { container } = mounted;

    partForValue(container, "item", "vite").click();
    await settle();

    expect(onValueChange).toHaveBeenCalledWith(expect.objectContaining({ value: "vite" }));
    expect(partForValue(container, "item", "next").dataset.state).toBe("checked");
  });

  it("takes no click on a disabled card while the rest of the group still works", async () => {
    mounted = mount(() => <Basic itemDisabled />);
    const { container } = mounted;

    partForValue(container, "item", "vite").click();
    await settle();
    expect(inputForValue(container, "vite").checked).toBe(false);
    expect(testId(container, "control-vite").dataset.disabled).toBe("");

    partForValue(container, "item", "astro").click();
    await settle();
    expect(inputForValue(container, "astro").checked).toBe(true);
  });

  it("marks focus, hover and the active press on the card the pointer is over", async () => {
    // The four states `RadioCard.ItemControl` reads off the item context and writes itself — the
    // machine describes this element for a radio group and describes nothing for a card.
    mounted = mount(() => <Basic />);
    const { container } = mounted;
    const item = partForValue(container, "item", "vite");

    item.dispatchEvent(new PointerEvent("pointermove", { bubbles: true }));
    await settle();
    expect(testId(container, "control-vite").dataset.hover).toBe("");
    expect(testId(container, "control-next").dataset.hover).toBeUndefined();

    inputForValue(container, "vite").focus();
    await settle();
    expect(testId(container, "control-vite").dataset.focus).toBe("");
  });

  it("hands the machine to a `RadioCard.Context` render prop that returns JSX", async () => {
    mounted = mount(() => (
      <RadioCard.Root defaultValue="next">
        <RadioCard.Context>
          {(group) => <span data-testid="picked">{group.value}</span>}
        </RadioCard.Context>
        <RadioCard.Item value="vite">
          <RadioCard.ItemHiddenInput />
        </RadioCard.Item>
      </RadioCard.Root>
    ));
    const { container } = mounted;

    expect(testId(container, "picked").textContent).toBe("next");

    partForValue(container, "item", "vite").click();
    await settle();
    expect(testId(container, "picked").textContent).toBe("vite");
  });

  it("hands one card's state to a `RadioCard.ItemContext` render prop", async () => {
    mounted = mount(() => (
      <RadioCard.Root defaultValue="next">
        <RadioCard.Item value="next">
          <RadioCard.ItemContext>
            {(item) => <span data-testid="state">{String(item.checked)}</span>}
          </RadioCard.ItemContext>
        </RadioCard.Item>
      </RadioCard.Root>
    ));

    expect(testId(mounted.container, "state").textContent).toBe("true");
  });

  it("drives a `RootProvider` from a machine the consumer owns", async () => {
    let group: CreateRadioCardReturn | undefined;

    mounted = mount(() => {
      group = createRadioCard({ defaultValue: "next" });
      return (
        <RadioCard.RootProvider value={group} size="lg">
          <For each={FRAMEWORKS}>
            {(framework) => (
              <RadioCard.Item value={framework}>
                <RadioCard.ItemHiddenInput />
                <RadioCard.ItemIndicator data-testid={`indicator-${framework}`} />
              </RadioCard.Item>
            )}
          </For>
        </RadioCard.RootProvider>
      );
    });
    const { container } = mounted;

    expect(group?.value).toBe("next");
    // The variant reached the recipe through the provider Root, not through the machine.
    expect(getComputedStyle(testId(container, "indicator-next")).width).toBe("24px");

    group?.setValue("astro");
    await settle();
    expect(inputForValue(container, "astro").checked).toBe(true);
  });

  it("inherits a surrounding fieldset's states and its legend id", () => {
    mounted = mount(() => (
      <Fieldset.Root id="framework" disabled invalid>
        <Fieldset.Legend>Framework</Fieldset.Legend>
        <RadioCard.Root>
          <RadioCard.Item value="next">
            <RadioCard.ItemHiddenInput />
            <RadioCard.ItemControl data-testid="control" />
          </RadioCard.Item>
        </RadioCard.Root>
      </Fieldset.Root>
    ));
    const { container } = mounted;

    expect(partOf(container, "root").getAttribute("aria-labelledby")).toBe(
      "fieldset::framework::legend",
    );
    expect(testId(container, "control").dataset.disabled).toBe("");
    expect(testId(container, "control").dataset.invalid).toBe("");
  });

  it("keeps the machine's orientation off the recipe's, in both directions", async () => {
    // `orientation` is a `radioCard` variant, so it turns the control's contents and never reaches
    // the machine — upstream splits the variant props off before the Ark Root sees them. The
    // group's arrow-key model stays the machine's own `vertical`.
    mounted = mount(() => <Basic orientation="horizontal" />);
    expect(partOf(mounted.container, "root").getAttribute("aria-orientation")).toBe("vertical");

    // …and the way back: a machine the consumer built *can* still carry one.
    mounted.dispose();
    mounted = mount(() => (
      <RadioCard.RootProvider value={createRadioCard({ orientation: "horizontal" })}>
        <RadioCard.Item value="next" />
      </RadioCard.RootProvider>
    ));

    expect(partOf(mounted.container, "root").getAttribute("aria-orientation")).toBe("horizontal");
    await settle();
  });
});

describe("RadioCard — shape E, reused on a second recipe", () => {
  /** A card whose parts report what the item context handed them. */
  function Probe(props: { value: string }) {
    const seen: RadioCardItemState[] = [];
    return (
      <RadioCard.Item value={props.value}>
        <RadioCard.ItemContext>
          {(item) => {
            seen.push(item);
            return <span data-testid={`seen-${props.value}`}>{String(seen.length)}</span>;
          }}
        </RadioCard.ItemContext>
      </RadioCard.Item>
    );
  }

  it("builds one context per card, once, and keeps it across state changes", async () => {
    mounted = mount(() => (
      <RadioCard.Root defaultValue="next">
        <For each={FRAMEWORKS}>{(framework) => <Probe value={framework} />}</For>
      </RadioCard.Root>
    ));
    const { container } = mounted;

    for (const framework of FRAMEWORKS) {
      expect(testId(container, `seen-${framework}`).textContent, framework).toBe("1");
    }

    partForValue(container, "item", "astro").click();
    await settle();

    // A state change re-reads the context; it never rebuilds it.
    for (const framework of FRAMEWORKS) {
      expect(testId(container, `seen-${framework}`).textContent, framework).toBe("1");
    }
  });

  it("round-trips each card's props bag through the Root's getters, live", async () => {
    const [value, setValue] = createSignal("next");

    mounted = mount(() => (
      <RadioCard.Root>
        <RadioCard.Item value={value()}>
          <RadioCard.ItemHiddenInput />
          <RadioCard.ItemText>Framework</RadioCard.ItemText>
          <RadioCard.ItemControl data-testid="control" />
        </RadioCard.Item>
      </RadioCard.Root>
    ));
    const { container } = mounted;

    expect(inputsIn(container)[0]?.value).toBe("next");
    expect(partOf(container, "item-text").id).toContain(":label:next");

    // The bag is getters over the props, so a signal-driven `value` moves every part with it — and
    // the machine still owns the ids, because the bag went back through *its* getters.
    setValue("astro");
    await settle();

    expect(inputsIn(container)[0]?.value).toBe("astro");
    expect(partOf(container, "item-text").id).toContain(":label:astro");
    expect(testId(container, "control").dataset.state).toBe("unchecked");
  });

  it("builds the context inside a `<For>` with no untracked read", () => {
    // A `<For>` callback is a strict-read phase in SolidJS 2.0, so a `[STRICT_READ_UNTRACKED]`
    // here would be a genuine defect rather than a missing wrapper. `mount` throws on one.
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    mounted = mount(() => (
      <RadioCard.Root defaultValue="vite">
        <For each={FRAMEWORKS}>
          {(framework) => (
            <RadioCard.Item value={framework}>
              <RadioCard.ItemHiddenInput />
              <RadioCard.ItemControl data-testid={`control-${framework}`}>
                <RadioCard.ItemIndicator />
              </RadioCard.ItemControl>
            </RadioCard.Item>
          )}
        </For>
      </RadioCard.Root>
    ));

    const messages = [...warn.mock.calls, ...error.mock.calls].flat().map(String);
    expect(messages.filter((message) => message.includes("STRICT_READ_UNTRACKED"))).toEqual([]);
    expect(testId(mounted.container, "control-vite").dataset.state).toBe("checked");

    warn.mockRestore();
    error.mockRestore();
  });

  it("resolves the class map once on the Root, so every card wears one string", () => {
    mounted = mount(() => <Basic />);
    const { container } = mounted;

    expect(new Set(partsOf(container, "item").map((item) => item.className)).size).toBe(1);
    expect(new Set(testIds(container, "control-next").map((el) => el.className)).size).toBe(1);

    const controls = FRAMEWORKS.map((framework) => testId(container, `control-${framework}`));
    expect(new Set(controls.map((control) => control.className)).size).toBe(1);
  });

  it("throws from a part written outside an Item, naming the one to add", () => {
    expect(() =>
      mount(() => (
        <RadioCard.Root>
          <RadioCard.ItemIndicator />
        </RadioCard.Root>
      )),
    ).toThrow(/RadioCard\.Item/);
  });

  it("throws from a part written outside a Root, naming that one too", () => {
    expect(() => mount(() => <RadioCard.Label>Framework</RadioCard.Label>)).toThrow(/RadioCard/);
  });
});

describe("RadioCard — the styles the slot recipe really generated", () => {
  it("stacks the group and lays each card out", () => {
    mounted = mount(() => <Basic />);
    const { container } = mounted;

    const root = getComputedStyle(partOf(container, "root"));
    expect(root.display).toBe("flex");
    expect(root.flexDirection).toBe("column");
    expect(root.rowGap).toBe("6px");
    expect(root.isolation).toBe("isolate");

    const item = getComputedStyle(partForValue(container, "item", "next"));
    expect(item.display).toBe("flex");
    expect(item.flexDirection).toBe("column");
    expect(item.position).toBe("relative");
    expect(item.userSelect).toBe("none");
    // `variant.outline`, the recipe's default.
    expect(item.borderTopWidth).toBe("1px");

    const label = getComputedStyle(partOf(container, "label"));
    // `flex`, though the recipe says `inline-flex`: the root above it is a flex container, so this
    // is a flex item and CSS blockifies its `display`. The two declarations below are what prove
    // the recipe's rule reached the sheet.
    expect(label.display).toBe("flex");
    expect(label.fontWeight).toBe("500");
    expect(label.fontSize).toBe("14px");
  });

  it("pads the control, stacks the content and dims the description", () => {
    mounted = mount(() => <Basic />);
    const { container } = mounted;

    const control = getComputedStyle(testId(container, "control-next"));
    expect(control.padding).toBe("16px");
    expect(control.columnGap).toBe("10px");
    expect(control.flexDirection).toBe("row");
    // `align: "start"` is the recipe's default, and it reaches this element through
    // `--radio-card-align` on the card above it rather than through a class of its own.
    expect(control.alignItems).toBe("flex-start");

    const content = getComputedStyle(testId(container, "content-next"));
    expect(content.display).toBe("flex");
    expect(content.flexDirection).toBe("column");
    expect(content.rowGap).toBe("4px");

    const description = getComputedStyle(testId(container, "description-next"));
    expect(description.opacity).toBe("0.64");
    expect(description.fontSize).toBe("14px");

    expect(getComputedStyle(partOf(container, "item-text")).fontWeight).toBe("500");
  });

  it("gives the addon its own band below the control", () => {
    mounted = mount(() => <Basic />);
    const addon = getComputedStyle(testId(mounted.container, "addon-next"));

    expect(addon.paddingLeft).toBe("16px");
    expect(addon.paddingTop).toBe("8px");
    expect(addon.borderTopWidth).toBe("1px");
  });

  it("draws the circle from the `itemIndicator` slot, one slot over from a radio group's", () => {
    mounted = mount(() => <Basic />);
    const indicator = getComputedStyle(testId(mounted.container, "indicator-next"));

    expect(indicator.borderRadius).toBe("9999px");
    expect(indicator.borderTopWidth).toBe("1px");
    expect(indicator.width).toBe("20px");
    expect(indicator.height).toBe("20px");
    // `cursor.radio` is `default` in the preset, unlike `cursor.button`. Asserting the resolved
    // value is what proves the token reached the sheet rather than the literal `radio`.
    expect(indicator.cursor).toBe("default");
  });

  it("paints the dot from the slot's own `& .dot` rule, which survives `unstyled`", () => {
    // The Radiomark renders `unstyled`, so its own `.radiomark` class is gone and with it the rule
    // that would size the dot. What finds `class="dot"` on the way back in is the `itemIndicator`
    // slot, which the preset gives the same `& .dot` block.
    mounted = mount(() => <Basic defaultValue="next" />);
    const dot = testId(mounted.container, "indicator-next").querySelector(".dot");
    if (!(dot instanceof HTMLElement)) {
      throw new Error("expected a picked card to render its dot");
    }
    const styles = getComputedStyle(dot);

    expect(styles.borderRadius).toBe("9999px");
    expect(styles.scale).toBe("0.4");
    expect(styles.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    expect(Number.parseFloat(styles.width)).toBeGreaterThan(0);

    expect(testId(mounted.container, "indicator-vite").querySelector(".dot")).toBeNull();
  });

  it("widens the dot under `variant=subtle`, which is this recipe's one respelt block", () => {
    // `radioGroup` respells `& .dot` under `outline`; here it is `subtle`, which is why the preset
    // row's sizes have to stay empty on both.
    mounted = mount(() => <Basic defaultValue="next" variant="subtle" />);
    const dot = testId(mounted.container, "indicator-next").querySelector(".dot");
    if (!(dot instanceof HTMLElement)) {
      throw new Error("expected a picked card to render its dot");
    }

    expect(getComputedStyle(dot).scale).toBe("0.6");
  });

  it("sizes the card from every one of the three `size` variants", () => {
    const circles = { sm: "16px", md: "20px", lg: "24px" } as const;
    const paddings = { sm: "12px", md: "16px", lg: "16px" } as const;
    const gaps = { sm: "6px", md: "10px", lg: "14px" } as const;

    for (const size of ["sm", "md", "lg"] as const) {
      mounted?.dispose();
      mounted = mount(() => <Basic size={size} />);
      const { container } = mounted;

      expect(getComputedStyle(testId(container, "indicator-next")).width, size).toBe(circles[size]);
      expect(getComputedStyle(testId(container, "control-next")).padding, size).toBe(
        paddings[size],
      );
      expect(getComputedStyle(testId(container, "control-next")).columnGap, size).toBe(gaps[size]);
    }
  });

  it("keeps the default `md` when the `size` variant is left unset", () => {
    mounted = mount(() => <Basic size={undefined} />);

    expect(getComputedStyle(testId(mounted.container, "indicator-next")).width).toBe("20px");
  });

  it("draws the four `variant`s differently, and defaults to `outline`", () => {
    mounted = mount(() => <Basic variant={undefined} defaultValue="next" />);
    const outlineDefault = getComputedStyle(partForValue(mounted.container, "item", "next"));
    // `outline` rings the picked card with an inset shadow rather than filling it.
    expect(outlineDefault.boxShadow).not.toBe("none");
    expect(outlineDefault.backgroundColor).toBe("rgba(0, 0, 0, 0)");

    mounted.dispose();
    mounted = mount(() => <Basic variant="subtle" />);
    // `subtle` is the only variant that gives the card a resting background.
    expect(
      getComputedStyle(partForValue(mounted.container, "item", "next")).backgroundColor,
    ).not.toBe("rgba(0, 0, 0, 0)");

    mounted.dispose();
    mounted = mount(() => <Basic variant="solid" defaultValue="next" />);
    // `solid` fills the picked card, and gives its circle an opaque background at rest.
    expect(
      getComputedStyle(partForValue(mounted.container, "item", "next")).backgroundColor,
    ).not.toBe("rgba(0, 0, 0, 0)");
    expect(getComputedStyle(testId(mounted.container, "indicator-vite")).backgroundColor).not.toBe(
      "rgba(0, 0, 0, 0)",
    );

    mounted.dispose();
    mounted = mount(() => <Basic variant="surface" defaultValue="next" />);
    expect(
      getComputedStyle(partForValue(mounted.container, "item", "next")).backgroundColor,
    ).not.toBe("rgba(0, 0, 0, 0)");
  });

  it("rings a `data-invalid` circle red under every variant, which is the preset row's job", () => {
    // `base.itemIndicator._invalid` sets `borderColor: red.500`, and **all four variants write a
    // flat `borderColor`**. Panda emits base conditions into a nested `_base` sub-layer that an
    // unlayered variant rule beats whatever its specificity, so without this recipe's
    // `shadowedSlotBaseConditions` row the circle renders in its resting colour and says nothing.
    //
    // The attribute is written here rather than reached through `invalid` on the Root, because
    // **nothing puts it on this element**: `_invalid` is `&:is(:invalid, [data-invalid], …)` — self
    // only — and a `RadioCard.ItemIndicator` is not a machine part, so it inherits no `data-invalid`
    // the way `RadioGroup.ItemIndicator` does. The next test is what that costs; this one is the
    // CSS, proved on the one path that can reach it.
    for (const variant of ["surface", "subtle", "outline", "solid"] as const) {
      mounted?.dispose();
      mounted = mount(() => (
        <RadioCard.Root variant={variant} defaultValue="next">
          <RadioCard.Item value="next">
            <RadioCard.ItemIndicator data-testid="indicator" data-invalid="" />
          </RadioCard.Item>
        </RadioCard.Root>
      ));

      expect(getComputedStyle(testId(mounted.container, "indicator")).borderTopColor, variant).toBe(
        "rgb(239, 68, 68)",
      );
    }
  });

  it("shows an invalid group nothing at all, which is the React version's shape too", () => {
    // Measured against `radio-card.ts` and `radiomark.tsx`: the only `_invalid` block in this whole
    // recipe is on `itemIndicator`, and the only elements the machine gives `data-invalid` are the
    // item, the item text and the machine's own `itemControl` — none of which this component
    // renders as that element. Chakra's Radiomark writes `data-checked` and `data-disabled` and no
    // more, so an invalid radio card is drawn exactly like a valid one on chakra-ui.com as well.
    // What carries the state is `aria-invalid` on the input, which is what a screen reader reads.
    mounted = mount(() => <Basic invalid />);
    const { container } = mounted;

    expect(getComputedStyle(testId(container, "indicator-next")).borderTopColor).not.toBe(
      "rgb(239, 68, 68)",
    );
    expect(partForValue(container, "item", "next").dataset.invalid).toBe("");
    expect(inputForValue(container, "next").getAttribute("aria-invalid")).toBe("true");
  });

  it("marks a card that is invalid on its own, with the group valid", () => {
    mounted = mount(() => <Basic itemInvalid />);
    const { container } = mounted;

    expect(testId(container, "control-vite").dataset.invalid).toBe("");
    expect(testId(container, "control-next").dataset.invalid).toBeUndefined();
    expect(inputForValue(container, "vite").getAttribute("aria-invalid")).toBe("true");
    expect(inputForValue(container, "next").getAttribute("aria-invalid")).toBeNull();
  });

  it("tints a focused `subtle` card, which is the row's second correction", async () => {
    // The one collision no other recipe here has: `variant.subtle` gives the **card** a resting
    // `bg`, which defeats `base.item._focus`'s `colorPalette.muted/20` — so without the correction
    // a focused subtle card keeps its resting fill and the focus is invisible.
    mounted = mount(() => <Basic variant="subtle" />);
    const { container } = mounted;

    const resting = getComputedStyle(partForValue(container, "item", "next")).backgroundColor;

    inputForValue(container, "next").focus();
    await settle();

    expect(partForValue(container, "item", "next").dataset.focus).toBe("");
    expect(getComputedStyle(partForValue(container, "item", "next")).backgroundColor).not.toBe(
      resting,
    );
  });

  it("dims a disabled card and greys its control", () => {
    mounted = mount(() => <Basic itemDisabled />);
    const { container } = mounted;

    expect(getComputedStyle(partForValue(container, "item", "vite")).opacity).toBe("0.5");
    expect(getComputedStyle(testId(container, "control-vite")).backgroundColor).not.toBe(
      "rgba(0, 0, 0, 0)",
    );
    expect(getComputedStyle(testId(container, "indicator-vite")).cursor).toBe("not-allowed");
  });

  it("writes `--radio-card-justify` from a variant with no default at all", () => {
    // Unset, nothing is written and the control keeps the browser's own `justify-content` — which
    // is the one variant of the five the recipe's `defaultVariants` leaves out.
    mounted = mount(() => <Basic justify={undefined} />);
    expect(getComputedStyle(testId(mounted.container, "control-next")).justifyContent).toBe(
      "normal",
    );

    mounted.dispose();
    mounted = mount(() => <Basic justify="center" />);
    expect(getComputedStyle(testId(mounted.container, "control-next")).justifyContent).toBe(
      "center",
    );
    // The property is written on the *card* and read by the control and the content below it.
    expect(getComputedStyle(testId(mounted.container, "content-next")).justifyContent).toBe(
      "center",
    );
  });

  it("turns the control with `orientation`, and aligns it with `align`", () => {
    mounted = mount(() => <Basic orientation="vertical" align="center" />);
    const control = getComputedStyle(testId(mounted.container, "control-next"));

    expect(control.flexDirection).toBe("column");
    expect(control.alignItems).toBe("center");
    expect(control.textAlign).toBe("center");
  });

  it("leaves every part with the browser's own styles under a Root-level `unstyled`", () => {
    // Asserted as a computed **fallback**, never as an absent class: a missing class name and a
    // class whose CSS was never generated look identical from the DOM.
    mounted = mount(() => <Basic unstyled defaultValue="next" />);
    const { container } = mounted;

    expect(getComputedStyle(partOf(container, "root")).display).toBe("block");
    expect(getComputedStyle(partForValue(container, "item", "next")).position).toBe("static");
    expect(getComputedStyle(testId(container, "control-next")).padding).toBe("0px");
    expect(getComputedStyle(testId(container, "indicator-next")).borderRadius).toBe("0px");
    expect(getComputedStyle(testId(container, "addon-next")).borderTopWidth).toBe("0px");
  });

  it("keeps that opt-out when a wrapper forwards `unstyled={undefined}`", () => {
    mounted = mount(() => <Basic unstyled={undefined} />);

    expect(getComputedStyle(testId(mounted.container, "indicator-next")).width).toBe("20px");
  });

  it("keeps the indicator's slot class when a wrapper forwards `unstyled={undefined}`", () => {
    // `RadioCard.ItemIndicator` hardcodes `unstyled` on the Radiomark **after** the spread, so there
    // is nothing a forwarded `undefined` can delete — switching the `radiomark` recipe back on
    // underneath the `itemIndicator` slot would draw a second circle inside the first.
    mounted = mount(() => (
      <RadioCard.Root defaultValue="next">
        <RadioCard.Item value="next">
          <RadioCard.ItemIndicator data-testid="indicator" unstyled={undefined} />
        </RadioCard.Item>
      </RadioCard.Root>
    ));
    const indicator = testId(mounted.container, "indicator");

    expect(indicator.className).not.toContain("radiomark");
    expect(getComputedStyle(indicator).width).toBe("20px");
    expect(getComputedStyle(indicator).borderRadius).toBe("9999px");
  });

  it("puts a style prop on the indicator above the slot it inherits", () => {
    // The `itemIndicator` class rides `recipeClass`, which sits *below* style props — which is
    // where the React version's `css={[styles.itemIndicator, props.css]}` puts it too. Handing it
    // to the Radiomark as a `class` instead would lift it above them, and the documented
    // `<RadioCard.ItemIndicator borderWidth="0" />` would silently keep the slot's border.
    mounted = mount(() => (
      <RadioCard.Root defaultValue="next">
        <RadioCard.Item value="next">
          <RadioCard.ItemIndicator data-testid="indicator" borderWidth="0" color="fg" />
        </RadioCard.Item>
      </RadioCard.Root>
    ));

    expect(getComputedStyle(testId(mounted.container, "indicator")).borderTopWidth).toBe("0px");
  });

  it("takes its variants from a `PropsProvider`, and lets a Root beat them", () => {
    mounted = mount(() => (
      <RadioCard.PropsProvider value={{ size: "lg" }}>
        <div data-testid="provided">
          <Basic />
        </div>
        <div data-testid="overridden">
          <Basic size="sm" />
        </div>
      </RadioCard.PropsProvider>
    ));
    const { container } = mounted;

    expect(getComputedStyle(testId(testId(container, "provided"), "indicator-next")).width).toBe(
      "24px",
    );
    expect(getComputedStyle(testId(testId(container, "overridden"), "indicator-next")).width).toBe(
      "16px",
    );
  });

  it("keeps the provider's variant when a Root forwards an unset one", () => {
    mounted = mount(() => (
      <RadioCard.PropsProvider value={{ size: "lg" }}>
        <Basic size={undefined} />
      </RadioCard.PropsProvider>
    ));

    expect(getComputedStyle(testId(mounted.container, "indicator-next")).width).toBe("24px");
  });
});

describe("RadioCard — the `checked` escape hatch", () => {
  /** The documented shape: a glyph that spreads what it is handed. */
  const Tick = (props: ComponentProps<"span">) => <span {...props}>✓</span>;

  it("gives the glyph the computed class, so it wears the whole mark", () => {
    // **The one thing this row exists to get right.** `itemIndicator` carries `radiomarkRecipe.base`
    // — the border, the radius, the size, the cursor — so a glyph that arrives without the composed
    // class loses all of it and renders as a bare `span` with nothing to say so. Asserted as
    // computed styles rather than as a class name, which is the only difference a browser can see.
    mounted = mount(() => (
      <RadioCard.Root defaultValue="next">
        <RadioCard.Item value="next">
          <RadioCard.ItemIndicator data-testid="glyph" checked={Tick} />
        </RadioCard.Item>
      </RadioCard.Root>
    ));
    const glyph = getComputedStyle(testId(mounted.container, "glyph"));

    expect(glyph.borderRadius).toBe("9999px");
    expect(glyph.width).toBe("20px");
    expect(glyph.height).toBe("20px");
    expect(glyph.cursor).toBe("default");
    expect(testId(mounted.container, "glyph").textContent).toBe("✓");
  });

  it("keeps the glyph's own style props above that class", () => {
    // `radio-card-with-custom-indicator` is exactly this: `borderWidth="0"` beside a `checked`
    // glyph, which only works because the slot rides `recipeClass` below the style props.
    mounted = mount(() => (
      <RadioCard.Root defaultValue="next">
        <RadioCard.Item value="next">
          <RadioCard.ItemIndicator data-testid="glyph" borderWidth="0" checked={Tick} />
        </RadioCard.Item>
      </RadioCard.Root>
    ));

    expect(getComputedStyle(testId(mounted.container, "glyph")).borderTopWidth).toBe("0px");
  });

  it("draws the default mark on every card the glyph's own is not picked for", async () => {
    mounted = mount(() => (
      <RadioCard.Root defaultValue="next">
        <For each={FRAMEWORKS}>
          {(framework) => (
            <RadioCard.Item value={framework}>
              <RadioCard.ItemHiddenInput />
              <RadioCard.ItemIndicator data-testid={`mark-${framework}`} checked={Tick} />
            </RadioCard.Item>
          )}
        </For>
      </RadioCard.Root>
    ));
    const { container } = mounted;

    expect(testId(container, "mark-next").textContent).toBe("✓");
    expect(testId(container, "mark-vite").textContent).toBe("");
    // The unpicked cards took the Radiomark arm, which draws no dot until it is picked.
    expect(testId(container, "mark-vite").querySelector(".dot")).toBeNull();

    // And the branch really is per card, live: picking another moves the glyph.
    partForValue(container, "item", "vite").click();
    await settle();

    expect(testId(container, "mark-vite").textContent).toBe("✓");
    expect(testId(container, "mark-next").textContent).toBe("");
  });

  it("draws the default mark when a wrapper forwards `checked={undefined}`", () => {
    mounted = mount(() => (
      <RadioCard.Root defaultValue="next">
        <RadioCard.Item value="next">
          <RadioCard.ItemIndicator data-testid="mark" checked={undefined} />
        </RadioCard.Item>
      </RadioCard.Root>
    ));

    expect(testId(mounted.container, "mark").querySelector(".dot")).not.toBeNull();
  });

  it("keeps `checked` off the DOM on both branches", () => {
    // Upstream spreads `{...props}` rather than `{...rest}` on its fallback branch, so the function
    // lands on the element until the next line overwrites it. Ours splits it out.
    mounted = mount(() => (
      <RadioCard.Root defaultValue="next">
        <RadioCard.Item value="next">
          <RadioCard.ItemIndicator data-testid="glyph" checked={Tick} />
        </RadioCard.Item>
        <RadioCard.Item value="vite">
          <RadioCard.ItemIndicator data-testid="mark" checked={Tick} />
        </RadioCard.Item>
      </RadioCard.Root>
    ));
    const { container } = mounted;

    expect(testId(container, "glyph").hasAttribute("checked")).toBe(false);
    expect(testId(container, "mark").hasAttribute("checked")).toBe(false);
    // `aria-hidden` is written at the call site, and it is on both arms — this part is not a machine
    // part, so unlike `RadioGroup.ItemIndicator` it inherits none.
    expect(testId(container, "glyph").getAttribute("aria-hidden")).toBe("true");
    expect(testId(container, "mark").getAttribute("aria-hidden")).toBe("true");
  });
});

describe("RadioCard — accessibility", () => {
  it("has no violations in any of the states a page really serves", async () => {
    const cases: Array<[string, () => Element]> = [
      ["default", () => mount(() => <Basic />).container],
      ["picked", () => mount(() => <Basic defaultValue="next" />).container],
      ["disabled", () => mount(() => <Basic disabled />).container],
      ["invalid", () => mount(() => <Basic invalid />).container],
      ["card disabled", () => mount(() => <Basic itemDisabled />).container],
      [
        // **No `RadioCard.Label` in here, and that is the composition rather than a shortcut.** The
        // machine takes the fieldset's legend id as its own label id, so a group that renders both
        // puts one id on two elements — Ark's shape, and ours, and axe cannot decide it.
        "in a fieldset",
        () =>
          mount(() => (
            <Fieldset.Root>
              <Fieldset.Legend>Framework</Fieldset.Legend>
              <RadioCard.Root>
                <For each={FRAMEWORKS}>
                  {(framework) => (
                    <RadioCard.Item value={framework}>
                      <RadioCard.ItemHiddenInput />
                      <RadioCard.ItemControl>
                        <RadioCard.ItemText>{framework}</RadioCard.ItemText>
                        <RadioCard.ItemIndicator />
                      </RadioCard.ItemControl>
                    </RadioCard.Item>
                  )}
                </For>
              </RadioCard.Root>
            </Fieldset.Root>
          )).container,
      ],
    ];

    for (const [name, render] of cases) {
      mounted?.dispose();
      mounted = undefined;
      const container = render();
      try {
        await expectNoA11yViolations(container);
      } catch (failure) {
        throw new Error(`${name}: ${(failure as Error).message}`);
      }
      container.remove();
    }
  });
});

describe("RadioCard — server render, then hydrate", () => {
  /** A probe on the hydrated tree; the entry gives every element one. */
  function probeIn(container: ParentNode, probe: string): HTMLElement {
    const element = container.querySelector(`[data-probe="${probe}"]`);
    if (!(element instanceof HTMLElement)) {
      throw new Error(`the hydrated tree is missing its [data-probe="${probe}"] element`);
    }
    return element;
  }

  it("reuses every server node across five cards, a per-card gate and an empty group", () => {
    // `hydrateFixture` asserts the contract itself — hydration was silent, no element was added or
    // dropped, every server node survived as the same object — so what is left here is the shape
    // the tree was *supposed* to arrive in.
    //
    // The divergence this subject is first to carry: the `checked` gate is decided **per card**, by
    // the machine's answer about that card, and the two arms are different subtrees. One card in
    // five takes the far arm on both builds, or every hydration key after it moves.
    const { container, dispose } = hydrateFixture(radioCardServerHtml, () => <Tree />);

    expect(container.querySelectorAll('[data-scope="radio-group"][data-part="item"]')).toHaveLength(
      13,
    );

    expect(probeIn(container, "a-text-astro").textContent).toBe("astro");
    expect((probeIn(container, "a-input-astro") as HTMLInputElement).checked).toBe(true);
    expect((probeIn(container, "a-input-next") as HTMLInputElement).checked).toBe(false);

    // The dot is one extra node in the picked card and in no other, on both builds.
    expect(probeIn(container, "a-mark-astro").querySelector(".dot")).not.toBeNull();
    expect(probeIn(container, "a-mark-next").querySelector(".dot")).toBeNull();

    // The gate: the glyph on the picked card, the Radiomark on the four others.
    expect(probeIn(container, "b-mark-astro").querySelector("svg")).not.toBeNull();
    expect(probeIn(container, "b-mark-next").querySelector("svg")).toBeNull();

    // The render prop is called in the part's body rather than a tracking scope, so it returns JSX
    // and the `Show` inside it is what reads the card.
    expect(probeIn(container, "c-state-one").textContent).toBe("picked");
    expect(probeIn(container, "c-state-two").textContent).toBe("—");

    expect(probeIn(container, "after").textContent).toBe("after");

    dispose();
  });

  it("keeps every card's ids and slot classes identical on both builds", () => {
    const { container, dispose } = hydrateFixture(radioCardServerHtml, () => <Tree />);

    for (const framework of ["next", "vite", "astro", "remix", "nuxt"]) {
      expect(probeIn(container, `a-text-${framework}`).id).toContain(`:label:${framework}`);
    }

    const classes = [...container.querySelectorAll('[data-probe^="a-control-"]')].map(
      (element) => element.className,
    );
    expect(new Set(classes).size).toBe(1);

    dispose();
  });

  it("moves the glyph between two server nodes after hydration", async () => {
    const { container, dispose } = hydrateFixture(radioCardServerHtml, () => <Tree />);

    // The machine starts in `onSettled`, which `hydrateFixture` does not wait for; `data-ssr`
    // clearing is the machine's own signal that it has started.
    await vi.waitFor(() =>
      expect(probeIn(container, "b-item-nuxt").hasAttribute("data-ssr")).toBe(false),
    );

    probeIn(container, "b-item-nuxt").click();
    await vi.waitFor(() => expect(probeIn(container, "b-item-nuxt").dataset.state).toBe("checked"));

    // The gate swings on two nodes the *server* sent, one of which rendered a whole subtree the
    // other did not — the arm a per-item gate can silently lose.
    expect(probeIn(container, "b-mark-nuxt").querySelector("svg")).not.toBeNull();
    expect(probeIn(container, "b-mark-astro").querySelector("svg")).toBeNull();

    dispose();
  });

  it("clears `data-ssr` once the machine starts, on the nodes the server sent", async () => {
    expect(radioCardServerHtml).toContain("data-ssr");

    const { container, dispose } = hydrateFixture(radioCardServerHtml, () => <Tree />);
    const item = probeIn(container, "a-item-next");

    await vi.waitFor(() => expect(item.hasAttribute("data-ssr")).toBe(false));
    expect(probeIn(container, "a-text-next").hasAttribute("data-ssr")).toBe(false);
    // …and it was never on the hand-written control, which is not a machine element.
    expect(probeIn(container, "a-control-next").hasAttribute("data-ssr")).toBe(false);

    dispose();
  });
});
