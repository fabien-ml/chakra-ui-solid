import { Portal } from "@solidjs/web";
import { Button, type ButtonProps, Popover } from "chakra-ui-solid";

export default function PopoverWithPlacement() {
  return (
    <Popover.Root positioning={{ placement: "bottom-end" }}>
      <Popover.Trigger
        render={(props) => <Button size="sm" variant="outline" {...(props as ButtonProps)} />}
      >
        Click me
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Arrow />
            <Popover.Body>Some content</Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}
