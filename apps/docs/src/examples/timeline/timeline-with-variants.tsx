import { Badge, Circle, Span, Stack, Timeline } from "chakra-ui-solid";
import { For } from "solid-js";
import { CheckIcon } from "../../components/ui/icons";

const variants = ["subtle", "solid", "outline", "plain"] as const;

export default function TimelineWithVariants() {
  return (
    <Stack gap="16">
      <For each={variants}>
        {(variant) => (
          <Timeline.Root variant={variant}>
            <Timeline.Item>
              <Timeline.Connector>
                <Timeline.Separator />
                <Timeline.Indicator>
                  {/* A `Circle` with initials where the React version puts an `Avatar`; the
                      `avatar` row has not shipped here yet. */}
                  <Circle size="full" bg="bg.emphasized" color="fg" fontWeight="medium">
                    S
                  </Circle>
                </Timeline.Indicator>
              </Timeline.Connector>
              <Timeline.Content>
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
              <Timeline.Content>
                <Timeline.Title>
                  <Span fontWeight="medium">sage</Span>
                  changed status from <Badge>In progress</Badge> to{" "}
                  <Badge colorPalette="teal">Completed</Badge>
                </Timeline.Title>
              </Timeline.Content>
            </Timeline.Item>
          </Timeline.Root>
        )}
      </For>
    </Stack>
  );
}
