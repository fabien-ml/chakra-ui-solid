import { Button, type ButtonProps, Popover, Portal } from "chakra-ui-solid";

export default function PopoverWithOffset() {
  return (
    <Popover.Root positioning={{ offset: { crossAxis: 0, mainAxis: 0 } }}>
      <Popover.Trigger
        render={(props) => <Button size="sm" variant="outline" {...(props as ButtonProps)} />}
      >
        Open
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Body>This popover has a custom offset from its trigger</Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}
