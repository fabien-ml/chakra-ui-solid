import { type MountedComponent, mount } from "@chakra-ui-solid/internal-test-utils";
import type { JSX } from "@solidjs/web";
import { afterEach, describe, expect, it } from "vitest";
import { Group } from "../../group";
import { Avatar, AvatarGroup } from "../index";

let mounted: MountedComponent | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

function roots(container: ParentNode): HTMLElement[] {
  return [...container.querySelectorAll('[data-scope="avatar"][data-part="root"]')].filter(
    (element): element is HTMLElement => element instanceof HTMLElement,
  );
}

const ringOf = (element: HTMLElement) => getComputedStyle(element).borderWidth;

function Person(props: { name: string; children?: JSX.Element }) {
  return (
    <Avatar.Root>
      <Avatar.Fallback name={props.name} />
      {props.children}
    </Avatar.Root>
  );
}

/**
 * Computed `border-width` throughout, never a class name: the ring is one declaration in the
 * preset's avatar recipe (`&[data-group-item] { border-width: 2px }`), and a class whose CSS was
 * never generated passes a `classList.contains` on an avatar with no ring at all.
 *
 * `2px` is the number chakra-ui.com's own Group example computes, measured there before this was
 * written; `0px` is what the same element computes with `data-group-item` taken off it.
 */
describe("AvatarGroup — the ring, and who writes the attribute", () => {
  it("rings three avatars in an AvatarGroup", () => {
    mounted = mount(() => (
      <AvatarGroup>
        <Person name="Segun Adebayo" />
        <Person name="Ada Lovelace" />
        <Person name="Grace Hopper" />
      </AvatarGroup>
    ));

    const avatars = roots(mounted.container);
    expect(avatars).toHaveLength(3);
    for (const avatar of avatars) {
      expect(avatar.getAttribute("data-group-item")).toBe("");
      expect(ringOf(avatar)).toBe("2px");
    }
  });

  it("rings three avatars in a plain Group, which is why the marker lives on Group", () => {
    // Chakra's ring comes from `Group` rather than from `AvatarGroup` — its own overflow example is
    // a plain `<Group>` of avatars — so a marker published anywhere else would leave this unringed.
    mounted = mount(() => (
      <Group>
        <Person name="Segun Adebayo" />
        <Person name="Ada Lovelace" />
        <Person name="Grace Hopper" />
      </Group>
    ));

    for (const avatar of roots(mounted.container)) {
      expect(ringOf(avatar)).toBe("2px");
    }
  });

  it("leaves a lone avatar unringed, as Chakra's early return does", () => {
    // Upstream never reaches the CSS: `Group` returns its children untouched when only one is in the
    // row, so the attribute is never written. A context marker cannot count siblings, so ours writes
    // it and `Group`'s own base suppresses the width — the attribute is still there, which is the
    // residue recorded in `__internal__/decisions.md`.
    mounted = mount(() => (
      <AvatarGroup>
        <Person name="Segun Adebayo" />
      </AvatarGroup>
    ));

    const [avatar] = roots(mounted.container);
    expect(avatar?.getAttribute("data-group-item")).toBe("");
    expect(ringOf(avatar as HTMLElement)).toBe("0px");
  });

  it("counts the row the way the seam does, so a skipped sibling leaves one avatar alone", () => {
    // Chakra's *second* early return — `validChildArray.length === 1` — fires when a row has several
    // children but only one that is not skipped. Both selectors here are already skip-aware, so this
    // case needs nothing of its own.
    mounted = mount(() => (
      <AvatarGroup>
        <Person name="Segun Adebayo" />
        <span data-group-skip="">not in the row</span>
      </AvatarGroup>
    ));

    expect(ringOf(roots(mounted.container)[0] as HTMLElement)).toBe("0px");
  });

  it("gives an `outline` avatar the group ring, not its own thinner border", () => {
    // A **cross-package** interaction, which is why it is pinned rather than left implied. The ring
    // is a *base* declaration of the preset's avatar recipe and `variant="outline"`'s `1px` is a
    // *variant* one, and a flat variant rule beat the conditional base one regardless of
    // specificity — so this computed `1px`, where chakra-ui.com computes `2px` (both measured).
    // `@chakra-ui-solid/panda-preset` copies each conditional base block into the variant values,
    // which puts a `--variant_outline[data-group-item]` rule beside `--variant_outline` in one
    // layer and hands the decision back to specificity: `0,2,0` over `0,1,0`. A change to that
    // copying would flip this back silently, and nothing else in this suite would notice.
    mounted = mount(() => (
      <AvatarGroup variant="outline">
        <Person name="Segun Adebayo" />
        <Person name="Ada Lovelace" />
      </AvatarGroup>
    ));

    for (const avatar of roots(mounted.container)) {
      expect(ringOf(avatar)).toBe("2px");
    }

    // The same avatar on its own keeps the variant's own border, which is what makes the assertion
    // above about the group rather than about `outline` losing everywhere.
    mounted.dispose();
    mounted = mount(() => (
      <Avatar.Root variant="outline">
        <Avatar.Fallback name="Segun Adebayo" />
      </Avatar.Root>
    ));

    expect(ringOf(roots(mounted.container)[0] as HTMLElement)).toBe("1px");
  });

  it("zeroes the ring under `borderless`, through the same selector", () => {
    mounted = mount(() => (
      <AvatarGroup borderless>
        <Person name="Segun Adebayo" />
        <Person name="Ada Lovelace" />
        <Person name="Grace Hopper" />
      </AvatarGroup>
    ));

    for (const avatar of roots(mounted.container)) {
      expect(avatar.getAttribute("data-group-item")).toBe("");
      expect(ringOf(avatar)).toBe("0px");
    }
  });

  it("keeps the attribute when a wrapper forwards `data-group-item` unset", () => {
    // The attribute is a merge source placed after the consumer's props rather than a JSX attribute
    // before them, because `merge` resolves a key by presence — written the other way round, this
    // avatar would delete its own ring (`CLAUDE.md`, *The third hazard*).
    mounted = mount(() => (
      <AvatarGroup>
        <Avatar.Root data-group-item={undefined}>
          <Avatar.Fallback name="Segun Adebayo" />
        </Avatar.Root>
        <Person name="Ada Lovelace" />
        <Person name="Grace Hopper" />
      </AvatarGroup>
    ));

    const [first] = roots(mounted.container);
    expect(first?.getAttribute("data-group-item")).toBe("");
    expect(ringOf(first as HTMLElement)).toBe("2px");
  });

  it("supplies its variants to every avatar below, and a local prop still wins", () => {
    mounted = mount(() => (
      <AvatarGroup size="lg">
        <Person name="Segun Adebayo" />
        <Avatar.Root size="2xl">
          <Avatar.Fallback name="Ada Lovelace" />
        </Avatar.Root>
      </AvatarGroup>
    ));

    const [inherited, own] = roots(mounted.container);
    expect(getComputedStyle(inherited as HTMLElement).width).toBe("44px");
    expect(getComputedStyle(own as HTMLElement).width).toBe("64px");
  });

  it("closes the gap and overlaps the row, from two style props that really generated CSS", () => {
    // `gap="0"` and `spaceX="-3"` are literals on a JSX element, which is what keeps them
    // statically extractable — the whole reason they are not a `withDefaults` pair. A class Panda
    // never generated would leave the row spaced normally, with nothing to say so.
    mounted = mount(() => (
      <AvatarGroup>
        <Person name="Segun Adebayo" />
        <Person name="Ada Lovelace" />
      </AvatarGroup>
    ));

    const group = mounted.container.querySelector(".chakra-group") as HTMLElement;
    const [first, second] = [...group.children] as HTMLElement[];

    expect(getComputedStyle(group).gap).toBe("0px");
    expect(getComputedStyle(first as HTMLElement).marginInlineStart).toBe("0px");
    expect(getComputedStyle(second as HTMLElement).marginInlineStart).toBe("-12px");
  });

  it("keeps the recipe's variant keys off the group element", () => {
    mounted = mount(() => (
      <AvatarGroup size="lg" shape="rounded">
        <Person name="Segun Adebayo" />
        <Person name="Ada Lovelace" />
      </AvatarGroup>
    ));

    const group = mounted.container.querySelector(".chakra-group");
    expect(group?.getAttribute("size")).toBeNull();
    expect(group?.getAttribute("shape")).toBeNull();
  });
});
