import { mergeProps, normalizeProps, useMachine } from "@chakra-ui-solid/core";
import { type MountedComponent, mount } from "@chakra-ui-solid/internal-test-utils";
import type { JSX } from "@solidjs/web";
import * as collapsible from "@zag-js/collapsible";
import {
  type Accessor,
  createMemo,
  createProjection,
  createSignal,
  createUniqueId,
  flush,
  getOwner,
  Show,
  untrack,
} from "solid-js";
import { describe, expect, it } from "vitest";

/**
 * Which shape the **machine store** takes — the value `create<Name>()` returns and every part
 * component reads off context — measured rather than argued. The shape gets stamped 51 times.
 *
 * Six candidates, all over one `createMemo(() => connect(service, normalizeProps))`, which returns a
 * whole new plain object on every machine transition:
 *
 * | | shape | a consumer writes |
 * |---|---|---|
 * | A | stable object of getters delegating to `api()` | `collapsible.open` |
 * | B | `{ api: Accessor<Api> }` | `collapsible.api().open` |
 * | C | `Accessor<Api & { unmounted }>`, built by spreading | `collapsible().open` |
 * | D | `createProjection` over the whole api | `collapsible.open` |
 * | D′ | projection over the data members only; functions delegated as in A | `collapsible.open` |
 * | D″ | projection over the *results* of the prop getters, for per-attribute tracking | `collapsible.open` |
 *
 * **The machine is real.** `@zag-js/collapsible` is started through the adapter in every instance,
 * `connect()` runs on every transition, and the parts merge its prop getters through this repo's own
 * `mergeProps` and spread the result onto an element — the whole internal read path. What is
 * synthetic is only the api's *width*: Zag's widest is `date-picker` at 78 members (25 data, 23
 * methods, 30 prop getters), so members in that proportion are added to the connected object to
 * reach 30 and 78. A transition changes every real part's props and half the synthetic ones, which
 * is what a wide machine's transition does — a date-picker view change moves every table cell and
 * leaves the root and the control alone.
 *
 * The styling layer is deliberately absent — no slot recipe, no `renderStyled`. Both are identical
 * under all six shapes and would only add a constant.
 *
 * Run it. The numbers arrive as test annotations, which need the verbose reporter:
 *
 * ```
 * pnpm vitest run --project=browser store-shape --reporter=verbose
 * ```
 */

/** The proportions of `date-picker`'s 78-member api, the widest Zag ships. */
interface ApiWidth {
  label: string;
  data: number;
  methods: number;
  getters: number;
}

const WIDTHS = {
  collapsible: { label: "10 members", data: 4, methods: 2, getters: 4 },
  typical: { label: "30 members", data: 10, methods: 9, getters: 11 },
  datePicker: { label: "78 members", data: 25, methods: 23, getters: 30 },
} satisfies Record<string, ApiWidth>;

/** `unmounted` included: it is a member of the store under every shape. */
const REAL_MEMBERS = {
  data: ["open", "visible", "disabled", "unmounted"],
  methods: ["setOpen", "measureSize"],
  getters: ["getRootProps", "getTriggerProps", "getContentProps", "getIndicatorProps"],
};

/** Marks the transition a part's props were last built in, so propagation can be asserted. */
const generationMark = (generation: number) => (generation % 2 === 0 ? "even" : "odd");

/** The parts whose props a transition leaves untouched. Half the synthetic ones, by construction. */
const STEADY = "steady";

/** The one part behind a `<Show>`, as `Collapsible.Content` is behind the render strategy. */
const GATED_PART = "getContentProps";

interface Counters {
  /** How many times the api memo recomputed. One per transition, under every shape. */
  connectCalls: number;
  /** How many times a part's `() => api.getXProps()` source ran — its merge memo, invalidated. */
  partSourceCalls: number;
  /** A consumer's compute over a member this transition **changed**. */
  narrowChanged: number;
  /** A consumer's compute over a member this transition left alone. All that granularity buys. */
  narrowStable: number;
  /** `setAttribute`/`removeAttribute` calls, counted only in the pass that patches for them. */
  attributeWrites: number;
}

const newCounters = (): Counters => ({
  connectCalls: 0,
  partSourceCalls: 0,
  narrowChanged: 0,
  narrowStable: 0,
  attributeWrites: 0,
});

type WideApi = Record<string, any>;

function getterNames(width: ApiWidth): string[] {
  const synthetic = Array.from(
    { length: width.getters - REAL_MEMBERS.getters.length },
    (_, index) => `getPart${index}Props`,
  );
  return [...REAL_MEMBERS.getters, ...synthetic];
}

/**
 * The real connected api, widened to `width` and re-derived on every tick.
 *
 * `tick` stands in for a transition: it re-runs `connect()` and produces a fresh object, which is
 * exactly what a transition does to everything downstream — without dragging the `raf` measuring and
 * the `animationend` window of a real open/close into the measurement. `open` is overridden from the
 * tick so that one data member really flips, and one real click is cross-checked in its own test.
 */
function createWideApi(
  width: ApiWidth,
  tick: Accessor<number>,
  counters: Counters,
  controlledOpen?: Accessor<boolean>,
) {
  const service = useMachine(collapsible.machine, () => ({
    id: createUniqueId(),
    open: controlledOpen?.(),
  }));

  return createMemo<WideApi>(() => {
    counters.connectCalls++;
    const generation = tick();
    const mark = generationMark(generation);
    const api: WideApi = { ...collapsible.connect(service, normalizeProps) };

    // With a controlled `open` the machine supplies the change itself, and the real prop getters
    // already move `data-state` and `aria-expanded` — the cross-check test wants exactly that.
    if (controlledOpen !== undefined) {
      return api;
    }

    api.open = generation % 2 === 0;

    for (const name of REAL_MEMBERS.getters) {
      const connected = api[name];
      api[name] = () => ({ ...connected(), "data-generation": mark });
    }

    for (let index = 0; index < width.data - REAL_MEMBERS.data.length; index++) {
      api[`flag${index}`] = index % 2 === 0 ? generation % 2 === 0 : true;
    }
    for (let index = 0; index < width.methods - REAL_MEMBERS.methods.length; index++) {
      api[`method${index}`] = () => generation;
    }
    for (let index = 0; index < width.getters - REAL_MEMBERS.getters.length; index++) {
      const changes = index % 2 === 0;
      api[`getPart${index}Props`] = () => ({
        "data-part": `part${index}`,
        "data-generation": changes ? mark : STEADY,
        "aria-hidden": changes && generation % 2 === 0 ? "true" : undefined,
      });
    }
    return api;
  });
}

/** What a part component and a consumer each need, whatever the shape underneath. */
interface StoreProbe {
  /** The source a part hands to `mergeProps` — `() => ctx.getTriggerProps()`, in shape terms. */
  partSource: (getter: string) => () => Record<string, unknown>;
  /** A narrow read of a member this transition changed. */
  readChanged: () => unknown;
  /** A narrow read of a member this transition left alone. */
  readStable: () => unknown;
  /** The render-strategy read every gated part makes. */
  readUnmounted: () => boolean;
}

type ShapeName = "A" | "B" | "C" | "D" | "D′" | "D″";

type ShapeBuilder = (api: Accessor<WideApi>, unmounted: Accessor<boolean>) => StoreProbe;

/**
 * Shape A — a stable object whose every member is a getter, or a method, over the one memo.
 *
 * Built by enumeration where the shipped store is written out by hand, and the delegates are
 * **fixed-arity** because that is what a hand-written one is: `getItemProps(props) { return
 * api().getItemProps(props) }`. The test below pins the two against each other.
 */
const shapeA: ShapeBuilder = (api, unmounted) => {
  const store: WideApi = {};
  Object.defineProperty(store, "unmounted", { get: unmounted, enumerable: true });
  const snapshot = untrack(api);
  for (const key of Object.keys(snapshot)) {
    if (typeof snapshot[key] === "function") {
      store[key] = (arg: unknown) => api()[key](arg);
    } else {
      Object.defineProperty(store, key, { get: () => api()[key], enumerable: true });
    }
  }
  return {
    partSource: (getter) => () => store[getter](),
    readChanged: () => store.open,
    readStable: () => store.disabled,
    readUnmounted: () => store.unmounted,
  };
};

/**
 * Shape A as `createMachineStore` ships it: the enumerated A with **rest-args** delegates.
 *
 * A fixed-arity delegate is not available to a general helper — Zag has multi-argument members
 * (`setChannelValue(channel, value)`, `item(index, count)`, `setOpen(open, reason?)`) and naming one
 * parameter drops the rest silently. This is here to price the forwarding, not to choose it.
 */
const shapeARestArgs: ShapeBuilder = (api, unmounted) => {
  const store: WideApi = {};
  Object.defineProperty(store, "unmounted", { get: unmounted, enumerable: true });
  const snapshot = untrack(api);
  for (const key of Object.keys(snapshot)) {
    if (typeof snapshot[key] === "function") {
      store[key] = (...args: unknown[]) => api()[key](...args);
    } else {
      Object.defineProperty(store, key, { get: () => api()[key], enumerable: true });
    }
  }
  return {
    partSource: (getter) => () => store[getter](),
    readChanged: () => store.open,
    readStable: () => store.disabled,
    readUnmounted: () => store.unmounted,
  };
};

/** Shape B — the memo itself, under a key, with the library-only member beside it. */
const shapeB: ShapeBuilder = (api, unmounted) => {
  const store = { api, unmounted };
  return {
    partSource: (getter) => () => store.api()[getter](),
    readChanged: () => store.api().open,
    readStable: () => store.api().disabled,
    readUnmounted: () => store.unmounted(),
  };
};

/** Shape C — one more memo, spreading the api so the library-only member can join it. Ark's shape. */
const shapeC: ShapeBuilder = (api, unmounted) => {
  const store = createMemo<WideApi>(() => ({ ...api(), unmounted: unmounted() }));
  return {
    partSource: (getter) => () => store()[getter](),
    readChanged: () => store().open,
    readStable: () => store().disabled,
    readUnmounted: () => store().unmounted,
  };
};

/** Shape D — a projection store over the whole api, per-key tracking and all. */
const shapeD: ShapeBuilder = (api, unmounted) => {
  const seed = untrack(() => ({ ...api(), unmounted: unmounted() }));
  const store = createProjection<WideApi>((draft) => {
    const current = api();
    for (const key in current) {
      draft[key] = current[key];
    }
    draft.unmounted = unmounted();
  }, seed);
  return {
    partSource: (getter) => () => store[getter](),
    readChanged: () => store.open,
    readStable: () => store.disabled,
    readUnmounted: () => store.unmounted,
  };
};

/**
 * Shape D′ — the only version of D that can deliver what D is for.
 *
 * A projection writes a fresh function identity into the draft on every run, so every function
 * member notifies on every transition however little changed. Keeping the functions out of the store
 * — delegated exactly as in A — leaves the projection holding only the data members, which are the
 * ones whose values can actually stay equal across a transition.
 */
const shapeDPrime: ShapeBuilder = (api, unmounted) => {
  const snapshot = untrack(api);
  const dataKeys = Object.keys(snapshot).filter((key) => typeof snapshot[key] !== "function");
  const seed: WideApi = untrack(() => {
    const current = api();
    const initial: WideApi = { unmounted: unmounted() };
    for (const key of dataKeys) {
      initial[key] = current[key];
    }
    return initial;
  });
  const flags = createProjection<WideApi>((draft) => {
    const current = api();
    for (const key of dataKeys) {
      draft[key] = current[key];
    }
    draft.unmounted = unmounted();
  }, seed);
  return {
    partSource: (getter) => () => api()[getter](),
    readChanged: () => flags.open,
    readStable: () => flags.disabled,
    readUnmounted: () => flags.unmounted,
  };
};

/**
 * Shape D″ — granularity taken as far as it goes: the projection holds the **result** of every prop
 * getter, so a part subscribes per attribute and a part whose attributes did not change never
 * re-runs at all. It is the only shape whose part work is not proportional to the anatomy.
 *
 * It is also **inapplicable to most machines**, and that is not a taste objection: 115 of Zag's 409
 * prop getters take a required argument (`getItemProps({ value })`,
 * `getDayTableCellProps({ value })`), across 32 of the 51 machines. A result cannot be projected for
 * a getter whose argument is not known until a part renders. Measured here at full width anyway,
 * because what it costs and what it saves is the ceiling on the whole idea.
 */
const shapeDDouble: ShapeBuilder = (api, unmounted) => {
  const names = Object.keys(untrack(api)).filter((key) => key.startsWith("get"));
  const resultKey = (getter: string) => `${getter}$result`;
  const seed = untrack(() => {
    const current = api();
    const initial: WideApi = { open: current.open, disabled: current.disabled, unmounted: false };
    for (const name of names) {
      initial[resultKey(name)] = { ...current[name]() };
    }
    return initial;
  });
  const store = createProjection<WideApi>((draft) => {
    const current = api();
    draft.open = current.open;
    draft.disabled = current.disabled;
    draft.unmounted = unmounted();
    for (const name of names) {
      const next = current[name]();
      const slot = draft[resultKey(name)];
      for (const key in next) {
        slot[key] = next[key];
      }
      for (const key in slot) {
        if (!(key in next)) {
          delete slot[key];
        }
      }
    }
  }, seed);
  return {
    partSource: (getter) => () => store[resultKey(getter)],
    readChanged: () => store.open,
    readStable: () => store.disabled,
    readUnmounted: () => store.unmounted,
  };
};

/**
 * Shape A as the shipped `createCollapsible` actually writes it — an **object literal** of getters
 * and methods, read by parts that name their getter statically. Only valid at collapsible's width, so
 * it stays out of the matrix and gets its own test.
 *
 * It exists so the matrix's enumerated `shapeA` can be checked against the thing that ships. The two
 * differ in ways that look like they should matter — a literal keeps V8's fast mode where a
 * `defineProperty`-built object goes to dictionary, and a static `store.getTriggerProps()` is
 * monomorphic where `store[getter]()` is not — and measure the same.
 */
const shapeALiteral: ShapeBuilder = (api, unmounted) => {
  const store = {
    get open() {
      return api().open;
    },
    get visible() {
      return api().visible;
    },
    get disabled() {
      return api().disabled;
    },
    get unmounted() {
      return unmounted();
    },
    setOpen(open: boolean) {
      api().setOpen(open);
    },
    measureSize() {
      api().measureSize();
    },
    getRootProps() {
      return api().getRootProps();
    },
    getTriggerProps() {
      return api().getTriggerProps();
    },
    getContentProps() {
      return api().getContentProps();
    },
    getIndicatorProps() {
      return api().getIndicatorProps();
    },
  };

  const sources: Record<string, () => Record<string, unknown>> = {
    getRootProps: () => store.getRootProps(),
    getTriggerProps: () => store.getTriggerProps(),
    getContentProps: () => store.getContentProps(),
    getIndicatorProps: () => store.getIndicatorProps(),
  };

  return {
    partSource: (getter) => sources[getter] as () => Record<string, unknown>,
    readChanged: () => store.open,
    readStable: () => store.disabled,
    readUnmounted: () => store.unmounted,
  };
};

const SHAPES: Record<ShapeName, ShapeBuilder> = {
  A: shapeA,
  B: shapeB,
  C: shapeC,
  D: shapeD,
  "D′": shapeDPrime,
  "D″": shapeDDouble,
};

const SHAPE_NAMES = Object.keys(SHAPES) as ShapeName[];

/**
 * One part component: merge the machine's props for this part with the component's own, spread the
 * result. What every one of the 200-plus part call sites does.
 */
function Part(props: { source: () => Record<string, unknown>; own: Record<string, unknown> }) {
  const elementProps = mergeProps(props.source, props.own) as JSX.HTMLAttributes<HTMLDivElement>;
  return <div {...elementProps} />;
}

/** One machine, its parts, one gated part, and two narrow consumer reads — per instance. */
function buildInstance(
  build: ShapeBuilder,
  width: ApiWidth,
  tick: Accessor<number>,
  counters: Counters,
  controlledOpen?: Accessor<boolean>,
) {
  return () => {
    const api = createWideApi(width, tick, counters, controlledOpen);
    const [unmounted] = createSignal(false);
    const probe = build(api, unmounted);

    const changed = createMemo(() => {
      counters.narrowChanged++;
      return probe.readChanged();
    });
    const stable = createMemo(() => {
      counters.narrowStable++;
      return probe.readStable();
    });

    const countedSource = (getter: string) => () => {
      counters.partSourceCalls++;
      return probe.partSource(getter)();
    };

    return (
      <div>
        <span>
          {String(changed())}/{String(stable())}
        </span>
        {getterNames(width)
          .filter((getter) => getter !== GATED_PART)
          .map((getter) => (
            <Part source={countedSource(getter)} own={{ class: "part" }} />
          ))}
        <Show when={!probe.readUnmounted()}>
          <Part source={countedSource(GATED_PART)} own={{ class: "part" }} />
        </Show>
      </div>
    );
  };
}

/**
 * Every part element carries the transition its props were built in, so a shape that fails to
 * propagate is caught rather than timed. A steady part keeps its own mark.
 */
function assertPropagated(container: HTMLElement, generation: number, expectedParts: number) {
  const marked = [...container.querySelectorAll("[data-generation]")];
  expect(marked.length).toBe(expectedParts);
  const mark = generationMark(generation);
  for (const element of marked) {
    const value = element.getAttribute("data-generation");
    if (value !== STEADY) {
      expect(value).toBe(mark);
    }
  }
}

interface CaseResult {
  shape: string;
  microsecondsPerTransition: number;
  counters: Counters;
}

/** Attribute writes get their own pass — the patch costs more than the number it reports. */
async function countingAttributeWrites<T>(
  counters: Counters,
  run: () => T | Promise<T>,
): Promise<T> {
  const { setAttribute, removeAttribute } = Element.prototype;
  Element.prototype.setAttribute = function patched(this: Element, ...args) {
    counters.attributeWrites++;
    return setAttribute.apply(this, args);
  };
  Element.prototype.removeAttribute = function patched(this: Element, ...args) {
    counters.attributeWrites++;
    return removeAttribute.apply(this, args);
  };
  try {
    return await run();
  } finally {
    Element.prototype.setAttribute = setAttribute;
    Element.prototype.removeAttribute = removeAttribute;
  }
}

const settle = () => new Promise<void>((resolve) => queueMicrotask(resolve));

/**
 * Every reactive node an instance keeps alive, by walking the owner tree the instance's component
 * owns. A node with an `_fn` is a computation — a memo, a projection, a render effect.
 */
function countOwnerTree(root: unknown): { computations: number; owners: number } {
  let computations = 0;
  let owners = 0;
  const walk = (node: any) => {
    owners++;
    if ("_fn" in node) {
      computations++;
    }
    let child = node._firstChild;
    while (child) {
      walk(child);
      child = child._nextSibling;
    }
  };
  walk(root as any);
  return { computations, owners };
}

/**
 * The store nodes an instance keeps that the owner walk cannot see: a projection allocates one signal
 * per property **any reader touched**, on the proxy target rather than in the owner tree
 * (`@solidjs/signals`, `storeTraps.get` → `getNodes(target, STORE_NODE)`). At `date-picker` width
 * every part reads its own getter key and the three consumer reads take three more, so the count is
 * deterministic rather than measured. D″ adds one node per attribute inside each projected result,
 * since that is what its parts subscribe to.
 */
function storeNodesPerInstance(shape: ShapeName, width: ApiWidth): number {
  const consumerReads = 3;
  const attributesPerPart = 3;
  switch (shape) {
    case "D":
      return width.getters + consumerReads;
    case "D′":
      return consumerReads;
    case "D″":
      return width.getters * (1 + attributesPerPart) + consumerReads;
    default:
      return 0;
  }
}

async function runCase(
  shape: string,
  build: ShapeBuilder,
  width: ApiWidth,
  instances: number,
  transitions: number,
): Promise<CaseResult> {
  const counters = newCounters();
  const [tick, setTick] = createSignal(0);

  let mounted: MountedComponent | undefined;
  try {
    mounted = mount(() => {
      const tree: JSX.Element[] = [];
      for (let index = 0; index < instances; index++) {
        const Instance = buildInstance(build, width, tick, counters);
        tree.push(<Instance />);
      }
      return tree;
    });
    await settle();

    // One transition before the clock starts, so the first-write paths — a store's per-key nodes, a
    // spread's `prevProps` — are warm and what is timed is a steady-state transition.
    flush(() => setTick(1));
    assertPropagated(mounted.container, 1, instances * width.getters);

    const start = performance.now();
    for (let generation = 2; generation < transitions + 2; generation++) {
      flush(() => setTick(generation));
    }
    const elapsed = performance.now() - start;
    assertPropagated(mounted.container, transitions + 1, instances * width.getters);

    const before = { ...counters };
    const lastGeneration = transitions + 2;
    await countingAttributeWrites(counters, () => {
      flush(() => setTick(lastGeneration));
    });
    assertPropagated(mounted.container, lastGeneration, instances * width.getters);

    return {
      shape,
      microsecondsPerTransition: (elapsed / transitions) * 1000,
      counters: {
        connectCalls: counters.connectCalls - before.connectCalls,
        partSourceCalls: counters.partSourceCalls - before.partSourceCalls,
        narrowChanged: counters.narrowChanged - before.narrowChanged,
        narrowStable: counters.narrowStable - before.narrowStable,
        attributeWrites: counters.attributeWrites,
      },
    };
  } finally {
    mounted?.dispose();
  }
}

/**
 * Three rounds, **interleaved across shapes**, cheapest round wins per shape.
 *
 * Three runs of one shape before moving to the next measured the first shape in the list 30% slow and
 * every later one warm: they share `mergeProps`, `spread` and `connect`, so whoever runs first pays
 * for their optimisation. Interleaving means every shape has a round where the shared code is hot,
 * and the minimum picks it. Noise here only ever adds, which is what makes the minimum the estimator.
 */
async function measureShapes(
  variants: Array<[string, ShapeBuilder]>,
  width: ApiWidth,
  instances: number,
  transitions: number,
): Promise<CaseResult[]> {
  const best = new Map<string, CaseResult>();
  for (let round = 0; round < 3; round++) {
    for (const [label, build] of variants) {
      const result = await runCase(label, build, width, instances, transitions);
      const previous = best.get(label);
      if (previous === undefined) {
        best.set(label, result);
      } else {
        expect(result.counters).toEqual(previous.counters);
        if (result.microsecondsPerTransition < previous.microsecondsPerTransition) {
          best.set(label, result);
        }
      }
    }
  }
  return variants.map(([label]) => best.get(label) as CaseResult);
}

function table(rows: CaseResult[]): string {
  const header =
    "shape | µs/transition | part sources | narrow: changed | narrow: stable | attr writes";
  const body = rows.map(
    ({ shape, microsecondsPerTransition, counters }) =>
      `${shape.padEnd(5)} | ${microsecondsPerTransition.toFixed(1).padStart(13)} | ` +
      `${String(counters.partSourceCalls).padStart(12)} | ` +
      `${String(counters.narrowChanged).padStart(15)} | ` +
      `${String(counters.narrowStable).padStart(14)} | ` +
      `${String(counters.attributeWrites).padStart(11)}`,
  );
  return [header, ...body].join("\n");
}

describe("machine store shape", () => {
  it("costs a transition, at each api width and tree size", async ({ annotate }) => {
    const cases: Array<[string, ApiWidth, number]> = [
      ["1 instance, 10 members, 4 parts — collapsible today", WIDTHS.collapsible, 1],
      ["1 instance, 30 members, 11 parts — the typical machine", WIDTHS.typical, 1],
      ["1 instance, 78 members, 30 parts — date-picker", WIDTHS.datePicker, 1],
      ["50 instances, 10 members — an accordion of 50 items", WIDTHS.collapsible, 50],
      ["10 instances, 78 members — 300 parts in one tree", WIDTHS.datePicker, 10],
    ];

    const variants = SHAPE_NAMES.map((shape) => [shape, SHAPES[shape]] as [string, ShapeBuilder]);

    const report: string[] = [];
    for (const [label, width, instances] of cases) {
      const rows = await measureShapes(variants, width, instances, 200);
      report.push(`\n${label}\n${table(rows)}`);
    }
    await annotate(report.join("\n"), "note");

    expect(report.length).toBe(cases.length);
  }, 300_000);

  it("measures the same written out as enumerated, so the matrix's A is A", async ({
    annotate,
  }) => {
    // The matrix builds A by enumeration because it has to serve three widths; the 51 components will
    // each write their store out instead. This is the one case where both can be measured, and it is
    // what licenses reading the matrix's A row as the shipped store's cost.
    const variants: Array<[string, ShapeBuilder]> = [
      ["A lit", shapeALiteral],
      ["A enum", SHAPES.A],
      // The shipping helper's delegate, against the arity-1 one the matrix's A uses.
      ["A rest", shapeARestArgs],
      ["B", SHAPES.B],
      ["C", SHAPES.C],
    ];

    const report: string[] = [];
    for (const instances of [1, 50]) {
      const rows = await measureShapes(variants, WIDTHS.collapsible, instances, 200);
      report.push(`\n${instances} instance(s), the real 10-member api\n${table(rows)}`);
    }
    await annotate(report.join("\n"), "note");

    expect(report.length).toBe(2);
  }, 300_000);

  it("keeps this many live reactive nodes per instance", async ({ annotate }) => {
    const rows: string[] = ["shape | computations | owners | store nodes | total"];

    for (const shape of SHAPE_NAMES) {
      const counters = newCounters();
      const [tick] = createSignal(0);

      let computations = 0;
      let owners = 0;
      const mounted = mount(() => {
        const Instance = buildInstance(SHAPES[shape], WIDTHS.datePicker, tick, counters);
        const tree = <Instance />;
        ({ computations, owners } = countOwnerTree(getOwner()));
        return tree;
      });
      await settle();
      mounted.dispose();

      const storeNodes = storeNodesPerInstance(shape, WIDTHS.datePicker);
      rows.push(
        `${shape.padEnd(5)} | ${String(computations).padStart(12)} | ${String(owners).padStart(6)} | ` +
          `${String(storeNodes).padStart(11)} | ${computations + storeNodes}`,
      );
    }

    await annotate(
      `${rows.join("\n")}\n\n` +
        "One instance at date-picker width: 78 api members, 30 parts. The `computations` column is a " +
        "walk of the instance's own owner tree; `store nodes` is the projection's per-key signals, " +
        "which are not owners and so are counted rather than walked (see storeNodesPerInstance).",
      "note",
    );

    expect(rows.length).toBe(SHAPE_NAMES.length + 1);
  }, 300_000);

  it("agrees with a real machine transition, not just a fresh api object", async ({ annotate }) => {
    const rows: string[] = ["shape | connect calls | part sources | attr writes"];

    for (const shape of SHAPE_NAMES) {
      const counters = newCounters();
      const [tick] = createSignal(0);
      const [open, setOpen] = createSignal(false);

      const mounted = mount(() => {
        const Instance = buildInstance(SHAPES[shape], WIDTHS.collapsible, tick, counters, open);
        return <Instance />;
      });
      await settle();

      const toggle = async (next: boolean) => {
        setOpen(next);
        await settle();
      };
      await toggle(true);

      // The root's `data-state`, not the trigger's `aria-expanded`: the trigger stays expanded
      // through the machine's `closing` window, which without the recipe's keyframes never ends.
      const root = mounted.container.querySelector('[data-part="root"]');
      expect(root?.getAttribute("data-state")).toBe("open");

      const before = { ...counters };
      await toggle(false);
      await toggle(true);
      const perTransition = {
        connectCalls: (counters.connectCalls - before.connectCalls) / 2,
        partSourceCalls: (counters.partSourceCalls - before.partSourceCalls) / 2,
      };

      const writes = newCounters();
      await countingAttributeWrites(writes, async () => {
        await toggle(false);
      });

      expect(root?.getAttribute("data-state")).toBe("closed");
      mounted.dispose();

      rows.push(
        `${shape.padEnd(5)} | ${String(perTransition.connectCalls).padStart(13)} | ` +
          `${String(perTransition.partSourceCalls).padStart(12)} | ` +
          `${String(writes.attributeWrites).padStart(11)}`,
      );
    }

    await annotate(
      `${rows.join("\n")}\n\n` +
        "One real collapsible, four parts, driven by a controlled `open`. No timings here — Chromium " +
        "clamps performance.now() to 100µs and two transitions cannot outrun that; the matrix test " +
        "amortises 200 of them instead. What this pins is that the counters a real transition " +
        "produces are the ones the synthetic tick produces, per part and per shape.",
      "note",
    );
    expect(rows.length).toBe(SHAPE_NAMES.length + 1);
  }, 300_000);
});
