import { Button, Container } from "chakra-ui-solid";

/**
 * A consumer's source file, and the only thing their Panda run scans.
 *
 * One import is the whole fixture. The import **gate** decides which of the 75 recipe bodies reach
 * a consumer's stylesheet by reading their import specifiers, so this line is what puts the
 * `.button` and `.container` rules the tests assert on in the sheet — and it leaves the rest out,
 * which is what keeps the run fast.
 *
 * Panda reads this as text and never compiles it, so nothing here is rendered by any test.
 */
export const trigger = Button;
export const shell = Container;
