# No jsdom anywhere

Tests that need a DOM run in real Chromium (the `browser` project, see [0065](0065-three-vitest-projects.md)). jsdom's `getComputedStyle` returns the cascade it was told about, which is exactly what the style assertions exist to check: a computed-style test against jsdom proves nothing about whether the CSS was generated.
