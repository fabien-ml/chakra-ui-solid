import checkboxServerHtml from "virtual:hydration-fixture?id=checkbox";
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
import { Fieldset } from "../../fieldset";
import type {
  CheckboxCheckedChangeDetails,
  CheckboxCheckedState,
  CheckboxIndicatorProps,
} from "../index";
import { Checkbox, CheckboxGroup, createCheckbox } from "../index";
import { Tree } from "./checkbox.ssr-entry";

let mounted: MountedComponent | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

/**
 * The machine defers every `send` by a microtask, and a checkbox runs exactly one machine — no
 * presence, no nested service — so one turn of the queue is the whole wait. What the machine
 * schedules in a `raf` (the press tracker's own bookkeeping) is waited for with `vi.waitFor`.
 */
const settle = () => new Promise<void>((resolve) => queueMicrotask(resolve));

/**
 * An element by part, **scope-qualified**: `field`, `fieldset` and `checkbox` all name a part
 * `root`, and several trees below nest one inside another.
 */
function partOf(container: ParentNode, part: string, scope = "checkbox"): HTMLElement {
  const element = container.querySelector(`[data-scope="${scope}"][data-part="${part}"]`);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`expected the tree to render a [data-part="${part}"] element`);
  }
  return element;
}

function partsOf(container: ParentNode, part: string): HTMLElement[] {
  return [...container.querySelectorAll(`[data-scope="checkbox"][data-part="${part}"]`)].filter(
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

function inputsIn(container: ParentNode): HTMLInputElement[] {
  return [...container.querySelectorAll("input[type=checkbox]")].filter(
    (element): element is HTMLInputElement => element instanceof HTMLInputElement,
  );
}

/** A component that records how many times it was really constructed. */
function countingComponent(): { component: () => JSX.Element; builds: () => number } {
  let builds = 0;
  return {
    component: () => {
      builds += 1;
      return <span data-testid="slot">mark</span>;
    },
    builds: () => builds,
  };
}

/**
 * Every prop is forwarded **by name** rather than spread, which is what puts each of them on the
 * forwarded-`undefined` path on every test in this file.
 */
function Basic(props: {
  checked?: CheckboxCheckedState;
  defaultChecked?: CheckboxCheckedState;
  disabled?: boolean;
  invalid?: boolean;
  name?: string;
  onCheckedChange?: (details: CheckboxCheckedChangeDetails) => void;
  readOnly?: boolean;
  required?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  unstyled?: boolean;
  value?: string;
  variant?: "outline" | "solid" | "subtle";
}) {
  return (
    <Checkbox.Root
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
      <Checkbox.HiddenInput />
      <Checkbox.Control />
      <Checkbox.Label>Accept terms and conditions</Checkbox.Label>
    </Checkbox.Root>
  );
}

describe("Checkbox — a real machine through the adapter", () => {
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
  });

  it("writes the state onto the input as a property, not as an attribute", async () => {
    // `syncInputElement` is the machine's own effect, and it is the only thing that makes a
    // controlled checkbox agree with the DOM — Zag hands back `defaultChecked`, which cannot express
    // a later change.
    const [checked, setChecked] = createSignal<CheckboxCheckedState>(false);
    mounted = mount(() => <Basic checked={checked()} />);
    const input = inputIn(mounted.container);

    expect(input.checked).toBe(false);

    setChecked(true);
    await settle();

    expect(input.checked).toBe(true);
    expect(input.indeterminate).toBe(false);

    setChecked("indeterminate");
    await settle();

    expect(input.indeterminate).toBe(true);
    expect(input.checked).toBe(false);
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

  it("moves an indeterminate box to checked rather than to unchecked", async () => {
    // The machine's `toggleChecked`: an indeterminate parent means "some of the set", and the useful
    // next state is "all of it".
    mounted = mount(() => <Basic defaultChecked="indeterminate" />);
    const { container } = mounted;

    expect(partOf(container, "control").dataset.state).toBe("indeterminate");

    partOf(container, "label").click();
    await settle();

    expect(partOf(container, "control").dataset.state).toBe("checked");
  });

  it("leaves the input's `indeterminate` property unwritten until the state changes", async () => {
    // **Expected, and the React version does exactly the same** — it is Zag's `watch`, which is
    // change-only on every adapter it ships: `syncInputElement` runs when `context.checked` moves,
    // and a box that *started* indeterminate has never moved. So the mark and every `data-state`
    // say `indeterminate` from the first byte while the hidden input's property still says
    // unchecked, and the first real change brings them together. Recorded rather than corrected:
    // fixing it here would be behavior chakra-ui.com does not have.
    mounted = mount(() => <Basic defaultChecked="indeterminate" />);
    const input = inputIn(mounted.container);

    expect(input.indeterminate).toBe(false);
    expect(partOf(mounted.container, "control").dataset.state).toBe("indeterminate");
    expect(mounted.container.querySelector("path")).not.toBeNull();

    partOf(mounted.container, "label").click();
    await settle();
    expect(input.checked).toBe(true);
  });

  it("takes no click and no keyboard while disabled", async () => {
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

    // Not `disabled`: a read-only checkbox is reachable by keyboard and announced, which is the
    // whole difference between the two states.
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

  it("submits its `value` under its `name`, and nothing when unticked", async () => {
    mounted = mount(() => (
      <form data-testid="form">
        <Basic name="agreement" value="terms" />
      </form>
    ));
    const form = mounted.container.querySelector("form");
    if (!(form instanceof HTMLFormElement)) {
      throw new Error("expected a form");
    }

    expect([...new FormData(form).entries()]).toEqual([]);

    partOf(mounted.container, "label").click();
    await settle();

    expect([...new FormData(form).entries()]).toEqual([["agreement", "terms"]]);
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

  it("hands the machine to a `Checkbox.Context` render prop that returns JSX", async () => {
    mounted = mount(() => (
      <Checkbox.Root>
        <Checkbox.HiddenInput />
        <Checkbox.Control />
        <Checkbox.Context>
          {(checkbox) => <span data-testid="state">{checkbox.checkedState.toString()}</span>}
        </Checkbox.Context>
      </Checkbox.Root>
    ));
    const state = () => mounted?.container.querySelector("[data-testid='state']")?.textContent;

    expect(state()).toBe("false");

    partOf(mounted.container, "control").click();
    await settle();

    expect(state()).toBe("true");
  });

  it("drives a `RootProvider` from a machine the consumer owns", async () => {
    let store: ReturnType<typeof createCheckbox> | undefined;
    mounted = mount(() => {
      store = createCheckbox({ defaultChecked: true });
      return (
        <Checkbox.RootProvider value={store}>
          <Checkbox.HiddenInput />
          <Checkbox.Control />
        </Checkbox.RootProvider>
      );
    });

    expect(store?.checked).toBe(true);
    store?.toggleChecked();
    await settle();

    expect(store?.checked).toBe(false);
    expect(partOf(mounted.container, "control").dataset.state).toBe("unchecked");
  });
});

describe("Checkbox — the slots that resolve JSX", () => {
  it("defaults the control's children to an indicator, and drops them for `null`", () => {
    mounted = mount(() => <Basic defaultChecked />);
    expect(mounted.container.querySelector("polyline")).not.toBeNull();

    mounted.dispose();
    mounted = mount(() => (
      <Checkbox.Root defaultChecked>
        <Checkbox.Control>{null}</Checkbox.Control>
      </Checkbox.Root>
    ));

    // `!== undefined`, never `??`: React's `defaultProps` fills only an *absent* child, so an
    // explicit `null` is an empty box in either library.
    expect(mounted.container.querySelector("svg")).toBeNull();
  });

  it("keeps the default when a wrapper forwards `children={undefined}`", () => {
    // The forwarded-`undefined` case, which is what separates the presence test above from a `??`.
    const Wrapper = (props: { children?: JSX.Element }) => (
      <Checkbox.Root defaultChecked>
        <Checkbox.Control>{props.children}</Checkbox.Control>
      </Checkbox.Root>
    );

    mounted = mount(() => <Wrapper children={undefined} />);

    expect(mounted.container.querySelector("polyline")).not.toBeNull();
  });

  it("builds a passed control child exactly once, not once per read", () => {
    // The whole point of resolving the slot through `children()`: the gate reads `props.children`
    // and the merged props bag reads it again, and a JSX prop is a getter that runs
    // `createComponent` on every read (`CLAUDE.md`, *The second hazard*).
    const { component: Counted, builds } = countingComponent();

    mounted = mount(() => (
      <Checkbox.Root>
        <Checkbox.Control>
          <Counted />
        </Checkbox.Control>
      </Checkbox.Root>
    ));

    expect(mounted.container.querySelector("[data-testid='slot']")).not.toBeNull();
    expect(builds()).toBe(1);
  });

  it("swaps the mark for the `checked` glyph, and builds it once", () => {
    const { component: Counted, builds } = countingComponent();

    mounted = mount(() => (
      <Checkbox.Root defaultChecked>
        <Checkbox.Control>
          <Checkbox.Indicator checked={() => <Counted />} />
        </Checkbox.Control>
      </Checkbox.Root>
    ));

    expect(mounted.container.querySelector("[data-testid='slot']")).not.toBeNull();
    expect(mounted.container.querySelector("polyline")).toBeNull();
    expect(builds()).toBe(1);
  });

  it("swaps the mark for the `indeterminate` glyph, and builds it once", () => {
    const { component: Counted, builds } = countingComponent();

    mounted = mount(() => (
      <Checkbox.Root defaultChecked="indeterminate">
        <Checkbox.Control>
          <Checkbox.Indicator indeterminate={() => <Counted />} />
        </Checkbox.Control>
      </Checkbox.Root>
    ));

    expect(mounted.container.querySelector("[data-testid='slot']")).not.toBeNull();
    expect(mounted.container.querySelector("path")).toBeNull();
    expect(builds()).toBe(1);
  });

  it("leaves an escape hatch uncalled while its state is not the live one", async () => {
    // What a function escape hatch buys over the JSX-element one it replaced: an element prop is a
    // getter that builds on every read, so the old shape had to be resolved through `children()`
    // whether the branch was taken or not. A function is called by the arm that wins, once.
    const { component: Counted, builds } = countingComponent();

    mounted = mount(() => (
      <Checkbox.Root>
        <Checkbox.HiddenInput />
        <Checkbox.Control>
          <Checkbox.Indicator checked={() => <Counted />} />
        </Checkbox.Control>
      </Checkbox.Root>
    ));

    expect(builds()).toBe(0);
    expect(mounted.container.querySelector("[data-testid='slot']")).toBeNull();

    partOf(mounted.container, "control").click();
    await settle();

    expect(mounted.container.querySelector("[data-testid='slot']")).not.toBeNull();
    expect(builds()).toBe(1);
  });

  it("hands a consumer's glyph the computed props, and lets the control size it", () => {
    // The bug the function form exists to close: a JSX element arrives already built and SolidJS has
    // no `cloneElement`, so the old shape rendered it bare and dropped every prop this part computed
    // — the `indicator` slot's class included, silently.
    //
    // `color` rather than the slot class is what the assertion reads, because the `indicator` slot's
    // recipe body is **empty** upstream (the whole checkmark sits on `control`), so no computed
    // style can witness that class at all. A style prop written on the part is the only thing that
    // proves the composed `class` arrived.
    mounted = mount(() => (
      <Checkbox.Root defaultChecked>
        <Checkbox.HiddenInput />
        <Checkbox.Control>
          <Checkbox.Indicator
            color="red.500"
            checked={(indicatorProps) => (
              <svg {...indicatorProps} data-testid="glyph" viewBox="0 0 24 24">
                <title>done</title>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          />
        </Checkbox.Control>
      </Checkbox.Root>
    ));

    const glyph = mounted.container.querySelector("[data-testid='glyph']");
    if (!(glyph instanceof SVGElement)) {
      throw new Error("expected the consumer's own glyph");
    }

    expect(getComputedStyle(glyph).color).toBe("rgb(239, 68, 68)");
    // The class token itself, which only a name check can see — see the note above.
    expect(glyph.getAttribute("class")).toContain("checkbox__indicator");

    // And the regression a wrapper element would have caused. `.checkbox__control :where(svg)` is
    // `width: 100%`, which resolves against the control's own content box only while the glyph is a
    // direct flex item of it; wrapped in a `span`, the same 100% would resolve against the
    // auto-sized wrapper and the glyph would collapse to its intrinsic size.
    const control = partOf(mounted.container, "control");
    const controlStyles = getComputedStyle(control);
    const contentWidth =
      control.clientWidth -
      parseFloat(controlStyles.paddingLeft) -
      parseFloat(controlStyles.paddingRight);

    expect(contentWidth).toBeGreaterThan(0);
    expect(glyph.getBoundingClientRect().width).toBeCloseTo(contentWidth, 1);
  });

  it("keeps the computed props coming when a wrapper forwards `checked={undefined}`", () => {
    // A spread merges by presence, so an unset escape hatch forwarded through a wrapper must fall
    // through to the default mark rather than blanking it.
    const Wrapper = (props: { checked?: CheckboxIndicatorProps["checked"] }) => (
      <Checkbox.Root defaultChecked>
        <Checkbox.Control>
          <Checkbox.Indicator checked={props.checked} />
        </Checkbox.Control>
      </Checkbox.Root>
    );

    mounted = mount(() => <Wrapper checked={undefined} />);

    expect(mounted.container.querySelector("polyline")).not.toBeNull();
  });

  it("carries no `data-part` on the mark, which is upstream's own shape", () => {
    // `checkbox.anatomy` names an `indicator` and Chakra's component never calls
    // `getIndicatorProps()` — so the mark has no scope, no part and no `hidden`, and `data-state` is
    // `Checkmark`'s own. Reproduced deliberately; asserting it is what keeps it a decision.
    mounted = mount(() => <Basic defaultChecked />);
    const mark = mounted.container.querySelector("svg");

    expect(mark).not.toBeNull();
    expect(mark?.getAttribute("data-part")).toBeNull();
    expect(mark?.getAttribute("data-scope")).toBeNull();
    expect(mark?.hasAttribute("hidden")).toBe(false);
    expect(mark?.getAttribute("data-state")).toBe("checked");
  });
});

describe("CheckboxGroup — one array, many boxes", () => {
  function Group(props: {
    defaultValue?: string[];
    disabled?: boolean;
    invalid?: boolean;
    maxSelectedValues?: number;
    name?: string;
    onValueChange?: (value: string[]) => void;
    readOnly?: boolean;
    value?: string[];
  }) {
    return (
      <CheckboxGroup
        defaultValue={props.defaultValue}
        disabled={props.disabled}
        invalid={props.invalid}
        maxSelectedValues={props.maxSelectedValues}
        name={props.name}
        onValueChange={props.onValueChange}
        readOnly={props.readOnly}
        value={props.value}
      >
        <Checkbox.Root value="react">
          <Checkbox.HiddenInput />
          <Checkbox.Control />
          <Checkbox.Label>React</Checkbox.Label>
        </Checkbox.Root>
        <Checkbox.Root value="solid">
          <Checkbox.HiddenInput />
          <Checkbox.Control />
          <Checkbox.Label>Solid</Checkbox.Label>
        </Checkbox.Root>
      </CheckboxGroup>
    );
  }

  const stateOf = (container: ParentNode) =>
    partsOf(container, "control").map((control) => control.dataset.state);

  it("ticks the box its `defaultValue` names, and reports the whole set on a change", async () => {
    const onValueChange = vi.fn();
    mounted = mount(() => <Group defaultValue={["react"]} onValueChange={onValueChange} />);
    const { container } = mounted;

    expect(stateOf(container)).toEqual(["checked", "unchecked"]);

    partsOf(container, "label")[1]?.click();
    await settle();

    expect(onValueChange).toHaveBeenCalledWith(["react", "solid"]);
    expect(stateOf(container)).toEqual(["checked", "checked"]);
  });

  it("unticks a ticked box", async () => {
    const onValueChange = vi.fn();
    mounted = mount(() => (
      <Group defaultValue={["react", "solid"]} onValueChange={onValueChange} />
    ));

    partsOf(mounted.container, "label")[0]?.click();
    await settle();

    expect(onValueChange).toHaveBeenCalledWith(["solid"]);
    expect(stateOf(mounted.container)).toEqual(["unchecked", "checked"]);
  });

  it("reports a controlled group upward rather than changing it itself", async () => {
    const [value, setValue] = createSignal<string[]>([]);
    mounted = mount(() => <Group value={value()} onValueChange={setValue} />);

    partsOf(mounted.container, "label")[0]?.click();
    await settle();

    expect(value()).toEqual(["react"]);
    expect(stateOf(mounted.container)).toEqual(["checked", "unchecked"]);
  });

  it("disables the unticked boxes at `maxSelectedValues` and frees them again", async () => {
    mounted = mount(() => <Group defaultValue={["react"]} maxSelectedValues={1} />);
    const { container } = mounted;

    expect(inputsIn(container)[1]?.disabled).toBe(true);
    expect(inputsIn(container)[0]?.disabled).toBe(false);

    partsOf(container, "label")[0]?.click();
    await settle();

    expect(inputsIn(container)[1]?.disabled).toBe(false);
  });

  it("names every box the same, and submits only the ticked ones", async () => {
    mounted = mount(() => (
      <form>
        <Group defaultValue={["react"]} name="framework" />
      </form>
    ));
    const form = mounted.container.querySelector("form");
    if (!(form instanceof HTMLFormElement)) {
      throw new Error("expected a form");
    }

    expect([...new FormData(form).entries()]).toEqual([["framework", "react"]]);

    partsOf(mounted.container, "label")[1]?.click();
    await settle();

    expect([...new FormData(form).entries()]).toEqual([
      ["framework", "react"],
      ["framework", "solid"],
    ]);
  });

  it("lets a checkbox's own prop beat the group's", () => {
    mounted = mount(() => (
      <CheckboxGroup disabled>
        <Checkbox.Root value="react" disabled={false}>
          <Checkbox.HiddenInput />
          <Checkbox.Control />
        </Checkbox.Root>
      </CheckboxGroup>
    ));

    expect(inputIn(mounted.container).disabled).toBe(false);
  });

  it("inherits `disabled` and `invalid` from a surrounding Fieldset", () => {
    mounted = mount(() => (
      <Fieldset.Root disabled invalid>
        <CheckboxGroup>
          <Checkbox.Root value="react">
            <Checkbox.HiddenInput />
            <Checkbox.Control />
          </Checkbox.Root>
        </CheckboxGroup>
      </Fieldset.Root>
    ));

    expect(inputIn(mounted.container).disabled).toBe(true);
    expect(partOf(mounted.container, "control").dataset.invalid).toBe("");
  });

  it("stacks its children in a column the `chakra()` base really generated", () => {
    // Computed, never a class name — and this is the one place the group is styled at all: the
    // recipe's `group` slot has no body, so a missing rule here would leave the boxes in a row with
    // nothing to say so.
    mounted = mount(() => <Group />);
    const group = partOf(mounted.container, "group");
    const styles = getComputedStyle(group);

    expect(styles.display).toBe("flex");
    expect(styles.flexDirection).toBe("column");
    expect(styles.rowGap).toBe("6px");
  });

  it("keeps the column when a wrapper forwards an unset style prop", () => {
    // The `chakra()` config is a recipe base rather than a JSX attribute before a spread, so an
    // `undefined` cannot delete it — which is exactly what a literal attribute would do
    // (`CLAUDE.md`, *The third hazard*).
    mounted = mount(() => (
      <CheckboxGroup gap={undefined} flexDirection={undefined}>
        <Checkbox.Root value="react">
          <Checkbox.HiddenInput />
        </Checkbox.Root>
      </CheckboxGroup>
    ));
    const styles = getComputedStyle(partOf(mounted.container, "group"));

    expect(styles.flexDirection).toBe("column");
    expect(styles.rowGap).toBe("6px");
  });
});

describe("Checkbox — the styles the slot recipe really generated", () => {
  // Computed styles, never class names: a Panda class whose CSS was never generated renders nothing
  // and raises no error, so `classList.contains("checkbox__control")` passes on a checkbox with no
  // box, no border and no cursor (`CLAUDE.md`, *silent unstyling*).

  it("draws the box on `control`, which is where the whole checkmark body lives", () => {
    // **The proof the recipe is generated, and the correction to the row's own note.** The React
    // version's `Checkbox.Indicator` renders `<Checkmark unstyled>` and passes it
    // `styles.indicator` — and that slot is *empty* in this recipe. Everything visible is on
    // `control`: the border, the radius and the cursor come from `base.control`, which is
    // `checkmarkRecipe.base` verbatim.
    mounted = mount(() => <Basic />);
    const styles = getComputedStyle(partOf(mounted.container, "control"));

    // `flex`, not the `inline-flex` the recipe writes: the box is a flex item of the `label` root,
    // and CSS blockifies a flex item's display. Either way it is not the `block` a bare `div`
    // computes, which is what the assertion is for.
    expect(styles.display).toBe("flex");
    expect(styles.justifyContent).toBe("center");
    expect(styles.borderTopWidth).toBe("1px");
    expect(styles.borderTopStyle).toBe("solid");
    // `cursor: "checkbox"` is a Chakra **token**, not a CSS keyword, and the token's value is
    // `default`. A `var()` that resolved to nothing would leave the property invalid at computed
    // value time and the cursor would be `auto`, so this is the token scale having been generated
    // as well as the rule.
    expect(styles.cursor).toBe("default");
  });

  it("carries no declarations at all on the `indicator` slot", () => {
    // **The vacuous case, and it is upstream's own** — which is why the box above is asserted on
    // `control` and never here. `checkbox__indicator` lands on the `svg` and carries nothing, so
    // this element could never tell a generated stylesheet from an absent one.
    mounted = mount(() => <Basic defaultChecked />);
    const mark = mounted.container.querySelector("svg");
    if (!(mark instanceof SVGElement)) {
      throw new Error("expected a checkmark svg");
    }

    expect(mark.getAttribute("class")).toContain("checkbox__indicator");
    expect(getComputedStyle(mark).borderTopWidth).toBe("0px");
  });

  it("sizes the box from every one of the four `size` variants", () => {
    for (const [size, boxSize] of [
      ["xs", "12px"],
      ["sm", "16px"],
      ["md", "20px"],
      ["lg", "24px"],
    ] as const) {
      mounted?.dispose();
      mounted = mount(() => <Basic size={size} />);
      const styles = getComputedStyle(partOf(mounted.container, "control"));

      expect(styles.width, size).toBe(boxSize);
      expect(styles.height, size).toBe(boxSize);
    }
  });

  it("keeps the default `md` when the `size` variant is left unset", () => {
    // The recipe's own `defaultVariants`, not a literal restated on the Root — which is why
    // `CheckboxVariantProps` declares no `@default` for it.
    mounted = mount(() => <Basic />);

    expect(getComputedStyle(partOf(mounted.container, "control")).width).toBe("20px");
  });

  it("gaps the row and scales the label from the same `size`", () => {
    mounted = mount(() => <Basic size="xs" />);
    expect(getComputedStyle(partOf(mounted.container, "root")).columnGap).toBe("6px");

    mounted.dispose();
    mounted = mount(() => <Basic size="lg" />);
    expect(getComputedStyle(partOf(mounted.container, "root")).columnGap).toBe("12px");
    expect(getComputedStyle(partOf(mounted.container, "label")).fontWeight).toBe("500");
  });

  it("paints a ticked box differently under each of the three `variant`s", () => {
    // Three variants, and the assertion is what each one actually does to a *checked* box:
    // `solid` fills it, `outline` leaves the fill alone and recolours the border, `subtle` tints the
    // fill at rest. Reading `backgroundColor` on all three is what tells a generated variant layer
    // from a missing one.
    const paints: Record<string, string> = {};

    for (const variant of ["solid", "outline", "subtle"] as const) {
      mounted?.dispose();
      mounted = mount(() => <Basic defaultChecked variant={variant} />);
      paints[variant] = getComputedStyle(partOf(mounted.container, "control")).backgroundColor;
    }

    expect(paints.solid).not.toBe(paints.outline);
    expect(paints.subtle).not.toBe(paints.outline);
    // `outline` never fills a checked box; the other two do.
    expect(paints.outline).toBe("rgba(0, 0, 0, 0)");
  });

  it("reddens the border of an invalid box under every variant", () => {
    // **The preset row this port owed.** Panda emits a recipe as
    // `@layer recipes { @layer _base { …base… } …variant rules… }`, and an unlayered variant rule
    // beats that nested `_base` layer whatever the specificity — so `base.control._invalid`'s
    // border colour lost to each variant's own flat `borderColor` and an invalid checkbox rendered
    // in its resting colour, silently. `shadowedSlotBaseConditions.checkbox` writes the condition
    // into the variant values that defeat it, and this is the only thing that can see the fix.
    for (const variant of ["solid", "outline", "subtle"] as const) {
      mounted?.dispose();
      mounted = mount(() => <Basic variant={variant} />);
      const resting = getComputedStyle(partOf(mounted.container, "control")).borderTopColor;

      mounted.dispose();
      mounted = mount(() => <Basic variant={variant} invalid />);
      const invalid = getComputedStyle(partOf(mounted.container, "control")).borderTopColor;

      expect(invalid, variant).not.toBe(resting);
    }
  });

  it("dims a disabled box and takes the cursor with it", () => {
    mounted = mount(() => <Basic disabled />);
    const styles = getComputedStyle(partOf(mounted.container, "control"));

    expect(styles.opacity).toBe("0.5");
    expect(styles.cursor).toBe("not-allowed");
    expect(getComputedStyle(partOf(mounted.container, "label")).opacity).toBe("0.5");
  });

  it("leaves every part with the browser's own styles under a Root-level `unstyled`", () => {
    // Asserted as a computed **fallback**, never as an absent class: a missing class name and a
    // class whose CSS was never generated look identical from the DOM.
    mounted = mount(() => <Basic unstyled defaultChecked />);
    const { container } = mounted;

    expect(getComputedStyle(partOf(container, "root")).display).toBe("inline");
    expect(getComputedStyle(partOf(container, "control")).borderTopWidth).toBe("0px");
    expect(getComputedStyle(partOf(container, "control")).width).not.toBe("20px");
    expect(getComputedStyle(partOf(container, "label")).fontWeight).toBe("400");
  });

  it("keeps the mark's own stroke under `unstyled`, and adds no second border to it", () => {
    // `Checkbox.Indicator` passes `unstyled` to `Checkmark` so the `checkmark` recipe does not draw
    // a *second* box inside the one `control` already draws. The five presentation attributes are
    // literal on the `svg` and survive it, which is what still makes the tick visible.
    mounted = mount(() => <Basic defaultChecked />);
    const mark = mounted.container.querySelector("svg");
    if (!(mark instanceof SVGElement)) {
      throw new Error("expected a checkmark svg");
    }

    expect(getComputedStyle(mark).stroke).toBe("rgb(255, 255, 255)");
    expect(getComputedStyle(mark).borderTopWidth).toBe("0px");
  });

  it("keeps that opt-out when a wrapper forwards `unstyled={undefined}`", () => {
    // A spread merges by presence, so an `unstyled` written as a JSX attribute before the spread
    // would be deleted here and the mark would gain the `checkmark` recipe's own border inside the
    // box `control` already draws (`CLAUDE.md`, *The third hazard*).
    mounted = mount(() => (
      <Checkbox.Root defaultChecked>
        <Checkbox.Control>
          <Checkbox.Indicator unstyled={undefined} />
        </Checkbox.Control>
      </Checkbox.Root>
    ));
    const mark = mounted.container.querySelector("svg");
    if (!(mark instanceof SVGElement)) {
      throw new Error("expected a checkmark svg");
    }

    expect(getComputedStyle(mark).borderTopWidth).toBe("0px");
  });

  it("takes its variants from a `PropsProvider`, and lets a Root beat them", () => {
    mounted = mount(() => (
      <Checkbox.PropsProvider value={{ size: "lg" }}>
        <Basic />
        <Basic size="xs" />
      </Checkbox.PropsProvider>
    ));
    const [provided, overridden] = partsOf(mounted.container, "control");

    expect(getComputedStyle(provided as HTMLElement).width).toBe("24px");
    expect(getComputedStyle(overridden as HTMLElement).width).toBe("12px");
  });

  it("keeps the provider's variant when a Root forwards an unset one", () => {
    // `withContextDefaults` resolves by value where `merge` resolves by presence, so
    // `<Basic size={undefined} />` must not beat the provider above it with `undefined`.
    mounted = mount(() => (
      <Checkbox.PropsProvider value={{ size: "lg" }}>
        <Basic size={undefined} />
      </Checkbox.PropsProvider>
    ));

    expect(getComputedStyle(partOf(mounted.container, "control")).width).toBe("24px");
  });
});

describe("Checkbox — accessibility", () => {
  it("has no violations in any of the states a page really serves", async () => {
    const trees = {
      default: () => <Basic />,
      checked: () => <Basic defaultChecked />,
      indeterminate: () => <Basic defaultChecked="indeterminate" />,
      disabled: () => <Basic disabled />,
      invalid: () => <Basic invalid />,
      inField: () => (
        <Field.Root>
          <Checkbox.Root>
            <Checkbox.HiddenInput />
            <Checkbox.Control />
            <Checkbox.Label>Accept terms</Checkbox.Label>
          </Checkbox.Root>
          <Field.HelperText>Read them first</Field.HelperText>
        </Field.Root>
      ),
      inGroup: () => (
        <Fieldset.Root>
          <Fieldset.Legend>Frameworks</Fieldset.Legend>
          <CheckboxGroup defaultValue={["react"]}>
            <Checkbox.Root value="react">
              <Checkbox.HiddenInput />
              <Checkbox.Control />
              <Checkbox.Label>React</Checkbox.Label>
            </Checkbox.Root>
          </CheckboxGroup>
        </Fieldset.Root>
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

describe("Checkbox — server render, then hydrate", () => {
  /** A probe on the hydrated tree; the entry gives every element one, machine part or not. */
  function probeIn(container: ParentNode, probe: string): HTMLElement {
    const element = container.querySelector(`[data-probe="${probe}"]`);
    if (!(element instanceof HTMLElement)) {
      throw new Error(`the hydrated tree is missing its [data-probe="${probe}"] element`);
    }
    return element;
  }

  it("reuses every server node, with the glyph count the group's array decided", () => {
    // The half neither other project can see. `hydrateFixture` asserts the contract itself —
    // hydration was silent, no element was added or dropped, every server node survived as the same
    // object — so what is left here is the shape the tree was *supposed* to arrive in.
    //
    // One `polyline` in root a (the group ticked `terms` alone), one `path` in root b (the field's
    // box is indeterminate), and root c's mark replaced by a consumer's own element. Each of those
    // is a different node count, so a group that resolved differently on the two builds would have
    // shifted every `_hk` after it.
    const { container, dispose } = hydrateFixture(checkboxServerHtml, () => <Tree />);

    expect(container.querySelectorAll("polyline")).toHaveLength(1);
    expect(container.querySelectorAll("path")).toHaveLength(1);
    expect(probeIn(container, "c-custom-checked").textContent).toBe("✔");
    expect(probeIn(container, "after").textContent).toBe("after");
    // The render prop is called in the part's body rather than a tracking scope, so it returns JSX
    // and the `Show` inside it is what reads the machine.
    expect(probeIn(container, "c-state").textContent).toBe("on");

    dispose();
  });

  it("arrives with the ticked box's `checked` property already true", () => {
    const { container, dispose } = hydrateFixture(checkboxServerHtml, () => <Tree />);

    // Off the served `checked` **attribute**, which SolidJS's server build resolved out of the
    // machine's `defaultChecked` — so a reader sees the right box ticked before hydration rather
    // than after it.
    const terms = probeIn(container, "a-input-terms") as HTMLInputElement;
    const newsletter = probeIn(container, "a-input-newsletter") as HTMLInputElement;

    expect(terms.checked).toBe(true);
    expect(newsletter.checked).toBe(false);
    // The indeterminate box is the one place markup cannot carry the state: `indeterminate` is a
    // property with no attribute, and Zag's `watch` is change-only, so the served `data-state` and
    // the `path` glyph are the whole of it until something moves. The React version is identical.
    expect((probeIn(container, "b-input") as HTMLInputElement).indeterminate).toBe(false);
    expect(probeIn(container, "b-control").dataset.state).toBe("indeterminate");

    dispose();
  });

  it("grows the field's `aria-describedby` after hydration, on the node the server sent", async () => {
    // `Field.HelperText` registers its id in `onSettled`, which no server runs — so the served input
    // carries no IDREF and the hydrated one does. Both sides agree at the moment `hydrate()` is
    // asked, which is the only thing hydration needs.
    expect(checkboxServerHtml).not.toContain("aria-describedby");

    const { container, dispose } = hydrateFixture(checkboxServerHtml, () => <Tree />);
    const input = probeIn(container, "b-input");

    await vi.waitFor(() =>
      expect(input.getAttribute("aria-describedby")).toBe(probeIn(container, "b-helper").id),
    );

    dispose();
  });

  it("runs the machine after hydration, on the server's own nodes", async () => {
    const { container, dispose } = hydrateFixture(checkboxServerHtml, () => <Tree />);

    const label = probeIn(container, "a-label-newsletter");
    const control = probeIn(container, "a-control-newsletter");
    const input = probeIn(container, "a-input-newsletter") as HTMLInputElement;

    label.click();

    await vi.waitFor(() => {
      expect(control.dataset.state).toBe("checked");
      expect(input.checked).toBe(true);
    });

    // `createUniqueId()` is a different function in the server build and the hydrating client build,
    // and they agree only while both walk the same counter. An id that shifted would leave the
    // label's `for` pointing at nothing.
    expect(probeIn(container, "a-root-newsletter").getAttribute("for")).toBe(input.id);
    expect(document.getElementById(input.id)).toBe(input);

    // The same objects the server sent, still — the machine drove them rather than replacing them.
    expect(probeIn(container, "a-control-newsletter")).toBe(control);

    dispose();
  });

  it("builds a glyph the server never sent, when a box is ticked after hydration", async () => {
    // The count divergence, driven the only direction a consumer can drive it: the server wrote one
    // `polyline` for the whole tree and ticking a second box has to build another beside nodes it
    // already claimed.
    const { container, dispose } = hydrateFixture(checkboxServerHtml, () => <Tree />);
    const control = probeIn(container, "a-control-updates");

    expect(control.querySelector("polyline")).toBeNull();
    probeIn(container, "a-label-updates").click();

    await vi.waitFor(() => expect(control.querySelector("polyline")).not.toBeNull());
    expect(probeIn(container, "a-control-updates")).toBe(control);

    dispose();
  });
});
