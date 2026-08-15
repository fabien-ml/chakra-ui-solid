/**
 * The one place a consumer widens the variant unions the component props are typed against.
 *
 * A recipe accepts any variant *value* at runtime: `button({ size: "huge" })` returns
 * `button button--size_huge` whether or not `huge` is one of ours. The prop types are what say
 * otherwise, so adding a value takes two steps — one in the Panda config, one in TypeScript.
 *
 * The value itself is added by extending our preset in `panda.config.ts`:
 *
 * ```ts
 * theme: {
 *   extend: {
 *     recipes: { button: { variants: { size: { huge: { px: "10", h: "16" } } } } },
 *   },
 * }
 * ```
 *
 * That generates the CSS; this interface is what tells TypeScript about it, in one `declare module`
 * block for the whole library rather than a widening per prop:
 *
 * ```ts
 * declare module "@chakra-ui-solid/core" {
 *   interface RecipeVariantOverrides {
 *     button: { size: "huge" };
 *   }
 * }
 * ```
 *
 * Keys are the recipe names Panda generates (`button`, `dialog`, …), each mapping variant keys to
 * the extra values that recipe now accepts. `<Button size="huge">` type-checks everywhere the block
 * is in scope, and every value the library already ships keeps working.
 *
 * **`@chakra-ui-solid/core` is the specifier to name, and naming another one fails silently.**
 * TypeScript merges an augmentation into the interface the named module *exports* — it does not
 * search. Name a module that exports no `RecipeVariantOverrides` and TypeScript declares a second,
 * unrelated interface, reports nothing, and leaves every union exactly as closed as it was.
 * `chakra-ui-solid` is that case today: it re-exports neither this interface nor
 * {@link PresetVariant}.
 *
 * Variant **values** are what this block declares, and at runtime a consumer's own system already
 * carries the rest: variant **keys** come off the recipe it supplies, so a key they added is passed
 * to the recipe rather than leaked onto the element. **Utilities** and **conditions** are still
 * sealed in the types by `styled-system/css/conditions.mjs` and
 * `styled-system/jsx/is-valid-prop.mjs`, which are declarations we publish before their build runs.
 * Typegen closes all three from their own config; until then this block is the hand-written half.
 */
// biome-ignore lint/suspicious/noEmptyInterface: the suggested `type` alias deletes the mechanism — `declare module` merges into an interface and cannot augment an alias, and empty is the shipped state.
export interface RecipeVariantOverrides {}

/**
 * The extra values declared for one recipe's variant — `never` until a consumer augments
 * {@link RecipeVariantOverrides}, and `never` for any recipe or key their augmentation leaves out.
 *
 * A component prop unions it in beside the values the library itself ships:
 *
 * ```ts
 * export type ButtonVariant = ConditionalValue<
 *   "solid" | "subtle" | "surface" | "outline" | "ghost" | "plain" | PresetVariant<"button", "variant">
 * >;
 * ```
 *
 * Unioning `never` adds nothing, so the prop stays exactly as closed as it is today for a consumer
 * who augments nothing. `"nope"` is a type error either way.
 */
export type PresetVariant<
  Recipe extends string,
  Key extends string,
> = Recipe extends keyof RecipeVariantOverrides
  ? Key extends keyof RecipeVariantOverrides[Recipe]
    ? RecipeVariantOverrides[Recipe][Key] & string
    : never
  : never;
