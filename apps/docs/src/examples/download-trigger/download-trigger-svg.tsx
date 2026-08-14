import { Button, type ButtonProps, DownloadTrigger } from "chakra-ui-solid";

const data = `
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
  <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red"/>
</svg>
`;

export default function DownloadTriggerSvg() {
  return (
    <DownloadTrigger
      data={data}
      fileName="sample.svg"
      mimeType="image/svg+xml"
      render={(props) => <Button variant="outline" {...(props as ButtonProps)} />}
    >
      Download svg
    </DownloadTrigger>
  );
}
