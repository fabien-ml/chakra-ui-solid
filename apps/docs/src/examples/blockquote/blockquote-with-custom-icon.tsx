import { Blockquote, Circle, Float } from "chakra-ui-solid";
import { StarIcon } from "../../components/ui/icons";

export default function BlockquoteWithCustomIcon() {
  return (
    <Blockquote.Root colorPalette="blue" ps="8">
      <Float placement="middle-start">
        <Circle bg="blue.600" size="8" color="white">
          <StarIcon />
        </Circle>
      </Float>
      <Blockquote.Content cite="Uzumaki Naruto">
        If anyone thinks he is something when he is nothing, he deceives himself. Each one should
        test his own actions. Then he can take pride in himself, without comparing himself to anyone
        else.
      </Blockquote.Content>
      <Blockquote.Caption>
        — <cite>Uzumaki Naruto</cite>
      </Blockquote.Caption>
    </Blockquote.Root>
  );
}
