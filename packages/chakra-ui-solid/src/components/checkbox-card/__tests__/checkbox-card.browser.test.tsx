import {
  expectNoA11yViolations,
  type MountedComponent,
  mount,
} from "@chakra-ui-solid/internal-test-utils";
import { createSignal } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CheckboxCheckedChangeDetails, CheckboxCheckedState } from "../../checkbox";
import { CheckboxGroup } from "../../checkbox";
import { Field } from "../../field";
import { Fieldset } from "../../fieldset";
import { CheckboxCard, createCheckboxCard } from "../index";

let mounted: MountedComponent | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

/**
 * The machine defers every `send` by a microtask, and a card runs exactly one machine — no presence,
 * no nested service — so one turn of the queue is the whole wait.
 */
const settle = () => new Promise<void>((resolve) => queueMicrotask(resolve));

/**
 * An element by part, **scope-qualified** — and here that is load-bearing rather than defensive.
 * `root`, `control` and `label` come from the checkbox machine's prop getters and carry
 * `data-scope="checkbox"`; `description` and `indicator` are written by this component and carry
 * `checkbox-card`. `field` and `fieldset` also name a part `root`, and two trees below nest one.
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

/** `Content` and `Addon` are slots with no anatomy name, so a probe is the only handle on one. */
function probeOf(container: ParentNode, probe: string): HTMLElement {
  const element = container.querySelector(`[data-probe="${probe}"]`);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`expected the tree to render a [data-probe="${probe}"] element`);
  }
  return element;
}

/** The indicator's `svg`, which is the element the box is drawn on in this recipe. */
function markIn(container: ParentNode): SVGElement {
  const element = container.querySelector("svg");
  if (!(element instanceof SVGElement)) {
    throw new Error("expected the tree to render a checkmark svg");
  }
  return element;
}

function inputIn(container: ParentNode): HTMLInputElement {
  const element = container.querySelector("input[type=checkbox]");
  if (!(element instanceof HTMLInputElement)) {
    throw new Error("expected the tree to render a hidden checkbox input");
  }
  return element;
}

const borderBoxWidth = (element: Element) => Math.round(element.getBoundingClientRect().width);

/**
 * Every prop is forwarded **by name** rather than spread, which is what puts each of them on the
 * forwarded-`undefined` path on every test in this file.
 */
function Basic(props: {
  align?: "start" | "end" | "center";
  checked?: CheckboxCheckedState;
  defaultChecked?: CheckboxCheckedState;
  disabled?: boolean;
  invalid?: boolean;
  justify?: "start" | "end" | "center";
  name?: string;
  onCheckedChange?: (details: CheckboxCheckedChangeDetails) => void;
  orientation?: "vertical" | "horizontal";
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
  unstyled?: boolean;
  value?: string;
  variant?: "surface" | "subtle" | "outline" | "solid";
}) {
  return (
    <CheckboxCard.Root
      align={props.align}
      checked={props.checked}
      defaultChecked={props.defaultChecked}
      disabled={props.disabled}
      invalid={props.invalid}
      justify={props.justify}
      name={props.name}
      onCheckedChange={props.onCheckedChange}
      orientation={props.orientation}
      readOnly={props.readOnly}
      size={props.size}
      unstyled={props.unstyled}
      value={props.value}
      variant={props.variant}
    >
      <CheckboxCard.HiddenInput />
      <CheckboxCard.Control>
        <CheckboxCard.Content data-probe="content">
          <CheckboxCard.Label>Next.js</CheckboxCard.Label>
          <CheckboxCard.Description>Best for apps</CheckboxCard.Description>
        </CheckboxCard.Content>
        <CheckboxCard.Indicator />
      </CheckboxCard.Control>
      <CheckboxCard.Addon data-probe="addon">New</CheckboxCard.Addon>
    </CheckboxCard.Root>
  );
}

describe("CheckboxCard — the checkbox machine under a second recipe", () => {
  it("toggles on a click anywhere on the card, because the Root is the label", async () => {
    const onCheckedChange = vi.fn();
    mounted = mount(() => <Basic onCheckedChange={onCheckedChange} />);
    const { container } = mounted;

    probeOf(container, "addon").click();
    await settle();

    expect(onCheckedChange).toHaveBeenCalledWith({ checked: true });
    expect(inputIn(container).checked).toBe(true);
    expect(partOf(container, "control").dataset.state).toBe("checked");
  });

  it("reports a controlled change upward rather than making it itself", async () => {
    const onCheckedChange = vi.fn();
    mounted = mount(() => <Basic checked={false} onCheckedChange={onCheckedChange} />);
    const { container } = mounted;

    partOf(container, "root").click();
    await settle();

    expect(onCheckedChange).toHaveBeenCalledWith({ checked: true });
    expect(inputIn(container).checked).toBe(false);
    expect(partOf(container, "control").dataset.state).toBe("unchecked");
  });

  it("writes the state onto the input as a property, not as an attribute", async () => {
    const [checked, setChecked] = createSignal<CheckboxCheckedState>(false);
    mounted = mount(() => <Basic checked={checked()} />);
    const input = inputIn(mounted.container);

    setChecked(true);
    await settle();
    expect(input.checked).toBe(true);

    setChecked("indeterminate");
    await settle();
    expect(input.indeterminate).toBe(true);
  });

  it("takes no click while disabled and no change while read-only", async () => {
    const onCheckedChange = vi.fn();
    mounted = mount(() => <Basic disabled onCheckedChange={onCheckedChange} />);
    partOf(mounted.container, "root").click();
    await settle();
    expect(onCheckedChange).not.toHaveBeenCalled();

    mounted.dispose();
    mounted = mount(() => <Basic readOnly onCheckedChange={onCheckedChange} />);
    // Not `disabled`: a read-only card is reachable by keyboard and announced.
    expect(inputIn(mounted.container).disabled).toBe(false);
    inputIn(mounted.container).click();
    await settle();
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it("carries the description's own state attributes, which no prop getter supplies", async () => {
    mounted = mount(() => <Basic />);
    const description = partOf(mounted.container, "description", "checkbox-card");

    expect(description.dataset.state).toBe("unchecked");
    expect(description.dataset.disabled).toBeUndefined();

    partOf(mounted.container, "root").click();
    await settle();

    // Derived from context rather than merged, so this is the only thing that proves it tracks.
    expect(description.dataset.state).toBe("checked");
  });

  it("leaves `Content` and `Addon` without an anatomy name, which is upstream's own shape", () => {
    // Neither is in `checkbox.anatomy` and neither calls a prop getter, so the slot class is the
    // only handle a stylesheet or a test has on one.
    mounted = mount(() => <Basic />);

    expect(probeOf(mounted.container, "content").getAttribute("data-part")).toBeNull();
    expect(probeOf(mounted.container, "addon").getAttribute("data-part")).toBeNull();
    expect(markIn(mounted.container).getAttribute("data-part")).toBe("indicator");
    expect(markIn(mounted.container).getAttribute("data-scope")).toBe("checkbox-card");
  });

  it("renders an empty control when it is given no children", () => {
    // The difference from `Checkbox.Control`, which fills an absent child with its own indicator.
    // Upstream gives this one no `defaultProps`, so a bare `<CheckboxCard.Control />` is an empty
    // box rather than a card with a stray tick in it.
    mounted = mount(() => (
      <CheckboxCard.Root defaultChecked>
        <CheckboxCard.Control />
      </CheckboxCard.Root>
    ));

    expect(mounted.container.querySelector("svg")).toBeNull();
  });

  it("hands the machine to a `CheckboxCard.Context` render prop that returns JSX", async () => {
    mounted = mount(() => (
      <CheckboxCard.Root>
        <CheckboxCard.HiddenInput />
        <CheckboxCard.Control>
          <CheckboxCard.Label>Next.js</CheckboxCard.Label>
        </CheckboxCard.Control>
        <CheckboxCard.Context>
          {(card) => <span data-probe="state">{card.checked ? "on" : "off"}</span>}
        </CheckboxCard.Context>
      </CheckboxCard.Root>
    ));

    expect(probeOf(mounted.container, "state").textContent).toBe("off");

    partOf(mounted.container, "root").click();
    await settle();

    // The render prop is called in the part's body, which is not a tracking scope — what tracks is
    // the JSX expression it returned.
    expect(probeOf(mounted.container, "state").textContent).toBe("on");
  });

  it("drives a `RootProvider` from a machine the consumer owns", async () => {
    // `createCheckboxCard` is `createCheckbox`: one machine, two public components.
    let card: ReturnType<typeof createCheckboxCard> | undefined;
    mounted = mount(() => {
      card = createCheckboxCard({ defaultChecked: true });
      return (
        <CheckboxCard.RootProvider value={card}>
          <CheckboxCard.HiddenInput />
          <CheckboxCard.Control>
            <CheckboxCard.Indicator />
          </CheckboxCard.Control>
        </CheckboxCard.RootProvider>
      );
    });

    expect(partOf(mounted.container, "control").dataset.state).toBe("checked");

    card?.setChecked(false);
    await settle();

    expect(partOf(mounted.container, "control").dataset.state).toBe("unchecked");
  });

  it("is driven by the checkbox row's `CheckboxGroup`, with nothing added", async () => {
    const onValueChange = vi.fn();
    mounted = mount(() => (
      <CheckboxGroup defaultValue={["next"]} name="framework" onValueChange={onValueChange}>
        <Card value="next" />
        <Card value="vite" />
      </CheckboxGroup>
    ));
    const [next, vite] = partsOf(mounted.container, "control");

    expect(next?.dataset.state).toBe("checked");
    expect(vite?.dataset.state).toBe("unchecked");

    partsOf(mounted.container, "root")[1]?.click();
    await settle();

    expect(onValueChange).toHaveBeenCalledWith(["next", "vite"]);
  });

  it("inherits `disabled` and `invalid` from a surrounding Fieldset", () => {
    mounted = mount(() => (
      <Fieldset.Root disabled invalid>
        <CheckboxGroup>
          <Card value="next" />
        </CheckboxGroup>
      </Fieldset.Root>
    ));
    const control = partOf(mounted.container, "control");

    expect(control.dataset.disabled).toBe("");
    expect(control.dataset.invalid).toBe("");
  });
});

/** One card, for the trees that need more than one of them. */
function Card(props: { value?: string }) {
  return (
    <CheckboxCard.Root value={props.value}>
      <CheckboxCard.HiddenInput />
      <CheckboxCard.Control>
        <CheckboxCard.Content>
          <CheckboxCard.Label>{props.value}</CheckboxCard.Label>
        </CheckboxCard.Content>
        <CheckboxCard.Indicator />
      </CheckboxCard.Control>
    </CheckboxCard.Root>
  );
}

describe("CheckboxCard — the styles the slot recipe really generated", () => {
  // Computed styles, never class names: a Panda class whose CSS was never generated renders nothing
  // and raises no error, so `classList.contains("checkbox-card__indicator")` passes on a card with
  // no box, no border and no cursor (`CLAUDE.md`, *silent unstyling*).

  it("draws the box on `indicator`, which is where the whole checkmark body lives", () => {
    // **The proof the recipe is generated, and the exact inverse of `checkbox`.** There
    // `checkmarkRecipe.base` is inlined into `control` and the `indicator` slot is empty; here it is
    // on `indicator` and `control` styles the card around it. The assertion `checkbox.browser` puts
    // on `control` therefore belongs here.
    mounted = mount(() => <Basic />);
    const styles = getComputedStyle(markIn(mounted.container));

    expect(styles.borderTopWidth).toBe("1px");
    expect(styles.borderTopStyle).toBe("solid");
    expect(styles.borderTopLeftRadius).not.toBe("0px");
    expect(styles.flexShrink).toBe("0");
    // `cursor: "checkbox"` is a Chakra **token**, not a CSS keyword, and the token's value is
    // `default`. A `var()` that resolved to nothing would leave the property invalid at computed
    // value time and the cursor would be `auto`, so this is the token scale having been generated
    // as well as the rule.
    expect(styles.cursor).toBe("default");
  });

  it("leaves `control` carrying the card's own layout rather than the mark's", () => {
    mounted = mount(() => <Basic />);
    const styles = getComputedStyle(partOf(mounted.container, "control"));

    // `flex`, not the `inline-flex` the recipe writes: the control is a flex item of the `label`
    // root, and CSS blockifies a flex item's display.
    expect(styles.display).toBe("flex");
    expect(styles.position).toBe("relative");
    expect(styles.paddingTop).toBe("16px");
    expect(styles.borderTopWidth).toBe("0px");
  });

  it("styles the four slots the `checkbox` recipe does not have", () => {
    mounted = mount(() => <Basic />);
    const { container } = mounted;

    const description = getComputedStyle(partOf(container, "description", "checkbox-card"));
    expect(description.opacity).toBe("0.64");
    expect(description.fontSize).toBe("14px");

    const content = getComputedStyle(probeOf(container, "content"));
    expect(content.display).toBe("flex");
    expect(content.flexDirection).toBe("column");
    expect(content.rowGap).toBe("4px");

    const addon = getComputedStyle(probeOf(container, "addon"));
    expect(addon.paddingTop).toBe("8px");
    expect(addon.paddingLeft).toBe("16px");
    expect(addon.borderTopWidth).toBe("1px");

    // The `root` slot, which is the `<label>` itself.
    const root = getComputedStyle(partOf(container, "root"));
    expect(root.display).toBe("flex");
    expect(root.flexDirection).toBe("column");
    expect(root.borderTopLeftRadius).not.toBe("0px");
  });

  it("sizes the card and the box from every one of the three `size` variants", () => {
    for (const [size, mark, gap, cardFontSize] of [
      ["sm", 16, "6px", "14px"],
      ["md", 20, "10px", "14px"],
      ["lg", 24, "14px", "16px"],
    ] as const) {
      mounted?.dispose();
      mounted = mount(() => <Basic size={size} />);
      const { container } = mounted;

      expect(borderBoxWidth(markIn(container)), size).toBe(mark);
      expect(getComputedStyle(partOf(container, "control")).columnGap, size).toBe(gap);
      expect(getComputedStyle(partOf(container, "root")).fontSize, size).toBe(cardFontSize);
    }
  });

  it("keeps the default `md` when the `size` variant is left unset", () => {
    // The recipe's own `defaultVariants`, not a literal restated on the Root.
    mounted = mount(() => <Basic />);

    expect(borderBoxWidth(markIn(mounted.container))).toBe(20);
  });

  it("paints a ticked card differently under each of the four `variant`s", () => {
    // Four variants where `checkbox` has three, and each one does something different to a *checked*
    // card: `solid` and `surface` fill the root, `subtle` tints the control, `outline` leaves the
    // fill alone and draws an inset ring.
    const paints: Record<string, { root: string; control: string; shadow: string }> = {};

    for (const variant of ["surface", "subtle", "outline", "solid"] as const) {
      mounted?.dispose();
      mounted = mount(() => <Basic defaultChecked variant={variant} />);
      const { container } = mounted;
      paints[variant] = {
        root: getComputedStyle(partOf(container, "root")).backgroundColor,
        control: getComputedStyle(partOf(container, "control")).backgroundColor,
        shadow: getComputedStyle(partOf(container, "root")).boxShadow,
      };
    }

    expect(paints.solid?.root).not.toBe(paints.surface?.root);
    expect(paints.solid?.root).not.toBe("rgba(0, 0, 0, 0)");
    expect(paints.surface?.root).not.toBe("rgba(0, 0, 0, 0)");
    // `outline` never fills the root; it draws the ring instead.
    expect(paints.outline?.root).toBe("rgba(0, 0, 0, 0)");
    expect(paints.outline?.shadow).not.toBe("none");
    // `subtle` is the only one that paints the *control*.
    expect(paints.subtle?.control).not.toBe("rgba(0, 0, 0, 0)");
  });

  it("gives the box a different resting border under each `variant`", () => {
    const borders: Record<string, string> = {};

    for (const variant of ["surface", "subtle", "outline", "solid"] as const) {
      mounted?.dispose();
      mounted = mount(() => <Basic variant={variant} />);
      borders[variant] = getComputedStyle(markIn(mounted.container)).borderTopColor;
    }

    // `subtle` writes no flat `borderColor` on the indicator at all, which is why it is the one
    // variant with no row in `shadowedSlotBaseConditions.checkboxCard`.
    expect(borders.subtle).not.toBe(borders.surface);
    expect(borders.solid).not.toBe(borders.surface);
  });

  it("reddens the box's border once the mark is marked invalid, under every variant", () => {
    // **The preset row this port owed.** Panda emits a recipe as
    // `@layer recipes { @layer _base { …base… } …variant rules… }`, and an unlayered variant rule
    // beats that nested `_base` layer whatever the specificity — so `base.indicator._invalid`'s
    // border colour lost to `surface`, `outline` and `solid`'s own flat `borderColor`, and this is
    // the only thing that can see `shadowedSlotBaseConditions.checkboxCard` correcting it.
    //
    // `data-invalid` is written onto the part here rather than reached through
    // `<CheckboxCard.Root invalid>`, and that is the state of the world rather than a shortcut — see
    // the test below.
    for (const variant of ["surface", "subtle", "outline", "solid"] as const) {
      mounted?.dispose();
      mounted = mount(() => <Basic variant={variant} />);
      const resting = getComputedStyle(markIn(mounted.container)).borderTopColor;

      mounted.dispose();
      mounted = mount(() => (
        <CheckboxCard.Root variant={variant}>
          <CheckboxCard.Control>
            <CheckboxCard.Indicator data-invalid="" />
          </CheckboxCard.Control>
        </CheckboxCard.Root>
      ));
      const invalid = getComputedStyle(markIn(mounted.container)).borderTopColor;

      expect(invalid, variant).not.toBe(resting);
    }
  });

  it("does not carry the card's `invalid` down to the mark, which is Chakra's own shape", () => {
    // **Expected, and the React version does exactly the same.** `_invalid` selects
    // `:is(:invalid, [data-invalid], [aria-invalid=true])` on the element itself, and this mark is
    // not a machine part: `Checkmark` writes `data-state` and `data-disabled` and nothing else, so
    // `base.indicator._invalid` has nothing to match on either library. What an invalid card *does*
    // show is the `root` slot's own outline, which is asserted above.
    //
    // The same is true of `base.addon._disabled`: the addon is a slot with no anatomy name and no
    // prop getter, so nothing writes `data-disabled` on it and the block never fires.
    mounted = mount(() => <Basic invalid disabled />);
    const { container } = mounted;

    expect(markIn(container).getAttribute("data-invalid")).toBeNull();
    expect(getComputedStyle(probeOf(container, "addon")).opacity).toBe("1");
    // The machine parts do carry both, which is what makes the contrast a shape rather than a bug.
    expect(partOf(container, "control").dataset.invalid).toBe("");
    expect(getComputedStyle(partOf(container, "label")).opacity).toBe("0.5");
  });

  it("outlines the whole card when it is invalid", () => {
    mounted = mount(() => <Basic invalid />);
    const styles = getComputedStyle(partOf(mounted.container, "root"));

    expect(styles.outlineWidth).toBe("2px");
    expect(styles.outlineStyle).toBe("solid");
  });

  it("leaves `--checkbox-card-justify` unset, and fills it from the `justify` variant", () => {
    // `justify` is the one variant key the recipe gives no `defaultVariants` entry, so unset means
    // the custom property is never written and the control keeps `justify-content: normal`.
    // Reproduced rather than defaulted.
    mounted = mount(() => <Basic />);
    expect(getComputedStyle(partOf(mounted.container, "control")).justifyContent).toBe("normal");
    expect(getComputedStyle(probeOf(mounted.container, "content")).justifyContent).toBe("normal");

    for (const [justify, computed] of [
      ["start", "flex-start"],
      ["center", "center"],
      ["end", "flex-end"],
    ] as const) {
      mounted?.dispose();
      mounted = mount(() => <Basic justify={justify} />);

      expect(getComputedStyle(partOf(mounted.container, "control")).justifyContent, justify).toBe(
        computed,
      );
    }
  });

  it("aligns from `align`, which does default, and takes the content's text with it", () => {
    for (const [align, computed, textAlign] of [
      ["start", "flex-start", "start"],
      ["center", "center", "center"],
      ["end", "flex-end", "end"],
    ] as const) {
      mounted?.dispose();
      mounted = mount(() => <Basic align={align} />);

      expect(getComputedStyle(partOf(mounted.container, "control")).alignItems, align).toBe(
        computed,
      );
      expect(getComputedStyle(probeOf(mounted.container, "content")).textAlign, align).toBe(
        textAlign,
      );
    }

    // The default is `start`, from the recipe's own `defaultVariants`.
    mounted?.dispose();
    mounted = mount(() => <Basic />);
    expect(getComputedStyle(partOf(mounted.container, "control")).alignItems).toBe("flex-start");
  });

  it("turns the control with `orientation`", () => {
    mounted = mount(() => <Basic orientation="vertical" />);
    expect(getComputedStyle(partOf(mounted.container, "control")).flexDirection).toBe("column");

    mounted.dispose();
    mounted = mount(() => <Basic />);
    expect(getComputedStyle(partOf(mounted.container, "control")).flexDirection).toBe("row");
  });

  it("dims a disabled card and takes the box's cursor with it", () => {
    mounted = mount(() => <Basic disabled />);
    const { container } = mounted;

    expect(getComputedStyle(partOf(container, "root")).opacity).toBe("0.8");
    expect(getComputedStyle(partOf(container, "label")).opacity).toBe("0.5");
    expect(getComputedStyle(partOf(container, "description", "checkbox-card")).opacity).toBe("0.5");
    expect(getComputedStyle(markIn(container)).opacity).toBe("0.5");
    expect(getComputedStyle(markIn(container)).cursor).toBe("not-allowed");
  });

  it("leaves every part with the browser's own styles under a Root-level `unstyled`", () => {
    // Asserted as a computed **fallback**, never as an absent class: a missing class name and a
    // class whose CSS was never generated look identical from the DOM.
    mounted = mount(() => <Basic unstyled defaultChecked />);
    const { container } = mounted;

    expect(getComputedStyle(partOf(container, "root")).display).toBe("inline");
    expect(getComputedStyle(partOf(container, "control")).paddingTop).toBe("0px");
    expect(getComputedStyle(markIn(container)).borderTopWidth).toBe("0px");
    expect(borderBoxWidth(markIn(container))).not.toBe(20);
    expect(getComputedStyle(partOf(container, "label")).fontWeight).toBe("400");
    expect(getComputedStyle(probeOf(container, "addon")).borderTopWidth).toBe("0px");
  });

  it("keeps the mark's own stroke under `unstyled`, and adds no second border to it", () => {
    // `CheckboxCard.Indicator` passes `unstyled` to `Checkmark` so the `checkmark` recipe does not
    // draw a *second* box inside the one the `indicator` slot already draws. The presentation
    // attributes are literal on the `svg` and survive it, which is what still makes the tick visible.
    mounted = mount(() => <Basic defaultChecked />);
    const mark = markIn(mounted.container);

    expect(getComputedStyle(mark).stroke).toBe("rgb(255, 255, 255)");
    // One border, the `indicator` slot's — not two.
    expect(getComputedStyle(mark).borderTopWidth).toBe("1px");
    expect(mark.getAttribute("class")).not.toContain("checkmark--");
  });

  it("keeps that opt-out when a wrapper forwards `unstyled={undefined}`", () => {
    // A spread merges by presence, so an `unstyled` written as a JSX attribute before the spread
    // would be deleted here and the mark would gain the `checkmark` recipe's own box inside the one
    // the `indicator` slot already draws (`CLAUDE.md`, *The third hazard*).
    mounted = mount(() => (
      <CheckboxCard.Root defaultChecked>
        <CheckboxCard.Control>
          <CheckboxCard.Indicator unstyled={undefined} />
        </CheckboxCard.Control>
      </CheckboxCard.Root>
    ));

    expect(markIn(mounted.container).getAttribute("class")).not.toContain("checkmark--");
    expect(getComputedStyle(markIn(mounted.container)).borderTopWidth).toBe("1px");
  });

  it("lets a consumer's own `class` on the indicator win a tie", () => {
    mounted = mount(() => (
      <CheckboxCard.Root>
        <CheckboxCard.Control>
          <CheckboxCard.Indicator borderRadius="0px" />
        </CheckboxCard.Control>
      </CheckboxCard.Root>
    ));

    // The slot class sits below the style props in the cascade, so a style prop on the part beats
    // the recipe's own `borderRadius: l1`.
    expect(getComputedStyle(markIn(mounted.container)).borderTopLeftRadius).toBe("0px");
  });

  it("takes its variants from a `RootPropsProvider`, and lets a Root beat them", () => {
    mounted = mount(() => (
      <CheckboxCard.RootPropsProvider value={{ size: "lg" }}>
        <Basic />
        <Basic size="sm" />
      </CheckboxCard.RootPropsProvider>
    ));
    const [provided, overridden] = [...mounted.container.querySelectorAll("svg")];

    expect(borderBoxWidth(provided as SVGElement)).toBe(24);
    expect(borderBoxWidth(overridden as SVGElement)).toBe(16);
  });

  it("keeps the provider's variant when a Root forwards an unset one", () => {
    // `withContextDefaults` resolves by value where `merge` resolves by presence, so
    // `<Basic size={undefined} />` must not beat the provider above it with `undefined`.
    mounted = mount(() => (
      <CheckboxCard.RootPropsProvider value={{ size: "lg" }}>
        <Basic size={undefined} />
      </CheckboxCard.RootPropsProvider>
    ));

    expect(borderBoxWidth(markIn(mounted.container))).toBe(24);
  });

  it("keeps the provider's variant on a `RootProvider` that forwards an unset one", () => {
    mounted = mount(() => {
      // Named, never `value={createCheckboxCard()}`: a call expression in a JSX attribute compiles
      // to a getter rather than a memo, and this Root reads `value` more than once — so the inline
      // form would start a second machine and hand the tree a different one on every read.
      const card = createCheckboxCard();
      return (
        <CheckboxCard.RootPropsProvider value={{ size: "lg" }}>
          <CheckboxCard.RootProvider value={card} size={undefined}>
            <CheckboxCard.Control>
              <CheckboxCard.Indicator />
            </CheckboxCard.Control>
          </CheckboxCard.RootProvider>
        </CheckboxCard.RootPropsProvider>
      );
    });

    expect(borderBoxWidth(markIn(mounted.container))).toBe(24);
  });
});

describe("CheckboxCard — accessibility", () => {
  it("has no violations in any of the states a page really serves", async () => {
    const trees = {
      default: () => <Basic />,
      checked: () => <Basic defaultChecked />,
      indeterminate: () => <Basic defaultChecked="indeterminate" />,
      disabled: () => <Basic disabled />,
      invalid: () => <Basic invalid />,
      inField: () => (
        <Field.Root>
          <Basic />
          <Field.HelperText>Pick the one you use</Field.HelperText>
        </Field.Root>
      ),
      inGroup: () => (
        <Fieldset.Root>
          <Fieldset.Legend>Frameworks</Fieldset.Legend>
          <CheckboxGroup defaultValue={["next"]}>
            <Card value="next" />
            <Card value="vite" />
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
