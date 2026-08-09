import { css } from "@chakra-ui-solid/styled-system/css";
import { Dynamic } from "@solidjs/web";
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
 * way a consumer gets it (`decisions.md` D-133).
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

const previewClass = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderWidth: "1px",
  borderColor: "border",
  borderTopRadius: "l2",
  bg: "bg.panel",
  px: "6",
  py: "10",
});

/**
 * Shiki hands back its own `<pre class="shiki">`, so the pane is styled through a descendant
 * selector rather than by putting a class on an element we do not render. Each token carries a
 * `--shiki-light` / `--shiki-dark` pair instead of a committed colour, which is what makes the
 * colour-mode switch a cascade choice — nothing is re-highlighted in the browser.
 */
const sourceClass = css({
  "& pre": {
    overflowX: "auto",
    borderWidth: "1px",
    borderTopWidth: "0",
    borderColor: "border",
    borderBottomRadius: "l2",
    bg: "bg.subtle",
    p: "4",
    fontSize: "sm",
    lineHeight: "relaxed",
    color: "var(--shiki-light)",
  },
  "& span": { color: "var(--shiki-light)" },
  _dark: {
    "& pre": { color: "var(--shiki-dark)" },
    "& span": { color: "var(--shiki-dark)" },
  },
});

export function Example(props: { name: string }) {
  const module = () => exampleModules[keyFor(props.name)];
  const source = () => exampleSources[keyFor(props.name)];

  return (
    <div class={css({ my: "6" })}>
      <Show
        when={module()}
        fallback={
          // Loud rather than empty. `check:docs-examples` fails the build on a missing example,
          // but whoever is running `pnpm dev` should see which name is wrong rather than a gap.
          <p class={css({ color: "fg.error", fontSize: "sm" })}>
            No example named “{props.name}” under <code>src/examples/</code>.
          </p>
        }
      >
        {(loaded) => (
          <div class={previewClass}>
            <Dynamic component={loaded().default} />
          </div>
        )}
      </Show>
      <Show when={source()}>{(html) => <div class={sourceClass} innerHTML={html()} />}</Show>
    </div>
  );
}
