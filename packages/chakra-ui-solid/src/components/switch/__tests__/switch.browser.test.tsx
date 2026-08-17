import switchServerHtml from "virtual:hydration-fixture?id=switch";
import {
  expectNoA11yViolations,
  hydrateFixture,
  type MountedComponent,
  mount,
} from "@chakra-ui-solid/internal-test-utils";
import type { JSX } from "@solidjs/web";
import { createSignal } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Field } from "../../field";
import type { SwitchCheckedChangeDetails } from "../index";
import { createSwitch, Switch } from "../index";
import { Tree } from "./switch.ssr-entry";

let mounted: MountedComponent | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

/**
 * The machine defers every `send` by a microtask, and a switch runs exactly one machine — no
 * presence, no nested service — so one turn of the queue is the whole wait. What the machine
 * schedules in a `raf` (the press tracker's own bookkeeping) is waited for with `vi.waitFor`.
 */
const settle = () => new Promise<void>((resolve) => queueMicrotask(resolve));

/**
 * An element by part, **scope-qualified**: `field` and `switch` both name a part `root`, and several
 * trees below nest one inside another.
 */
function partOf(container: ParentNode, part: string, scope = "switch"): HTMLElement {
  const element = container.querySelector(`[data-scope="${scope}"][data-part="${part}"]`);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`expected the tree to render a [data-part="${part}"] element`);
  }
  return element;
}

function partsOf(container: ParentNode, part: string): HTMLElement[] {
  return [...container.querySelectorAll(`[data-scope="switch"][data-part="${part}"]`)].filter(
    (element): element is HTMLElement => element instanceof HTMLElement,
  );
}

/** The real control — the one thing a click, a form and a screen reader actually touch. */
function inputIn(container: ParentNode): HTMLInputElement {
  const element = container.querySelector("input[type=checkbox]");
  if (!(element instanceof HTMLInputElement)) {
    throw new Error("expected the tree to render a hidden checkbox input");
  }
  return element;
}

/** An element by `data-testid`, for the parts that carry no anatomy of their own. */
function testId(container: ParentNode, id: string): HTMLElement {
  const element = container.querySelector(`[data-testid="${id}"]`);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`expected the tree to render a [data-testid="${id}"] element`);
  }
  return element;
}

/** A text-free stand-in for the icon the docs page puts in an indicator. */
const Glyph = () => (
  <svg viewBox="0 0 8 8" width="8" height="8" aria-hidden="true">
    <circle cx="4" cy="4" r="4" fill="currentColor" />
  </svg>
);

/** A component that records how many times it was really constructed. */
function countingComponent(label: string): { component: () => JSX.Element; builds: () => number } {
  let builds = 0;
  return {
    component: () => {
      builds += 1;
      return <span data-testid={label}>{label}</span>;
    },
    builds: () => builds,
  };
}

/**
 * Every prop is forwarded **by name** rather than spread, which is what puts each of them on the
 * forwarded-`undefined` path on every test in this file.
 */
function Basic(props: {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  name?: string;
  onCheckedChange?: (details: SwitchCheckedChangeDetails) => void;
  readOnly?: boolean;
  required?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  unstyled?: boolean;
  value?: string | number;
  variant?: "solid" | "raised";
}) {
  return (
    <Switch.Root
      checked={props.checked}
      defaultChecked={props.defaultChecked}
      disabled={props.disabled}
      invalid={props.invalid}
      name={props.name}
      onCheckedChange={props.onCheckedChange}
      readOnly={props.readOnly}
      required={props.required}
      size={props.size}
      unstyled={props.unstyled}
      value={props.value}
      variant={props.variant}
    >
      <Switch.HiddenInput />
      <Switch.Control />
      <Switch.Label>Activate Chakra</Switch.Label>
    </Switch.Root>
  );
}

describe("Switch — a real machine through the adapter", () => {
  it("toggles on a click anywhere in the row, because the Root is the label", async () => {
    const onCheckedChange = vi.fn();
    mounted = mount(() => <Basic onCheckedChange={onCheckedChange} />);
    const { container } = mounted;

    // The label, not the input: `getRootProps()` points its `for` at the hidden input, so the whole
    // row is the hit area and no handler of ours is involved.
    partOf(container, "label").click();
    await settle();

    expect(onCheckedChange).toHaveBeenCalledWith({ checked: true });
    expect(inputIn(container).checked).toBe(true);
    expect(partOf(container, "control").dataset.state).toBe("checked");
    expect(partOf(container, "thumb").dataset.state).toBe("checked");
  });

  it("writes the state onto the input as a property, not as an attribute", async () => {
    // `syncInputElement` is the machine's own effect, and it is the only thing that makes a
    // controlled switch agree with the DOM — Zag hands back `defaultChecked`, which cannot express
    // a later change.
    const [checked, setChecked] = createSignal(false);
    mounted = mount(() => <Basic checked={checked()} />);
    const input = inputIn(mounted.container);

    expect(input.checked).toBe(false);

    setChecked(true);
    await settle();

    expect(input.checked).toBe(true);
  });

  it("reports a controlled change upward rather than making it itself", async () => {
    const onCheckedChange = vi.fn();
    mounted = mount(() => <Basic checked={false} onCheckedChange={onCheckedChange} />);
    const { container } = mounted;

    partOf(container, "label").click();
    await settle();

    expect(onCheckedChange).toHaveBeenCalledWith({ checked: true });
    expect(inputIn(container).checked).toBe(false);
    expect(partOf(container, "control").dataset.state).toBe("unchecked");
  });

  it("takes no click while disabled", async () => {
    const onCheckedChange = vi.fn();
    mounted = mount(() => <Basic disabled onCheckedChange={onCheckedChange} />);
    const { container } = mounted;

    expect(inputIn(container).disabled).toBe(true);
    partOf(container, "label").click();
    await settle();

    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(partOf(container, "control").dataset.state).toBe("unchecked");
  });

  it("stays focusable but refuses to change while read-only", async () => {
    const onCheckedChange = vi.fn();
    mounted = mount(() => <Basic readOnly onCheckedChange={onCheckedChange} />);
    const { container } = mounted;

    // Not `disabled`: a read-only switch is reachable by keyboard and announced, which is the whole
    // difference between the two states.
    expect(inputIn(container).disabled).toBe(false);
    expect(partOf(container, "root").dataset.readonly).toBe("");

    inputIn(container).click();
    await settle();

    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(inputIn(container).checked).toBe(false);
  });

  it("marks focus and hover on every part, from the machine rather than from CSS", async () => {
    mounted = mount(() => <Basic />);
    const { container } = mounted;

    inputIn(container).focus();
    await vi.waitFor(() => expect(partOf(container, "control").dataset.focus).toBe(""));
    expect(partOf(container, "root").dataset.focus).toBe("");

    partOf(container, "root").dispatchEvent(new PointerEvent("pointermove", { bubbles: true }));
    await settle();
    expect(partOf(container, "control").dataset.hover).toBe("");
  });

  it("submits its `value` under its `name`, and nothing when off", async () => {
    mounted = mount(() => (
      <form>
        <Basic name="notifications" value="email" />
      </form>
    ));
    const form = mounted.container.querySelector("form");
    if (!(form instanceof HTMLFormElement)) {
      throw new Error("expected a form");
    }

    expect([...new FormData(form).entries()]).toEqual([]);

    partOf(mounted.container, "label").click();
    await settle();

    expect([...new FormData(form).entries()]).toEqual([["notifications", "email"]]);
  });

  it('keeps the machine\'s `value: "on"` when a wrapper forwards `value={undefined}`', async () => {
    // The adapter runs `compact()` over the machine's prop bag, so an unset key never reaches the
    // spread that would overwrite the machine's own default with `undefined` (`CLAUDE.md`, *The
    // third hazard*). Without it a forwarded `value` would submit an empty string.
    mounted = mount(() => (
      <form>
        <Basic name="notifications" value={undefined} defaultChecked />
      </form>
    ));
    const form = mounted.container.querySelector("form");
    if (!(form instanceof HTMLFormElement)) {
      throw new Error("expected a form");
    }

    expect([...new FormData(form).entries()]).toEqual([["notifications", "on"]]);
  });

  it("goes back to its initial state when the form resets", async () => {
    // `trackFormControlState` is a machine effect over the real input, so a native `form.reset()`
    // reaches state the machine owns without anything of ours listening.
    const current = mount(() => (
      <form>
        <Basic defaultChecked />
      </form>
    ));
    mounted = current;
    const form = current.container.querySelector("form");
    if (!(form instanceof HTMLFormElement)) {
      throw new Error("expected a form");
    }

    partOf(current.container, "label").click();
    await settle();
    expect(inputIn(current.container).checked).toBe(false);

    form.reset();
    await vi.waitFor(() => expect(inputIn(current.container).checked).toBe(true));
  });

  it("hands the machine to a `Switch.Context` render prop that returns JSX", async () => {
    mounted = mount(() => (
      <Switch.Root>
        <Switch.HiddenInput />
        <Switch.Control />
        <Switch.Context>
          {(api) => <span data-testid="state">{api.checked.toString()}</span>}
        </Switch.Context>
      </Switch.Root>
    ));
    const state = () => testId(mounted?.container as ParentNode, "state").textContent;

    expect(state()).toBe("false");

    partOf(mounted.container, "control").click();
    await settle();

    expect(state()).toBe("true");
  });

  it("drives a `RootProvider` from a machine the consumer owns", async () => {
    let store: ReturnType<typeof createSwitch> | undefined;
    mounted = mount(() => {
      store = createSwitch({ defaultChecked: true });
      return (
        <Switch.RootProvider value={store}>
          <Switch.HiddenInput />
          <Switch.Control />
        </Switch.RootProvider>
      );
    });

    expect(store?.checked).toBe(true);
    store?.toggleChecked();
    await settle();

    expect(store?.checked).toBe(false);
    expect(partOf(mounted.container, "control").dataset.state).toBe("unchecked");
  });

  it("inherits the field's states and its ids without being passed one", () => {
    mounted = mount(() => (
      <Field.Root disabled invalid id="notify">
        <Switch.Root>
          <Switch.HiddenInput />
          <Switch.Control />
          <Switch.Label>Notify me</Switch.Label>
        </Switch.Root>
      </Field.Root>
    ));
    const { container } = mounted;

    expect(inputIn(container).disabled).toBe(true);
    expect(partOf(container, "control").dataset.invalid).toBe("");
    expect(inputIn(container).id).toBe("notify");
    expect(partOf(container, "root").getAttribute("for")).toBe("notify");
  });
});

describe("Switch — the slots that resolve JSX", () => {
  it("defaults the control's children to a thumb, and drops them for `null`", () => {
    mounted = mount(() => <Basic />);
    expect(partsOf(mounted.container, "thumb")).toHaveLength(1);

    mounted.dispose();
    mounted = mount(() => (
      <Switch.Root>
        <Switch.Control>{null}</Switch.Control>
      </Switch.Root>
    ));

    // `!== undefined`, never `??`: React's `defaultProps` fills only an *absent* child, so an
    // explicit `null` is an empty track in either library.
    expect(partsOf(mounted.container, "thumb")).toHaveLength(0);
  });

  it("keeps the default when a wrapper forwards `children={undefined}`", () => {
    // The forwarded-`undefined` case, which is what separates the presence test above from a `??`.
    const Wrapper = (props: { children?: JSX.Element }) => (
      <Switch.Root>
        <Switch.Control>{props.children}</Switch.Control>
      </Switch.Root>
    );

    mounted = mount(() => <Wrapper children={undefined} />);

    expect(partsOf(mounted.container, "thumb")).toHaveLength(1);
  });

  it("builds a passed control child exactly once, not once per read", () => {
    // The whole point of resolving the slot through `children()`: the gate reads `props.children`
    // and the merged props bag reads it again, and a JSX prop is a getter that runs
    // `createComponent` on every read (`CLAUDE.md`, *The second hazard*).
    const { component: Counted, builds } = countingComponent("slot");

    mounted = mount(() => (
      <Switch.Root>
        <Switch.Control>
          <Counted />
        </Switch.Control>
      </Switch.Root>
    ));

    expect(testId(mounted.container, "slot")).not.toBeNull();
    expect(builds()).toBe(1);
  });

  it("builds only the indicator arm the machine selected, exactly once", async () => {
    // Two `children()` memos on one element, and `children()`'s memo is **lazy** — so the arm the
    // gate does not select is never constructed at all. That is the whole reason the pair is two
    // calls rather than a ternary read straight off props, and nothing but a construction count can
    // see it.
    const on = countingComponent("on");
    const off = countingComponent("off");

    mounted = mount(() => (
      <Switch.Root>
        <Switch.HiddenInput />
        <Switch.Control>
          <Switch.Thumb />
          <Switch.Indicator fallback={<off.component />}>
            <on.component />
          </Switch.Indicator>
        </Switch.Control>
      </Switch.Root>
    ));

    expect(off.builds()).toBe(1);
    expect(on.builds()).toBe(0);

    partOf(mounted.container, "control").click();
    await settle();

    expect(on.builds()).toBe(1);
    expect(off.builds()).toBe(1);
    expect(testId(mounted.container, "on")).not.toBeNull();
    expect(mounted.container.querySelector("[data-testid='off']")).toBeNull();
  });

  it("does the same for the thumb indicator, which shares the pair and nothing else", async () => {
    const on = countingComponent("on");
    const off = countingComponent("off");

    mounted = mount(() => (
      <Switch.Root defaultChecked>
        <Switch.HiddenInput />
        <Switch.Control>
          <Switch.Thumb>
            <Switch.ThumbIndicator fallback={<off.component />}>
              <on.component />
            </Switch.ThumbIndicator>
          </Switch.Thumb>
        </Switch.Control>
      </Switch.Root>
    ));

    expect(on.builds()).toBe(1);
    expect(off.builds()).toBe(0);

    partOf(mounted.container, "control").click();
    await settle();

    expect(off.builds()).toBe(1);
    expect(testId(mounted.container, "off")).not.toBeNull();
  });

  it("renders neither arm when neither was written", () => {
    mounted = mount(() => (
      <Switch.Root>
        <Switch.Control>
          <Switch.Thumb />
          <Switch.Indicator data-testid="indicator" />
        </Switch.Control>
      </Switch.Root>
    ));

    expect(testId(mounted.container, "indicator").textContent).toBe("");
  });

  it("carries only `data-checked` on the track indicator, which is upstream's own shape", async () => {
    // Chakra's fifth slot has no machine part behind it: no `data-scope`, no `data-part`, no
    // `data-state`. The one attribute it does carry is what the recipe's `_checked` block selects
    // on, and the assertion below on `left` is what proves that block fired.
    mounted = mount(() => (
      <Switch.Root>
        <Switch.HiddenInput />
        <Switch.Control>
          <Switch.Thumb />
          <Switch.Indicator data-testid="indicator">sun</Switch.Indicator>
        </Switch.Control>
      </Switch.Root>
    ));
    const indicator = testId(mounted.container, "indicator");

    expect(indicator.getAttribute("data-scope")).toBeNull();
    expect(indicator.getAttribute("data-part")).toBeNull();
    expect(indicator.getAttribute("data-state")).toBeNull();
    expect(indicator.hasAttribute("data-checked")).toBe(false);

    partOf(mounted.container, "control").click();
    await settle();

    expect(indicator.getAttribute("data-checked")).toBe("");
  });

  it("keeps `data-checked` when a wrapper forwards it unset", () => {
    // The attribute is written **after** the props spread precisely so this cannot delete it: a
    // spread merges by presence, and the `indicator` slot's whole checked position hangs off this
    // one attribute (`CLAUDE.md`, *The third hazard*). The React version writes it before its own
    // spread and has exactly that hole.
    mounted = mount(() => (
      <Switch.Root defaultChecked>
        <Switch.Control>
          <Switch.Thumb />
          <Switch.Indicator data-testid="indicator" data-checked={undefined}>
            sun
          </Switch.Indicator>
        </Switch.Control>
      </Switch.Root>
    ));

    expect(testId(mounted.container, "indicator").getAttribute("data-checked")).toBe("");
    expect(getComputedStyle(testId(mounted.container, "indicator")).left).toBe("2px");
  });
});

describe("Switch — the styles the slot recipe really generated", () => {
  // Computed styles, never class names: a Panda class whose CSS was never generated renders nothing
  // and raises no error, so `classList.contains("switch__control")` passes on a switch with no
  // track, no thumb and no cursor (`CLAUDE.md`, *silent unstyling*).

  it("gives the track the pointer cursor the preset's misspelling drops", () => {
    // **The assertion the shipped token never got.** `@chakra-ui/panda-preset` registers this cursor
    // token as `swittch` while its own recipe references `cursor: "switch"`, so upstream's reference
    // resolves to nothing and Panda emits `cursor: switch`, which no browser parses — the track
    // would compute `auto`. `packages/panda-preset/src/preset.ts` adds one
    // `theme.extend.tokens.cursor.switch` key, and this is the only thing that can see it working
    // on a real element.
    mounted = mount(() => <Basic />);

    expect(getComputedStyle(partOf(mounted.container, "control")).cursor).toBe("pointer");
  });

  it("lays the row out and draws the track from the `control` slot", () => {
    mounted = mount(() => <Basic />);
    const { container } = mounted;
    const root = getComputedStyle(partOf(container, "root"));
    const control = getComputedStyle(partOf(container, "control"));

    expect(root.display).toBe("inline-flex");
    expect(root.alignItems).toBe("center");
    expect(root.columnGap).toBe("10px");
    // `flex`, not the `inline-flex` the recipe writes: the track is a flex item of the `label` root,
    // and CSS blockifies a flex item's display. Either way it is not the `inline` a bare `span`
    // computes, which is what the assertion is for.
    expect(control.display).toBe("flex");
    expect(control.width).toBe("40px");
    expect(control.height).toBe("20px");
    expect(control.borderTopLeftRadius).toBe("9999px");
  });

  it("scales the thumb with the track and slides it only once checked", async () => {
    mounted = mount(() => <Basic />);
    const thumb = partOf(mounted.container, "thumb");

    expect(getComputedStyle(thumb).width).toBe("20px");
    expect(getComputedStyle(thumb).height).toBe("20px");
    // `translate: none` is the resting value; `_checked` writes `var(--switch-x) 0`, which is the
    // whole animation and the only thing that moves the knob.
    expect(getComputedStyle(thumb).translate).toBe("none");

    partOf(mounted.container, "control").click();
    await settle();

    // The **resolved distance**, not merely "something other than `none`": `--switch-x` is
    // `calc(var(--switch-width) - var(--switch-height))` written on the Root and inherited down, so a
    // variable that never resolved would compute `0px` here and pass a looser assertion while the
    // knob stayed put. `vi.waitFor`, because `transitionProperty: translate` means a bare read lands
    // mid-slide.
    await vi.waitFor(() => expect(getComputedStyle(thumb).translate).toBe("20px"));
  });

  it("parks the track indicator at one end and moves it to the other when checked", async () => {
    // The `indicator` slot's own body, and the only proof that `data-checked` reaches CSS: at rest
    // it sits at `calc(var(--switch-x) - 2px)` — 18px at `md` — and checked it sits at 2px.
    mounted = mount(() => (
      <Switch.Root>
        <Switch.HiddenInput />
        <Switch.Control>
          <Switch.Thumb />
          <Switch.Indicator data-testid="indicator" fallback="off">
            on
          </Switch.Indicator>
        </Switch.Control>
      </Switch.Root>
    ));
    const indicator = testId(mounted.container, "indicator");

    expect(getComputedStyle(indicator).position).toBe("absolute");
    expect(getComputedStyle(indicator).display).toBe("grid");
    expect(getComputedStyle(indicator).width).toBe("20px");
    expect(getComputedStyle(indicator).left).toBe("18px");

    partOf(mounted.container, "control").click();
    await settle();

    // `vi.waitFor`, not a bare read: the slot declares `transition: inset-inline-start 0.12s ease`,
    // and a computed style taken mid-transition is the animated value rather than the target.
    await vi.waitFor(() => expect(getComputedStyle(indicator).left).toBe("2px"));
  });

  it("sizes the track from every one of the four `size` variants", () => {
    for (const [size, width, height] of [
      ["xs", "24px", "12px"],
      ["sm", "32px", "16px"],
      ["md", "40px", "20px"],
      ["lg", "48px", "24px"],
    ] as const) {
      mounted?.dispose();
      mounted = mount(() => <Basic size={size} />);
      const styles = getComputedStyle(partOf(mounted.container, "control"));

      expect(styles.width, size).toBe(width);
      expect(styles.height, size).toBe(height);
    }
  });

  it("keeps the default `md` when the `size` variant is left unset", () => {
    // The recipe's own `defaultVariants`, not a literal restated on the Root — which is why
    // `SwitchVariantProps` declares no `@default` for it.
    mounted = mount(() => <Basic />);

    expect(getComputedStyle(partOf(mounted.container, "control")).width).toBe("40px");
  });

  it("draws the two `variant`s differently, and defaults to `solid`", () => {
    mounted = mount(() => <Basic variant="solid" />);
    const solid = getComputedStyle(partOf(mounted.container, "control"));
    const solidBackground = solid.backgroundColor;

    expect(solid.height).toBe("20px");
    expect(solid.boxShadow).toBe("none");

    mounted.dispose();
    mounted = mount(() => <Basic variant="raised" />);
    const raised = getComputedStyle(partOf(mounted.container, "control"));

    // `raised` halves the track into a rail the thumb sits proud of, and shadows it inward.
    expect(raised.height).toBe("10px");
    expect(raised.boxShadow).not.toBe("none");
    expect(raised.backgroundColor).not.toBe(solidBackground);

    mounted.dispose();
    mounted = mount(() => <Basic />);
    expect(getComputedStyle(partOf(mounted.container, "control")).height).toBe("20px");
  });

  it("paints a checked track from the palette under both variants", async () => {
    for (const variant of ["solid", "raised"] as const) {
      mounted?.dispose();
      const current = mount(() => <Basic variant={variant} />);
      mounted = current;
      const resting = getComputedStyle(partOf(current.container, "control")).backgroundColor;

      partOf(current.container, "control").click();
      await settle();

      expect(
        getComputedStyle(partOf(current.container, "control")).backgroundColor,
        variant,
      ).not.toBe(resting);
    }
  });

  it("scales the label's text and dims it with the row", () => {
    mounted = mount(() => <Basic />);
    const label = getComputedStyle(partOf(mounted.container, "label"));

    expect(label.fontSize).toBe("14px");
    expect(label.fontWeight).toBe("500");
    expect(label.userSelect).toBe("none");
  });

  it("dims a disabled switch and takes the cursor with it", () => {
    mounted = mount(() => <Basic disabled />);
    const styles = getComputedStyle(partOf(mounted.container, "control"));

    expect(styles.opacity).toBe("0.5");
    expect(styles.cursor).toBe("not-allowed");
    expect(getComputedStyle(partOf(mounted.container, "label")).opacity).toBe("0.5");
  });

  it("rings an invalid track, and nothing shadows that condition away", () => {
    // `base.control._invalid` is an `outline`, and neither variant writes a flat `outline` of its
    // own — which is why `swittch` needs no `shadowedSlotBaseConditions` row where `checkbox` does.
    // Asserting it under both variants is what would catch a preset bump that added one.
    for (const variant of ["solid", "raised"] as const) {
      mounted?.dispose();
      mounted = mount(() => <Basic variant={variant} invalid />);
      const styles = getComputedStyle(partOf(mounted.container, "control"));

      expect(styles.outlineWidth, variant).toBe("2px");
      expect(styles.outlineStyle, variant).toBe("solid");
      expect(styles.outlineOffset, variant).toBe("2px");
    }
  });

  it("leaves every part with the browser's own styles under a Root-level `unstyled`", () => {
    // Asserted as a computed **fallback**, never as an absent class: a missing class name and a
    // class whose CSS was never generated look identical from the DOM.
    mounted = mount(() => <Basic unstyled defaultChecked />);
    const { container } = mounted;

    expect(getComputedStyle(partOf(container, "root")).display).toBe("inline");
    expect(getComputedStyle(partOf(container, "control")).width).not.toBe("40px");
    // Not `auto`: `cursor` inherits, and the `<label>` this span sits in carries the browser's own
    // `default`. What matters is that the recipe's `pointer` is gone.
    expect(getComputedStyle(partOf(container, "control")).cursor).not.toBe("pointer");
    expect(getComputedStyle(partOf(container, "thumb")).translate).toBe("none");
    expect(getComputedStyle(partOf(container, "label")).fontWeight).toBe("400");
  });

  it("keeps that opt-out when a wrapper forwards `unstyled={undefined}`", () => {
    mounted = mount(() => <Basic unstyled={undefined} />);

    expect(getComputedStyle(partOf(mounted.container, "control")).width).toBe("40px");
  });

  it("takes its variants from a `PropsProvider`, and lets a Root beat them", () => {
    mounted = mount(() => (
      <Switch.PropsProvider value={{ size: "lg" }}>
        <Basic />
        <Basic size="xs" />
      </Switch.PropsProvider>
    ));
    const [provided, overridden] = partsOf(mounted.container, "control");

    expect(getComputedStyle(provided as HTMLElement).width).toBe("48px");
    expect(getComputedStyle(overridden as HTMLElement).width).toBe("24px");
  });

  it("keeps the provider's variant when a Root forwards an unset one", () => {
    // `withContextDefaults` resolves by value where `merge` resolves by presence, so
    // `<Basic size={undefined} />` must not beat the provider above it with `undefined`.
    mounted = mount(() => (
      <Switch.PropsProvider value={{ size: "lg" }}>
        <Basic size={undefined} />
      </Switch.PropsProvider>
    ));

    expect(getComputedStyle(partOf(mounted.container, "control")).width).toBe("48px");
  });

  it("gives the thumb indicator no styles of its own, which is the point of it", () => {
    // The sixth component that is not a slot. Nothing in the recipe names it, so it computes as the
    // bare `span` it is — and a class here would mean we had invented a slot Chakra does not have.
    mounted = mount(() => (
      <Switch.Root defaultChecked>
        <Switch.Control>
          <Switch.Thumb>
            <Switch.ThumbIndicator data-testid="thumb-indicator">on</Switch.ThumbIndicator>
          </Switch.Thumb>
        </Switch.Control>
      </Switch.Root>
    ));
    const thumbIndicator = testId(mounted.container, "thumb-indicator");

    // Empty rather than absent: `renderStyled` always writes a `class`, and what it had to write
    // here was nothing at all.
    expect(thumbIndicator.className).toBe("");
    expect(getComputedStyle(thumbIndicator).position).toBe("static");
  });
});

describe("Switch — accessibility", () => {
  it("has no violations in any of the states a page really serves", async () => {
    const trees = {
      default: () => <Basic />,
      checked: () => <Basic defaultChecked />,
      disabled: () => <Basic disabled />,
      invalid: () => <Basic invalid />,
      // Glyphs rather than text, which is what the docs page shows too: axe's colour-contrast rule
      // reads *text* and does not care that `getControlProps()` marked the whole track
      // `aria-hidden`, so a bare "sun" here would be flagged for a contrast ratio the switch does
      // not control.
      withIndicators: () => (
        <Switch.Root defaultChecked size="lg">
          <Switch.HiddenInput />
          <Switch.Control>
            <Switch.Thumb>
              <Switch.ThumbIndicator fallback={<Glyph />}>
                <Glyph />
              </Switch.ThumbIndicator>
            </Switch.Thumb>
            <Switch.Indicator fallback={<Glyph />}>
              <Glyph />
            </Switch.Indicator>
          </Switch.Control>
          <Switch.Label>Dark mode</Switch.Label>
        </Switch.Root>
      ),
      inField: () => (
        <Field.Root>
          <Switch.Root>
            <Switch.HiddenInput />
            <Switch.Control />
            <Switch.Label>Notify me</Switch.Label>
          </Switch.Root>
          <Field.HelperText>We only send the important ones</Field.HelperText>
        </Field.Root>
      ),
    };

    for (const [name, tree] of Object.entries(trees)) {
      mounted?.dispose();
      const current = mount(tree);
      mounted = current;
      await settle();

      await expectNoA11yViolations(current.container).catch((error: Error) => {
        throw new Error(`${name}: ${error.message}`);
      });
    }
  });
});

describe("Switch — server render, then hydrate", () => {
  /** A probe on the hydrated tree; the entry gives every element one, machine part or not. */
  function probeIn(container: ParentNode, probe: string): HTMLElement {
    const element = container.querySelector(`[data-probe="${probe}"]`);
    if (!(element instanceof HTMLElement)) {
      throw new Error(`the hydrated tree is missing its [data-probe="${probe}"] element`);
    }
    return element;
  }

  it("reuses every server node, with only the arms the machine selected in it", () => {
    // The half neither other project can see. `hydrateFixture` asserts the contract itself —
    // hydration was silent, no element was added or dropped, every server node survived as the same
    // object — so what is left here is the shape the tree was *supposed* to arrive in.
    //
    // Four gates over two roots, taken in opposite directions: root a is checked, so both its
    // indicators show their `children`, and root b is not, so both show their `fallback`. The arms
    // nobody selected were never constructed on either build, which is the only reason the two agree
    // about how many nodes there are.
    const { container, dispose } = hydrateFixture(switchServerHtml, () => <Tree />);

    expect(probeIn(container, "a-thumb-on").textContent).toBe("✓");
    expect(container.querySelector("[data-probe='a-thumb-off']")).toBeNull();
    expect(probeIn(container, "a-track-on").textContent).toBe("sun");
    expect(container.querySelector("[data-probe='a-track-off']")).toBeNull();

    expect(probeIn(container, "b-thumb-off").textContent).toBe("✕");
    expect(container.querySelector("[data-probe='b-thumb-on']")).toBeNull();
    expect(probeIn(container, "b-track-off").textContent).toBe("moon");
    expect(container.querySelector("[data-probe='b-track-on']")).toBeNull();

    // The render prop is called in the part's body rather than a tracking scope, so it returns JSX
    // and the `Show` inside it is what reads the machine.
    expect(probeIn(container, "d-state").textContent).toBe("on");
    expect(probeIn(container, "after").textContent).toBe("after");

    dispose();
  });

  it("fills the empty control with a thumb on both builds", () => {
    // Root c writes `<Switch.Control />` with no children, so the thumb is built inside a
    // `children()` call that allocates in the ambient owner rather than at the position it is read.
    const { container, dispose } = hydrateFixture(switchServerHtml, () => <Tree />);
    const control = probeIn(container, "c-control");

    expect(control.querySelector('[data-part="thumb"]')).not.toBeNull();

    dispose();
  });

  it("arrives with the checked switch's `checked` property already true", () => {
    const { container, dispose } = hydrateFixture(switchServerHtml, () => <Tree />);

    // Off the served `checked` **attribute**, which SolidJS's server build resolved out of the
    // machine's `defaultChecked` — so a reader sees the right switch on before hydration rather
    // than after it.
    expect((probeIn(container, "a-input") as HTMLInputElement).checked).toBe(true);
    expect((probeIn(container, "b-input") as HTMLInputElement).checked).toBe(false);

    dispose();
  });

  it("grows the field's `aria-describedby` after hydration, on the node the server sent", async () => {
    // `Field.HelperText` registers its id in `onSettled`, which no server runs — so the served input
    // carries no IDREF and the hydrated one does. Both sides agree at the moment `hydrate()` is
    // asked, which is the only thing hydration needs.
    expect(switchServerHtml).not.toContain("aria-describedby");

    const { container, dispose } = hydrateFixture(switchServerHtml, () => <Tree />);
    const input = probeIn(container, "c-input");

    await vi.waitFor(() =>
      expect(input.getAttribute("aria-describedby")).toBe(probeIn(container, "c-helper").id),
    );

    dispose();
  });

  it("runs the machine after hydration, on the server's own nodes", async () => {
    const { container, dispose } = hydrateFixture(switchServerHtml, () => <Tree />);

    const label = probeIn(container, "b-label");
    const control = probeIn(container, "b-control");
    const input = probeIn(container, "b-input") as HTMLInputElement;

    label.click();

    await vi.waitFor(() => {
      expect(control.dataset.state).toBe("checked");
      expect(input.checked).toBe(true);
    });

    // `createUniqueId()` is a different function in the server build and the hydrating client build,
    // and they agree only while both walk the same counter. An id that shifted would leave the
    // label's `for` pointing at nothing.
    expect(probeIn(container, "b-root").getAttribute("for")).toBe(input.id);
    expect(document.getElementById(input.id)).toBe(input);

    // The same objects the server sent, still — the machine drove them rather than replacing them.
    expect(probeIn(container, "b-control")).toBe(control);

    dispose();
  });

  it("builds the arm the server never sent, when a switch is toggled after hydration", async () => {
    // The count divergence, driven the only direction a consumer can drive it: root b served two
    // `fallback` subtrees and toggling it has to build two `children` subtrees beside nodes
    // `hydrate()` already claimed.
    const { container, dispose } = hydrateFixture(switchServerHtml, () => <Tree />);
    const control = probeIn(container, "b-control");

    probeIn(container, "b-label").click();

    await vi.waitFor(() =>
      expect(container.querySelector("[data-probe='b-track-on']")).not.toBeNull(),
    );
    expect(probeIn(container, "b-thumb-on").textContent).toBe("✓");
    expect(container.querySelector("[data-probe='b-track-off']")).toBeNull();
    expect(probeIn(container, "b-control")).toBe(control);

    dispose();
  });
});
