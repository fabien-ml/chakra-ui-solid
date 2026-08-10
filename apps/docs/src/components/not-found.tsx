import { Box } from "@chakra-ui-solid/components";
import { Link } from "@tanstack/solid-router";

export function NotFound() {
  return (
    <Box maxW="3xl" mx="auto" px="6" py="24" textAlign="center">
      <Box as="h1" fontSize="3xl" fontWeight="bold" color="fg" mb="3">
        Page not found
      </Box>
      <Box as="p" color="fg.muted" mb="6">
        This site is built one batch at a time, so a page you expected may not exist yet rather than
        having moved.
      </Box>
      <Box
        color="colorPalette.fg"
        textDecoration="underline"
        render={(renderProps) => (
          <Link to="/" class={renderProps.class as string}>
            {renderProps.children}
          </Link>
        )}
      >
        Back to the docs home
      </Box>
    </Box>
  );
}
