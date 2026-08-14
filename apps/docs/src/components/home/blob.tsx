import { Box, type BoxProps } from "chakra-ui-solid";

/**
 * The ambient wash chakra-ui.com floats behind its landing sections: a soft radial gradient,
 * decorative only, hidden below `md` where it costs paint and shows nothing.
 *
 * **Size and position are written by the caller, as literal style props.** Panda extracts styles by
 * reading source text, so `<Blob top={someValue}>` would compute a class name no stylesheet
 * contains — it renders nothing and raises no error (`plan.md` §0.2). Every call site writes its
 * own literals, and `check:style-contract` is what keeps that from regressing.
 *
 * The gradient reads `--chakra-colors-color-palette-solid` rather than naming teal, so the wash
 * follows whatever palette the page it floats behind is scoped to — `routes/index.tsx` sets
 * `colorPalette="teal"` on the landing root, and the property inherits from there.
 */
export function Blob(props: BoxProps) {
  return (
    <Box
      aria-hidden="true"
      position="absolute"
      zIndex="0"
      width="1000px"
      height="800px"
      opacity="0.06"
      pointerEvents="none"
      flexShrink="0"
      hideBelow="md"
      backgroundImage="radial-gradient(var(--chakra-colors-color-palette-solid) 0%, transparent 60%)"
      {...props}
    />
  );
}
