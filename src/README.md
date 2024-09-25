# React Project Source Code

This folder contains the JavaScript/FontEnd side of things

## Structure

### HTML

There are 3 entry points, which all server different purposes. Depending on what is needed the one of these 3 files will be copied to the project root.

- [`index.demo.html`](./index.demo.html) contains the html for the browser demo.
- [`index.dev.html`](./index.dev.html)  contains the html for development (no ContentSecurePolicy + React Devtools script tag)
- [`index.prod.html`](./index.prod.html) contains the html for Tauri.

### CSS

- [`base.css`](./base.css) contains the css variable definitions and styling for html tags
- [`App.css`](./App.css) contains the base layout of the app

### JavaScript

- [`comps`](./comps/) Contains reusable components
	All comps are bundled into a single fragment in [`Comps.ts`](./comps/Comps.ts). It is also the target for `@comps` imports, which is defined in the Vite & TypeScript configs
	- [`CheckBox`](./comps/CheckBox/)
	- [`ContextMenu`](./comps/ContextMenu/)
	- [`SideBar`](./comps/SideBar/)
	- [`Table`](./comps/Table)
	- [`Versions`](./comps/Versions/)

- [`pages`](./pages/) Contains all pages
	All pages reachable from the Side bar

- [`util`](./util/)


