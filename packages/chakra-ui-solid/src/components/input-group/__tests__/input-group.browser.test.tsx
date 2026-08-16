import inputGroupServerHtml from "virtual:hydration-fixture?id=input-group";
import {
  hydrateFixture,
  type MountedElement,
  mountElement,
} from "@chakra-ui-solid/internal-test-utils";
import type { JSX } from "@solidjs/web";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { Box } from "../../box";
import { Input } from "../../input";
import { NativeSelect } from "../../native-select";
import { InputGroup } from "../input-group";
import { Tree } from "./input-group.ssr-entry";

let mounted: MountedElement | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

function queryElement(root: ParentNode, selector: string): HTMLElement {
  const element = root.querySelector(selector);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`expected an element matching ${selector}`);
  }
  return element;
}

/** The group, with the control inside it resolved. */
function mountGroup(ui: () => JSX.Element): { group: HTMLElement; control: HTMLElement } {
  mounted = mountElement(ui);
  return {
    group: mounted.element,
    control: queryElement(mounted.element, "[data-probe='control']"),
  };
}

type InputSize = "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

/** Every step, with the field height it publishes as `--input-height`, in used pixels. */
const HEIGHT_PER_SIZE: ReadonlyArray<readonly [InputSize, string]> = [
  ["2xs", "28px"],
  ["xs", "32px"],
  ["sm", "36px"],
  ["md", "40px"],
  ["lg", "44px"],
  ["xl", "48px"],
  ["2xl", "64px"],
];

describe("InputGroup", () => {
  it("renders a full-width row", () => {
    mounted = mountElement(() => (
      <InputGroup>
        <Input data-probe="control" />
      </InputGroup>
    ));
    const style = getComputedStyle(mounted.element);

    expect(style.display).toBe("inline-flex");
    expect(style.width).toBe(`${mounted.container.clientWidth}px`);
  });

  it("stays full width when a wrapper forwards an unset `width`", () => {
    // Spelled `<Group width="full" {...rest}>` the default resolves by *presence*, so a wrapper
    // passing `width={props.width}` with nothing set deletes it and the row collapses to its
    // content (`CLAUDE.md`, *The third hazard*).
    mounted = mountElement(() => (
      <InputGroup width={undefined}>
        <Input data-probe="control" />
      </InputGroup>
    ));

    expect(getComputedStyle(mounted.element).width).toBe(`${mounted.container.clientWidth}px`);
  });

  it("leaves the control's own padding alone when there is no element", () => {
    // The failure the context route exists to avoid: a padding declaration that is always on
    // resolves `calc(var(--input-height) - …)` against nothing here, and a non-inherited property
    // that is invalid at computed-value time collapses to `0` — silently taking the recipe's
    // padding with it.
    const { control } = mountGroup(() => (
      <InputGroup>
        <Input data-probe="control" />
      </InputGroup>
    ));

    expect(getComputedStyle(control).paddingLeft).toBe("12px");
    expect(getComputedStyle(control).paddingRight).toBe("12px");
  });

  it.each(HEIGHT_PER_SIZE)("pads the control by its own height at size %s", (size, height) => {
    // The padding is the field's height, which every step republishes as `--input-height` — so the
    // `calc()` has to evaluate in the *control's* scope, not the group's.
    const { control } = mountGroup(() => (
      <InputGroup startElement="@">
        <Input size={size} data-probe="control" />
      </InputGroup>
    ));

    expect(getComputedStyle(control).paddingLeft).toBe(height);
  });

  it("pads the trailing edge for an end element", () => {
    const { control } = mountGroup(() => (
      <InputGroup endElement=".com">
        <Input data-probe="control" />
      </InputGroup>
    ));
    const style = getComputedStyle(control);

    expect(style.paddingRight).toBe("40px");
    expect(style.paddingLeft).toBe("12px");
  });

  it("gives padding back for an offset", () => {
    const { control } = mountGroup(() => (
      <InputGroup startElement="@" startOffset="8px">
        <Input data-probe="control" />
      </InputGroup>
    ));

    expect(getComputedStyle(control).paddingLeft).toBe("32px");
  });

  it("takes the full height when a wrapper forwards an unset `startOffset`", () => {
    // The offset's `"0px"` is a default like any other, and it rides an inline custom property that
    // the padding's `calc()` subtracts — so a forwarded `undefined` that deleted it would leave
    // `calc(var(--input-height) - )`, which is not a length at all.
    const { control } = mountGroup(() => (
      <InputGroup startElement="@" startOffset={undefined} endOffset={undefined}>
        <Input data-probe="control" />
      </InputGroup>
    ));

    expect(getComputedStyle(control).paddingLeft).toBe("40px");
  });

  it("tracks an offset that changes", () => {
    const [offset, setOffset] = createSignal("0px");
    const { control } = mountGroup(() => (
      <InputGroup startElement="@" startOffset={offset()}>
        <Input data-probe="control" />
      </InputGroup>
    ));

    expect(getComputedStyle(control).paddingLeft).toBe("40px");
    flush(() => setOffset("10px"));
    expect(getComputedStyle(control).paddingLeft).toBe("30px");
  });

  it("lets the consumer's own `ps` win", () => {
    // **The decisive one.** No CSS route can pass it: a descendant selector either outranks the
    // consumer's own `.ps_4\.75em` on specificity or ties with it and is settled by stylesheet
    // source order. The control contributing the padding *underneath* its own props is a JS object
    // merge, which is the same precedence Chakra's `...children.props` spread produces.
    const { control } = mountGroup(() => (
      <InputGroup startElement="@">
        <Input ps="4.75em" data-probe="control" />
      </InputGroup>
    ));

    // 4.75em against the recipe's 14px font size.
    expect(getComputedStyle(control).paddingLeft).toBe("66.5px");
  });

  it("lets the consumer's own `paddingInlineEnd` win", () => {
    const { control } = mountGroup(() => (
      <InputGroup endElement=".com">
        <Input paddingInlineEnd="5px" data-probe="control" />
      </InputGroup>
    ));

    expect(getComputedStyle(control).paddingRight).toBe("5px");
  });

  it("reaches a control that is not an immediate child", () => {
    // What the context buys and `cloneElement` cannot: the control may be nested or wrapped, so
    // there is no single-child constraint to enforce and none is declared.
    const { control } = mountGroup(() => (
      <InputGroup startElement="@">
        <Box>
          <Input data-probe="control" />
        </Box>
      </InputGroup>
    ));

    expect(getComputedStyle(control).paddingLeft).toBe("40px");
  });

  it("pads a NativeSelect.Field too", () => {
    // The select republishes `--input-height` as `var(--select-field-height)` on its own element,
    // which is the composition Chakra documents — so leaving it out would ship it visibly broken.
    const { control } = mountGroup(() => (
      <InputGroup startElement="@">
        <NativeSelect.Root>
          <NativeSelect.Field data-probe="control">
            <option value="a">A</option>
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </InputGroup>
    ));

    expect(getComputedStyle(control).paddingLeft).toBe("40px");
  });

  /**
   * The boundary the two below pin: `children()` resolves the four slots in the group's **own
   * owner**, which is above the provider, so an opted-in control placed *inside* a slot never sees
   * the context and keeps its recipe's padding — only the control in `children` collects the
   * group's. Chakra's `cloneElement` reaches exactly as far.
   *
   * `apps/docs/src/examples/input/input-with-select.tsx` rests on it: its `NativeSelect.Field` sits
   * in `endElement` and is itself an opted-in control, so a slot resolved under the provider would
   * pad that field by its own height and push the `.com` out of the group. Nothing else here would
   * notice — the markup, the geometry and every other computed style are identical either way.
   */
  it("leaves a NativeSelect.Field inside a slot on its own padding", () => {
    const { group, control } = mountGroup(() => (
      <InputGroup
        startElement="https://"
        endElement={
          <NativeSelect.Root size="xs" variant="plain" width="auto">
            <NativeSelect.Field data-probe="slot-control">
              <option value=".com">.com</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        }
      >
        <Input data-probe="control" />
      </InputGroup>
    ));
    const slotStyle = getComputedStyle(queryElement(group, "[data-probe='slot-control']"));

    expect(getComputedStyle(control).paddingLeft).toBe("40px");
    // The `xs` `plain` recipe's own padding, the trailing edge wider to clear the indicator. Under
    // the context both would be the field's own height instead — 32px, since the group has an
    // element over each edge.
    expect(slotStyle.paddingLeft).toBe("8px");
    expect(slotStyle.paddingRight).toBe("24px");
  });

  it("leaves an Input inside a slot on its own padding", () => {
    const { group, control } = mountGroup(() => (
      <InputGroup startElement="@" endElement={<Input data-probe="slot-control" />}>
        <Input data-probe="control" />
      </InputGroup>
    ));
    const slotStyle = getComputedStyle(queryElement(group, "[data-probe='slot-control']"));
    const controlStyle = getComputedStyle(control);

    expect(controlStyle.paddingLeft).toBe("40px");
    expect(controlStyle.paddingRight).toBe("40px");
    expect(slotStyle.paddingLeft).toBe("12px");
    expect(slotStyle.paddingRight).toBe("12px");
  });

  it("collapses the seam between an addon and the control", () => {
    const { group, control } = mountGroup(() => (
      <InputGroup startAddon="https://" endAddon=".com">
        <Input data-probe="control" />
      </InputGroup>
    ));
    const [startAddon, , endAddon] = [...group.children].map((child) => getComputedStyle(child));
    const controlStyle = getComputedStyle(control);

    expect(startAddon?.borderTopLeftRadius).not.toBe("0px");
    expect(startAddon?.borderTopRightRadius).toBe("0px");
    expect(controlStyle.borderTopLeftRadius).toBe("0px");
    expect(controlStyle.borderTopRightRadius).toBe("0px");
    expect(endAddon?.borderTopLeftRadius).toBe("0px");
    expect(endAddon?.borderTopRightRadius).not.toBe("0px");
  });

  it("leaves the row unattached when there is no addon", () => {
    const { control } = mountGroup(() => (
      <InputGroup startElement="@">
        <Input data-probe="control" />
      </InputGroup>
    ));

    expect(getComputedStyle(control).borderTopLeftRadius).not.toBe("0px");
  });

  it("keeps an element between two addons out of the row's count", () => {
    // `InputElement` marks itself `data-group-skip` and `Group` reads a child's position
    // structurally, so the overlay between the addons collects no corner of its own and does not
    // push either addon out of first or last place.
    const { group } = mountGroup(() => (
      <InputGroup startAddon="https://" startElement="@" endAddon=".com">
        <Input data-probe="control" />
      </InputGroup>
    ));
    const [startAddon, overlay, , endAddon] = [...group.children].map((child) =>
      getComputedStyle(child),
    );

    expect(startAddon?.borderTopLeftRadius).not.toBe("0px");
    expect(startAddon?.borderTopRightRadius).toBe("0px");
    expect(endAddon?.borderTopLeftRadius).toBe("0px");
    expect(endAddon?.borderTopRightRadius).not.toBe("0px");
    // The overlay itself is untouched by the seam — it is not in the row at all.
    expect(overlay?.position).toBe("absolute");
  });

  it("places the start element over the leading edge and lets clicks through", () => {
    const { group } = mountGroup(() => (
      <InputGroup startElement="@" endElement=".com">
        <Input data-probe="control" />
      </InputGroup>
    ));
    const [start, , end] = [...group.children].map((child) => getComputedStyle(child));

    expect(start?.pointerEvents).toBe("none");
    // The end element is interactive by default — a clear button is the usual thing to put there.
    expect(end?.pointerEvents).toBe("auto");
  });

  it("lets `startElementProps` take back the pointer events", () => {
    const { group } = mountGroup(() => (
      <InputGroup startElement="@" startElementProps={{ pointerEvents: "auto" }}>
        <Input data-probe="control" />
      </InputGroup>
    ));
    const [start] = [...group.children].map((child) => getComputedStyle(child));

    expect(start?.pointerEvents).toBe("auto");
  });

  it("pins the end element to the trailing edge", () => {
    const { group } = mountGroup(() => (
      <InputGroup endElement=".com">
        <Input data-probe="control" />
      </InputGroup>
    ));
    const end = group.children[0];
    if (!(end instanceof HTMLElement)) {
      throw new Error("expected the end element to render");
    }

    expect(end.getBoundingClientRect().right).toBeCloseTo(group.getBoundingClientRect().right, 1);
  });

  it("renders no addon or element for the slots it was not given", () => {
    const { group } = mountGroup(() => (
      <InputGroup>
        <Input data-probe="control" />
      </InputGroup>
    ));

    expect(group.children.length).toBe(1);
  });

  /**
   * The hazard these four exist for: a JSX-valued **prop** compiles to a lazy getter that runs
   * `createComponent` on every read, and each slot here is read three times in one render — by its
   * gate, by its body, and by the value derived from it (`attached`, or the context boolean the
   * control's padding hangs off). Read raw they are built three times and two copies discarded, and
   * nothing else in this file can see it: the markup, the geometry and the styles are identical
   * either way. Only a count says so.
   *
   * They are four spelled-out cases rather than one `it.each` over the slot names because **the
   * getter is the thing under test**. `<InputGroup {...{ [slot]: <Counted /> }}>` evaluates the
   * element eagerly into an object literal, so the group receives a plain value that no number of
   * reads can rebuild, and the count is 1 however badly the slot is read — the `it.each` spelling
   * stayed green against an implementation that built the slot twice. Only a literal JSX attribute
   * compiles to the lazy getter, so each slot is written out as one.
   */
  function countingComponent(): { component: () => JSX.Element; builds: () => number } {
    let builds = 0;
    return {
      component: () => {
        builds += 1;
        return <span data-testid="slot" />;
      },
      builds: () => builds,
    };
  }

  /** Mounts a group whose slot is the counted component, and pins it to one construction. */
  function expectSlotBuiltOnce(group: (Counted: () => JSX.Element) => JSX.Element): void {
    const { component, builds } = countingComponent();
    mounted = mountElement(() => group(component));

    expect(queryElement(mounted.element, "[data-testid='slot']")).toBeDefined();
    expect(builds()).toBe(1);
  }

  it("builds the `startElement` slot once, not once per read", () => {
    expectSlotBuiltOnce((Counted) => (
      <InputGroup startElement={<Counted />}>
        <Input data-probe="control" />
      </InputGroup>
    ));
  });

  it("builds the `endElement` slot once, not once per read", () => {
    expectSlotBuiltOnce((Counted) => (
      <InputGroup endElement={<Counted />}>
        <Input data-probe="control" />
      </InputGroup>
    ));
  });

  it("builds the `startAddon` slot once, not once per read", () => {
    expectSlotBuiltOnce((Counted) => (
      <InputGroup startAddon={<Counted />}>
        <Input data-probe="control" />
      </InputGroup>
    ));
  });

  it("builds the `endAddon` slot once, not once per read", () => {
    expectSlotBuiltOnce((Counted) => (
      <InputGroup endAddon={<Counted />}>
        <Input data-probe="control" />
      </InputGroup>
    ));
  });

  it("builds no slot it was not given", () => {
    // `children()`'s memo is lazy, so an unpassed slot costs nothing at all.
    const { component: Counted, builds } = countingComponent();
    mounted = mountElement(() => (
      <InputGroup startElement={<Counted />}>
        <Input data-probe="control" />
      </InputGroup>
    ));

    expect(builds()).toBe(1);
  });

  it("hydrates the server's markup", () => {
    // Four conditional slots per group, all resolved through `children()`, which allocates in the
    // ambient owner rather than at the position it is read — so the hydration keys are exactly what
    // has to match, and nothing about the markup or the styles can see it. `hydrateFixture` asserts
    // hydration logged nothing, added and dropped no element, and reused every server node.
    const { container, dispose } = hydrateFixture(inputGroupServerHtml, () => <Tree />);

    const searchControl = queryElement(container, "[data-probe='search-control']");
    const siteControl = queryElement(container, "[data-probe='site-control']");
    const plainControl = queryElement(container, "[data-probe='plain-control']");

    // The padding has to be on the server's own nodes rather than on nodes a fallback rebuilt: a
    // 44px field less the 4px offset, a wrapped control with addons and no element, and a control
    // in a group with no slot at all keeping its recipe's own padding.
    expect(getComputedStyle(searchControl).paddingLeft).toBe("40px");
    expect(getComputedStyle(siteControl).paddingLeft).toBe("12px");
    expect(getComputedStyle(plainControl).paddingLeft).toBe("12px");

    dispose();
  });
});
