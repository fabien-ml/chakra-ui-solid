import { Box } from "@chakra-ui-solid/components";

/**
 * A consumer's source file, and the only thing their Panda run scans.
 *
 * It is not compiled or rendered by any test — Panda reads it as **text**, which is the whole
 * point: extraction is a source scan, so what a consumer writes here is what ends up in their
 * stylesheet, and nothing about our components participates.
 */
export const App = () => <Box p="4" bg="red.500" gapX="4" />;
