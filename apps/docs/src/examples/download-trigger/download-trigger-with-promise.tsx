import { Button, type ButtonProps, DownloadTrigger } from "chakra-ui-solid";
import { ImageDownIcon } from "../../components/ui/icons";

const data = async () => {
  const res = await fetch("https://picsum.photos/200/300");
  return res.blob();
};

export default function DownloadTriggerWithPromise() {
  return (
    <DownloadTrigger
      data={data}
      fileName="sample.jpg"
      mimeType="image/jpeg"
      render={(props) => <Button variant="outline" {...(props as ButtonProps)} />}
    >
      <ImageDownIcon /> Download
    </DownloadTrigger>
  );
}
