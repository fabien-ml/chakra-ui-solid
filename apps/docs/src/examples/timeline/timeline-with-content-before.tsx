import { Stack, Timeline } from "chakra-ui-solid";
import { For } from "solid-js";

const sizes = ["sm", "md", "lg"] as const;

export default function TimelineWithContentBefore() {
  return (
    <Stack gap="8">
      <For each={sizes}>
        {(size) => (
          <Timeline.Root size={size}>
            <Timeline.Item>
              <Timeline.Content width="auto">
                <Timeline.Title whiteSpace="nowrap">Nov 1994</Timeline.Title>
              </Timeline.Content>
              <Timeline.Connector>
                <Timeline.Separator />
                <Timeline.Indicator>1</Timeline.Indicator>
              </Timeline.Connector>
              <Timeline.Content>
                <Timeline.Title>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </Timeline.Title>
              </Timeline.Content>
            </Timeline.Item>

            <Timeline.Item>
              <Timeline.Content width="auto">
                <Timeline.Title whiteSpace="nowrap">Nov 2010</Timeline.Title>
              </Timeline.Content>
              <Timeline.Connector>
                <Timeline.Separator />
                <Timeline.Indicator>2</Timeline.Indicator>
              </Timeline.Connector>
              <Timeline.Content>
                <Timeline.Title>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </Timeline.Title>
              </Timeline.Content>
            </Timeline.Item>
          </Timeline.Root>
        )}
      </For>
    </Stack>
  );
}
