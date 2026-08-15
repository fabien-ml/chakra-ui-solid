import { Portal } from "@solidjs/web";
import {
  Button,
  type ButtonProps,
  CloseButton,
  type CloseButtonProps,
  Drawer,
  Kbd,
  Text,
} from "chakra-ui-solid";

export default function DrawerWithConditionalVariants() {
  return (
    <>
      <Text mb="4">Open drawer and resize screen to mobile size</Text>
      {/*
        A responsive **recipe variant**, which the stylesheet only carries for the recipes a config
        opts in — this site's `panda.config.ts` names `responsive: { drawer: ["placement"] }`. A
        responsive *style prop* beside it needs no such line.
      */}
      <Drawer.Root placement={{ mdDown: "bottom", md: "end" }}>
        <Drawer.Trigger
          render={(props) => <Button variant="outline" size="sm" {...(props as ButtonProps)} />}
        >
          Open Drawer
        </Drawer.Trigger>
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content>
              <Drawer.Header>
                <Drawer.Title>Drawer Title</Drawer.Title>
              </Drawer.Header>
              <Drawer.Body>
                Press the <Kbd>esc</Kbd> key to close the drawer.
              </Drawer.Body>
              <Drawer.Footer>
                <Drawer.ActionTrigger
                  render={(props) => <Button variant="outline" {...(props as ButtonProps)} />}
                >
                  Cancel
                </Drawer.ActionTrigger>
                <Button>Save</Button>
              </Drawer.Footer>
              <Drawer.CloseTrigger
                render={(props) => <CloseButton size="sm" {...(props as CloseButtonProps)} />}
              />
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </>
  );
}
