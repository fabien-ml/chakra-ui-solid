import { renderToStream } from "@solidjs/web";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { createRegisteredId } from "../create-registered-id";

/**
 * `onSettled` does not run on the server, so **nothing registers there** — and that is a fact a
 * component author has to design around rather than a detail. An ancestor whose
 * `aria-labelledby`/`aria-describedby` must already be in the server's markup needs its own
 * server-visible fallback id; one that only ever renders inside a `Portal` emits no server markup to
 * disagree with, so it is safe either way.
 *
 * This file is what makes that statement measured. The browser file proves the write does happen
 * after mount; without this one, "does not run on the server" is a comment.
 */

function Child(props: { id?: string; register: (id: string | undefined) => void }) {
  createRegisteredId({ id: () => props.id, register: props.register });
  return <p id={props.id}>child</p>;
}

function Parent(props: { id?: string; register: (id: string | undefined) => void }) {
  const [registeredId] = createSignal<string | undefined>();

  return (
    <div aria-describedby={registeredId()}>
      <Child id={props.id} register={props.register} />
    </div>
  );
}

describe("createRegisteredId on the server", () => {
  it("registers nothing", async () => {
    const register = vi.fn();
    await renderToStream(() => <Parent id="child-id" register={register} />);

    expect(register).not.toHaveBeenCalled();
  });

  it("leaves the ancestor's ARIA relationship out of the server markup", async () => {
    // The consequence, stated as markup rather than as a call count: a Root that relies on the
    // registration alone ships an `aria-describedby`-less element and only gains the link after
    // hydration.
    const html = await renderToStream(() => <Parent id="child-id" register={() => {}} />);

    expect(html).toContain('id="child-id"');
    expect(html).not.toContain("aria-describedby");
  });
});
