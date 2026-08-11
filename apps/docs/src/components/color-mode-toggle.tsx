import type { JSX } from "@solidjs/web";
import { Box } from "chakra-ui-solid";
import { MoonIcon, SunIcon } from "~/components/site/icons";
import { colorMode, toggleColorMode } from "~/lib/color-mode";

/**
 * The site's colour-mode switch.
 *
 * **The glyph is chosen by the cascade, not by the signal.** Both icons are rendered and one is
 * hidden per mode, so the button shows the right thing on the very first paint — the same reason
 * the pre-paint script exists (`~/lib/color-mode`). Only the accessible name reads the signal,
 * and an attribute is not a paint: Solid re-runs the expression when it claims the node during
 * hydration, so the name is correct from the first client render even though the prerendered HTML
 * carries the light-mode wording.
 */
export function ColorModeToggle() {
  return (
    <Box
      onClick={() => toggleColorMode()}
      aria-label={colorMode() === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      boxSize="9"
      borderWidth="1px"
      borderColor="border"
      borderRadius="l2"
      color="fg.muted"
      cursor="pointer"
      _hover={{ bg: "bg.muted", color: "fg" }}
      _focusVisible={{ outline: "2px solid", outlineColor: "border.emphasized" }}
      render={(renderProps) => (
        <button {...(renderProps as JSX.ButtonHTMLAttributes<HTMLButtonElement>)} type="button">
          {renderProps.children}
        </button>
      )}
    >
      {/* `display` is a style prop and must not reach the `<svg>`, so the per-mode toggle sits on a
        span around each glyph. The glyph itself is `1em` and needs no sizing here — `fontSize`
        above is what makes it 16px. */}
      <Box as="span" display="inline-flex" fontSize="md" _dark={{ display: "none" }}>
        <SunIcon />
      </Box>
      <Box as="span" display="inline-flex" fontSize="md" _light={{ display: "none" }}>
        <MoonIcon />
      </Box>
    </Box>
  );
}
