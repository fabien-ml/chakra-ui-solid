import radioGroupServerHtml from "virtual:hydration-fixture?id=radio-group";
import {
  expectNoA11yViolations,
  hydrateFixture,
  type MountedComponent,
  mount,
} from "@chakra-ui-solid/internal-test-utils";
import { createSignal, For, merge } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Fieldset } from "../../fieldset";
import type {
  CreateRadioGroupReturn,
  RadioGroupItemBaseProps,
  RadioGroupItemState,
  RadioGroupValueChangeDetails,
} from "../index";
import { createRadioGroup, RadioGroup } from "../index";
import { Tree } from "./radio-group.ssr-entry";

let mounted: MountedComponent | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

/**
 * The machine defers every `send` by a microtask, and a radio group runs exactly one machine for N
 * radios — no presence, no per-item service — so one turn of the queue is the whole wait. What the
 * machine schedules in a `raf` (the indicator's rect measurement) is waited for with `vi.waitFor`.
 */
const settle = () => new Promise<void>((resolve) => queueMicrotask(resolve));

/**
 * An element by part, **scope-qualified**: `fieldset` and `radio-group` both name a part `root`, and
 * several trees below nest one inside another.
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

/** One item's element of a part, found by the item's own id rather than by position. */
function partForValue(container: ParentNode, part: string, value: string): HTMLElement {
  const found = partsOf(container, part).find((element) => element.id.endsWith(`:${value}`));
  if (found === undefined) {
    throw new Error(`expected a [data-part="${part}"] element for the "${value}" item`);
  }
  return found;
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

function testId(container: ParentNode, id: string): HTMLElement {
  const element = container.querySelector(`[data-testid="${id}"]`);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`expected the tree to render a [data-testid="${id}"] element`);
  }
  return element;
}

const FRAMEWORKS = ["solid", "vue", "react"];

/**
 * Every prop is forwarded **by name** rather than spread, which is what puts each of them on the
 * forwarded-`undefined` path on every test in this file.
 */
function Basic(props: {
  defaultValue?: string | null;
  disabled?: boolean;
  invalid?: boolean;
  itemDisabled?: boolean;
  itemInvalid?: boolean;
  name?: string;
  onValueChange?: (details: RadioGroupValueChangeDetails) => void;
  orientation?: "horizontal" | "vertical";
  readOnly?: boolean;
  required?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  unstyled?: boolean;
  value?: string | null;
  variant?: "outline" | "subtle" | "solid";
}) {
  return (
    <RadioGroup.Root
      defaultValue={props.defaultValue}
      disabled={props.disabled}
      invalid={props.invalid}
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
      <RadioGroup.Label>Framework</RadioGroup.Label>
      <For each={FRAMEWORKS}>
        {(framework) => (
          <RadioGroup.Item
            value={framework}
            disabled={framework === "vue" ? props.itemDisabled : undefined}
            invalid={framework === "vue" ? props.itemInvalid : undefined}
          >
            <RadioGroup.ItemHiddenInput />
            <RadioGroup.ItemIndicator />
            <RadioGroup.ItemText>{framework}</RadioGroup.ItemText>
          </RadioGroup.Item>
        )}
      </For>
    </RadioGroup.Root>
  );
}

describe("RadioGroup — a real machine through the adapter", () => {
  it("picks a radio on a click anywhere in its row, because each item is a label", async () => {
    const onValueChange = vi.fn();
    mounted = mount(() => <Basic onValueChange={onValueChange} />);
    const { container } = mounted;

    // The item, not the input: `getItemProps()` points its `for` at that item's hidden input, so
    // the whole row is the hit area and no handler of ours is involved.
    partForValue(container, "item", "vue").click();
    await settle();

    expect(onValueChange).toHaveBeenCalledWith({ value: "vue" });
    expect(inputForValue(container, "vue").checked).toBe(true);
    expect(partForValue(container, "item", "vue").dataset.state).toBe("checked");
    expect(partForValue(container, "item", "solid").dataset.state).toBe("unchecked");
  });

  it("moves the checked state between items rather than accumulating it", async () => {
    mounted = mount(() => <Basic defaultValue="solid" />);
    const { container } = mounted;

    expect(inputsIn(container).filter((input) => input.checked)).toHaveLength(1);

    partForValue(container, "item", "react").click();
    await settle();

    const checked = inputsIn(container).filter((input) => input.checked);
    expect(checked).toHaveLength(1);
    expect(checked[0]?.value).toBe("react");
  });

  it("reports a controlled change upward rather than making it itself", async () => {
    const onValueChange = vi.fn();
    mounted = mount(() => <Basic value="solid" onValueChange={onValueChange} />);
    const { container } = mounted;

    partForValue(container, "item", "vue").click();
    await settle();

    expect(onValueChange).toHaveBeenCalledWith({ value: "vue" });
    expect(inputForValue(container, "solid").checked).toBe(true);
    expect(partForValue(container, "item", "vue").dataset.state).toBe("unchecked");
  });

  it("takes no click on a disabled item while the rest of the group still works", async () => {
    const onValueChange = vi.fn();
    mounted = mount(() => <Basic itemDisabled onValueChange={onValueChange} />);
    const { container } = mounted;

    expect(inputForValue(container, "vue").disabled).toBe(true);
    expect(inputForValue(container, "solid").disabled).toBe(false);

    partForValue(container, "item", "vue").click();
    await settle();
    expect(onValueChange).not.toHaveBeenCalled();

    partForValue(container, "item", "solid").click();
    await settle();
    expect(onValueChange).toHaveBeenCalledWith({ value: "solid" });
  });

  it("stays focusable but refuses to change while read-only", async () => {
    const onValueChange = vi.fn();
    mounted = mount(() => <Basic readOnly onValueChange={onValueChange} />);
    const { container } = mounted;

    expect(partForValue(container, "item", "solid").dataset.readonly).toBe("");

    inputForValue(container, "vue").click();
    await settle();

    expect(onValueChange).not.toHaveBeenCalled();
    expect(inputForValue(container, "vue").checked).toBe(false);
  });

  it("marks focus and hover on the item the pointer is over, and on no other", async () => {
    mounted = mount(() => <Basic />);
    const { container } = mounted;

    inputForValue(container, "vue").focus();
    await vi.waitFor(() => expect(partForValue(container, "item", "vue").dataset.focus).toBe(""));
    expect(partForValue(container, "item", "solid").dataset.focus).toBeUndefined();

    partForValue(container, "item", "react").dispatchEvent(
      new PointerEvent("pointermove", { bubbles: true }),
    );
    await settle();
    expect(partForValue(container, "item", "react").dataset.hover).toBe("");
    expect(partForValue(container, "item", "vue").dataset.hover).toBeUndefined();
  });

  it("focuses the checked radio when the group's label is clicked", async () => {
    mounted = mount(() => <Basic defaultValue="react" />);
    const { container } = mounted;

    partOf(container, "label").click();
    await vi.waitFor(() => expect(document.activeElement).toBe(inputForValue(container, "react")));
  });

  it("submits one value under one name", async () => {
    mounted = mount(() => (
      <form>
        <Basic name="framework" />
      </form>
    ));
    const form = mounted.container.querySelector("form");
    if (!(form instanceof HTMLFormElement)) {
      throw new Error("expected a form");
    }

    expect([...new FormData(form).entries()]).toEqual([]);

    partForValue(mounted.container, "item", "vue").click();
    await settle();

    expect([...new FormData(form).entries()]).toEqual([["framework", "vue"]]);
  });

  it("keeps the machine's `vertical` orientation when a wrapper forwards it unset", () => {
    // The adapter runs `compact()` over the machine's prop bag, so an unset key never reaches the
    // spread that would overwrite the machine's own default with `undefined` (`CLAUDE.md`, *The
    // third hazard*). It is the machine's default, not the one a row of radios looks like — the
    // recipe lays nothing out, so this is only the arrow-key model.
    mounted = mount(() => <Basic orientation={undefined} />);

    expect(partOf(mounted.container, "root").dataset.orientation).toBe("vertical");
  });

  it("hands the machine to a `RadioGroup.Context` render prop that returns JSX", async () => {
    mounted = mount(() => (
      <RadioGroup.Root>
        <RadioGroup.Item value="solid">
          <RadioGroup.ItemHiddenInput />
          <RadioGroup.ItemText>Solid</RadioGroup.ItemText>
        </RadioGroup.Item>
        <RadioGroup.Context>
          {(group) => <span data-testid="value">{String(group.value)}</span>}
        </RadioGroup.Context>
      </RadioGroup.Root>
    ));
    const value = () => testId(mounted?.container as ParentNode, "value").textContent;

    // `undefined`, not `null`, and that is the machine's: its `value` bindable is seeded with
    // `defaultValue` straight off the props, so an untouched group has never been given one. Zag
    // types the member `string | null`, which the inherited store type repeats — asserted here so
    // the gap is recorded rather than discovered by a consumer's `=== null`.
    expect(value()).toBe("undefined");

    partOf(mounted.container, "item").click();
    await settle();

    expect(value()).toBe("solid");
  });

  it("drives a `RootProvider` from a machine the consumer owns", async () => {
    let store: CreateRadioGroupReturn | undefined;
    mounted = mount(() => {
      store = createRadioGroup({ defaultValue: "solid" });
      return (
        <RadioGroup.RootProvider value={store}>
          <RadioGroup.Item value="solid">
            <RadioGroup.ItemHiddenInput />
            <RadioGroup.ItemIndicator />
          </RadioGroup.Item>
          <RadioGroup.Item value="vue">
            <RadioGroup.ItemHiddenInput />
            <RadioGroup.ItemIndicator />
          </RadioGroup.Item>
        </RadioGroup.RootProvider>
      );
    });

    expect(store?.value).toBe("solid");
    store?.setValue("vue");
    await settle();

    expect(store?.value).toBe("vue");
    expect(partForValue(mounted.container, "item", "vue").dataset.state).toBe("checked");

    store?.clearValue();
    await settle();
    expect(inputsIn(mounted.container).filter((input) => input.checked)).toHaveLength(0);
  });

  it("inherits a surrounding fieldset's states and its legend id", () => {
    // Ark reads a *fieldset* here where Checkbox and Switch read a Field: a set of radios is a
    // legend and a group rather than one labelled control.
    mounted = mount(() => (
      <Fieldset.Root id="framework" disabled invalid>
        <Fieldset.Legend>Framework</Fieldset.Legend>
        <Basic />
      </Fieldset.Root>
    ));
    const { container } = mounted;

    expect(inputForValue(container, "solid").disabled).toBe(true);
    expect(partForValue(container, "item", "solid").dataset.invalid).toBe("");
    expect(partOf(container, "root").getAttribute("aria-labelledby")).toBe(
      "fieldset::framework::legend",
    );
  });
});

describe("RadioGroup — shape E, the repeated part", () => {
  /**
   * Every item's context object, captured through the public `ItemContext` render prop — the same
   * thing a consumer gets, so nothing here reaches into an internal.
   */
  function capturingTree(captured: Map<string, RadioGroupItemState>) {
    return (
      <RadioGroup.Root defaultValue="solid">
        <For each={FRAMEWORKS}>
          {(framework) => (
            <RadioGroup.Item value={framework}>
              <RadioGroup.ItemHiddenInput />
              <RadioGroup.ItemIndicator />
              <RadioGroup.ItemText>{framework}</RadioGroup.ItemText>
              <RadioGroup.ItemContext>
                {(item) => {
                  // Keyed by the `<For>` callback's own plain string rather than by `item.value`:
                  // this callback runs in the part's body, which is not a tracking scope, so
                  // reading a context member here is the untracked read `mount`'s guard reports.
                  captured.set(framework, item);
                  return <span data-testid={`state-${framework}`}>{framework}</span>;
                }}
              </RadioGroup.ItemContext>
            </RadioGroup.Item>
          )}
        </For>
      </RadioGroup.Root>
    );
  }

  it("proof 1 — builds one context per item, once, and keeps it across state changes", async () => {
    // Three items, three distinct context objects, each reporting its own identity. Then a
    // selection change: the objects a descendant captured at build time report the **new** state,
    // which is only true if the context was built once per item and its members are reactive
    // getters. A context rebuilt per transition would leave these three stale.
    const captured = new Map<string, RadioGroupItemState>();
    mounted = mount(() => capturingTree(captured));

    expect([...captured.keys()]).toEqual(FRAMEWORKS);
    expect(new Set(captured.values()).size).toBe(3);
    expect(captured.get("solid")?.checked).toBe(true);
    expect(captured.get("vue")?.checked).toBe(false);

    partForValue(mounted.container, "item", "vue").click();
    await settle();

    expect(captured.size).toBe(3);
    expect(captured.get("solid")?.checked).toBe(false);
    expect(captured.get("vue")?.checked).toBe(true);
  });

  it("proof 1 — every descendant part reads its own item, never the Root's state", () => {
    // No part below `Item` takes a `value`, so an id or a `data-state` that is right per item can
    // only have come from the item context. Reading the Root instead would give all three items the
    // *group's* answer, which is what this compares against.
    mounted = mount(() => <Basic defaultValue="vue" />);
    const { container } = mounted;

    for (const part of ["item", "item-text", "item-control"]) {
      const states = partsOf(container, part).map((element) => element.dataset.state);
      expect(states, part).toEqual(["unchecked", "checked", "unchecked"]);
    }

    for (const framework of FRAMEWORKS) {
      expect(partForValue(container, "item-text", framework).id).toContain(`:label:${framework}`);
      expect(partForValue(container, "item-control", framework).id).toContain(
        `:control:${framework}`,
      );
      expect(inputForValue(container, framework).id).toContain(`:input:${framework}`);
    }
  });

  it("proof 2 — the item's props bag round-trips through the Root's getters, live", async () => {
    // The bag every part hands back is captured off the machine the consumer owns, so this is the
    // real argument rather than a reconstruction. Two things are asserted about it: the getters are
    // called with the item's own bag, and the bag is **the item's live one** — reading it after a
    // signal changed the item's `value` gives the new value, so nothing copied it on the way past.
    const seenByText: RadioGroupItemBaseProps[] = [];
    const seenByControl: RadioGroupItemBaseProps[] = [];
    const [value, setValue] = createSignal("solid");

    mounted = mount(() => {
      const store = createRadioGroup();
      const spied = merge(store, {
        getItemTextProps: (itemProps: RadioGroupItemBaseProps) => {
          seenByText.push(itemProps);
          return store.getItemTextProps(itemProps);
        },
        getItemControlProps: (itemProps: RadioGroupItemBaseProps) => {
          seenByControl.push(itemProps);
          return store.getItemControlProps(itemProps);
        },
      });

      return (
        <RadioGroup.RootProvider value={spied}>
          <RadioGroup.Item value={value()} disabled invalid>
            <RadioGroup.ItemHiddenInput />
            <RadioGroup.ItemControl />
            <RadioGroup.ItemText>Framework</RadioGroup.ItemText>
          </RadioGroup.Item>
        </RadioGroup.RootProvider>
      );
    });

    expect(seenByText.length).toBeGreaterThan(0);
    expect(seenByControl.length).toBeGreaterThan(0);

    // Unmodified: exactly the three keys the machine's `ItemProps` names, with the values written
    // on the Item — a part that added or dropped one would show up here.
    for (const bag of [seenByText[0], seenByControl[0]]) {
      expect(Object.keys(bag as object).sort()).toEqual(["disabled", "invalid", "value"]);
      expect(bag?.disabled).toBe(true);
      expect(bag?.invalid).toBe(true);
    }
    expect(seenByText[0]?.value).toBe("solid");
    // The same object both parts were handed — one bag per item, not one per part.
    expect(seenByText[0]).toBe(seenByControl[0]);

    setValue("vue");
    await settle();

    expect(seenByText[0]?.value).toBe("vue");
    expect(partOf(mounted.container, "item-text").id).toContain(":label:vue");
  });

  it("proof 3 — builds the context inside a `<For>` with no untracked read", async () => {
    // A `<For>` callback is a strict-read phase, and `mount`'s console guard raises a recorded
    // `[STRICT_READ_UNTRACKED]` from `dispose()` as a failure carrying the full text. Disposing
    // inside the test rather than leaving it to `afterEach` is what makes the proof legible: this
    // assertion is the diagnostic, not a green tick beside it.
    //
    // Six items, each reading `props.value` through the context and the machine, over a signal-driven
    // list — so a read the item body took eagerly would be reported rather than merely stale.
    const [list, setList] = createSignal([...FRAMEWORKS, "svelte", "qwik", "angular"]);
    const current = mount(() => (
      <RadioGroup.Root defaultValue="solid">
        <For each={list()}>
          {(framework) => (
            <RadioGroup.Item value={framework}>
              <RadioGroup.ItemHiddenInput />
              <RadioGroup.ItemIndicator />
              <RadioGroup.ItemText>{framework}</RadioGroup.ItemText>
            </RadioGroup.Item>
          )}
        </For>
      </RadioGroup.Root>
    ));

    expect(partsOf(current.container, "item")).toHaveLength(6);

    setList(["solid", "vue"]);
    await settle();
    expect(partsOf(current.container, "item")).toHaveLength(2);

    expect(() => current.dispose()).not.toThrow();
  });

  it("proof 5 — resolves the class map once on the Root, so every item wears one string", () => {
    // A per-item `sva()` call would be correct and wasteful, and the only thing that can see the
    // difference is a comparison like this one. Asserted with the *computed* box as well, because a
    // class map resolved per item could still agree by accident while the recipe was never run.
    mounted = mount(() => <Basic size="lg" variant="outline" />);
    const { container } = mounted;

    for (const part of ["item", "item-text", "item-control"]) {
      const classes = partsOf(container, part).map((element) => element.className);
      expect(new Set(classes).size, part).toBe(1);
    }

    const boxes = partsOf(container, "item-control").map(
      (element) => getComputedStyle(element).width,
    );
    expect(new Set(boxes).size).toBe(1);
    expect(boxes[0]).toBe("24px");
  });

  it("keeps one item's own `disabled` off its siblings", () => {
    mounted = mount(() => <Basic itemDisabled itemInvalid />);
    const { container } = mounted;

    expect(partForValue(container, "item", "vue").dataset.disabled).toBe("");
    expect(partForValue(container, "item-control", "vue").dataset.invalid).toBe("");
    expect(partForValue(container, "item", "solid").dataset.disabled).toBeUndefined();
    expect(partForValue(container, "item-control", "solid").dataset.invalid).toBeUndefined();
  });

  it("lets the group's `disabled` win over an item that forwards it unset", () => {
    // `getItemState` resolves the two with `||`, so an item passing `disabled={undefined}` inherits
    // rather than overriding — the forwarded-`undefined` path on a per-item prop.
    mounted = mount(() => <Basic disabled itemDisabled={undefined} />);

    for (const input of inputsIn(mounted.container)) {
      expect(input.disabled).toBe(true);
    }
  });

  it("throws from a part written outside an Item, naming the one to add", () => {
    expect(() =>
      mount(() => (
        <RadioGroup.Root>
          <RadioGroup.ItemText>orphan</RadioGroup.ItemText>
        </RadioGroup.Root>
      )),
    ).toThrow(/RadioGroup\.Item/);
  });
});

describe("RadioGroup — the styles the slot recipe really generated", () => {
  it("lays the item out and draws the circle from the `itemControl` slot", () => {
    mounted = mount(() => <Basic />);
    const { container } = mounted;

    const item = getComputedStyle(partOf(container, "item"));
    expect(item.display).toBe("inline-flex");
    expect(item.alignItems).toBe("center");
    expect(item.position).toBe("relative");
    expect(item.fontWeight).toBe("500");

    const control = getComputedStyle(partOf(container, "item-control"));
    // `flex`, though the recipe says `inline-flex`: the item above it is an inline-flex container,
    // so this is a flex item and CSS blockifies its `display`. The recipe's declaration is what the
    // `justify-content` below proves reached the sheet.
    expect(control.display).toBe("flex");
    expect(control.justifyContent).toBe("center");
    expect(control.borderWidth).toBe("1px");
    expect(control.borderRadius).toBe("9999px");
    // `cursor.radio` is `default` in the preset, unlike `cursor.button`. Asserting the resolved
    // value is what proves the token reached the sheet rather than the literal `radio`.
    expect(control.cursor).toBe("default");
  });

  it("paints the dot from the slot's own `& .dot` rule, which survives `unstyled`", () => {
    // The Radiomark renders `unstyled`, so its own `.radiomark` class is gone and with it the rule
    // that would size the dot. What finds `class="dot"` on the way back in is the `itemControl`
    // slot, which the preset gives the same `& .dot` block.
    mounted = mount(() => <Basic defaultValue="solid" />);
    const dot = partForValue(mounted.container, "item-control", "solid").querySelector(".dot");
    if (!(dot instanceof HTMLElement)) {
      throw new Error("expected a checked radio to render its dot");
    }
    const styles = getComputedStyle(dot);

    expect(styles.borderRadius).toBe("9999px");
    expect(styles.scale).toBe("0.4");
    // `bg: currentColor` off the slot's rule — the circle's `color`, which every variant paints.
    expect(styles.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    expect(Number.parseFloat(styles.width)).toBeGreaterThan(0);
  });

  it("widens the dot under `variant=outline`, which is the recipe's one respelt block", () => {
    mounted = mount(() => <Basic defaultValue="solid" variant="outline" />);
    const dot = partForValue(mounted.container, "item-control", "solid").querySelector(".dot");
    if (!(dot instanceof HTMLElement)) {
      throw new Error("expected a checked radio to render its dot");
    }

    expect(getComputedStyle(dot).scale).toBe("0.6");
  });

  it("draws no dot at all until an item is checked", () => {
    mounted = mount(() => <Basic defaultValue="solid" />);

    expect(
      partForValue(mounted.container, "item-control", "solid").querySelector(".dot"),
    ).not.toBeNull();
    expect(partForValue(mounted.container, "item-control", "vue").querySelector(".dot")).toBeNull();
  });

  it("sizes the circle and the row from every one of the four `size` variants", () => {
    const boxes = { xs: "12px", sm: "16px", md: "20px", lg: "24px" } as const;
    const gaps = { xs: "6px", sm: "8px", md: "10px", lg: "12px" } as const;

    for (const size of ["xs", "sm", "md", "lg"] as const) {
      mounted?.dispose();
      mounted = mount(() => <Basic size={size} />);
      const control = getComputedStyle(partOf(mounted.container, "item-control"));
      const item = getComputedStyle(partOf(mounted.container, "item"));

      expect(control.width, size).toBe(boxes[size]);
      expect(control.height, size).toBe(boxes[size]);
      expect(item.columnGap, size).toBe(gaps[size]);
    }
  });

  it("keeps the default `md` when the `size` variant is left unset", () => {
    mounted = mount(() => <Basic size={undefined} />);

    expect(getComputedStyle(partOf(mounted.container, "item-control")).width).toBe("20px");
  });

  it("draws the three `variant`s differently, and defaults to `solid`", async () => {
    mounted = mount(() => <Basic variant={undefined} defaultValue="solid" />);
    const solidChecked = getComputedStyle(partForValue(mounted.container, "item-control", "solid"));
    // `solid` fills the checked circle from the palette; the other two never set a background here.
    expect(solidChecked.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");

    mounted.dispose();
    mounted = mount(() => <Basic variant="subtle" />);
    const subtle = getComputedStyle(partOf(mounted.container, "item-control"));
    expect(subtle.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    // `subtle` hides the dot at rest by painting it in `transparent` and reveals it on `_checked`.
    expect(subtle.color).toBe("rgba(0, 0, 0, 0)");

    mounted.dispose();
    mounted = mount(() => <Basic variant="outline" />);
    const outline = getComputedStyle(partOf(mounted.container, "item-control"));
    expect(outline.backgroundColor).toBe("rgba(0, 0, 0, 0)");
    await settle();
  });

  it("rings an invalid circle red under every variant, which is the preset row's whole job", () => {
    // `base.itemControl._invalid` sets `borderColor: red.500`, and **all three variants write a flat
    // `borderColor`** — `inherit`, `colorPalette.muted`, `border.emphasized`. Panda emits base
    // conditions into a nested `_base` sub-layer that an unlayered variant rule beats whatever its
    // specificity, so without this recipe's `shadowedSlotBaseConditions` row an invalid radio
    // renders in its resting colour and says nothing.
    for (const variant of ["outline", "subtle", "solid"] as const) {
      mounted?.dispose();
      mounted = mount(() => <Basic variant={variant} invalid />);
      const control = getComputedStyle(partOf(mounted.container, "item-control"));

      expect(control.borderTopColor, variant).toBe("rgb(239, 68, 68)");
    }
  });

  it("rings an item that is invalid on its own, with the group valid", () => {
    mounted = mount(() => <Basic itemInvalid />);
    const { container } = mounted;

    expect(getComputedStyle(partForValue(container, "item-control", "vue")).borderTopColor).toBe(
      "rgb(239, 68, 68)",
    );
    expect(
      getComputedStyle(partForValue(container, "item-control", "solid")).borderTopColor,
    ).not.toBe("rgb(239, 68, 68)");
  });

  it("dims a disabled item and takes the cursor with it", () => {
    mounted = mount(() => <Basic itemDisabled />);
    const { container } = mounted;
    const control = getComputedStyle(partForValue(container, "item-control", "vue"));

    expect(control.opacity).toBe("0.5");
    expect(control.cursor).toBe("not-allowed");
    expect(getComputedStyle(partForValue(container, "item", "vue")).cursor).toBe("not-allowed");
  });

  it("scales the group's label and dims it with the group", () => {
    mounted = mount(() => <Basic />);
    const label = getComputedStyle(partOf(mounted.container, "label"));

    expect(label.userSelect).toBe("none");
    expect(label.fontSize).toBe("14px");

    mounted.dispose();
    mounted = mount(() => <Basic disabled />);
    expect(getComputedStyle(partOf(mounted.container, "label")).opacity).toBe("0.5");
  });

  it("leaves every part with the browser's own styles under a Root-level `unstyled`", () => {
    // Asserted as a computed **fallback**, never as an absent class: a missing class name and a
    // class whose CSS was never generated look identical from the DOM.
    mounted = mount(() => <Basic unstyled defaultValue="solid" />);
    const { container } = mounted;

    expect(getComputedStyle(partOf(container, "item")).display).toBe("inline");
    expect(getComputedStyle(partOf(container, "item-control")).width).not.toBe("20px");
    expect(getComputedStyle(partOf(container, "item-control")).borderRadius).toBe("0px");
    expect(getComputedStyle(partOf(container, "label")).userSelect).not.toBe("none");
  });

  it("keeps that opt-out when a wrapper forwards `unstyled={undefined}`", () => {
    mounted = mount(() => <Basic unstyled={undefined} />);

    expect(getComputedStyle(partOf(mounted.container, "item-control")).width).toBe("20px");
  });

  it("keeps the indicator's slot class when a wrapper forwards `unstyled={undefined}`", () => {
    // `RadioGroup.ItemIndicator` hardcodes `unstyled` on the Radiomark **after** the spread, so
    // there is nothing a forwarded `undefined` can delete — switching the `radiomark` recipe back on
    // underneath the `itemControl` slot would draw a second circle inside the first.
    mounted = mount(() => (
      <RadioGroup.Root defaultValue="solid">
        <RadioGroup.Item value="solid">
          <RadioGroup.ItemIndicator unstyled={undefined} />
        </RadioGroup.Item>
      </RadioGroup.Root>
    ));
    const control = partOf(mounted.container, "item-control");

    expect(control.className).not.toContain("radiomark");
    expect(getComputedStyle(control).width).toBe("20px");
    expect(getComputedStyle(control).borderRadius).toBe("9999px");
  });

  it("puts a style prop on the indicator above the slot it inherits", () => {
    // The `itemControl` class rides `recipeClass`, which sits *below* style props — which is where
    // the React version's `css={[styles.itemControl, props.css]}` puts it too. Handing it to the
    // Radiomark as a `class` instead would lift it above them and this would silently stay 9999px.
    mounted = mount(() => (
      <RadioGroup.Root defaultValue="solid">
        <RadioGroup.Item value="solid">
          <RadioGroup.ItemIndicator borderRadius="sm" />
        </RadioGroup.Item>
      </RadioGroup.Root>
    ));

    expect(getComputedStyle(partOf(mounted.container, "item-control")).borderRadius).not.toBe(
      "9999px",
    );
  });

  it("takes its variants from a `PropsProvider`, and lets a Root beat them", () => {
    mounted = mount(() => (
      <RadioGroup.PropsProvider value={{ size: "lg" }}>
        <div data-testid="provided">
          <Basic />
        </div>
        <div data-testid="overridden">
          <Basic size="xs" />
        </div>
      </RadioGroup.PropsProvider>
    ));
    const { container } = mounted;

    expect(getComputedStyle(partOf(testId(container, "provided"), "item-control")).width).toBe(
      "24px",
    );
    expect(getComputedStyle(partOf(testId(container, "overridden"), "item-control")).width).toBe(
      "12px",
    );
  });

  it("keeps the provider's variant when a Root forwards an unset one", () => {
    mounted = mount(() => (
      <RadioGroup.PropsProvider value={{ size: "lg" }}>
        <Basic size={undefined} />
      </RadioGroup.PropsProvider>
    ));

    expect(getComputedStyle(partOf(mounted.container, "item-control")).width).toBe("24px");
  });

  it("gives a plain `ItemControl` the same slot as the indicator, and no mark", () => {
    mounted = mount(() => (
      <RadioGroup.Root defaultValue="solid">
        <RadioGroup.Item value="solid">
          <RadioGroup.ItemControl />
        </RadioGroup.Item>
      </RadioGroup.Root>
    ));
    const control = partOf(mounted.container, "item-control");

    expect(getComputedStyle(control).borderRadius).toBe("9999px");
    expect(control.querySelector(".dot")).toBeNull();
  });
});

describe("RadioGroup — accessibility", () => {
  it("has no violations in any of the states a page really serves", async () => {
    const cases: Array<[string, () => Element]> = [
      ["default", () => mount(() => <Basic />).container],
      ["checked", () => mount(() => <Basic defaultValue="solid" />).container],
      ["disabled", () => mount(() => <Basic disabled />).container],
      ["invalid", () => mount(() => <Basic invalid />).container],
      ["item disabled", () => mount(() => <Basic itemDisabled />).container],
      [
        // **No `RadioGroup.Label` in here, and that is the composition rather than a shortcut.**
        // The machine takes the fieldset's legend id as its own label id, so a group that renders
        // both puts one id on two elements — Ark's shape, and ours, and axe cannot decide it. The
        // legend *is* the group's label; a `RadioGroup.Label` is for a group standing alone.
        "in a fieldset",
        () =>
          mount(() => (
            <Fieldset.Root>
              <Fieldset.Legend>Framework</Fieldset.Legend>
              <RadioGroup.Root>
                <For each={FRAMEWORKS}>
                  {(framework) => (
                    <RadioGroup.Item value={framework}>
                      <RadioGroup.ItemHiddenInput />
                      <RadioGroup.ItemIndicator />
                      <RadioGroup.ItemText>{framework}</RadioGroup.ItemText>
                    </RadioGroup.Item>
                  )}
                </For>
              </RadioGroup.Root>
            </Fieldset.Root>
          )).container,
      ],
    ];

    for (const [name, render] of cases) {
      mounted?.dispose();
      mounted = undefined;
      const container = render();
      // `name` is only here so a failure says which state it was in; axe reports against the
      // container it was handed.
      try {
        await expectNoA11yViolations(container);
      } catch (failure) {
        throw new Error(`${name}: ${(failure as Error).message}`);
      }
      container.remove();
    }
  });
});

describe("RadioGroup — server render, then hydrate", () => {
  /** A probe on the hydrated tree; the entry gives every element one. */
  function probeIn(container: ParentNode, probe: string): HTMLElement {
    const element = container.querySelector(`[data-probe="${probe}"]`);
    if (!(element instanceof HTMLElement)) {
      throw new Error(`the hydrated tree is missing its [data-probe="${probe}"] element`);
    }
    return element;
  }

  it("reuses every server node across six items, a static list and an empty group", () => {
    // Proof 4, and the half neither other project can see. `hydrateFixture` asserts the contract
    // itself — hydration was silent, no element was added or dropped, every server node survived as
    // the same object — so what is left here is the shape the tree was *supposed* to arrive in.
    //
    // Six items from a `<For>` over four parts each, with the checked one fifth: an item spends a
    // fixed number of hydration keys and the next item's start position depends on it, so a server
    // that resolved any item differently would land every node after it on the wrong marker.
    const { container, dispose } = hydrateFixture(radioGroupServerHtml, () => <Tree />);

    // Six from the `<For>`, two written statically, one in the fieldset, one beside the plain
    // control, and none at all from the empty root.
    expect(container.querySelectorAll('[data-scope="radio-group"][data-part="item"]')).toHaveLength(
      10,
    );
    expect(probeIn(container, "a-text-svelte").textContent).toBe("svelte");
    expect((probeIn(container, "a-input-svelte") as HTMLInputElement).checked).toBe(true);
    expect((probeIn(container, "a-input-solid") as HTMLInputElement).checked).toBe(false);

    // The dot is one extra node in the checked item and in no other, on both builds.
    expect(probeIn(container, "a-mark-svelte").querySelector(".dot")).not.toBeNull();
    expect(probeIn(container, "a-mark-solid").querySelector(".dot")).toBeNull();

    // The render prop is called in the part's body rather than a tracking scope, so it returns JSX
    // and the `Show` inside it is what reads the item.
    expect(probeIn(container, "b-state-one").textContent).toBe("picked");
    expect(probeIn(container, "b-state-two").textContent).toBe("—");

    expect(probeIn(container, "after").textContent).toBe("after");

    dispose();
  });

  it("keeps every item's ids and slot classes identical on both builds", () => {
    const { container, dispose } = hydrateFixture(radioGroupServerHtml, () => <Tree />);

    for (const framework of ["solid", "vue", "react", "svelte", "qwik", "angular"]) {
      expect(probeIn(container, `a-text-${framework}`).id).toContain(`:label:${framework}`);
    }

    const classes = [...container.querySelectorAll('[data-probe^="a-item-"]')].map(
      (element) => element.className,
    );
    expect(new Set(classes).size).toBe(1);

    dispose();
  });

  it("clears `data-ssr` once the machine starts, on the nodes the server sent", async () => {
    // The one attribute the two builds are *supposed* to disagree about: the machine's `entry`
    // action clears it, and `entry` runs when a machine starts — which never happens on a server.
    // No `radioGroup` rule reads it; `segmentGroup` is what will.
    expect(radioGroupServerHtml).toContain("data-ssr");

    const { container, dispose } = hydrateFixture(radioGroupServerHtml, () => <Tree />);
    const item = probeIn(container, "a-item-solid");

    await vi.waitFor(() => expect(item.hasAttribute("data-ssr")).toBe(false));
    expect(probeIn(container, "a-text-solid").hasAttribute("data-ssr")).toBe(false);
    expect(probeIn(container, "a-mark-solid").hasAttribute("data-ssr")).toBe(false);

    dispose();
  });

  it("picks a different radio after hydration, on the same nodes", async () => {
    const { container, dispose } = hydrateFixture(radioGroupServerHtml, () => <Tree />);
    const input = probeIn(container, "a-input-qwik") as HTMLInputElement;

    // The machine starts in `onSettled`, which `hydrateFixture` does not wait for — and a click
    // that lands first is heard by the browser and not by the machine, so the input goes `checked`
    // while `data-state` stays `unchecked`. `data-ssr` clearing is the machine's own signal that it
    // has started, so it is what this waits on.
    await vi.waitFor(() =>
      expect(probeIn(container, "a-item-qwik").hasAttribute("data-ssr")).toBe(false),
    );

    probeIn(container, "a-item-qwik").click();

    // Waited on the *machine's* answer, not the input's: the browser flips `.checked` as part of
    // label activation, so a `waitFor` on that returns before the machine has heard anything.
    await vi.waitFor(() => expect(probeIn(container, "a-item-qwik").dataset.state).toBe("checked"));

    expect(input.checked).toBe(true);
    expect((probeIn(container, "a-input-svelte") as HTMLInputElement).checked).toBe(false);

    // The dot moves between two nodes the *server* sent, one of which rendered nothing for it — the
    // insert has no marker of its own to hydrate against, so this is the arm a repeated part with a
    // conditional child can silently lose.
    expect(probeIn(container, "a-mark-qwik").querySelector(".dot")).not.toBeNull();
    expect(probeIn(container, "a-mark-svelte").querySelector(".dot")).toBeNull();

    dispose();
  });
});
