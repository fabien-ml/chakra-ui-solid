import { type MountedComponent, mount } from "@chakra-ui-solid/internal-test-utils";
import { afterEach, describe, expect, it } from "vitest";
// The docs app's **own** generated stylesheet — the caption's own declarations live in it, and
// without it `captionSide` and `display` read UA defaults and assert nothing.
import "../../../styled-system/styles.css";
import { propsTables } from "../../generated/props-tables";
import { PropsTable } from "../props-table";

/**
 * **Every props table names the interface it is showing.**
 *
 * The bug this pins shipped: `<PropsTable component="color-swatch" />` rendered `ColorSwatchProps`
 * and `ColorSwatchMixProps` one after the other with nothing to say which was which. Our tables are
 * keyed by a component *directory*, and five directories hold more than one interface, so the
 * failure is not a page's mistake — it is a page written correctly against a directory that later
 * grew a sibling. Nothing on the page errors; a reader simply reads the wrong table.
 *
 * So the assertion is made against **the generated data**, over every directory at once, rather
 * than against the one page that happened to break. A component added to the library with a second
 * interface fails here rather than shipping an anonymous table.
 */
let mounted: MountedComponent | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

function captionsFor(component: string, iface?: string): string[] {
  mounted = mount(() => <PropsTable component={component} interface={iface} />);
  return [...mounted.container.querySelectorAll("table")].map(
    (table) => table.querySelector("caption")?.textContent ?? "",
  );
}

const directories = Object.keys(propsTables);

describe("every props table names its interface", () => {
  it("holds only real components", () => {
    // `scripts/generate-props-tables.mjs` walks `src/components/*`, which contains `__tests__`
    // alongside the components. It used to emit that as a component of its own, and the filter that
    // hid it lived here — in the consumer, where the next consumer would not know to repeat it.
    expect(directories.filter((name) => name.startsWith("__"))).toEqual([]);
  });

  it.each(directories)("%s", (component) => {
    const expected = (propsTables[component] ?? []).map((entry) => entry.name);

    // In order, so a caption cannot be right by coincidence on a directory with two interfaces
    // whose tables were rendered the other way round.
    expect(captionsFor(component)).toEqual(expected);
  });

  it("leads with the interface the directory is named after", () => {
    // Order is the only thing that says which of several tables is the page's subject. Interfaces
    // arrive in filename order, which put `StackSeparatorProps` above `StackProps` on the Stack
    // page, `GridItemProps` above `GridProps`, and `ButtonGroupProps` above `ButtonProps`.
    const pascal = (component: string) =>
      `${component
        .split("-")
        .map((word) => `${word[0]?.toUpperCase() ?? ""}${word.slice(1)}`)
        .join("")}Props`;

    for (const component of directories) {
      const names = (propsTables[component] ?? []).map((entry) => entry.name);
      if (names.includes(pascal(component))) {
        expect(names[0], component).toBe(pascal(component));
      }
    }
  });

  it("covers every directory with more than one interface", () => {
    // The subset the bug actually lives in, named so that deleting the loop above cannot quietly
    // take the interesting cases with it.
    const multiple = directories.filter((name) => (propsTables[name] ?? []).length > 1);

    expect(multiple.length).toBeGreaterThan(0);
    for (const component of multiple) {
      const captions = captionsFor(component);
      expect(new Set(captions).size, component).toBe(captions.length);
      mounted?.dispose();
      mounted = undefined;
    }
  });

  it("names the one table a scoped call renders", () => {
    expect(captionsFor("color-swatch", "ColorSwatchMixProps")).toEqual(["ColorSwatchMixProps"]);
  });
});

describe("the caption itself", () => {
  it("is painted as a heading above its table, not as an unstyled footnote", () => {
    // Computed styles, never class names — a `<caption>` whose CSS was never generated renders as
    // bare text *below* the table in some engines, which reads as a note about the table above it
    // (`CLAUDE.md`, *silent unstyling*).
    mounted = mount(() => <PropsTable component="color-swatch" />);
    const caption = mounted.container.querySelector("caption");
    if (!(caption instanceof HTMLElement)) {
      throw new Error("expected the table to carry a caption");
    }
    const style = getComputedStyle(caption);

    expect(style.captionSide).toBe("top");
    expect(style.display).toBe("table-caption");
    expect(style.textAlign).toBe("start");
    expect(style.fontWeight).toBe("600");
    expect(style.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
  });

  it("shows the interface name and not its JSDoc", () => {
    // The generated `description` is the comment above the declaration, written for whoever
    // maintains the component — `ColorSwatchProps`' runs to four lines about `VARIANT_KEYS`.
    const entry = (propsTables["color-swatch"] ?? [])[0];
    expect(entry?.description).not.toBe("");

    mounted = mount(() => <PropsTable component="color-swatch" />);
    const caption = mounted.container.querySelector("caption");

    expect(caption?.textContent).toBe("ColorSwatchProps");
  });
});
