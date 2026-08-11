import type { JSX } from "@solidjs/web";
import { AspectRatio, Box } from "chakra-ui-solid";

export default function AspectRatioWithImage() {
  return (
    <AspectRatio maxW="400px" ratio={4 / 3}>
      <Box
        objectFit="cover"
        render={(props) => (
          <img
            {...(props as JSX.ImgHTMLAttributes<HTMLImageElement>)}
            src="https://bit.ly/naruto-sage"
            alt="naruto"
          />
        )}
      />
    </AspectRatio>
  );
}
