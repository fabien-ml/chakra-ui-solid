import { trackFocusVisible } from "@zag-js/focus-visible";
// `/next` is the SolidJS 2.0 renderer entry; the bare export resolves to the 1.x-compatible one.
// This project targets 2.0 only.
import { definePreview } from "storybook-solidjs-vite/next";
// The generated stylesheet plus the colour-mode class the preset requires, shared with the
// `browser` Vitest project. Panda's `css()` computes class names and never injects a rule, so
// without this every story renders unstyled — and unstyled reads as a story that simply has no
// styles rather than as a failure.
import "../dev-stylesheet.ts";

// Storybook 10.5 replaces HTMLElement.prototype.focus with an accessor whose getter throws when
// read off the prototype. Zag reads it exactly that way. Story modules evaluate before Storybook's
// loaders run, so warming the tracker here — while `focus` is still a plain data property — makes
// every later call an early return. See prior-art.md §5.3; pinned Storybook version in
// pnpm-workspace.yaml.
//
// It is the first statement of the first module Storybook evaluates, which is what "before every
// import that pulls a machine" means in a language that hoists imports: no module imported above
// starts a machine at load, and this file runs before Storybook's `enhanceContext` loader. Cost per
// component: zero — `setupGlobalFocusEvents` is once-per-window and every later call returns
// immediately.
//
// Deleting this line breaks every story that uses a machine, and **nothing in CI would notice**
// (D-133) — the symptom is a blank canvas plus `[REACTIVITY_HALTED]` in the browser console.
trackFocusVisible({ onChange() {} });

export default definePreview({
  parameters: { layout: "centered" },
});
