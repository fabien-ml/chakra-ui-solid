import { expectNoA11yViolations, mount } from "@chakra-ui-solid/internal-test-utils";
import type { JSX } from "@solidjs/web";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { LocaleProvider, useFilter, useLocaleContext } from "../locale";

/**
 * Two claims, and the second is the one with no other guard: the direction is *derived* from the
 * locale tag rather than passed in, and `useFilter` is locale-aware rather than a plain
 * case-insensitive `includes`. A filter that quietly ignored the ambient locale would pass every
 * English test ever written.
 *
 * Both probes render what they read into the DOM. Reading a context memo straight into a variable
 * in a component body is an untracked read, which Solid 2.0 reports and `mount()` fails on; a JSX
 * expression is a tracked computation, and it is also what a real component does with `dir`.
 */

function LocaleProbe(): JSX.Element {
  const locale = useLocaleContext();
  return (
    <p data-testid="locale" data-locale={locale().locale} dir={locale().dir}>
      locale probe
    </p>
  );
}

/**
 * `mañana` contains `man` under English collation — `ñ` folds to `n` at base sensitivity — and does
 * not under Spanish, where `ñ` is its own letter. One assertion, and it can only pass if the filter
 * really is built with the locale in hand.
 */
function FilterProbe(props: { locale?: string }): JSX.Element {
  const filter = useFilter({
    sensitivity: "base",
    // A getter, so the read happens inside `useFilter`'s memo rather than untracked in this body.
    get locale() {
      return props.locale;
    },
  });
  return (
    <p data-testid="filter" data-contains={String(filter().contains("mañana", "man"))}>
      filter probe
    </p>
  );
}

let mounted: { container: HTMLElement; dispose: () => void } | undefined;

function render(ui: () => JSX.Element): HTMLElement {
  mounted = mount(ui);
  const element = mounted.container.querySelector("[data-testid]");
  if (!(element instanceof HTMLElement)) {
    throw new Error("the probe did not render");
  }
  return element;
}

afterEach(() => {
  mounted?.dispose();
  mounted = undefined;
});

describe("useLocaleContext", () => {
  it("answers `en-US` / `ltr` with no provider anywhere", () => {
    // The context carries a default rather than throwing, so a single component is usable on its
    // own. A version that threw would make every component require a provider it does not need.
    const probe = render(() => <LocaleProbe />);

    expect(probe.getAttribute("data-locale")).toBe("en-US");
    expect(probe.getAttribute("dir")).toBe("ltr");
  });
});

describe("LocaleProvider", () => {
  it("derives `rtl` from an RTL locale tag", () => {
    const probe = render(() => (
      <LocaleProvider locale="ar-EG">
        <LocaleProbe />
      </LocaleProvider>
    ));

    expect(probe.getAttribute("data-locale")).toBe("ar-EG");
    expect(probe.getAttribute("dir")).toBe("rtl");
  });

  it("derives it from the tag's *script*, not from a list of languages", () => {
    // `isRTL` maximizes the tag and reads the script, so a tag whose language alone says nothing —
    // Azerbaijani is Latin in Azerbaijan and Arabic in Iran — still resolves correctly. A hard-coded
    // language list would get `az-Arab` wrong.
    const arabicScript = render(() => (
      <LocaleProvider locale="az-Arab">
        <LocaleProbe />
      </LocaleProvider>
    ));
    expect(arabicScript.getAttribute("dir")).toBe("rtl");
    mounted?.dispose();
    mounted = undefined;

    const latinScript = render(() => (
      <LocaleProvider locale="az-AZ">
        <LocaleProbe />
      </LocaleProvider>
    ));
    expect(latinScript.getAttribute("dir")).toBe("ltr");
  });

  it("re-derives the direction when the locale changes", () => {
    // A language switcher is the whole reason this is a memo over a prop rather than a value read
    // once. Every machine takes `dir`, so a stale one mis-maps every arrow key in the tree.
    const [locale, setLocale] = createSignal("en-US");
    const probe = render(() => (
      <LocaleProvider locale={locale()}>
        <LocaleProbe />
      </LocaleProvider>
    ));

    expect(probe.getAttribute("dir")).toBe("ltr");
    // Solid 2.0 defers a plain write until the next flush.
    flush(() => setLocale("he-IL"));
    expect(probe.getAttribute("dir")).toBe("rtl");
  });

  it("is accessible", async () => {
    const { container, dispose } = mount(() => (
      <LocaleProvider locale="ar-EG">
        <LocaleProbe />
      </LocaleProvider>
    ));
    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("useFilter", () => {
  it("matches under the ambient locale's collation", () => {
    const probe = render(() => (
      <LocaleProvider locale="en-US">
        <FilterProbe />
      </LocaleProvider>
    ));
    expect(probe.getAttribute("data-contains")).toBe("true");
    mounted?.dispose();
    mounted = undefined;

    const spanish = render(() => (
      <LocaleProvider locale="es-ES">
        <FilterProbe />
      </LocaleProvider>
    ));
    expect(spanish.getAttribute("data-contains")).toBe("false");
  });

  it("lets an explicit `locale` option override the ambient one", () => {
    const probe = render(() => (
      <LocaleProvider locale="en-US">
        <FilterProbe locale="es-ES" />
      </LocaleProvider>
    ));
    expect(probe.getAttribute("data-contains")).toBe("false");
  });

  it("falls back to the default locale with no provider", () => {
    const probe = render(() => <FilterProbe />);
    expect(probe.getAttribute("data-contains")).toBe("true");
  });
});
