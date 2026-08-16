import { Button } from "chakra-ui-solid";

export default function ButtonWithResponsiveSize() {
  return (
    // A responsive **recipe variant**, which the stylesheet only carries for the recipes a config
    // opts in — this site's `panda.config.ts` names `responsive: { button: ["size"] }`. A
    // responsive *style prop* beside it needs no such line.
    <Button rounded="3xl" size={{ base: "md", md: "lg" }}>
      Button
    </Button>
  );
}
