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
 * declare module "chakra-ui-solid" {
 *   interface RecipeVariantOverrides {
 *     button: { size: "huge" };
 *   }
 * }
 * ```
 *
 * Keys are the recipe names Panda generates (`button`, `dialog`, …), each mapping variant keys to
 * the extra values that recipe now accepts. `<Button size="huge">` type-checks everywhere the block
 * is in scope, and every value the library already ships keeps working. A key the recipe gained
 * that no component declares — `tone` — arrives as a prop of its own through
 * {@link PresetVariantProps}.
 *
 * **Write it by hand and you are doing `panda codegen`'s job.** Every run writes
 * `styled-system/chakra-system-types.d.ts` with a row per recipe, taken off the `*VariantProps` types
 * Panda generated from the same config — so the block above is for a project whose styled-system is
 * assembled some other way.
 *
 * **The specifier has to be one that exports this interface, and naming another fails silently.**
 * TypeScript merges an augmentation into the interface the named module *exports* — it does not
 * search. Name a module that exports no `RecipeVariantOverrides` and TypeScript declares a second,
 * unrelated interface, reports nothing, and leaves every union exactly as closed as it was.
 * `chakra-ui-solid` re-exports this and its three siblings for that reason, and it is the one to
 * name: pnpm's isolated `node_modules` puts only the package a consumer installed on their
 * resolution path, so `@chakra-ui-solid/core` is a specifier their `declare module` cannot resolve.
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
    ? // `Extract`, never `& string`, and the difference is the whole prop. A generated
      // `ButtonVariantProps["size"]` is `ConditionalValue<…> | undefined`, whose object arm is
      // all-optional — and `"anything" & { _hover?: … }` is a type a bare string satisfies. So
      // intersecting opened `size` to every string the moment a generated row landed, which is the
      // one failure this whole layer exists to prevent. Extracting keeps the literal arm alone.
      Extract<RecipeVariantOverrides[Recipe][Key], string>
    : never
  : never;

/**
 * The variant **keys** a consumer's recipe has that no component prop declares — `tone`, once their
 * `panda.config.ts` adds `variants: { tone: { brand: … } }` to `theme.extend.recipes.button`.
 *
 * The component's own props cover the keys the library ships; this covers the ones it cannot know
 * about, so a props interface mixes it in beside {@link PresetVariant} on the values:
 *
 * ```ts
 * export interface ButtonProps extends HTMLChakraProps<"button">, PresetVariantProps<"button"> {
 *   size?: ConditionalValue<"sm" | "md" | PresetVariant<"button", "size">>;
 * }
 * ```
 *
 * It resolves to `{}` for a consumer who augments nothing, so nothing widens by default. A key the
 * interface declares itself wins — an interface's own member overrides the one it inherits — which
 * is what keeps `size`'s documented union and its `@default` tag on the props table rather than
 * replacing them with Panda's generated spelling.
 *
 * The runtime half needs no counterpart: `useRecipeVariantKeys` reads the key list off the recipe
 * the system supplied, so an added key is passed to that recipe rather than leaked onto the element.
 */
export type PresetVariantProps<Recipe extends string> = Recipe extends keyof RecipeVariantOverrides
  ? { [Key in keyof RecipeVariantOverrides[Recipe]]?: RecipeVariantOverrides[Recipe][Key] }
  : Record<never, never>;

/**
 * Style props for the `utilities` a consumer's `panda.config.ts` adds — the third of the three
 * things their config decides and our published declarations cannot see.
 *
 * ```ts
 * // panda.config.ts
 * utilities: {
 *   extend: {
 *     elevation: { values: ["low", "high"], transform: (value) => ({ boxShadow: shadows[value] }) },
 *   },
 * }
 * ```
 *
 * `<Box elevation="high">` already *works* — the element's style props are partitioned by the
 * `isCssProperty` their own Panda run generated, so a name their config invented is folded into the
 * class rather than set as a DOM attribute. This is what makes it type-check, and `panda codegen`
 * writes the row:
 *
 * ```ts
 * declare module "chakra-ui-solid" {
 *   interface CustomStyleProps {
 *     elevation?: SystemProperties["elevation"];
 *   }
 * }
 * ```
 *
 * The value type is Panda's own for that utility rather than one synthesised here, so the prop
 * accepts exactly what their `css({ elevation })` accepts — `var(--…)` and the raw-CSS escape hatch
 * included.
 *
 * Only names the preset does **not** already declare belong here. A consumer who extends `bg` is
 * changing a prop that exists rather than adding one, and a second declaration of it would collide
 * with Panda's own on the styling surface that mixes both in.
 */
// biome-ignore lint/suspicious/noEmptyInterface: the suggested `type` alias deletes the mechanism — `declare module` merges into an interface and cannot augment an alias, and empty is the shipped state.
export interface CustomStyleProps {}

/**
 * Style-object props for the `conditions` a consumer's `panda.config.ts` adds.
 *
 * ```ts
 * // panda.config.ts
 * conditions: { extend: { supportsGrid: "@supports (display: grid)" } }
 * ```
 *
 * ```ts
 * // styled-system/chakra-system-types.d.ts, written by `panda codegen`
 * declare module "chakra-ui-solid" {
 *   interface CustomConditions {
 *     _supportsGrid?: SystemStyleObject;
 *   }
 * }
 * ```
 *
 * Panda prefixes a condition name with `_` for the prop that applies it, so `supportsGrid` is
 * `<Box _supportsGrid={{ bg: "red.500" }}>` — and, as with a custom utility, the runtime half is
 * already theirs: their `isCssProperty` answers `true` for the name, and their `css()` knows the
 * selector behind it.
 *
 * **Top-level only.** `SystemStyleObject` derives its nested condition keys from the `Conditions`
 * interface Panda generated for *this* package at *our* build, so a custom condition is a prop but
 * not yet a key inside `css={{ … }}` or inside another condition.
 */
// biome-ignore lint/suspicious/noEmptyInterface: same as above — the empty interface is the augmentation seam, not an oversight.
export interface CustomConditions {}
