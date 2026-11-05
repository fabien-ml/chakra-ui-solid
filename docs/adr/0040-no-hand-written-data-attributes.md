# We write no `data-*` attributes

State attributes (`data-state`, `data-disabled`, `data-highlighted`, `data-selected`, `data-invalid`, ...) come from the headless layer's prop getters, and the preset's conditions (`_open`, `_checked`, ...) are written against exactly those. One vocabulary, no translation layer.

- Never add a translation getter speculatively: an unnecessary one is invisible and drifts.
- `data-slot`, an earlier Solid library's convention, appears in zero Chakra files and is not carried.
