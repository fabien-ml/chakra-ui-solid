# A machine's inline `style` is forwarded untouched

The headless layer emits `style` objects on some parts (for example `pointer-events` on a dialog's positioner and content). We forward them to the DOM as written and never translate them into a class. A DOM `style` attribute is not a stylesheet, so it is allowed by [0067](0067-zero-published-css.md), and translating it would create a second source of truth for a value the machine owns. It would also lose the guarantee that an inline `style` beats any class.
