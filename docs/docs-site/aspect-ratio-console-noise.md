# Aspect Ratio page console noise

The errors and warnings in a real browser console on the Aspect Ratio docs page all come from the YouTube and Google Maps embeds in `aspect-ratio-with-video` and `aspect-ratio-with-map`.

## How it was measured

| Check | Result |
|---|---|
| Source URL on every console row | `youtube.com` or `google.com/maps/embed` |
| `console.warn`, `console.error`, `window.onerror`, `unhandledrejection` hooked in the top frame | zero captured |

A cross-origin frame's output cannot be read from the parent page. The browser pane's `read_console_messages` attaches to the top frame only, so it shows clean while DevTools shows a wall.

## What to do

Nothing. Do not lazy-load the embeds or add a click-to-load facade: the page carries the same embeds as the React version. On a repeat report, ask for the source URL of a few rows first.
