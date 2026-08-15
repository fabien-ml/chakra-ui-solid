import { $PROXY, omit } from "solid-js";

/** `Props` without the keys in `Keys` — SolidJS's own `omit` return type, spelled here. */
export type OmitProps<Props, Keys extends readonly (keyof Props)[]> = {
  [Key in keyof Props as Exclude<Key, Keys[number]>]: Props[Key];
};

/** Props are read-only; a write through the proxy is dropped rather than thrown, as Solid's is. */
const ignoreWrite = () => true;

/**
 * `props` with the listed keys removed, kept lazy so every remaining key stays reactive — the bag a
 * component spreads onto its element once it has pulled out the props it handles itself.
 *
 * Use it wherever SolidJS's `omit` would go. It is that function plus one guarantee: **the omission
 * survives being merged again.** `merge(omitProps(props, "size"), { class: … })` — how nearly every
 * component here builds its element props — really does drop `size`, so `<button size="sm">` never
 * reaches the DOM.
 */
export function omitProps<Props extends object, Keys extends readonly (keyof Props)[]>(
  props: Props,
  ...keys: Keys
): OmitProps<Props, Keys> {
  // Solid's own `omit` is a proxy only when its source is one. For anything else it copies own
  // property *names*, and the symbol below is not one — so that branch is already safe, and it is
  // the cheaper of the two.
  if (!($PROXY in props)) {
    return omit(props as Record<string, unknown>, ...(keys as readonly string[])) as OmitProps<
      Props,
      Keys
    >;
  }

  const omitted = new Set<PropertyKey>(keys);

  // Every symbol but `$PROXY` reads as absent here, and that is the whole reason this function
  // exists. `merge` tags its result with an internal symbol holding the sources it was built from,
  // and unwraps that tag whenever it finds it on a source — a flattening that assumes anything
  // carrying the tag *is* those sources. Solid's `omit` forwards unknown keys verbatim, symbols
  // included, so an omit of a merged bag still answers the tag with the bag's own sources: the
  // next `merge` drops the omit and merges back exactly what it was hiding. Nothing errors, the
  // class is still computed from the right props, and the withheld ones land on the element as
  // attributes.
  const read = (key: PropertyKey) =>
    typeof key === "symbol" || omitted.has(key) ? undefined : props[key as keyof Props];

  return new Proxy(
    {},
    {
      get: (_, key, receiver) => (key === $PROXY ? receiver : read(key)),
      has: (_, key) =>
        key === $PROXY || (typeof key === "string" && !omitted.has(key) && key in props),
      ownKeys: () => Object.keys(props).filter((key) => !omitted.has(key)),
      getOwnPropertyDescriptor: (_, key) => ({
        configurable: true,
        enumerable: true,
        get: () => read(key),
        set: ignoreWrite,
      }),
      set: ignoreWrite,
      deleteProperty: ignoreWrite,
    },
  ) as OmitProps<Props, Keys>;
}
