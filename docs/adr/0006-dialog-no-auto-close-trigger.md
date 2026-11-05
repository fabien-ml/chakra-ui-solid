# `Dialog.Content` renders no close button of its own

Chakra's Dialog does not render a `CloseTrigger` inside `Content`; a consumer places `<Dialog.CloseTrigger>` themselves. hope-ui's `Content` rendered one behind a `showCloseButton` prop. We follow Chakra: the port rule outranks the carried-over behaviour.
