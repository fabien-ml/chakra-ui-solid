import * as css from "@chakra-ui-solid/styled-system/css";
import { isCssProperty } from "@chakra-ui-solid/styled-system/is-valid-prop";
import * as patterns from "@chakra-ui-solid/styled-system/patterns";
import { token } from "@chakra-ui-solid/styled-system/tokens";
import { createSystem } from "chakra-ui-solid";

/**
 * The styled-system every component on this site computes its classes from, handed to the
 * `<ChakraProvider>` in `~/routes/__root`.
 *
 * It is assembled here rather than imported ready-made because that is the shape a consumer writes:
 * their Panda run emits the `css` namespace, `isCssProperty`, `token` and the patterns, and
 * `createSystem` turns them into the object the provider takes.
 */
export const system = createSystem({ ...css, isCssProperty, token, patterns });
