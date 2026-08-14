import { Spinner } from "chakra-ui-solid";

export default function SpinnerWithTrackColor() {
  return <Spinner color="red.500" css={{ "--spinner-track-color": "colors.gray.200" }} />;
}
