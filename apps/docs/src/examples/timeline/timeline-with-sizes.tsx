import { Avatar, Badge, Span, Stack, Timeline } from "chakra-ui-solid";
import { For } from "solid-js";
import { CheckIcon } from "../../components/ui/icons";

const sizes = ["sm", "md", "lg", "xl"] as const;

export default function TimelineWithSizes() {
  return (
    <Stack gap="8">
      <For each={sizes}>
        {(size) => (
          <Timeline.Root size={size}>
            <Timeline.Item>
              <Timeline.Connector>
                <Timeline.Separator />
                <Timeline.Indicator>
                  <Avatar.Root size="full">
                    <Avatar.Image src="https://bit.ly/sage-adebayo" />
                    <Avatar.Fallback name="Sage" />
                  </Avatar.Root>
                </Timeline.Indicator>
              </Timeline.Connector>
              <Timeline.Content textStyle="xs">
                <Timeline.Title>
                  <Span fontWeight="medium">sage</Span>
                  created a new project
                </Timeline.Title>
              </Timeline.Content>
            </Timeline.Item>

            <Timeline.Item>
              <Timeline.Connector>
                <Timeline.Separator />
                <Timeline.Indicator>
                  <CheckIcon />
                </Timeline.Indicator>
              </Timeline.Connector>
              <Timeline.Content textStyle="xs">
                <Timeline.Title mt={size === "sm" ? "-2px" : undefined}>
                  <Span fontWeight="medium">sage</Span>
                  changed status from <Badge size="sm">In progress</Badge> to{" "}
                  <Badge colorPalette="teal" size="sm">
                    Completed
                  </Badge>
                </Timeline.Title>
              </Timeline.Content>
            </Timeline.Item>
          </Timeline.Root>
        )}
      </For>
    </Stack>
  );
}
