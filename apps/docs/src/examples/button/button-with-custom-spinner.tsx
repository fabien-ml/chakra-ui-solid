import { Button, Spinner } from "chakra-ui-solid";

/**
 * The React version passes a `BeatLoader` from `react-spinners`. Nothing here depends on a
 * third-party spinner, so the slot takes the library's own — re-dressed, which is the point: the
 * `spinner` prop accepts any element, and the button's default is only what it falls back to.
 */
export default function ButtonWithCustomSpinner() {
  return (
    <Button
      loading
      colorPalette="blue"
      spinner={<Spinner size="sm" color="white" borderWidth="3px" animationDuration="0.5s" />}
    >
      Click me
    </Button>
  );
}
