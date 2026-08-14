import { useEnvironmentContext } from "@chakra-ui-solid/core";
import { downloadFile, type FileMimeType } from "@zag-js/file-utils";

/** What a browser can be handed as a file: text, or an already-built binary. */
export type DownloadableData = string | Blob | File;

/** What {@link createDownload} takes. */
export interface CreateDownloadProps {
  /** The name the browser saves the file under. */
  fileName: string;
  /**
   * The file's MIME type. It decides what the browser does with the bytes — `text/plain` and
   * `image/svg+xml` are read as text, anything else as binary — and it is also what a `Blob` built
   * from a string is tagged with.
   */
  mimeType: FileMimeType;
  /**
   * The bytes themselves, or a function returning them — and that function may return a promise, so
   * a file that has to be fetched or generated is only produced when the download is asked for.
   */
  data: DownloadableData | (() => DownloadableData | Promise<DownloadableData>);
}

/** What {@link createDownload} returns. */
export interface CreateDownloadReturn {
  /** Save the file. Resolves `data` first when it is a function or a promise. */
  download: () => void;
}

/**
 * Saves a file to the reader's disk — the whole behavior `DownloadTrigger` is, on its own so a
 * consumer can hang it off anything.
 *
 * ```tsx
 * const { download } = createDownload({
 *   fileName: "notes.txt",
 *   mimeType: "text/plain",
 *   data: () => editor.value,
 * });
 * ```
 *
 * **Every prop is read when `download()` is called, never when this is.** That is what makes the
 * props above live: a `fileName` driven by a signal names the file whatever it is at the moment of
 * the click, where a hook that destructured its props would have frozen it at mount. Chakra's
 * `useDownload` gets the same effect from React re-running the whole hook on every render.
 *
 * A promise that rejects is left to reject. Nothing here catches it, so `data: () => fetch(…)` on a
 * dead URL surfaces as an unhandled rejection rather than as a silent no-op — the React version
 * behaves the same way, and a `.catch` inside the consumer's own `data` function is where a message
 * belongs.
 */
export function createDownload(props: CreateDownloadProps): CreateDownloadReturn {
  const environment = useEnvironmentContext();

  // `@zag-js/file-utils`, which is the function Ark's `useDownload` calls: a `Blob` tagged with the
  // MIME type, an object URL, a hidden `<a download>` clicked synthetically, and the URL revoked one
  // task later — plus the BOM and the macOS-WebView and legacy-Edge branches that a hand-written
  // version of this would have to rediscover.
  //
  // The window comes from the environment context rather than from the global, so a trigger rendered
  // inside an iframe clicks its anchor in *that* document. Read at call time for the reason every
  // other read here is.
  const saveToDisk = (data: DownloadableData): void => {
    downloadFile({
      file: data,
      name: props.fileName,
      type: props.mimeType,
      win: environment().getWindow(),
    });
  };

  const download = (): void => {
    const data = props.data;

    if (typeof data !== "function") {
      saveToDisk(data);
      return;
    }

    const resolved = data();
    if (resolved instanceof Promise) {
      resolved.then(saveToDisk);
      return;
    }

    saveToDisk(resolved);
  };

  return { download };
}
