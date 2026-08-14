import { type MountedComponent, mount } from "@chakra-ui-solid/internal-test-utils";
import { type CardVariantProps, card } from "@chakra-ui-solid/styled-system/recipes";
import type { ComponentProps, JSX, ValidComponent } from "@solidjs/web";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { renderStyled } from "../../render-styled/render-styled";
import { withContextDefaults } from "../../utils/defaults";
import { createSlotRecipeContext } from "../slot-recipe-context";

/**
 * The multi-part seam against a real stylesheet. Every assertion reads a **computed style**, never a
 * class name: under Panda `sva()` computes a class and never injects a rule, so
 * `classList.contains("card__body")` passes on a completely unstyled element.
 *
 * `card` is a real generated slot recipe rather than a hand-written class map, so these break if the
 * seam stops carrying what a recipe actually emits. The three values they read:
 * `.card__body { padding: var(--card-padding) }` against `--card-padding` set per size on the root
 * (`md` → 24px, `sm` → 16px), and `.card__title { font-weight: 600 }`.
 */

type CardSlot = "root" | "header" | "body" | "footer" | "title" | "description";

interface CardRootProps extends ComponentProps<"div">, CardVariantProps {
  unstyled?: boolean;
}

const {
  withProvider,
  withContext,
  useStyles,
  StylesProvider,
  resolveSlotClasses,
  PropsProvider,
  usePropsContext,
} = createSlotRecipeContext<CardSlot, CardRootProps, CardVariantProps>({
  name: "Card",
  recipe: card,
  variantKeys: ["size", "variant"],
});

const Root = withProvider("div", "root");
/** A part's own props declare `as`, the way a real component's do — the seam reads it either way. */
type BodyProps = ComponentProps<"div"> & { as?: ValidComponent };

const Body = withContext<BodyProps>("div", "body");
/** The `Field.ErrorIcon` shape: an element the recipe has no slot for. */
const Ornament = withContext<ComponentProps<"span">>("span");

let mounted: MountedComponent | undefined;

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

function render(ui: () => JSX.Element): HTMLElement {
  mounted = mount(ui);
  return mounted.container;
}

const probe = (container: ParentNode, name: string): HTMLElement => {
  const element = container.querySelector(`[data-probe="${name}"]`);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`expected the tree to render a [data-probe="${name}"] element`);
  }
  return element;
};

describe("createSlotRecipeContext — the Root and its parts", () => {
  it("dresses the Root in its own slot and every part in theirs", () => {
    const container = render(() => (
      <Root data-probe="root">
        <Body data-probe="body" />
      </Root>
    ));

    // `--card-padding` is declared by the root's size variant and read by the body's slot, so this
    // one value says both classes landed.
    expect(getComputedStyle(probe(container, "body")).padding).toBe("24px");
    expect(getComputedStyle(probe(container, "root")).display).toBe("flex");
  });

  it("keeps a variant prop off the element, and re-resolves every slot when it changes", () => {
    const [size, setSize] = createSignal<"sm" | "md">("md");
    const container = render(() => (
      <Root data-probe="root" size={size()}>
        <Body data-probe="body" />
      </Root>
    ));

    // A recipe input is not an attribute, and `size` is not a style prop for `renderStyled` to
    // swallow — forwarded, it would reach the DOM.
    expect(probe(container, "root").getAttribute("size")).toBeNull();
    expect(getComputedStyle(probe(container, "body")).padding).toBe("24px");

    flush(() => setSize("sm"));

    expect(getComputedStyle(probe(container, "body")).padding).toBe("16px");
  });

  it("empties every slot below when the Root is `unstyled`", () => {
    const container = render(() => (
      <Root data-probe="root" unstyled>
        <Body data-probe="body" />
      </Root>
    ));

    expect(getComputedStyle(probe(container, "root")).display).toBe("block");
    expect(getComputedStyle(probe(container, "body")).padding).toBe("0px");
  });

  it("takes `as` on a minted component", () => {
    const container = render(() => (
      <Root>
        <Body as="section" data-probe="body" />
      </Root>
    ));

    expect(probe(container, "body").tagName).toBe("SECTION");
    expect(getComputedStyle(probe(container, "body")).padding).toBe("24px");
  });

  it("names the family when a part is rendered with no Root above it", () => {
    expect(() => {
      const { dispose } = mount(() => <Body />);
      dispose();
    }).toThrow(/Card sub-components must be rendered inside a Card root component/);
  });

  it("renders a slot-less part anywhere, since there is no class for it to miss", () => {
    const container = render(() => <Ornament data-probe="ornament" />);

    expect(probe(container, "ornament").tagName).toBe("SPAN");
  });
});

describe("createSlotRecipeContext — the props context", () => {
  it("supplies the Root's props from above, and a local prop still wins", () => {
    const container = render(() => (
      <PropsProvider value={{ size: "sm" }}>
        <Root>
          <Body data-probe="inherited" />
        </Root>
        <Root size="lg">
          <Body data-probe="local" />
        </Root>
      </PropsProvider>
    ));

    expect(getComputedStyle(probe(container, "inherited")).padding).toBe("16px");
    expect(getComputedStyle(probe(container, "local")).padding).toBe("28px");
  });

  it("keeps the provider's value when a Root forwards the same prop unset", () => {
    // `merge` resolves a key by presence, so a wrapper forwarding an unset `size` would otherwise
    // beat the provider with `undefined` and the subtree would lose its size.
    const container = render(() => (
      <PropsProvider value={{ size: "sm" }}>
        <Root size={undefined}>
          <Body data-probe="body" />
        </Root>
      </PropsProvider>
    ));

    expect(getComputedStyle(probe(container, "body")).padding).toBe("16px");
  });
});

describe("createSlotRecipeContext — the seams a hand-written body uses", () => {
  it("hands a part its slot through `useStyles`", () => {
    // The `Field.Label` shape: a part that merges something of its own and so cannot be minted.
    function Title(props: ComponentProps<"h3">): JSX.Element {
      const styles = useStyles();
      return renderStyled<ComponentProps<"h3">>({
        as: "h3",
        props,
        recipeClass: () => styles().title,
      });
    }

    const container = render(() => (
      <Root>
        <Title data-probe="title">Total</Title>
      </Root>
    ));

    expect(getComputedStyle(probe(container, "title")).fontWeight).toBe("600");
  });

  it("lets a Root that owns more than an element publish the classes itself", () => {
    // `Field.Root`'s shape: it owns a store as well as an element, so it resolves the recipe with
    // `resolveSlotClasses` and publishes it with `StylesProvider` rather than being minted.
    function OwnRoot(props: CardRootProps): JSX.Element {
      // `withContextDefaults`, never a spread: a spread reads `props.children` here and builds every
      // part below outside the provider this body is about to open.
      const merged = withContextDefaults(props, usePropsContext());
      const slots = resolveSlotClasses(merged);
      return (
        <StylesProvider value={slots}>
          {renderStyled<CardRootProps>({
            as: "div",
            props: merged,
            recipeClass: () => slots().root,
          })}
        </StylesProvider>
      );
    }

    const container = render(() => (
      <OwnRoot size="sm" data-probe="root">
        <Body data-probe="body" />
      </OwnRoot>
    ));

    expect(getComputedStyle(probe(container, "body")).padding).toBe("16px");
  });

  it("wraps the Root's element in a context of the family's own", () => {
    // `Alert.Root`'s shape: the recipe gives it every slot, and the one thing the seam cannot supply
    // is the status its indicator reads.
    let wrappedSize: string | undefined;
    const WrappedRoot = withProvider("div", "root", {
      wrapElement(element, props) {
        wrappedSize = props.size as string | undefined;
        return <div data-probe="wrapper">{element}</div>;
      },
    });

    const container = render(() => (
      <WrappedRoot size="sm">
        <Body data-probe="body" />
      </WrappedRoot>
    ));

    expect(probe(container, "wrapper").firstElementChild).toBe(
      probe(container, "body").parentElement,
    );
    expect(wrappedSize).toBe("sm");
    expect(getComputedStyle(probe(container, "body")).padding).toBe("16px");
  });
});
