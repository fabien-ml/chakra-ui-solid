# Only object-form `style` may reach a positioner

Popper writes custom properties (`--z-index` among eight) into the positioner's `style` attribute from inside a `raf`, while Solid binds that same attribute reactively.

Bind `style` as an **object**, never as a string. Solid's object form diffs per property, so the popper-written properties survive. A string binding assigns `cssText`, rewriting the whole attribute: it wipes every machine custom property on each update, and the recipe's `z-index: calc(… + var(--layer-index, 0))` silently falls back to the base token. Popper does not notice the wipe.

Measured: with object form, stacked floating elements keep `z-index` 1500 and 1501 across interleaved re-renders.
