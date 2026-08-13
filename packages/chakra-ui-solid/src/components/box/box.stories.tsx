import type { JSX } from "@solidjs/web";
import { createSignal } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Box } from "./box";

/**
 * Box in Storybook — a **local playground**, never user-facing docs and never a gate
 * (`testing.md` §7). Nothing automated opens these; what proves Box works is the docs page in
 * `apps/docs`, where it is used the way a consumer uses it (D-133). These exist so a human can look
 * at the thing, so **a broken one here costs a debugging session and nothing else.**
 *
 * **Storybook controls cannot drive a style prop, and that is the governing constraint rather than
 * a limitation of these stories.** Panda reads style-prop values out of the *source text* at build
 * time, so `<Box p={args.padding}>` computes a class whose rule was never generated: no error, no
 * warning, no style. `check:style-contract` rule 1 rejects it here for the same reason the docs
 * playground offers only pre-generated value sets (`docs-site.md` §4.4). The one dynamic value a
 * control *can* supply is a CSS custom property — the last story is that route.
 */
const meta = {
  title: "System/Box",
  component: Box,
  parameters: {
    // No controls panel. Every story here renders a fixed tree, so a control would move and nothing
    // would happen — and the props a control *could* reach on Box are DOM attributes, which is not
    // what anyone opens a Box story to change. A component whose props include real behavior
    // (`open`, `modal`, `orientation`) turns this back on for those props.
    controls: { disable: true },
  },
} satisfies Meta<typeof Box>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Spacing and semantic colour tokens, the two most common style props on any page. */
export const StyleProps: Story = {
  render: () => (
    <Box p="4" bg="bg.panel" color="fg" borderWidth="1px" borderColor="border" borderRadius="l2">
      p="4" bg="bg.panel"
    </Box>
  ),
};

/**
 * A conditional style prop. Panda compiles `_hover` into a real `:hover` rule at build time, so
 * hovering this box is the whole assertion — there is no runtime style engine involved.
 */
export const ConditionalStyles: Story = {
  render: () => (
    <Box
      p="4"
      bg="bg.panel"
      color="fg"
      borderWidth="1px"
      borderColor="border"
      borderRadius="l2"
      cursor="pointer"
      _hover={{ bg: "bg.emphasized", borderColor: "border.emphasized" }}
    >
      hover me
    </Box>
  ),
};

/**
 * `gapX` is one of the 17 shorthands Chakra has and Panda does not, which our preset adds back
 * through `utilities.extend` (D-112). Without that alias `gapX` is an unknown prop, forwarded to
 * the DOM as an attribute, and the two children sit flush against each other.
 */
export const AliasedShorthand: Story = {
  render: () => (
    <Box
      display="flex"
      gapX="4"
      p="4"
      bg="bg.panel"
      color="fg"
      borderRadius="l2"
      borderWidth="1px"
      borderColor="border"
    >
      <Box p="2" bg="bg.emphasized" borderRadius="l1">
        first
      </Box>
      <Box p="2" bg="bg.emphasized" borderRadius="l1">
        second
      </Box>
    </Box>
  ),
};

/**
 * The responsive array form: base value first, then one per breakpoint, exactly Chakra's semantics.
 * Resize the preview pane to see it — it is `@media` rules in the stylesheet, nothing more.
 */
export const Responsive: Story = {
  render: () => (
    <Box p={["2", "4", "8"]} bg="bg.panel" color="fg" borderRadius="l2" borderWidth="1px">
      p={["2", "4", "8"]}
    </Box>
  ),
};

/** `as` swaps the element and keeps every computed style. */
export const As: Story = {
  render: () => (
    <Box as="section" p="4" bg="bg.panel" color="fg" borderRadius="l2" borderWidth="1px">
      rendered as &lt;section&gt;
    </Box>
  ),
};

/**
 * The `render` prop is polymorphism's other half, and it is a **function** receiving the computed
 * props — never a JSX element and never `asChild`. A Solid JSX element is an already-constructed
 * node by the time it reaches us and there is no `cloneElement`, so accepting one could only mean
 * dropping every prop Box computed (`component-blueprint.md` §3.5).
 *
 * The cast is the one every `render` target that is not a `div` needs, because Box's props are a
 * `div`'s (`composition.mdx`, *The `render` Prop*).
 */
export const RenderProp: Story = {
  render: () => (
    <Box
      p="4"
      bg="bg.panel"
      color="fg"
      borderRadius="l2"
      borderWidth="1px"
      render={(props) => (
        <article {...(props as JSX.HTMLAttributes<HTMLElement>)}>
          rendered as &lt;article&gt;
        </article>
      )}
    />
  ),
};

/**
 * The `css` escape hatch, in both forms Chakra accepts. It outranks the style props beside it, and
 * the array form merges left to right — so this box is padded `8`, not `2`.
 */
export const CssEscapeHatch: Story = {
  render: () => (
    <Box
      p="2"
      css={[{ padding: "8" }, { bg: "bg.panel", color: "fg", borderRadius: "l2" }]}
      borderWidth="1px"
    >
      css=&#123;[&#123; padding: "8" &#125;, …]&#125; beats p="2"
    </Box>
  ),
};

/**
 * The route every genuinely dynamic value takes, and the only one a control could ever drive.
 *
 * The class is static — `w="var(--box-story-width)"` is a literal string Panda extracts at build
 * time — and the *value* arrives through an inline `style`, which outranks every class. Written the
 * obvious way instead (`w={width()}`), this renders at no width at all, silently, and passes any
 * assertion that reads a class name (`plan.md` §3.5 route 3).
 */
export const DynamicWidthThroughACustomProperty: Story = {
  render: () => {
    const [width, setWidth] = createSignal(160);

    return (
      <Box display="flex" flexDirection="column" gapY="4" alignItems="flex-start">
        <input
          type="range"
          min={80}
          max={320}
          value={width()}
          onInput={(event) => setWidth(event.currentTarget.valueAsNumber)}
          aria-label="Box width in pixels"
        />
        <Box
          style={{ "--box-story-width": `${width()}px` }}
          w="var(--box-story-width)"
          p="4"
          bg="bg.panel"
          color="fg"
          borderRadius="l2"
          borderWidth="1px"
        >
          {width()}px
        </Box>
      </Box>
    );
  },
};
