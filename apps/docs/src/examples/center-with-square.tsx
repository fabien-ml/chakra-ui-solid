import { Square } from "@chakra-ui-solid/components";

const Dot = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <circle cx="12" cy="12" r="6" fill="currentColor" />
  </svg>
);

export default function CenterWithSquare() {
  return (
    <Square size="10" bg="purple.700" color="white">
      <Dot />
    </Square>
  );
}
