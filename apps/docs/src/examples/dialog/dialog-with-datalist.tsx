import { Portal } from "@solidjs/web";
import {
  Avatar,
  Badge,
  Button,
  type ButtonProps,
  CloseButton,
  type CloseButtonProps,
  DataList,
  Dialog,
  HStack,
  Textarea,
  VStack,
} from "chakra-ui-solid";

export default function DialogWithDatalist() {
  return (
    <VStack alignItems="start">
      <Dialog.Root>
        <Dialog.Trigger
          render={(props) => <Button variant="outline" {...(props as ButtonProps)} />}
        >
          Open Dialog
        </Dialog.Trigger>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Prepare Chakra V3</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body pb="8">
                <DataList.Root orientation="horizontal">
                  <DataList.Item>
                    <DataList.ItemLabel>Status</DataList.ItemLabel>
                    <DataList.ItemValue>
                      <Badge colorPalette="green">Completed</Badge>
                    </DataList.ItemValue>
                  </DataList.Item>
                  <DataList.Item>
                    <DataList.ItemLabel>Assigned to</DataList.ItemLabel>
                    <DataList.ItemValue>
                      <HStack>
                        <Avatar.Root size="xs">
                          <Avatar.Image src="https://bit.ly/sage-adebayo" />
                          <Avatar.Fallback name="Segun Adebayo" />
                        </Avatar.Root>
                        Segun Adebayo
                      </HStack>
                    </DataList.ItemValue>
                  </DataList.Item>
                  <DataList.Item>
                    <DataList.ItemLabel>Due date</DataList.ItemLabel>
                    <DataList.ItemValue>12th August 2024</DataList.ItemValue>
                  </DataList.Item>
                </DataList.Root>

                <Textarea placeholder="Add a note" mt="8" />
              </Dialog.Body>
              <Dialog.CloseTrigger
                render={(props) => <CloseButton size="sm" {...(props as CloseButtonProps)} />}
              />
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </VStack>
  );
}
