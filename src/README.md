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

- [`util`](./util/) Utility functions
	Sorted by Page, Comp, or whatever. Rough sorting should suffice, since the functions will be used across the whole project.

- [`worker`](./worker/) The WebWorkers

	 - [`export.worker.ts`](./worker/export.worker.ts)
	 	Compiles the data from indexedDB and sends it to the main thread. Then from there a write-stream (tauri-plugin/fs) saves the data to the systems download folder
	 - [`import.worker.ts`](./worker/import.worker.ts)
	 	Converts the assigned columns in the Upload-Page into rows and inserts them into a database and oStore
	 - [`table.worker.ts`](./worker/table.worker.ts)
	   Returns the requested rows to the table, for display

- [`types`](./types/)
	All TypeScript type definitions, sorted like [`factor/src/`](../src/)


