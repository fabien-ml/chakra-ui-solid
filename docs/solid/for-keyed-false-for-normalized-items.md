# `For keyed={false}` over normalized items

`SegmentGroup.Items` iterates `<For each keyed={false}>`.

`normalize()` builds fresh objects whenever `items` changes, and the default identity-keyed `<For>` would treat each as a new item and replace the `<label>` the active indicator is measuring. With `keyed={false}` the DOM node is kept and its item updated in place.

Use `keyed={false}` whenever a list is derived by a function that rebuilds its objects and something outside the list holds a reference to a rendered node.
