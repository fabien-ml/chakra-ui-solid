import { css } from "@chakra-ui-solid/styled-system/css";
import type { JSX } from "@solidjs/web";
import { For, children as resolveChildren } from "solid-js";

/**
 * A numbered setup sequence, as chakra-ui.com renders `:::steps` on its install pages.
 *
 * Theirs is a `Timeline` slot recipe; ours is drawn here, because the docs site's own chrome is
 * ours to build and `Timeline` has not shipped (`docs-site.md` §3.2 row 11). The connector is a
 * left border on the content column rather than a separate element, so a step's height and its
 * line cannot disagree.
 *
 * Steps are authored as `<Step title="…">` children rather than through a remark container
 * directive: MDX already renders JSX, and a directive would be a second authoring dialect for one
 * component.
 */
export function Steps(props: { children?: JSX.Element }) {
  const resolved = resolveChildren(() => props.children);
  const items = () => resolved.toArray();

  return (
    <div class={css({ display: "flex", flexDirection: "column", mt: "8", mb: "6" })}>
      <For each={items()}>
        {(step, index) => (
          <div class={css({ display: "flex", gap: "4", alignItems: "stretch" })}>
            <div class={css({ display: "flex", flexDirection: "column", alignItems: "center" })}>
              <span
                class={css({
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: "0",
                  width: "7",
                  height: "7",
                  borderRadius: "l2",
                  layerStyle: "fill.subtle",
                  fontSize: "sm",
                  fontWeight: "medium",
                  color: "colorPalette.fg",
                })}
                aria-hidden="true"
              >
                {index() + 1}
              </span>
              <span
                class={css({ flex: "1", width: "1px", bg: "border", mt: "2" })}
                aria-hidden="true"
              />
            </div>
            <div class={css({ flex: "1", minW: "0", pb: "8" })}>{step}</div>
          </div>
        )}
      </For>
    </div>
  );
}

export function Step(props: { title: string; children?: JSX.Element }) {
  return (
    <div>
      <h3 class={css({ fontSize: "md", fontWeight: "semibold", color: "fg", mt: "0.5", mb: "2" })}>
        {props.title}
      </h3>
      {props.children}
    </div>
  );
}
