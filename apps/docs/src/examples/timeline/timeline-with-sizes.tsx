import { Badge, Circle, Span, Stack, Timeline } from "chakra-ui-solid";
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
                  {/* The React version puts an `Avatar` here. `avatar` has not shipped yet, so a
                      `Circle` with initials stands in — what the example is about is an indicator
                      filling itself at every size. */}
                  <Circle size="full" bg="bg.emphasized" color="fg" fontWeight="medium">
                    S
                  </Circle>
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
