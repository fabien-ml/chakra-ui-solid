import type { JSX } from "@solidjs/web";
import { Box } from "chakra-ui-solid";
import { Container } from "~/components/container";
import { DISCLAIMER } from "~/config";

/**
 * The footer. Its whole job is `docs-site.md` §3.4 row 4: the disclaimer, verbatim, on **every**
 * page, with chakra-ui.com as a live link — the link is part of the wording rather than a
 * courtesy, because it is what turns a disclaimer into a redirect.
 *
 * Deliberately smaller than chakra-ui.com's: there is no product tier, no company, no social row
 * and no newsletter to put in one.
 */
export function SiteFooter() {
  return (
    <Box as="footer" borderTopWidth="1px" borderColor="border" bg="bg.subtle" mt="16">
      <Container py="8">
        <Box as="p" fontSize="sm" color="fg.muted" maxW="3xl">
          {DISCLAIMER.before}
          <Box
            color="fg"
            textDecoration="underline"
            render={(props) => (
              <a
                {...(props as JSX.AnchorHTMLAttributes<HTMLAnchorElement>)}
                href={DISCLAIMER.linkHref}
              >
                {props.children}
              </a>
            )}
          >
            {DISCLAIMER.linkText}
          </Box>
          {DISCLAIMER.after}
        </Box>
      </Container>
    </Box>
  );
}
