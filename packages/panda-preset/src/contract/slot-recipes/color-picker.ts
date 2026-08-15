import type { RecipeShape } from "../index";

/** The `colorPicker` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const colorPickerShape = {
  className: "colorPicker",
  slots: [
    "root",
    "label",
    "control",
    "trigger",
    "positioner",
    "content",
    "area",
    "areaThumb",
    "valueText",
    "areaBackground",
    "channelSlider",
    "channelSliderLabel",
    "channelSliderTrack",
    "channelSliderThumb",
    "channelSliderValueText",
    "channelInput",
    "transparencyGrid",
    "swatchGroup",
    "swatchTrigger",
    "swatchIndicator",
    "swatch",
    "eyeDropperTrigger",
    "formatTrigger",
    "formatSelect",
    "view",
    "channelText",
  ],
  variants: {
    size: ["2xs", "xs", "sm", "md", "lg", "xl", "2xl"],
    variant: ["outline", "subtle"],
  },
  defaultVariants: { size: "md", variant: "outline" },
} as const satisfies RecipeShape;
