import { css } from "@chakra-ui-solid/styled-system/css";
import { Link } from "@tanstack/solid-router";

export function NotFound() {
  return (
    <div class={css({ maxW: "3xl", mx: "auto", px: "6", py: "24", textAlign: "center" })}>
      <h1 class={css({ fontSize: "3xl", fontWeight: "bold", color: "fg", mb: "3" })}>
        Page not found
      </h1>
      <p class={css({ color: "fg.muted", mb: "6" })}>
        This site is built one batch at a time, so a page you expected may not exist yet rather than
        having moved.
      </p>
      <Link to="/" class={css({ color: "colorPalette.fg", textDecoration: "underline" })}>
        Back to the docs home
      </Link>
    </div>
  );
}
