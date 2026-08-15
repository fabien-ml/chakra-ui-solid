import { Portal } from "@solidjs/web";
import {
  Button,
  type ButtonProps,
  CloseButton,
  type CloseButtonProps,
  Drawer,
  Text,
} from "chakra-ui-solid";
import { Show } from "solid-js";

export default function DrawerWithContext() {
  return (
    <Drawer.Root>
      <Drawer.Trigger
        render={(props) => <Button variant="outline" size="sm" {...(props as ButtonProps)} />}
      >
        Open Drawer
      </Drawer.Trigger>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Context>
              {(store) => (
                // The render prop is called once in the part's body, which is not a tracking scope,
                // so it must return JSX — a bare ternary here would read `open` untracked and
                // freeze on the value it had at mount.
                <Drawer.Body pt="6" spaceY="3">
                  <Text>
                    Drawer is open:{" "}
                    <Show when={store.open} fallback="false">
                      true
                    </Show>
                  </Text>
                  <Text>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                    incididunt ut labore et dolore magna aliqua.
                  </Text>
                  <Button variant="outline" size="sm" onClick={() => store.setOpen(false)}>
                    Close
                  </Button>
                </Drawer.Body>
              )}
            </Drawer.Context>
            <Drawer.CloseTrigger
              render={(props) => <CloseButton size="sm" {...(props as CloseButtonProps)} />}
            />
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}
