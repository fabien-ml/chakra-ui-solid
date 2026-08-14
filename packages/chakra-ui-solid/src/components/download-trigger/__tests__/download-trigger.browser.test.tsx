import {
  expectNoA11yViolations,
  type MountedElement,
  mountElement,
} from "@chakra-ui-solid/internal-test-utils";
import { createSignal, flush } from "solid-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Button, type ButtonProps } from "../../button";
import { EnvironmentProvider } from "../../environment";
import { DownloadTrigger } from "../download-trigger";

let mounted: MountedElement | undefined;

/**
 * Every anchor `downloadFile` appends, snapshotted **as it is added**. Reading the DOM afterwards
 * would not work: the anchor is removed one task after the click, and the promise cases here resolve
 * later than that.
 */
let savedFiles: { download: string; href: string; rel: string }[] = [];
let anchorObserver: MutationObserver | undefined;

let createdUrls: string[] = [];
let revokedUrls: string[] = [];
let savedBlobs: Blob[] = [];

/**
 * The rejections the component deliberately does not catch. Registering a listener at all is what
 * keeps them off the run's error report — Vitest's browser client counts user listeners and steps
 * aside when it finds one — so this both records the contract and is why the suite stays green while
 * asserting it.
 */
let unhandledReasons: unknown[] = [];
const recordRejection = (event: PromiseRejectionEvent) => {
  unhandledReasons.push(event.reason);
  event.preventDefault();
};

beforeEach(() => {
  savedFiles = [];
  createdUrls = [];
  revokedUrls = [];
  savedBlobs = [];
  unhandledReasons = [];

  anchorObserver = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node instanceof HTMLAnchorElement && node.hasAttribute("download")) {
          savedFiles.push({ download: node.download, href: node.href, rel: node.rel });
        }
      }
    }
  });
  anchorObserver.observe(document.body, { childList: true });

  // Wrapped rather than replaced: the object URL is real, so what the assertions below read is the
  // browser's own lifecycle rather than a stub's idea of it.
  const createObjectURL = URL.createObjectURL.bind(URL);
  vi.spyOn(URL, "createObjectURL").mockImplementation((source: Blob | MediaSource) => {
    if (source instanceof Blob) {
      savedBlobs.push(source);
    }
    const url = createObjectURL(source);
    createdUrls.push(url);
    return url;
  });

  const revokeObjectURL = URL.revokeObjectURL.bind(URL);
  vi.spyOn(URL, "revokeObjectURL").mockImplementation((url: string) => {
    revokedUrls.push(url);
    revokeObjectURL(url);
  });

  window.addEventListener("unhandledrejection", recordRejection);
});

afterEach(() => {
  window.removeEventListener("unhandledrejection", recordRejection);
  anchorObserver?.disconnect();
  anchorObserver = undefined;
  vi.restoreAllMocks();
  mounted?.dispose();
  mounted = undefined;
});

const TEXT = "The quick brown fox jumps over the lazy dog";

function mountTrigger(ui: () => ReturnType<typeof DownloadTrigger>): HTMLButtonElement {
  mounted = mountElement(ui);
  return mounted.element as HTMLButtonElement;
}

describe("DownloadTrigger", () => {
  it("renders a button, and keeps the three download props off it", () => {
    const trigger = mountTrigger(() => (
      <DownloadTrigger data={TEXT} fileName="sample.txt" mimeType="text/plain">
        Download txt
      </DownloadTrigger>
    ));

    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger.textContent).toBe("Download txt");
    expect(trigger.type).toBe("button");
    // `data` is the one that matters: forwarded, a Blob would be stringified into an attribute.
    expect(trigger.hasAttribute("data")).toBe(false);
    expect(trigger.hasAttribute("fileName")).toBe(false);
    expect(trigger.hasAttribute("mimeType")).toBe(false);
  });

  it("saves the data as a file when clicked", async () => {
    const trigger = mountTrigger(() => (
      <DownloadTrigger data={TEXT} fileName="sample.txt" mimeType="text/plain">
        Download txt
      </DownloadTrigger>
    ));

    trigger.click();

    await vi.waitFor(() => expect(savedFiles).toHaveLength(1));
    // The `download` attribute is what makes the anchor save rather than navigate, and its value is
    // the file's name on disk.
    expect(savedFiles[0]?.download).toBe("sample.txt");
    expect(savedFiles[0]?.href).toBe(createdUrls[0]);
    expect(savedFiles[0]?.rel).toBe("noopener");

    expect(savedBlobs).toHaveLength(1);
    expect(savedBlobs[0]?.type).toBe("text/plain");
    await expect(savedBlobs[0]?.text()).resolves.toBe(TEXT);
  });

  it("revokes the object URL and takes the anchor back out of the document", async () => {
    const trigger = mountTrigger(() => (
      <DownloadTrigger data={TEXT} fileName="sample.txt" mimeType="text/plain">
        Download txt
      </DownloadTrigger>
    ));

    trigger.click();

    // Both happen one task after the click — long enough for the browser to have read the blob, and
    // short enough that a page clicking this a hundred times does not hold a hundred blobs alive.
    await vi.waitFor(() => expect(revokedUrls).toEqual(createdUrls));
    expect(document.body.querySelector("a[download]")).toBeNull();
    await expect(fetch(createdUrls[0] as string)).rejects.toThrow();
  });

  it("calls a function `data` at click time, not at mount", async () => {
    const data = vi.fn(() => TEXT);
    const trigger = mountTrigger(() => (
      <DownloadTrigger data={data} fileName="sample.txt" mimeType="text/plain">
        Download txt
      </DownloadTrigger>
    ));

    expect(data).not.toHaveBeenCalled();
    trigger.click();

    expect(data).toHaveBeenCalledTimes(1);
    await vi.waitFor(() => expect(savedFiles).toHaveLength(1));
  });

  it("waits for a promise before saving", async () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"></svg>';
    const trigger = mountTrigger(() => (
      <DownloadTrigger
        data={() => Promise.resolve(new Blob([svg], { type: "image/svg+xml" }))}
        fileName="sample.svg"
        mimeType="image/svg+xml"
      >
        Download svg
      </DownloadTrigger>
    ));

    trigger.click();
    // Nothing yet — the file does not exist until the promise settles.
    expect(savedFiles).toHaveLength(0);

    await vi.waitFor(() => expect(savedFiles).toHaveLength(1));
    expect(savedFiles[0]?.download).toBe("sample.svg");
    // A `Blob` is passed through as it is, so its own type is what the file gets.
    expect(savedBlobs[0]?.type).toBe("image/svg+xml");
  });

  it("names the file whatever `fileName` is at the moment of the click", async () => {
    // The Solid-native half of `createDownload`: every prop is read inside `download()`, so a signal
    // driving one of them is live. A hook that destructured its props would have frozen this at
    // mount.
    const [fileName, setFileName] = createSignal("first.txt");
    const trigger = mountTrigger(() => (
      <DownloadTrigger data={TEXT} fileName={fileName()} mimeType="text/plain">
        Download txt
      </DownloadTrigger>
    ));

    flush(() => setFileName("second.txt"));
    trigger.click();

    await vi.waitFor(() => expect(savedFiles).toHaveLength(1));
    expect(savedFiles[0]?.download).toBe("second.txt");
  });

  it("runs a consumer's `onClick` first, and lets it cancel the download", async () => {
    const order: string[] = [];
    const trigger = mountTrigger(() => (
      <DownloadTrigger
        data={TEXT}
        fileName="sample.txt"
        mimeType="text/plain"
        onClick={(event) => {
          order.push("consumer");
          event.preventDefault();
        }}
      >
        Download txt
      </DownloadTrigger>
    ));

    trigger.click();

    expect(order).toEqual(["consumer"]);
    // Given a task to appear in, and it does not.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(savedFiles).toHaveLength(0);
    expect(createdUrls).toHaveLength(0);
  });

  it("is a `button` whatever `type` says, which is Chakra's behaviour too", () => {
    // Ark writes `<ark.button {...rest} type="button">` — after the props, so it is fixed rather
    // than defaulted, and a download trigger never submits the form around it. Both spellings are
    // pinned: the fixed value survives an explicit `submit`, and a wrapper forwarding an unset
    // `type` cannot delete it either.
    const trigger = mountTrigger(() => (
      <DownloadTrigger data={TEXT} fileName="s.txt" mimeType="text/plain" type="submit">
        Download
      </DownloadTrigger>
    ));
    expect(trigger.type).toBe("button");

    mounted?.dispose();
    const forwarded = mountTrigger(() => (
      <DownloadTrigger data={TEXT} fileName="s.txt" mimeType="text/plain" type={undefined}>
        Download
      </DownloadTrigger>
    ));
    expect(forwarded.type).toBe("button");
  });

  it("leaves a rejected `data` promise to reject, and saves nothing", async () => {
    const failure = new Error("the file could not be fetched");
    const trigger = mountTrigger(() => (
      <DownloadTrigger
        data={() => Promise.reject(failure)}
        fileName="sample.jpg"
        mimeType="image/jpeg"
      >
        Download
      </DownloadTrigger>
    ));

    trigger.click();

    // Nothing catches it here and nothing catches it in Chakra — a `.catch` inside the consumer's own
    // `data` function is where a message belongs, and swallowing it here would make a dead URL a
    // button that silently does nothing. The `[Unhandled rejection]` line this test prints is the
    // assertion made visible, not a failure.
    await vi.waitFor(() => expect(unhandledReasons).toEqual([failure]));
    expect(savedFiles).toHaveLength(0);
    expect(createdUrls).toHaveLength(0);
  });

  it("clicks its anchor in the window the environment context names", async () => {
    // The only thing the environment context changes here, and the reason `downloadFile` takes a
    // `win` at all: a trigger rendered against another document saves from *that* document.
    const frame = document.createElement("iframe");
    document.body.append(frame);
    const frameDocument = frame.contentDocument as Document;

    mounted = mountElement(() => (
      <EnvironmentProvider value={frameDocument}>
        <DownloadTrigger data={TEXT} fileName="framed.txt" mimeType="text/plain">
          Download
        </DownloadTrigger>
      </EnvironmentProvider>
    ));
    (mounted.element as HTMLButtonElement).click();

    const anchor = frameDocument.body.querySelector("a[download]");
    expect(anchor).not.toBeNull();
    expect((anchor as HTMLAnchorElement).download).toBe("framed.txt");
    // …and not in ours.
    expect(savedFiles).toHaveLength(0);

    frame.remove();
  });

  it("carries no recipe of its own, and still takes style props", () => {
    // Its recipe key resolves to nothing in Chakra either, so what ships is a bare `button` — the
    // UA's `inline-block`, not the `inline-flex` a recipe would give it.
    const trigger = mountTrigger(() => (
      <DownloadTrigger data={TEXT} fileName="s.txt" mimeType="text/plain" padding="4">
        Download
      </DownloadTrigger>
    ));
    const style = getComputedStyle(trigger);

    expect(style.display).toBe("inline-block");
    expect(style.padding).toBe("16px");
  });

  it("puts the download on a real Button through `render`", async () => {
    // How every example on the page gets a look, and the analogue of Chakra's `asChild`.
    mounted = mountElement(() => (
      <DownloadTrigger
        data={TEXT}
        fileName="sample.txt"
        mimeType="text/plain"
        render={(props) => (
          <Button variant="outline" {...(props as ButtonProps)}>
            Download txt
          </Button>
        )}
      />
    ));
    const trigger = mounted.element as HTMLButtonElement;

    expect(getComputedStyle(trigger).display).toBe("inline-flex");
    expect(trigger.type).toBe("button");

    trigger.click();
    await vi.waitFor(() => expect(savedFiles).toHaveLength(1));
    expect(savedFiles[0]?.download).toBe("sample.txt");
  });

  it("is accessible", async () => {
    mounted = mountElement(() => (
      <DownloadTrigger data={TEXT} fileName="sample.txt" mimeType="text/plain">
        Download txt
      </DownloadTrigger>
    ));
    await expectNoA11yViolations(mounted.container);
  });
});
