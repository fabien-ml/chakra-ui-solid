import { css } from "@chakra-ui-solid/styled-system/css";
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
        <p class={css({ color: "fg.error", fontSize: "sm" })}>
          No generated props table for “{props.component}”. Run <code>pnpm codegen</code>.
        </p>
      }
    >
      <For each={entries()}>
        {(entry) => (
          <div class={css({ my: "4" })}>
            <table class={css({ width: "full", fontSize: "sm", borderCollapse: "collapse" })}>
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
                        <code class={css({ fontFamily: "mono", color: "fg" })}>{row.name}</code>
                        <Show when={row.required}>
                          <span class={css({ color: "fg.error", ml: "1" })}>*</span>
                        </Show>
                      </Td>
                      <Td>
                        <code class={css({ fontFamily: "mono", fontSize: "xs" })}>{row.type}</code>
                      </Td>
                      <Td>{row.description}</Td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
            <Show when={entry.extends.length > 0}>
              <p class={css({ fontSize: "sm", color: "fg.muted", mt: "2" })}>
                Plus everything it inherits:{" "}
                <For each={entry.extends}>
                  {(base, index) => (
                    <>
                      <Show when={index() > 0}>{", "}</Show>
                      <code class={css({ fontFamily: "mono", fontSize: "xs" })}>{base}</code>
                    </>
                  )}
                </For>
                . Those are the whole style-prop surface and the DOM attributes of the element it
                renders — several hundred names, listed here as their sources rather than expanded.
              </p>
            </Show>
          </div>
        )}
      </For>
    </Show>
  );
}

const Th = (props: { children: string }) => (
  <th
    class={css({
      textAlign: "start",
      fontWeight: "semibold",
      color: "fg",
      borderBottomWidth: "1px",
      borderColor: "border",
      px: "3",
      py: "2",
    })}
  >
    {props.children}
  </th>
);

const Td = (props: { children: unknown }) => (
  <td
    class={css({
      borderBottomWidth: "1px",
      borderColor: "border.subtle",
      px: "3",
      py: "2",
      color: "fg.muted",
      verticalAlign: "top",
    })}
  >
    {props.children as never}
  </td>
);
