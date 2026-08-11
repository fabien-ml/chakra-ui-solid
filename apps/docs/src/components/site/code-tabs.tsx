import { Dynamic, type JSX } from "@solidjs/web";
import { Box } from "chakra-ui-solid";
import { createSignal, For, Show } from "solid-js";

export interface CodeTab {
  /** Stable across renders — it is half of every `id` the ARIA wiring below needs. */
  id: string;
  label: string;
  /**
   * The glyph beside the label, as a *component* rather than an element. A JSX element built at
   * module scope is evaluated on import and breaks SSR; holding the function defers it to render.
   * Typed to match `~/components/site/icons` — every attribute there is optional, so `Dynamic`
   * mounting it with no props is well-formed.
   */
  icon?: (props: JSX.SvgSVGAttributes<SVGSVGElement>) => JSX.Element;
  /** Shiki's `<pre class="shiki">…`, produced at build time by the `?highlight` plugin. */
  html: string;
}

/**
 * The code panel on the design-system section — chakra-ui.com renders it with their own `Tabs`.
 *
 * Ours is written by hand, because `Tabs` ships at step 8 (`roadmap.md` §4) and this is site chrome
 * rather than library surface (`docs-site.md` §3.2 row 11). It is the ARIA tabs pattern and nothing
 * more: roving `tabindex`, arrow keys, `aria-controls` both ways. **Replace it with the real
 * component the phase Tabs lands** — that is the whole reason the shape is kept this plain.
 *
 * Every panel is in the prerendered HTML, hidden rather than unmounted, so the code is readable
 * before hydration and indexable after it.
 */
export function CodeTabs(props: { label: string; items: CodeTab[] }) {
  const [selected, setSelected] = createSignal(0);
  const tabs: HTMLElement[] = [];

  const focusTab = (index: number) => {
    setSelected(index);
    tabs[index]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const count = props.items.length;
    const current = selected();
    const next = {
      ArrowRight: (current + 1) % count,
      ArrowLeft: (current - 1 + count) % count,
      Home: 0,
      End: count - 1,
    }[event.key];

    if (next !== undefined) {
      event.preventDefault();
      focusTab(next);
    }
  };

  return (
    <Box borderWidth="1px" borderColor="border.muted" borderRadius="l3" bg="bg.panel" p="2">
      <Box
        role="tablist"
        aria-label={props.label}
        onKeyDown={onKeyDown}
        display="flex"
        gap="1"
        p="1"
      >
        <For each={props.items}>
          {(item, index) => {
            const isSelected = () => selected() === index();

            return (
              <Box
                ref={(element: HTMLElement) => {
                  tabs[index()] = element;
                }}
                role="tab"
                id={`${item.id}-tab`}
                aria-controls={`${item.id}-panel`}
                aria-selected={isSelected() ? "true" : "false"}
                tabindex={isSelected() ? 0 : -1}
                onClick={() => setSelected(index())}
                display="inline-flex"
                alignItems="center"
                gap="2"
                px="3"
                py="2"
                fontSize="sm"
                fontWeight="medium"
                borderRadius="l2"
                cursor="pointer"
                focusRing="outside"
                bg={isSelected() ? "colorPalette.subtle" : "transparent"}
                color={isSelected() ? "colorPalette.fg" : "fg.muted"}
                render={(renderProps) => (
                  <button
                    {...(renderProps as JSX.ButtonHTMLAttributes<HTMLButtonElement>)}
                    type="button"
                  >
                    {renderProps.children}
                  </button>
                )}
              >
                <Show when={item.icon}>{(icon) => <Dynamic component={icon()} />}</Show>
                {item.label}
              </Box>
            );
          }}
        </For>
      </Box>

      <For each={props.items}>
        {(item, index) => (
          <Box
            role="tabpanel"
            id={`${item.id}-panel`}
            aria-labelledby={`${item.id}-tab`}
            hidden={selected() !== index()}
            tabindex="0"
            mt="1"
            borderRadius="l2"
            bg="bg.subtle"
            focusRing="outside"
            // Shiki hands back its own `<pre class="shiki">`, so those two elements are reached by
            // descendant selectors — which is what the `css` escape hatch is for. Each token
            // carries a `--shiki-light` / `--shiki-dark` pair rather than a committed colour, so
            // the colour-mode switch is a cascade choice and nothing is re-highlighted in the
            // browser.
            css={{
              "& pre": {
                overflowX: "auto",
                p: "4",
                fontSize: "sm",
                lineHeight: "tall",
                color: "var(--shiki-light)",
              },
              "& span": { color: "var(--shiki-light)" },
              _dark: {
                "& pre": { color: "var(--shiki-dark)" },
                "& span": { color: "var(--shiki-dark)" },
              },
            }}
            innerHTML={item.html}
          />
        )}
      </For>
    </Box>
  );
}
