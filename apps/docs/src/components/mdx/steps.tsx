import type { JSX } from "@solidjs/web";
import { Box } from "chakra-ui-solid";
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
    <Box display="flex" flexDirection="column" mt="8" mb="6">
      <For each={items()}>
        {(step, index) => (
          <Box display="flex" gap="4" alignItems="stretch">
            <Box display="flex" flexDirection="column" alignItems="center">
              <Box
                as="span"
                aria-hidden="true"
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink="0"
                width="7"
                height="7"
                borderRadius="l2"
                layerStyle="fill.subtle"
                fontSize="sm"
                fontWeight="medium"
                color="colorPalette.fg"
              >
                {index() + 1}
              </Box>
              <Box as="span" aria-hidden="true" flex="1" width="1px" bg="border" mt="2" />
            </Box>
            <Box flex="1" minW="0" pb="8">
              {step}
            </Box>
          </Box>
        )}
      </For>
    </Box>
  );
}

export function Step(props: { title: string; children?: JSX.Element }) {
  return (
    <div>
      <Box as="h3" fontSize="md" fontWeight="semibold" color="fg" mt="0.5" mb="2">
        {props.title}
      </Box>
      {props.children}
    </div>
  );
}
