/**
 * Vite's `?raw` suffix, which imports a file's text instead of loading it.
 *
 * The consumer-override test needs the fixture consumer's generated stylesheet **as a string** so
 * it can inject it over ours and read the difference — importing it normally would inject it at
 * module load, before any test has decided it should be there.
 *
 * The declaration lives in a `types/` directory rather than inline in the test for the same reason
 * the hydration-fixture one does: a test file is itself a module, so a `declare module` there is
 * read as *augmentation* of a module that does not exist.
 */
declare module "*.css?raw" {
  const contents: string;
  export default contents;
}
