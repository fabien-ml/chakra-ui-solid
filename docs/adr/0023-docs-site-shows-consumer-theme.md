# The docs site shows the theme a consumer gets

The docs site reproduces Chakra's surfaces, radii, type scale and spacing through tokens, but not its typeface (Wix Madefor Text) or its `globalCss` block. Those are set through the system config, which for the docs app is the preset's config helper plus `include` and `outdir` and nothing else; a check fails on any further key. So the site keeps the preset's own Inter font stack, and the two layout custom properties (`--header-height`, `--content-height`) move onto the `<body>` class, as an ordinary Panda rule in the app's own sheet.

The forced difference is the consumer-config check working, not a gap: a docs site that overrode the preset's fonts would show readers a theme they cannot get by installing ([0008](0008-docs-app-is-a-consumer.md)).
