import avatarServerHtml from "virtual:hydration-fixture?id=avatar";
import {
  expectNoA11yViolations,
  hydrateFixture,
  type MountedComponent,
  mount,
} from "@chakra-ui-solid/internal-test-utils";
import type { JSX } from "@solidjs/web";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AvatarStatusChangeDetails } from "../index";
import { Avatar, createAvatar } from "../index";
import { Tree } from "./avatar.ssr-entry";

let mounted: MountedComponent | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

/** The machine defers every `send` by a microtask, so one turn of the queue is the whole wait. */
const settle = () => new Promise<void>((resolve) => queueMicrotask(resolve));

/** A 1×1 transparent GIF, so the `loaded` path runs against a real decode rather than a stub. */
const REAL_IMAGE = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

function partOf(container: ParentNode, part: string): HTMLElement {
  const element = container.querySelector(`[data-part="${part}"]`);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`expected the tree to render a [data-part="${part}"] element`);
  }
  return element;
}

/** A component that records how many times it was really constructed. */
function countingComponent(): { component: () => JSX.Element; builds: () => number } {
  let builds = 0;
  return {
    component: () => {
      builds += 1;
      return <span data-testid="slot">SA</span>;
    },
    builds: () => builds,
  };
}

describe("Avatar — the seam, end to end", () => {
  it("shows a name's initials, in a box the recipe really rounded", () => {
    mounted = mount(() => (
      <Avatar.Root>
        <Avatar.Fallback name="Segun Adebayo" />
      </Avatar.Root>
    ));

    expect(partOf(mounted.container, "fallback").textContent).toBe("SA");

    // A computed style, never a class name: `classList.contains("avatar__root")` passes on an avatar
    // with no rule behind it at all (`CLAUDE.md`, *silent unstyling*).
    //
    // `9999px` is four things resolving at once — the `shape` variant set `--avatar-radius`, the
    // `radii.full` token behind it exists, the root slot class landed on the element, and
    // `.avatar__root { border-radius: var(--avatar-radius) }` landed with it. It comes from the
    // recipe's own `defaultVariants`, which is why no `shape` is passed here and why
    // `AvatarVariantProps` declares no `@default` for it.
    expect(getComputedStyle(partOf(mounted.container, "root")).borderRadius).toBe("9999px");
  });
});

describe("Avatar — the fallback slot", () => {
  it("takes a single word down to one letter", () => {
    mounted = mount(() => (
      <Avatar.Root>
        <Avatar.Fallback name="Segun" />
      </Avatar.Root>
    ));

    expect(partOf(mounted.container, "fallback").textContent).toBe("S");
  });

  it("reads the first and last word, ignoring what is between them", () => {
    mounted = mount(() => (
      <Avatar.Root>
        <Avatar.Fallback name="  Ada  King Lovelace " />
      </Avatar.Root>
    ));

    expect(partOf(mounted.container, "fallback").textContent).toBe("AL");
  });

  it("draws the icon when there is neither a child nor a name", () => {
    mounted = mount(() => (
      <Avatar.Root>
        <Avatar.Fallback />
      </Avatar.Root>
    ));

    const glyph = partOf(mounted.container, "fallback").querySelector("svg");
    expect(glyph).not.toBeNull();
    expect(glyph?.getAttribute("aria-hidden")).toBe("true");
    // `width="1.2em"` is a style prop written as a literal on `chakra.svg`; a class Panda never
    // generated would leave the glyph at its intrinsic size with nothing to say so.
    expect(getComputedStyle(glyph as SVGElement).width).toBe("19.1875px");
  });

  it("falls through to the icon on `null` children, where `??` would render nothing", () => {
    // Chakra's gate is `if (props.children || props.asChild)`, a truthiness test — so an empty
    // expression container is *no* child rather than a child that happens to be empty.
    mounted = mount(() => (
      <Avatar.Root>
        <Avatar.Fallback>{null}</Avatar.Fallback>
      </Avatar.Root>
    ));

    expect(partOf(mounted.container, "fallback").querySelector("svg")).not.toBeNull();
  });

  it("lets a child win over a name", () => {
    mounted = mount(() => (
      <Avatar.Root>
        <Avatar.Fallback name="Segun Adebayo">
          <span data-testid="own">★</span>
        </Avatar.Fallback>
      </Avatar.Root>
    ));

    const fallback = partOf(mounted.container, "fallback");
    expect(fallback.querySelector("[data-testid='own']")).not.toBeNull();
    expect(fallback.textContent).toBe("★");
  });

  it("keeps `name` off the element, where it would be a bare attribute", () => {
    mounted = mount(() => (
      <Avatar.Root>
        <Avatar.Fallback name="Segun Adebayo" />
      </Avatar.Root>
    ));

    expect(partOf(mounted.container, "fallback").getAttribute("name")).toBeNull();
  });

  it("builds a passed child exactly once, not once per read", () => {
    // The whole point of resolving the slot through `children()`. Chakra's gate reads
    // `props.children` and its body reads it again, and a JSX prop is a getter that runs
    // `createComponent` on every read — so the un-resolved spelling builds the child twice and
    // throws one away, which nothing but a counter can see (`CLAUDE.md`, *The second hazard*).
    const { component: Counted, builds } = countingComponent();

    mounted = mount(() => (
      <Avatar.Root>
        <Avatar.Fallback>
          <Counted />
        </Avatar.Fallback>
      </Avatar.Root>
    ));

    expect(mounted.container.querySelector("[data-testid='slot']")).not.toBeNull();
    expect(builds()).toBe(1);
  });

  it("still builds it once when a `name` is there for the gate to fall through", () => {
    const { component: Counted, builds } = countingComponent();

    mounted = mount(() => (
      <Avatar.Root>
        <Avatar.Fallback name="Segun Adebayo">
          <Counted />
        </Avatar.Fallback>
      </Avatar.Root>
    ));

    expect(builds()).toBe(1);
  });
});

describe("Avatar — the image, and the machine behind it", () => {
  it("hides the image and shows the fallback until the file has decoded", () => {
    mounted = mount(() => (
      <Avatar.Root>
        <Avatar.Image src="/never-resolves.png" alt="Segun Adebayo" />
        <Avatar.Fallback name="Segun Adebayo" />
      </Avatar.Root>
    ));

    expect((partOf(mounted.container, "image") as HTMLImageElement).hidden).toBe(true);
    expect(partOf(mounted.container, "image").dataset.state).toBe("hidden");
    expect(partOf(mounted.container, "fallback").hidden).toBe(false);
    expect(partOf(mounted.container, "fallback").dataset.state).toBe("visible");
  });

  it("swaps to the image once it loads, and calls `onStatusChange`", async () => {
    const statuses: AvatarStatusChangeDetails[] = [];

    mounted = mount(() => (
      <Avatar.Root onStatusChange={(details) => statuses.push(details)}>
        <Avatar.Image src={REAL_IMAGE} alt="Segun Adebayo" />
        <Avatar.Fallback name="Segun Adebayo" />
      </Avatar.Root>
    ));

    const container = mounted.container;
    await vi.waitFor(() => {
      expect((partOf(container, "image") as HTMLImageElement).hidden).toBe(false);
    });

    expect(partOf(container, "fallback").hidden).toBe(true);
    expect(statuses).toEqual([{ status: "loaded" }]);
  });

  it("reports `error` when the file never arrives, and keeps the fallback up", async () => {
    const statuses: AvatarStatusChangeDetails[] = [];

    mounted = mount(() => (
      <Avatar.Root onStatusChange={(details) => statuses.push(details)}>
        <Avatar.Image src="data:image/gif;base64,not-an-image" alt="Segun Adebayo" />
        <Avatar.Fallback name="Segun Adebayo" />
      </Avatar.Root>
    ));

    const container = mounted.container;
    await vi.waitFor(() => {
      expect(statuses).toEqual([{ status: "error" }]);
    });

    expect(partOf(container, "fallback").hidden).toBe(false);
  });

  it("keeps `draggable` when a wrapper forwards it unset", () => {
    // `merge` resolves a key by presence, so a default written as a JSX attribute before the spread
    // is deleted by a forwarded `undefined`. These two are `withDefaults`, which resolves by value.
    mounted = mount(() => (
      <Avatar.Root>
        <Avatar.Image src={REAL_IMAGE} alt="Segun Adebayo" draggable={undefined} />
      </Avatar.Root>
    ));

    expect(partOf(mounted.container, "image").getAttribute("draggable")).toBe("false");
  });

  it("keeps `referrerpolicy` when a wrapper forwards it unset", () => {
    mounted = mount(() => (
      <Avatar.Root>
        <Avatar.Image src={REAL_IMAGE} alt="Segun Adebayo" referrerpolicy={undefined} />
      </Avatar.Root>
    ));

    expect(partOf(mounted.container, "image").getAttribute("referrerpolicy")).toBe("no-referrer");
  });

  it("lets a consumer override either default", () => {
    mounted = mount(() => (
      <Avatar.Root>
        <Avatar.Image
          src={REAL_IMAGE}
          alt="Segun Adebayo"
          draggable="true"
          referrerpolicy="origin"
        />
      </Avatar.Root>
    ));

    expect(partOf(mounted.container, "image").getAttribute("draggable")).toBe("true");
    expect(partOf(mounted.container, "image").getAttribute("referrerpolicy")).toBe("origin");
  });
});

describe("Avatar — ids", () => {
  it("seeds every part's id from the Root's `id`, rather than naming the element with it", () => {
    mounted = mount(() => (
      <Avatar.Root id="team">
        <Avatar.Image src={REAL_IMAGE} alt="Segun Adebayo" />
        <Avatar.Fallback name="Segun Adebayo" />
      </Avatar.Root>
    ));

    expect(partOf(mounted.container, "root").id).toBe("avatar:team");
    expect(partOf(mounted.container, "image").id).toBe("avatar:team:image");
    expect(partOf(mounted.container, "fallback").id).toBe("avatar:team:fallback");
  });

  it("lets a consumer `id` on a part reach the element, last-wins", () => {
    // No part component strips `id`; the machine's own goes on first and the consumer's replaces it.
    mounted = mount(() => (
      <Avatar.Root id="team">
        <Avatar.Fallback id="mine" name="Segun Adebayo" />
      </Avatar.Root>
    ));

    expect(partOf(mounted.container, "fallback").id).toBe("mine");
  });

  it("takes `ids` on the Root as the documented override", () => {
    mounted = mount(() => (
      <Avatar.Root id="team" ids={{ fallback: "chosen" }}>
        <Avatar.Fallback name="Segun Adebayo" />
      </Avatar.Root>
    ));

    expect(partOf(mounted.container, "fallback").id).toBe("chosen");
  });
});

describe("Avatar — the styles the slot recipe really generated", () => {
  // Computed styles, never class names: a Panda class whose CSS was never generated renders nothing
  // and raises no error, so `classList.contains("avatar__root")` passes on an avatar with no size,
  // no fill and no rounding at all (`CLAUDE.md`, *silent unstyling*).

  it("sizes the box from the `size` variant, through the root's custom property", () => {
    // `--avatar-size` is set by the variant and read by `.avatar__root { width: var(--avatar-size) }`,
    // so each number here is the token, the variant rule and the base rule all resolving.
    for (const [size, width] of [
      ["2xs", "24px"],
      ["xs", "32px"],
      ["sm", "36px"],
      ["md", "40px"],
      ["lg", "44px"],
      ["xl", "48px"],
      ["2xl", "64px"],
    ] as const) {
      mounted?.dispose();
      mounted = mount(() => (
        <Avatar.Root size={size}>
          <Avatar.Fallback name="Segun Adebayo" />
        </Avatar.Root>
      ));

      expect(getComputedStyle(partOf(mounted.container, "root")).width, size).toBe(width);
    }
  });

  it("keeps the default `md` when `size` is left unset", () => {
    // The recipe's own `defaultVariants`, not a literal restated on the Root — which is why
    // `AvatarVariantProps` declares no `@default` for it.
    mounted = mount(() => (
      <Avatar.Root>
        <Avatar.Fallback name="Segun Adebayo" />
      </Avatar.Root>
    ));

    expect(getComputedStyle(partOf(mounted.container, "root")).width).toBe("40px");
  });

  it("rounds the corners by `shape`, and `square` is the arm that sets no property at all", () => {
    // `square` declares an empty body, so `border-radius: var(--avatar-radius)` resolves against an
    // unset custom property and falls back to the initial value. Asserting it is what proves the
    // other two arms are a variant rule rather than the base.
    for (const [shape, radius] of [
      ["square", "0px"],
      ["full", "9999px"],
    ] as const) {
      mounted?.dispose();
      mounted = mount(() => (
        <Avatar.Root shape={shape}>
          <Avatar.Fallback name="Segun Adebayo" />
        </Avatar.Root>
      ));

      expect(getComputedStyle(partOf(mounted.container, "root")).borderRadius, shape).toBe(radius);
    }

    mounted?.dispose();
    mounted = mount(() => (
      <Avatar.Root shape="rounded">
        <Avatar.Fallback name="Segun Adebayo" />
      </Avatar.Root>
    ));

    const rounded = getComputedStyle(partOf(mounted.container, "root")).borderRadius;
    expect(rounded).not.toBe("0px");
    expect(rounded).not.toBe("9999px");
  });

  it("fills the box by `variant`, and only `outline` draws a border", () => {
    const backgrounds = new Map<string, string>();

    for (const variant of ["solid", "subtle", "outline"] as const) {
      mounted?.dispose();
      mounted = mount(() => (
        <Avatar.Root variant={variant} colorPalette="green">
          <Avatar.Fallback name="Segun Adebayo" />
        </Avatar.Root>
      ));

      const style = getComputedStyle(partOf(mounted.container, "root"));
      backgrounds.set(variant, style.backgroundColor);
      expect(style.borderWidth, variant).toBe(variant === "outline" ? "1px" : "0px");
    }

    // Three variants that all computed the same fill would pass every assertion above while the
    // variant layer did nothing.
    expect(new Set(backgrounds.values()).size).toBe(3);
  });

  it("crops the image to the same radius the root carries", () => {
    mounted = mount(() => (
      <Avatar.Root shape="full">
        <Avatar.Image src={REAL_IMAGE} alt="Segun Adebayo" />
      </Avatar.Root>
    ));

    const style = getComputedStyle(partOf(mounted.container, "image"));
    expect(style.borderRadius).toBe("9999px");
    expect(style.objectFit).toBe("cover");
  });
});

describe("Avatar — a machine the consumer owns", () => {
  it("drives a RootProvider from outside", async () => {
    const Subject = () => {
      const avatar = createAvatar({ id: "owned" });
      return (
        <>
          <button type="button" onClick={() => avatar.setLoaded()}>
            mark loaded
          </button>
          <Avatar.RootProvider value={avatar}>
            <Avatar.Image src={REAL_IMAGE} alt="Segun Adebayo" />
            <Avatar.Fallback name="Segun Adebayo" />
          </Avatar.RootProvider>
        </>
      );
    };

    mounted = mount(() => <Subject />);
    const container = mounted.container;

    expect(partOf(container, "root").id).toBe("avatar:owned");
    expect(partOf(container, "fallback").hidden).toBe(false);

    (container.querySelector("button") as HTMLButtonElement).click();
    await settle();

    // The store is an object of getters over the live machine, so the parts re-read it rather than
    // holding the snapshot they were built with.
    expect(partOf(container, "fallback").hidden).toBe(true);
    expect(partOf(container, "image").dataset.state).toBe("visible");
  });

  it("hands the machine to a render prop", () => {
    mounted = mount(() => (
      <Avatar.Root>
        <Avatar.Context>
          {(avatar) => <span>{avatar.loaded ? "loaded" : "loading"}</span>}
        </Avatar.Context>
        <Avatar.Fallback name="Segun Adebayo" />
      </Avatar.Root>
    ));

    expect(mounted.container.querySelector("span")?.textContent).toBe("loading");
  });
});

describe("Avatar — accessibility", () => {
  it("has no axe violations with a name, an image, or the bare icon", async () => {
    mounted = mount(() => (
      <div>
        <Avatar.Root>
          <Avatar.Fallback name="Segun Adebayo" />
        </Avatar.Root>
        <Avatar.Root>
          <Avatar.Image src={REAL_IMAGE} alt="Segun Adebayo" />
          <Avatar.Fallback name="Segun Adebayo" />
        </Avatar.Root>
        <Avatar.Root>
          <Avatar.Fallback />
        </Avatar.Root>
      </div>
    ));

    await expectNoA11yViolations(mounted.container);
  });

  it("has no axe violations once the image has taken over", async () => {
    mounted = mount(() => (
      <Avatar.Root>
        <Avatar.Image src={REAL_IMAGE} alt="Segun Adebayo" />
        <Avatar.Fallback name="Segun Adebayo" />
      </Avatar.Root>
    ));

    const container = mounted.container;
    await vi.waitFor(() => {
      expect((partOf(container, "image") as HTMLImageElement).hidden).toBe(false);
    });

    await expectNoA11yViolations(container);
  });

  it("has no axe violations across a group", async () => {
    mounted = mount(() => <Tree />);

    await expectNoA11yViolations(mounted.container);
  });
});

describe("Avatar — server render, then hydrate", () => {
  it("reuses every server node across all three fallback shapes and both groups", () => {
    // The half neither other project can see. `Avatar.Fallback` picks one of three shapes out of a
    // `children()` call and each spends a different number of hydration keys, so a server that took
    // one branch where the client takes another shifts everything after it. `hydrate()` then either
    // claims a server node under a different client tree or gives up and client-renders, and **both
    // are silent**: the markup and the styles still look right.
    const { container, dispose } = hydrateFixture(avatarServerHtml, () => <Tree />);

    expect(container.querySelector('[data-probe="named-fallback"]')?.textContent).toBe("SA");
    expect(container.querySelector('[data-probe="iconic-fallback"] svg')).not.toBeNull();
    expect(container.querySelector('[data-probe="pictured-child"]')?.textContent).toBe("SA");

    dispose();
  });

  it("agrees about `data-group-item`, which only a context read decides", () => {
    // The one attribute here whose presence is a fact about *where* the element sits rather than
    // about what it was passed. A provider that moved between the two builds would leave it — and
    // the ring the preset keys on it — on the server's markup and not on the hydrated tree.
    const { container, dispose } = hydrateFixture(avatarServerHtml, () => <Tree />);

    for (const probe of ["row-first", "row-second", "lone-only"]) {
      const avatar = container.querySelector(`[data-probe="${probe}"]`);
      expect(avatar?.getAttribute("data-group-item"), probe).toBe("");
    }

    for (const probe of ["named", "iconic", "pictured"]) {
      const avatar = container.querySelector(`[data-probe="${probe}"]`);
      expect(avatar?.hasAttribute("data-group-item"), probe).toBe(false);
    }

    // The ring itself, computed — the grouped pair carries one and the lone avatar does not, which
    // is Chakra's early return expressed as a rule rather than a withheld attribute.
    expect(
      getComputedStyle(container.querySelector('[data-probe="row-first"]') as HTMLElement)
        .borderWidth,
    ).toBe("2px");
    expect(
      getComputedStyle(container.querySelector('[data-probe="lone-only"]') as HTMLElement)
        .borderWidth,
    ).toBe("0px");

    dispose();
  });

  it("keeps every generated id across the round trip", () => {
    // `createUniqueId()` is a different function in the server build and the hydrating client build,
    // and they only agree while both walk the same counter. Five Roots call it here, so an id that
    // shifted would leave a part addressed by the machine under a name nothing else uses.
    const { container, dispose } = hydrateFixture(avatarServerHtml, () => <Tree />);

    const root = container.querySelector('[data-probe="pictured"]');
    const image = container.querySelector('[data-probe="pictured-image"]');
    expect(image?.id).toBe(`${root?.id}:image`);

    dispose();
  });
});
