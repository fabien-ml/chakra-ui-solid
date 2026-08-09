import type { JSX } from "@solidjs/web";
import { renderToStream } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import { LocaleProvider, useFilter, useLocaleContext } from "../locale";

/**
 * The direction has to be right in the **first** bytes the server sends. Every Zag machine takes
 * `dir` and every root element carries the attribute, and the recipes are authored against logical
 * properties the browser resolves from it — so a page that arrives `ltr` and flips after hydration
 * lays itself out backwards and then jumps.
 *
 * There is no DOM here, so the assertions read the emitted markup. That is a string check on an
 * *attribute*, not on a class name — the banned assertion is the one where a class stands in for
 * styling that may never have been generated (`testing.md` §2).
 */

function LocaleProbe(): JSX.Element {
  const locale = useLocaleContext();
  return (
    <p data-locale={locale().locale} dir={locale().dir}>
      locale probe
    </p>
  );
}

function FilterProbe(): JSX.Element {
  const filter = useFilter({ sensitivity: "base" });
  return <p data-contains={String(filter().contains("mañana", "man"))}>filter probe</p>;
}

describe("LocaleProvider on the server", () => {
  it("emits the derived direction into the markup", async () => {
    const html = await renderToStream(() => (
      <LocaleProvider locale="ar-EG">
        <LocaleProbe />
      </LocaleProvider>
    ));

    expect(html).toContain('dir="rtl"');
    expect(html).toContain('data-locale="ar-EG"');
  });

  it("emits the default with no provider", async () => {
    const html = await renderToStream(() => <LocaleProbe />);

    expect(html).toContain('dir="ltr"');
    expect(html).toContain('data-locale="en-US"');
  });

  it("runs `useFilter` with no DOM", async () => {
    // Collation is `Intl`, not the DOM, so a collection component can filter during SSR. If this
    // ever stops being true the failure is a server crash on the first such component, three
    // batches from now.
    const html = await renderToStream(() => (
      <LocaleProvider locale="es-ES">
        <FilterProbe />
      </LocaleProvider>
    ));

    expect(html).toContain('data-contains="false"');
  });
});
