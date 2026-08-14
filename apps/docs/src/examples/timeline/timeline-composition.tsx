import { Button, Card, Circle, Icon, Input, Span, Timeline } from "chakra-ui-solid";
import { PenIcon, XIcon } from "../../components/ui/icons";

/**
 * The React version puts an `Avatar` in four places here. `avatar` has not shipped yet, so a
 * `Circle` with an initial stands in — what the example is about is a timeline composed with the
 * rest of the library. Each one is written out with literal style props, because a size passed
 * through a variable is a value Panda's extractor never sees.
 */
export default function TimelineComposition() {
  return (
    <Timeline.Root size="lg" variant="subtle" maxW="md">
      <Timeline.Item>
        <Timeline.Connector>
          <Timeline.Separator />
          <Timeline.Indicator>
            <Icon fontSize="xs">
              <PenIcon />
            </Icon>
          </Timeline.Indicator>
        </Timeline.Connector>
        <Timeline.Content>
          <Timeline.Title>
            <Circle size="4" bg="bg.emphasized" color="fg" textStyle="2xs">
              L
            </Circle>
            Lucas Moras <Span color="fg.muted">has changed</Span>
            <Span fontWeight="medium">3 labels</Span> on
            <Span color="fg.muted">Jan 1, 2024</Span>
          </Timeline.Title>
        </Timeline.Content>
      </Timeline.Item>

      <Timeline.Item>
        <Timeline.Connector>
          <Timeline.Separator />
          <Timeline.Indicator>
            <Icon fontSize="xs">
              <XIcon />
            </Icon>
          </Timeline.Indicator>
        </Timeline.Connector>
        <Timeline.Content>
          <Timeline.Title>
            <Circle size="4" bg="bg.emphasized" color="fg" textStyle="2xs">
              J
            </Circle>
            Jenna Smith <Span color="fg.muted">removed</Span>
            <Span fontWeight="medium">Enas</Span>
            <Span color="fg.muted">on Jan 12, 2024</Span>
          </Timeline.Title>
        </Timeline.Content>
      </Timeline.Item>

      <Timeline.Item>
        <Timeline.Connector>
          <Timeline.Separator />
          <Timeline.Indicator bg="teal.solid" color="teal.contrast">
            <Icon fontSize="xs">
              <XIcon />
            </Icon>
          </Timeline.Indicator>
        </Timeline.Connector>
        <Timeline.Content gap="4">
          <Timeline.Title>
            <Circle size="4" bg="bg.emphasized" color="fg" textStyle="2xs">
              E
            </Circle>
            Erica <Span color="fg.muted">commented</Span>
            <Span color="fg.muted">on Jan 12, 2024</Span>
          </Timeline.Title>
          <Card.Root size="sm">
            <Card.Body textStyle="sm" lineHeight="tall">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore.
            </Card.Body>
            <Card.Footer>
              <Button size="xs" variant="surface" rounded="md">
                👏 2
              </Button>
            </Card.Footer>
          </Card.Root>
        </Timeline.Content>
      </Timeline.Item>

      <Timeline.Item>
        <Timeline.Connector>
          <Timeline.Separator />
          <Timeline.Indicator>
            <Circle size="full" bg="bg.emphasized" color="fg" textStyle="2xs">
              O
            </Circle>
          </Timeline.Indicator>
        </Timeline.Connector>
        <Timeline.Content gap="4" mt="-1" w="full">
          <Input size="sm" placeholder="Add comment..." />
        </Timeline.Content>
      </Timeline.Item>
    </Timeline.Root>
  );
}
