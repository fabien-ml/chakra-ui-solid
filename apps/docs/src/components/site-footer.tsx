import { css } from "@chakra-ui-solid/styled-system/css";
import { DISCLAIMER } from "~/config";

/**
 * The footer. Its whole job is `legal.md` §3.3.3 item 1: the disclaimer, verbatim, on **every**
 * page, with chakra-ui.com as a live link — the link is part of the wording rather than a
 * courtesy, because it is what turns a disclaimer into a redirect.
 *
 * Deliberately smaller than chakra-ui.com's: there is no product tier, no company, no social row
 * and no newsletter to put in one.
 */
export function SiteFooter() {
  return (
    <footer
      class={css({
        borderTopWidth: "1px",
        borderColor: "border",
        bg: "bg.subtle",
        mt: "16",
      })}
    >
      <div class={css({ maxW: "7xl", mx: "auto", px: "6", py: "8" })}>
        <p class={css({ fontSize: "sm", color: "fg.muted", maxW: "3xl" })}>
          {DISCLAIMER.before}
          <a href={DISCLAIMER.linkHref} class={css({ color: "fg", textDecoration: "underline" })}>
            {DISCLAIMER.linkText}
          </a>
          {DISCLAIMER.after}
        </p>
      </div>
    </footer>
  );
}
