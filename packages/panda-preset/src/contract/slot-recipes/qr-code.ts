import type { RecipeShape } from "../index";

/** The `qrCode` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const qrCodeShape = {
  className: "qr-code",
  slots: ["root", "frame", "pattern", "overlay", "downloadTrigger"],
  variants: {
    size: ["2xs", "xs", "sm", "md", "lg", "xl", "2xl", "full"],
  },
  defaultVariants: { size: "md" },
} as const satisfies RecipeShape;
