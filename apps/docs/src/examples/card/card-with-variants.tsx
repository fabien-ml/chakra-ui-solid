import { Button, Card, Circle, Stack } from "chakra-ui-solid";
import { For } from "solid-js";

export default function CardWithVariants() {
  // A recipe variant may be a loop variable, where a style prop may not: the preset declares
  // `staticCss: ["*"]` on every recipe it ships, so all three `card` variant classes are in the
  // sheet whether or not any file spells them.
  return (
    <Stack gap="4" direction="row" wrap="wrap">
      <For each={["subtle", "outline", "elevated"] as const}>
        {(variant) => (
          <Card.Root width="320px" variant={variant}>
            <Card.Body gap="2">
              <Circle size="12" bg="bg.emphasized" color="fg" fontWeight="medium">
                NC
              </Circle>
              <Card.Title mb="2">Nue Camp</Card.Title>
              <Card.Description>
                This is the card body. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </Card.Description>
            </Card.Body>
            <Card.Footer justifyContent="flex-end">
              <Button variant="outline">View</Button>
              <Button>Join</Button>
            </Card.Footer>
          </Card.Root>
        )}
      </For>
    </Stack>
  );
}
