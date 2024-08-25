# Factor

![Logo](./resources/icons/android/solo_whiteldpi.png)

An invoicing application built with TypeScript:React on top of IndexDB packaged with Electron

## Status
The most important step is already done, which is the Table Component in in `./src/renderer/src/comps/Table`.
The approach of using IndexedDB is surprisingly performant, better than expected. So why go with IndexedDB?
Well it is already built into the browser, meaning no added dependencies. It's also quite performant, even with
 - IndexedDB is a NOSQL-type Database[1], but using referencing to different object stores[2] (oStores)
 - the awkward async callbacks without using `await`
 - no significant performance tricks applied

I have not run any benchmarks yet, but scrolling in a Table with:
 - entries: 4000+ entries
 - scope: 27
 - scrolling speed: 27 per scroll
 - column-count: 12 columns
 - column with of 250px
 - 5 dereferencing operations per row
 - in dev mode
 - on old hardware

works without problems. WebWorkers[3] do most of the heavy lifting. Certainly more performant, than using `useLiveQuery` from Dexie.js[4]. That being said there is much more performance to be gained at various places. Looking at what already is accomplished, this approach looks very promising.

For now the uploading of data can only be done in csv with semi-colon (;) separated fields with customers as the only upload option. There are still a bunch of things to do (see `roadmap.md`), before adding new tables.


## Development

```bash
yarn install
yarn dev
yarn devtools
```
Note: See "Yarn Package Manager" in `CONTRIBUTING.md` on how to use node's `corepack`

# Links
+ [1] https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Basic_Terminology#key_characteristics
+ [2] https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore
+ [3] https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker
+ [4] https://github.com/dexie/Dexie.js
