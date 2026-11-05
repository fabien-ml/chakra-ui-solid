# `use*Styles` hooks return class strings, not style objects

`useDialogStyles`, `usePopoverStyles` and `useCollapsibleStyles` return an accessor of class strings per slot, read off the component context. Upstream's hooks return `SystemStyleObject`s, which only make sense with a runtime style engine. This is the standing difference of the styling seam, not a per-hook choice, and it is the only shape available without runtime CSS ([0067](0067-zero-published-css.md)).
