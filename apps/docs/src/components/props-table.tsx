import { Box } from "@chakra-ui-solid/components";
import { For, Show } from "solid-js";
import { propsTables } from "~/generated/props-tables";

/**
 * A generated props table (`docs-site.md` §4.2). **Never hand-written**: a hand-written table
 * omits a new prop silently and a reader concludes the prop does not exist — a failure with no
 * error and no test. This one is regenerated from `packages/components/src/<component>/**` by
 * `scripts/generate-props-tables.mjs` on every `codegen`.
 *
 * A missing entry renders **loudly** rather than as an empty box, because an empty box looks
 * intentional.
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
          <Box my="4">
            <Box as="table" width="full" fontSize="sm" borderCollapse="collapse">
              <thead>
                <tr>
                  <Th>Prop</Th>
                  <Th>Type</Th>
                  <Th>Description</Th>
                </tr>
              </thead>
              <tbody>
                <For each={entry.props}>
                  {(row) => (
                    <tr>
                      <Td>
                        <Box as="code" fontFamily="mono" color="fg">
                          {row.name}
                        </Box>
                        <Show when={row.required}>
                          <Box as="span" color="fg.error" ml="1">
                            *
                          </Box>
                        </Show>
                      </Td>
                      <Td>
                        <Box as="code" fontFamily="mono" fontSize="xs">
                          {row.type}
                        </Box>
                      </Td>
                      <Td>{row.description}</Td>
                    </tr>
                  )}
                </For>
              </tbody>
            </Box>
            <Show when={entry.extends.length > 0}>
              <Box as="p" fontSize="sm" color="fg.muted" mt="2">
                Plus everything it inherits:{" "}
                <For each={entry.extends}>
                  {(base, index) => (
                    <>
                      <Show when={index() > 0}>{", "}</Show>
                      <Box as="code" fontFamily="mono" fontSize="xs">
                        {base}
                      </Box>
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

const Th = (props: { children: string }) => (
  <Box
    as="th"
    textAlign="start"
    fontWeight="semibold"
    color="fg"
    borderBottomWidth="1px"
    borderColor="border"
    px="3"
    py="2"
  >
    {props.children}
  </Box>
);

const Td = (props: { children: unknown }) => (
  <Box
    as="td"
    borderBottomWidth="1px"
    borderColor="border.subtle"
    px="3"
    py="2"
    color="fg.muted"
    verticalAlign="top"
  >
    {props.children as never}
  </Box>
);
