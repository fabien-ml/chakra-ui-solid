import { IconButton } from "chakra-ui-solid";
import { SearchIcon } from "../components/site/icons";

export default function IconButtonBasic() {
  return (
    <IconButton aria-label="Search database">
      <SearchIcon />
    </IconButton>
  );
}
