import { css } from "@chakra-ui-solid/styled-system/css";
import { createSignal, For, onSettled, Show } from "solid-js";
import type { TocEntry } from "~/lib/site-map";

/**
 * "On this page" — the right-hand column, from the table of contents the MDX pipeline exports.
 *
 * The headings are collected at **build time** (`rehype-slug` → `@stefanprobst/rehype-extract-toc`
 * → its MDX exporter), so this component reads a module export rather than walking the DOM. The
 * only thing it does in the browser is track which heading is in view, which is a scroll listener
 * and not a second source of truth about the page's structure.
 */
interface FlatEntry {
  value: string;
  id: string;
  depth: number;
}

function flatten(entries: TocEntry[], depth = 0): FlatEntry[] {
  return entries.flatMap((entry) => [
    ...(entry.id === undefined ? [] : [{ value: entry.value, id: entry.id, depth }]),
    ...flatten(entry.children ?? [], depth + 1),
  ]);
}

export function Toc(props: { entries: TocEntry[] }) {
  const items = () => flatten(props.entries);
  const [activeId, setActiveId] = createSignal<string>();

  // `onSettled` is Solid 2.0's component-level setup-and-teardown — 1.x's `onMount` plus
  // `onCleanup`, with the teardown returned rather than registered separately. It runs on the
  // client only, which is what keeps this out of the prerendered HTML.
  onSettled(() => {
    const headings = items()
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => element !== null);
    if (headings.length === 0) {
      return;
    }

    // The topmost heading that has passed under the sticky header. An IntersectionObserver would
    // report the wrong one whenever several headings share a viewport, which is most of this site.
    const update = () => {
      const offset = 120;
      const passed = headings.filter((heading) => heading.getBoundingClientRect().top <= offset);
      setActiveId((passed.at(-1) ?? headings[0])?.id);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  });

  return (
    <Show when={items().length > 0}>
      <nav
        aria-label="On this page"
        class={css({
          display: "none",
          xl: { display: "block" },
          flexShrink: "0",
          width: "16rem",
          px: "2",
          py: "8",
          fontSize: "sm",
          position: "sticky",
          top: "var(--header-height)",
          height: "var(--content-height)",
          overflowY: "auto",
          overscrollBehavior: "contain",
        })}
      >
        <p class={css({ fontWeight: "semibold", color: "fg" })}>On this page</p>
        <ul
          class={css({
            listStyle: "none",
            mt: "3",
            display: "flex",
            flexDirection: "column",
            gap: "2",
          })}
        >
          <For each={items()}>
            {(item) => (
              <li>
                <a
                  href={`#${item.id}`}
                  aria-current={activeId() === item.id ? "page" : undefined}
                  style={{ "margin-inline-start": `${item.depth}rem` }}
                  class={css({
                    display: "block",
                    color: "fg.muted",
                    textDecoration: "none",
                    _hover: { color: "fg" },
                    "&[aria-current=page]": { color: "fg", fontWeight: "medium" },
                  })}
                >
                  {item.value}
                </a>
              </li>
            )}
          </For>
        </ul>
      </nav>
    </Show>
  );
}
