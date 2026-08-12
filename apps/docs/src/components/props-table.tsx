import type { JSX } from "@solidjs/web";
import { Box, Stack } from "chakra-ui-solid";
import { For, Show } from "solid-js";
import type { PropRow } from "~/generated/props-tables";
import { propsTables } from "~/generated/props-tables";

/**
 * A generated props table (`docs-site.md` §4.2). **Never hand-written**: a hand-written table
 * omits a new prop silently and a reader concludes the prop does not exist — a failure with no
 * error and no test. This one is regenerated from `packages/chakra-ui-solid/src/components/<component>/**` by
 * `scripts/generate-props-tables.mjs` on every `codegen`.
 *
 * **Three columns, and they are chakra-ui.com's**: `Prop`, `Default`, `Type` — with the type and
 * the description stacked in that last cell rather than split into a fourth column. A reader
 * comparing the two sites is comparing the same shape, which is the whole point of a 1:1 port.
 *
 * **Every table names its own interface, in a `<caption>`.** chakra-ui.com never needs this — their
 * `PropTable` is keyed by a single `part`, so one call is one table. Ours is keyed by a component
 * *directory*, and five of them hold more than one interface, so an unscoped call renders several
 * tables in a row. Unlabelled, a reader cannot tell which component each belongs to, and the
 * failure arrives **later than the page it breaks**: a page written when its directory held one
 * interface silently grows a second anonymous table the day a sibling component ships beside it.
 * That is how `color-swatch` shipped two. Labelling here rather than in the pages is what makes it
 * unrepeatable — a page cannot forget, and a scoped call is self-describing too.
 *
 * A `<caption>` rather than a heading: it is the element HTML has for naming a table, it is
 * announced with the table by a screen reader, and it keeps the page's table of contents a list of
 * the author's sections rather than of type names.
 *
 * The interface **name** only, never its `description` — that field is the JSDoc above the
 * declaration, which is written for whoever maintains the component and reads as noise to whoever
 * is looking up a prop.
 *
 * A missing entry renders **loudly** rather than as an empty box, because an empty box looks
 * intentional. An entry with no rows is a different thing and says so in a row of its own: some
 * components really do add no prop of their own, and `Container`'s two are variants the recipe
 * owns rather than members of any interface here.
 */
export function PropsTable(props: { component: string; interface?: string }) {
  const entries = () => {
    const all = propsTables[props.component] ?? [];
    return props.interface === undefined
      ? all
      : all.filter((entry) => entry.name === props.interface);
  };

  return (
    <Show
      when={entries().length > 0}
      fallback={
        <Box as="p" color="fg.error" fontSize="sm">
          No generated props table for “{props.component}”. Run <code>pnpm codegen</code>.
        </Box>
      }
    >
      <For each={entries()}>
        {(entry) => (
          // The two code cells below read `colorPalette.fg`, and the palette is scoped here so they
          // do not follow the page. chakra-ui.com's table accents the same two cells through
          // `accent.fg`, a semantic token this preset does not ship, so teal is the nearest thing
          // that keeps a default and a type visually distinct from the prose around them.
          <Box my="6" colorPalette="teal">
            <Box borderWidth="1px" borderColor="border" borderRadius="l2" overflowX="auto">
              <Box as="table" width="full" fontSize="sm" borderCollapse="collapse">
                <Caption>{entry.name}</Caption>
                <thead>
                  <tr>
                    <Th>Prop</Th>
                    <Th>Default</Th>
                    <Th>Type</Th>
                  </tr>
                </thead>
                <tbody>
                  <Show
                    when={entry.props.length > 0}
                    fallback={
                      <tr>
                        <Td colSpan={3}>No props to display</Td>
                      </tr>
                    }
                  >
                    <For each={entry.props}>{(row) => <Row {...row} />}</For>
                  </Show>
                </tbody>
              </Box>
            </Box>
            <Show when={entry.extends.length > 0}>
              <Box as="p" fontSize="sm" color="fg.muted" mt="2">
                Plus everything it inherits:{" "}
                <For each={entry.extends}>
                  {(base, index) => (
                    <>
                      <Show when={index() > 0}>{", "}</Show>
                      <Code>{base}</Code>
                    </>
                  )}
                </For>
                . Those are the whole style-prop surface and the DOM attributes of the element it
                renders — several hundred names, listed here as their sources rather than expanded.
              </Box>
            </Show>
          </Box>
        )}
      </For>
    </Show>
  );
}

function Row(props: PropRow) {
  return (
    <tr>
      <Td width="36">
        <Code fontWeight="bold" color="fg">
          {props.name}
        </Code>
        <Show when={props.required}>
          <Box as="span" color="fg.error" ms="1">
            *
          </Box>
        </Show>
      </Td>
      <Td width="28">
        <Show
          when={props.defaultValue !== null}
          fallback={
            // chakra-ui.com puts a minus icon here; no Icon component has shipped, and an em dash
            // says the same thing without inventing one.
            <Box as="span" color="fg.subtle" aria-label="no default">
              —
            </Box>
          }
        >
          <Code color="colorPalette.fg">{show(props.defaultValue)}</Code>
        </Show>
      </Td>
      <Td>
        <Stack gap="2" align="start">
          <Code color="colorPalette.fg">{props.type.replaceAll('"', "'")}</Code>
          <Show when={props.description !== ""}>
            <Box as="p" fontSize="sm">
              {props.description}
            </Box>
          </Show>
        </Stack>
      </Td>
    </tr>
  );
}

/**
 * A default shown the way chakra-ui.com shows one: a string in single quotes, everything else as
 * written. `4 / 3` is an expression, not a token, so quoting it would say the prop takes the
 * string.
 */
function show(value: string | null): string {
  if (value === null) {
    return "";
  }
  return /^[{[]|[\s/]|^(true|false|\d+(\.\d+)?)$/.test(value) ? value : `'${value}'`;
}

const Code = (props: { children: unknown; color?: string; fontWeight?: string }) => (
  <Box
    as="code"
    fontFamily="mono"
    fontSize="xs"
    bg="bg.muted"
    borderRadius="l1"
    px="1.5"
    py="0.5"
    color={props.color}
    fontWeight={props.fontWeight}
  >
    {props.children as never}
  </Box>
);

/**
 * The interface's name, as the table's own caption.
 *
 * `captionSide: "top"` is written out rather than left to the default: it *is* the default in every
 * engine, and it is also the one declaration that decides whether the label reads as a title or as
 * a footnote — an inherited default that silently flipped would be a wrong answer that still looks
 * deliberate.
 */
const Caption = (props: { children: string }) => (
  <Box
    as="caption"
    captionSide="top"
    textAlign="start"
    fontFamily="mono"
    fontSize="xs"
    fontWeight="semibold"
    color="fg"
    bg="bg.subtle"
    borderBottomWidth="1px"
    borderColor="border"
    px="4"
    py="2"
  >
    {props.children}
  </Box>
);

const Th = (props: { children: string }) => (
  <Box
    as="th"
    textAlign="start"
    fontWeight="semibold"
    color="fg"
    bg="bg.subtle"
    borderBottomWidth="1px"
    borderColor="border"
    px="4"
    height="10"
  >
    {props.children}
  </Box>
);

const Td = (props: { children: unknown; width?: string; colSpan?: number }) => (
  <Box
    as="td"
    borderBottomWidth="1px"
    borderColor="border.subtle"
    px="4"
    py="2"
    color="fg.muted"
    verticalAlign="top"
    width={props.width}
    // The span is a `td` attribute, and Box types its props against `HTMLAttributes<HTMLElement>`
    // which `as` never re-types — so the one cell that spans the table reaches it through `render`,
    // exactly as `box.mdx` documents. Solid spells it `colspan`, as HTML does.
    render={
      props.colSpan === undefined
        ? undefined
        : (cellProps) => (
            <td
              {...(cellProps as JSX.TdHTMLAttributes<HTMLTableCellElement>)}
              colspan={props.colSpan}
            >
              {cellProps.children}
            </td>
          )
    }
  >
    {props.children as never}
  </Box>
);
