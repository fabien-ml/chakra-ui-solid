import type { RecipeShape } from "../index";

/** The `fileUpload` recipe's shape. What a row is, and why it is authored: `../index.ts`. */
export const fileUploadShape = {
  className: "file-upload",
  slots: [
    "root",
    "dropzone",
    "item",
    "itemDeleteTrigger",
    "itemGroup",
    "itemName",
    "itemPreview",
    "itemPreviewImage",
    "itemSizeText",
    "label",
    "trigger",
    "clearTrigger",
    "itemContent",
    "dropzoneContent",
    "fileText",
  ],
  variants: {},
  defaultVariants: {},
} as const satisfies RecipeShape;
