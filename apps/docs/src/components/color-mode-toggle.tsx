import { css } from "@chakra-ui-solid/styled-system/css";
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
    <button
      type="button"
      onClick={() => toggleColorMode()}
      aria-label={colorMode() === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      class={css({
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        boxSize: "9",
        borderWidth: "1px",
        borderColor: "border",
        borderRadius: "l2",
        color: "fg.muted",
        cursor: "pointer",
        _hover: { bg: "bg.muted", color: "fg" },
        _focusVisible: { outline: "2px solid", outlineColor: "border.emphasized" },
      })}
    >
      <SunIcon />
      <MoonIcon />
    </button>
  );
}

const iconClass = css({ boxSize: "4" });
const lightOnly = css({ _dark: { display: "none" } });
const darkOnly = css({ _light: { display: "none" } });

const SunIcon = () => (
  <svg
    class={`${iconClass} ${lightOnly}`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

const MoonIcon = () => (
  <svg
    class={`${iconClass} ${darkOnly}`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
  </svg>
);
