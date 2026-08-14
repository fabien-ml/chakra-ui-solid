import { Button, Card, Circle } from "chakra-ui-solid";

export default function CardBasic() {
  return (
    <Card.Root width="320px">
      <Card.Body gap="2">
        {/* A `Circle` where the React version puts an `Avatar` — that row is not ported yet, and
            the avatar is decoration here rather than the subject. `float-with-avatar` is the
            precedent. */}
        <Circle size="12" bg="bg.emphasized" color="fg" fontWeight="medium">
          NC
        </Circle>
        <Card.Title mt="2">Nue Camp</Card.Title>
        <Card.Description>
          This is the card body. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur
          nec odio vel dui euismod fermentum. Curabitur nec odio vel dui euismod fermentum.
        </Card.Description>
      </Card.Body>
      <Card.Footer justifyContent="flex-end">
        <Button variant="outline">View</Button>
        <Button>Join</Button>
      </Card.Footer>
    </Card.Root>
  );
}
