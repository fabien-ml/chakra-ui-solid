import { Link } from "@tanstack/solid-router";
import { Box, Button } from "chakra-ui-solid";

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
      {/* The palette is declared here rather than inherited: this page renders outside the landing
        root, which is the one place that sets `colorPalette="teal"`. A literal, because a
        `colorPalette` assembled from a variable is a class nobody generated. */}
      <Button
        colorPalette="teal"
        render={(renderProps) => (
          <Link to="/" class={renderProps.class as string}>
            {renderProps.children}
          </Link>
        )}
      >
        Back to the docs home
      </Button>
    </Box>
  );
}
