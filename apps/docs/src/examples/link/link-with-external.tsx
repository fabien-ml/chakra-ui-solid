import { Link } from "chakra-ui-solid";
import { ExternalLinkIcon } from "../../components/ui/icons";

export default function LinkWithExternal() {
  return (
    <Link href="#">
      Visit Chakra UI <ExternalLinkIcon />
    </Link>
  );
}
