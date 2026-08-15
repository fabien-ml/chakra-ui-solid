import { createSignal, flush, merge } from "solid-js";
import { describe, expect, it } from "vitest";
import { mergeProps } from "../../zag/merge-props";
import { omitProps } from "../omit-props";

/** A props bag that is a **lazy proxy** — what a machine part hands every component here. */
function lazyBag<Props extends object>(props: Props): Props {
  return mergeProps(() => props) as Props;
}

describe("omitProps", () => {
  it("hides the listed keys", () => {
    const rest = omitProps({ id: "x", size: "sm" }, "size");

    expect(Object.keys(rest)).toEqual(["id"]);
    expect("size" in rest).toBe(false);
  });

  it("hides them from a lazy props source too", () => {
    const rest = omitProps(lazyBag({ id: "x", size: "sm" }), "size");

    expect(Object.keys(rest)).toEqual(["id"]);
    expect((rest as Record<string, unknown>).size).toBeUndefined();
  });

  it("keeps the omission when the result is merged again", () => {
    // The defect this exists for. Solid's own `omit` forwards every unknown key of a proxied
    // source, including the internal symbol `merge` tags its results with — so the next `merge`
    // mistakes the omit for the bag it wraps, unwraps it, and merges back the keys that were
    // hidden. `variant`/`size` and every style prop reached the DOM as attributes on any component
    // composed through a `render` prop.
    const elementProps = merge(omitProps(lazyBag({ id: "x", size: "sm" }), "size"), {
      class: "computed",
    });

    expect(Object.keys(elementProps).sort()).toEqual(["class", "id"]);
    expect((elementProps as Record<string, unknown>).size).toBeUndefined();
  });

  it("keeps the remaining keys reactive", () => {
    const [label, setLabel] = createSignal("open");
    const rest = omitProps(
      lazyBag({
        get "aria-label"() {
          return label();
        },
        size: "sm",
      }),
      "size",
    );

    expect(rest["aria-label"]).toBe("open");
    // Solid 2.0's client build defers a plain write to a microtask.
    flush(() => setLabel("close"));
    expect(rest["aria-label"]).toBe("close");
  });

  it("reads nothing at call time", () => {
    let reads = 0;
    const props = {
      get id() {
        reads++;
        return "x";
      },
      size: "sm",
    };

    const rest = omitProps(lazyBag(props), "size");
    expect(reads).toBe(0);
    void rest.id;
    expect(reads).toBe(1);
  });
});
