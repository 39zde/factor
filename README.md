# Factor

![Logo](./resources/icons/android/solo_whiteldpi.png)

An invoicing application built with TypeScript:React on top of IndexDB packaged with Electron

## Status
The most important step is already done, which is the Table Component in in `./src/renderer/src/comps/Table`.
The approach of using IndexedDB is surprisingly performant, better than expected. So why go with IndexedDB?
Well it is already built into the browser, meaning no added dependencies. Even though IndexedDB is a NOSQL-type Database[1],
and the awkward async callbacks, without using `await`, building references into an object store (oStore) and referencing them is quite performant.
I have not run any benchmarks yet, but scrolling a in a Table with:
 - entries: 4000+ entries
 - scope: 27
 - scrolling speed: 27 per scroll
 - column-count: 12 columns
 - column with of 250px
 - 5 dereferencing operations per row

can be done easily. Even in dev mode and on old hardware, thanks to using WebWorkers [2].

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
+ [2] https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker
