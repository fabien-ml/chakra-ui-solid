# The top bar has four tiers and shows a tier only once it has a page

The top bar is exactly Get Started, Components, Styling, Theming: no sponsor button, version dropdown, Docs/Showcase/Blog split, or Charts. The four are declared in one module, and a tier renders once it has at least one content file. The sidebar and the inventory check read the same module.

Rendering all four from the start would put a link to a 404 in the bar; greyed-out items are a promise with worse ergonomics than an absence; declaring only existing tiers would leave the settled structure nowhere in code.
