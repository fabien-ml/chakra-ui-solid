# Port what renders, not what Chakra's type says

Where Chakra's declared element type disagrees with the element it actually renders, we match the DOM, which is what a recipe selector, a snapshot and a screen reader see. Examples: `Card.Title` renders an `h3` though typed `h2`; `Tag.Root` renders a `div` though typed `span`; a dialog's Content and Description fall back to `div` though typed `section` and `p`. A consumer's `as` still overrides the fallback.
