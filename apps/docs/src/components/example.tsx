import { Dynamic } from "@solidjs/web";
import { Box } from "chakra-ui-solid";
import type { Component } from "solid-js";
import { Show } from "solid-js";

/**
 * A live preview fused to the source of the file that rendered it (`docs-plan.md` §8.2).
 *
 * Both panes come from **one file**, read at build time — the component from the module, the
 * highlighted code from the same path with `?highlight`. A hand-copied snippet beside a live demo
 * drifts silently and survives every check that exists; this cannot, because there is nothing to
 * copy.
 *
 * Every file under `src/examples/` is a deliverable rather than a file: `check:docs-examples`
 * typechecks it, asserts it imports only subpaths that exist, **mounts** it with no console error
 * and a non-empty root, and runs axe over it. That job used to belong to a story canary; it is
 * here because a story renders a component in a harness we control and an example renders it the
 * way a consumer gets it (`decisions-ledger.md` D-133).
 */
const exampleModules = import.meta.glob<{ default: Component }>("../examples/*.tsx", {
  eager: true,
});

const exampleSources = import.meta.glob<string>("../examples/*.tsx", {
  eager: true,
  query: "?highlight",
  import: "default",
});

const keyFor = (name: string) => `../examples/${name}.tsx`;

export const exampleNames = Object.keys(exampleModules)
  .map((key) => key.replace("../examples/", "").replace(/\.tsx$/, ""))
  .sort();

export const exampleComponent = (name: string): Component | undefined =>
  exampleModules[keyFor(name)]?.default;

export function Example(props: { name: string }) {
  const module = () => exampleModules[keyFor(props.name)];
  const source = () => exampleSources[keyFor(props.name)];

  return (
    <Box my="6">
      <Show
        when={module()}
        fallback={
          // Loud rather than empty. `check:docs-examples` fails the build on a missing example,
          // but whoever is running `pnpm dev` should see which name is wrong rather than a gap.
          <Box as="p" color="fg.error" fontSize="sm">
            No example named “{props.name}” under <code>src/examples/</code>.
          </Box>
        }
      >
        {(loaded) => (
          <Box
            // A column that **stretches**, not a centred row: an example is ported from Chakra's
            // own docs, where the preview is a block container, so `<Stack><Box h="20" /></Stack>`
            // is written with no width of its own. Centred, every one of those collapses to zero
            // width and the preview renders an empty box.
            display="flex"
            flexDirection="column"
            alignItems="stretch"
            justifyContent="center"
            borderWidth="1px"
            borderColor="border"
            borderTopRadius="l2"
            bg="bg.panel"
            px="6"
            py="10"
          >
            <Dynamic component={loaded().default} />
          </Box>
        )}
      </Show>
      <Show when={source()}>
        {(html) => (
          <Box
            // Shiki hands back its own `<pre class="shiki">`, so those two elements are reached by
            // descendant selectors — which is what the `css` escape hatch is for. Each token
            // carries a `--shiki-light` / `--shiki-dark` pair instead of a committed colour, which
            // is what makes the colour-mode switch a cascade choice: nothing is re-highlighted in
            // the browser.
            css={{
              "& pre": {
                overflowX: "auto",
                borderWidth: "1px",
                borderTopWidth: "0",
                borderColor: "border",
                borderBottomRadius: "l2",
                bg: "bg.subtle",
                p: "4",
                fontSize: "sm",
                // `tall`, not Chakra v2's `relaxed` — the v3 preset renamed the scale, and an
                // unknown token is emitted as its own name (`line-height: relaxed`), which the
                // browser drops with no error.
                lineHeight: "tall",
                color: "var(--shiki-light)",
              },
              "& span": { color: "var(--shiki-light)" },
              _dark: {
                "& pre": { color: "var(--shiki-dark)" },
                "& span": { color: "var(--shiki-dark)" },
              },
            }}
            innerHTML={html()}
          />
        )}
      </Show>
    </Box>
  );
}
