import { Box, IconButton } from "chakra-ui-solid";
import { MoonIcon, SunIcon } from "~/components/site/icons";
import { colorMode, toggleColorMode } from "~/lib/color-mode";

/**
 * The site's colour-mode switch.
 *
 * **The glyph is chosen by the cascade, not by the signal.** Both icons are rendered and one is
 * hidden per mode, so the button shows the right thing on the very first paint — the same reason
 * the pre-paint script exists (`~/lib/color-mode`).
 *
 * Only the accessible name reads the signal, and it is **stale until the first toggle** when the
 * mode comes from `prefers-color-scheme` rather than from storage: the server renders the
 * light-mode wording, and Solid does not re-run the attribute expression while claiming the node
 * during hydration. Pre-dates this component using `IconButton`; the fix belongs in
 * `~/lib/color-mode`, not here.
 *
 * The frame is the `button` recipe and nothing else: `size="sm"` is the 36px square this used to
 * spell as `boxSize="9"`, and the base gives it the centring, the radius, the cursor and the
 * focus-visible ring that used to be eleven style props here.
 */
export function ColorModeToggle() {
  return (
    <IconButton
      variant="ghost"
      size="sm"
      onClick={() => toggleColorMode()}
      aria-label={colorMode() === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* `display` is a style prop and must not reach the `<svg>`, so the per-mode toggle sits on a
        span around each glyph. The glyph needs no sizing — the recipe sets `:where(svg)` to 16px at
        this size. */}
      <Box as="span" display="inline-flex" _dark={{ display: "none" }}>
        <SunIcon />
      </Box>
      <Box as="span" display="inline-flex" _light={{ display: "none" }}>
        <MoonIcon />
      </Box>
    </IconButton>
  );
}
