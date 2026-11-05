# The browser pane's tabs are backgrounded

Every tab in the Claude desktop browser pane reports `document.visibilityState === "hidden"`, including a tab navigated to an external site with no dev server involved. Two consequences look exactly like port defects.

| Symptom | Cause |
|---|---|
| `requestAnimationFrame` never fires, CSS animations never advance | the pane captures over CDP without fronting the tab, so the renderer stays throttled. A component that measures in `raf` leaves its size at the default (Collapsible stuck at `--height: 0px` with `data-state="open"`) |
| screenshots go solid black once the page is scrolled | same throttling; a `computer` scroll then times out |

## What still works

`getComputedStyle` forces a style recalc on demand, so style is measurable: remove an attribute and re-read a computed value. DOM insertion order is measurable too. Anything gated on the frame loop is not: popper never positions, so floating geometry and any value written in `raf` read as unset.

## What to do

- Never scroll a long page. Resize the viewport tall enough to hold it (`1280x3000`) and screenshot at scroll 0; every element is then reachable by `ref`.
- Verify animation and `raf` behavior in the real-browser Vitest project, which drives a foreground page.
- Read DOM state through JavaScript, not from a screenshot.
