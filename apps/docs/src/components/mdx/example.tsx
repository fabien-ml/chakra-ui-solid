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
 * Every file under `src/examples/` is a deliverable rather than a file: `pnpm typecheck` covers it,
 * and `examples/__tests__/examples.browser.test.tsx` **mounts** every one with no console error and
 * a non-empty root. That job used to belong to a story canary; it is here because a story renders a
 * component in a harness we control and an example renders it the way a consumer gets it
 * (`decisions-ledger.md` D-133).
 *
 * **What nothing checks is the other direction.** The suite mounts the files that exist; no test
 * reads the `<Example name>` in an `.mdx` page and asserts a file answers it, so a wrong name ships
 * the fallback below instead of failing a run.
 */
// One directory per component, and the negation is load-bearing: the suite that mounts these files
// sits in a sibling directory that `*/*.tsx` matches, so without it the site imports a test module
// at startup and every route 500s on a `describe()` called outside a runner. The pair is written
// out twice rather than shared, because `import.meta.glob` is compiled away — it reads its
// arguments off the AST, so a `const` holding them is a build error rather than a refactor.
const exampleModules = import.meta.glob<{ default: Component }>(
  ["../../examples/*/*.tsx", "!../../examples/__tests__/**"],
  { eager: true },
);

const exampleSources = import.meta.glob<string>(
  ["../../examples/*/*.tsx", "!../../examples/__tests__/**"],
  { eager: true, query: "?highlight", import: "default" },
);

// Examples live in a directory per component (`examples/dialog/dialog-basic.tsx`), but a page still
// names one by its file name alone — the directory is for whoever opens the folder, not part of the
// address. Basenames are unique across the tree because each one already carries its component.
const byName = <T,>(modules: Record<string, T>): Record<string, T> =>
  Object.fromEntries(
    Object.entries(modules).map(([key, value]) => [
      key.replace(/^.*\//, "").replace(/\.tsx$/, ""),
      value,
    ]),
  );

const modulesByName = byName(exampleModules);
const sourcesByName = byName(exampleSources);

export const exampleNames = Object.keys(modulesByName).sort();

export const exampleComponent = (name: string): Component | undefined =>
  modulesByName[name]?.default;

export function Example(props: { name: string }) {
  const module = () => modulesByName[props.name];
  const source = () => sourcesByName[props.name];

  return (
    <Box my="6">
      <Show
        when={module()}
        fallback={
          // Loud rather than empty, and it is the only thing that catches a wrong name — nothing
          // fails a build over one, so whoever is running `pnpm dev` has to be able to see it.
          <Box as="p" color="fg.error" fontSize="sm">
            No example named “{props.name}” under <code>src/examples/</code>.
          </Box>
        }
      >
        {(loaded) => (
          <Box
            // **A block container, which is what Chakra's own preview is** (`apps/www/components/
            // example.tsx`: a bare `<Box padding="10">`), and the shape every example is written
            // against. It has to fill the width, because `<Stack><Box h="20" /></Stack>` is written
            // with no width of its own and would collapse to nothing if the preview centred it —
            // but a *flex column* fills too much: it blockifies its children, so an example whose
            // root is intrinsically sized, like a lone `IconButton`, is stretched to the full
            // width and a `rounded="full"` circle renders as a pill.
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
