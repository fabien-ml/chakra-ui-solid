# Controlled means "not `undefined`"

A prop is controlled when its value `!== undefined`. `null` therefore means "controlled, and empty", never "leave it to the component". Use `undefined` for uncontrolled. This matches Chakra, and applies to every nullable value prop (`select`, `combobox`, `listbox` `highlightedValue`, `color-picker`, `date-picker`, and Dialog's `triggerValue`).

Worked instance: `<Dialog.Root triggerValue={null}>` pins the active trigger to none rather than handing control back to the machine. A component documenting such a prop must say what `null` means.
