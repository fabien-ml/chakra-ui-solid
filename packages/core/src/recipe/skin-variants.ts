/**
 * The one place a **skin** — an alternative token table published as its own package — widens the
 * variant unions the component props are typed against.
 *
 * A recipe accepts any variant *value* at runtime: `button({ variant: "dashed" })` returns
 * `button button--variant_dashed` whether or not `dashed` is one of ours. The prop types are what
 * say otherwise, and this interface is how a skin says its own values are legal too — one
 * `declare module` block for the whole library, rather than a widening per prop.
 *
 * A skin package writes:
 *
 * ```ts
 * declare module "@chakra-ui-solid/core" {
 *   interface RecipeVariantOverrides {
 *     button: { variant: "dashed" };
 *     dialog: { size: "jumbo" };
 *   }
 * }
 * ```
 *
 * Keys are the recipe names Panda generates (`button`, `dialog`, …), each mapping variant keys to
 * the extra values that recipe now accepts. `<Button variant="dashed">` type-checks everywhere the
 * block is in scope, and every value the library already ships keeps working.
 *
 * **`@chakra-ui-solid/core` is the specifier to name, and naming another one fails silently.**
 * TypeScript merges an augmentation into the interface the named module *exports* — it does not
 * search. Name a module that exports no `RecipeVariantOverrides` and TypeScript declares a second,
 * unrelated interface, reports nothing, and leaves every union exactly as closed as it was.
 * `chakra-ui-solid` is that case today: it re-exports neither this interface nor {@link SkinVariant}.
 *
 * Variant **keys** are not extensible this way, only values. `splitVariantProps` and the
 * `VARIANT_KEYS` tuples that strip variant props off the DOM are compiled into our build, so a key
 * that existed only in a consumer's types would style correctly and then leak onto the element as
 * an HTML attribute.
 */
// biome-ignore lint/suspicious/noEmptyInterface: the suggested `type` alias deletes the mechanism — `declare module` merges into an interface and cannot augment an alias, and empty is the shipped state.
export interface RecipeVariantOverrides {}

/**
 * The extra values a skin has declared for one recipe's variant — `never` when no skin is
 * installed, or when the installed one says nothing about this recipe or this key.
 *
 * A component prop unions it in beside the values the library itself ships:
 *
 * ```ts
 * export type ButtonVariant = ConditionalValue<
 *   "solid" | "subtle" | "surface" | "outline" | "ghost" | "plain" | SkinVariant<"button", "variant">
 * >;
 * ```
 *
 * Unioning `never` adds nothing, so the prop stays exactly as closed as it is today until a skin
 * augments {@link RecipeVariantOverrides}. `"nope"` is a type error either way.
 */
export type SkinVariant<
  Recipe extends string,
  Key extends string,
> = Recipe extends keyof RecipeVariantOverrides
  ? Key extends keyof RecipeVariantOverrides[Recipe]
    ? RecipeVariantOverrides[Recipe][Key] & string
    : never
  : never;
