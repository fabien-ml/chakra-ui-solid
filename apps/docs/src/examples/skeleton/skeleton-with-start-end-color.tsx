import { Skeleton } from "chakra-ui-solid";

export default function SkeletonWithStartEndColor() {
  return (
    <Skeleton
      variant="shine"
      width="full"
      height="5"
      css={{ "--start-color": "colors.pink.500", "--end-color": "colors.orange.500" }}
    />
  );
}
