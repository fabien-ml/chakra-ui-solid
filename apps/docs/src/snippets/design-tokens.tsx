import { chakraConfig } from "@chakra-ui-solid/panda-preset";
import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  ...chakraConfig(),
  theme: {
    extend: {
      semanticTokens: {
        colors: {
          brand: {
            value: { base: "{colors.teal.600}", _dark: "{colors.teal.400}" },
          },
        },
      },
    },
  },
  include: ["./src/**/*.{ts,tsx}"],
  outdir: "styled-system-app",
});
