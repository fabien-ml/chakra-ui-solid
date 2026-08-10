import { DecorativeBox } from "../components/decorative-box";

export default function AspectRatioResponsive() {
  return (
    <DecorativeBox maxWidth="300px" aspectRatio={{ base: 1, md: 16 / 9 }}>
      Box
    </DecorativeBox>
  );
}
