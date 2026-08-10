import { Container } from "@chakra-ui-solid/components";
import { DecorativeBox } from "../components/decorative-box";

export default function ContainerBasic() {
  return (
    <Container>
      <DecorativeBox px="2">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam consectetur, tortor in
        lacinia eleifend, dui nisl tristique nunc.
      </DecorativeBox>
    </Container>
  );
}
