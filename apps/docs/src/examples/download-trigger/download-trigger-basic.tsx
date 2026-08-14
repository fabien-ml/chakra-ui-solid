import { Button, type ButtonProps, DownloadTrigger } from "chakra-ui-solid";

const data = "The quick brown fox jumps over the lazy dog";

export default function DownloadTriggerBasic() {
  return (
    <DownloadTrigger
      data={data}
      fileName="sample.txt"
      mimeType="text/plain"
      render={(props) => <Button variant="outline" {...(props as ButtonProps)} />}
    >
      Download txt
    </DownloadTrigger>
  );
}
