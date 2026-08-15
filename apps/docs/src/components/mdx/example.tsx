import { Dynamic } from "@solidjs/web";
import { Box, IconButton, Tabs } from "chakra-ui-solid";
import type { Component } from "solid-js";
import { createSignal, onCleanup, Show } from "solid-js";
import { embeddedCodePaneClass } from "~/components/mdx/code-pane";
import { CheckIcon, CopyIcon } from "~/components/ui/icons";

/**
 * A live preview and the source of the file that rendered it, split across two tabs
 * (`docs-plan.md` §8.2).
 *
 * Both panes come from **one file**, read at build time — the component from the module, the
 * highlighted code from the same path with `?highlight`, the text the copy button writes with
 * `?raw`. A hand-copied snippet beside a live demo drifts silently and survives every check that
 * exists; this cannot, because there is nothing to copy.
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
// at startup and every route 500s on a `describe()` called outside a runner. The triple is written
// out three times rather than shared, because `import.meta.glob` is compiled away — it reads its
// arguments off the AST, so a `const` holding them is a build error rather than a refactor.
const exampleModules = import.meta.glob<{ default: Component }>(
  ["../../examples/*/*.tsx", "!../../examples/__tests__/**"],
  { eager: true },
);

const exampleHighlighted = import.meta.glob<string>(
  ["../../examples/*/*.tsx", "!../../examples/__tests__/**"],
  { eager: true, query: "?highlight", import: "default" },
);

// The plain text behind the highlighted markup. The copy button owes a reader something they can
// paste into an editor, and Shiki's output is a `<pre>` full of spans — reading it back out of the
// DOM would put the highlighter's whitespace decisions in a consumer's clipboard.
const exampleSources = import.meta.glob<string>(
  ["../../examples/*/*.tsx", "!../../examples/__tests__/**"],
  { eager: true, query: "?raw", import: "default" },
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
const highlightedByName = byName(exampleHighlighted);
const sourcesByName = byName(exampleSources);

export const exampleNames = Object.keys(modulesByName).sort();

export const exampleComponent = (name: string): Component | undefined =>
  modulesByName[name]?.default;

/** Ark's `Clipboard` default, which is what the React version's own copy button feels like. */
const COPIED_FOR_MS = 3000;

/**
 * Writes an example's source to the clipboard and says so for three seconds.
 *
 * `navigator.clipboard` is reached inside the handler rather than at module scope: this component
 * server-renders, and the whole tab it lives in is absent from the prerendered HTML anyway.
 */
function CopyButton(props: { source: string }) {
  const [copied, setCopied] = createSignal(false);
  let reset: ReturnType<typeof setTimeout> | undefined;

  onCleanup(() => clearTimeout(reset));

  const copy = async () => {
    await navigator.clipboard.writeText(props.source);
    setCopied(true);
    clearTimeout(reset);
    reset = setTimeout(() => setCopied(false), COPIED_FOR_MS);
  };

  return (
    <IconButton
      variant="ghost"
      size="sm"
      aria-label={copied() ? "Copied" : "Copy code"}
      onClick={copy}
    >
      <Show when={copied()} fallback={<CopyIcon />}>
        <CheckIcon />
      </Show>
    </IconButton>
  );
}

export function Example(props: { name: string }) {
  const module = () => modulesByName[props.name];
  const highlighted = () => highlightedByName[props.name];
  const source = () => sourcesByName[props.name] ?? "";

  return (
    <Show
      when={module()}
      fallback={
        // Loud rather than empty, and it is the only thing that catches a wrong name — nothing
        // fails a build over one, so whoever is running `pnpm dev` has to be able to see it.
        <Box as="p" color="fg.error" fontSize="sm" my="6">
          No example named “{props.name}” under <code>src/examples/</code>.
        </Box>
      }
    >
      {(loaded) => (
        <Tabs.Root
          variant="subtle"
          size="sm"
          defaultValue="preview"
          // The reader opens a page to read prose, not source — so the code panel is **absent from
          // the prerendered HTML** until Code is clicked, and gone again when Preview is. That is
          // the trade this split was taken for: a page carries up to a dozen examples, and every
          // one of them shipping its whole file twice (once highlighted, once raw) is what the
          // permanently-visible source pane cost.
          lazyMount
          unmountOnExit
          my="6"
        >
          <Tabs.List mb="4" width="full">
            <Tabs.Trigger value="preview">Preview</Tabs.Trigger>
            <Tabs.Trigger value="code">Code</Tabs.Trigger>
          </Tabs.List>

          {/* The group owns the border and the rounding for both panels. Split across the panels
            themselves — the preview rounding its top, the source pane its bottom — the two halves
            only line up while both are mounted, which `lazyMount` above makes untrue. */}
          <Tabs.ContentGroup
            borderWidth="1px"
            borderColor="border"
            borderRadius="l2"
            overflow="hidden"
          >
            <Tabs.Content
              value="preview"
              // **A block container, which is what Chakra's own preview is** (`apps/www/components/
              // example.tsx`: a `<Tabs.Content padding={{ base: "6", sm: "10" }}>`), and the shape
              // every example is written against. It has to fill the width, because
              // `<Stack><Box h="20" /></Stack>` is written with no width of its own and would
              // collapse to nothing if the preview centred it — but a *flex column* fills too much:
              // it blockifies its children, so an example whose root is intrinsically sized, like a
              // lone `IconButton`, is stretched to the full width and a `rounded="full"` circle
              // renders as a pill.
              bg="bg.panel"
              padding={{ base: "6", sm: "10" }}
            >
              <Dynamic component={loaded().default} />
            </Tabs.Content>

            <Tabs.Content value="code" position="relative" bg="bg.subtle" p="0">
              <Box class={embeddedCodePaneClass} innerHTML={highlighted()} />
              <Box position="absolute" top="2" right="2">
                <CopyButton source={source()} />
              </Box>
            </Tabs.Content>
          </Tabs.ContentGroup>
        </Tabs.Root>
      )}
    </Show>
  );
}
