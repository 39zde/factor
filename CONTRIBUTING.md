# Contributions

Anyone can contribute. This is not a Pet-Project nor do I follow any agenda with this repo. So I won't block contributions, because of personal feeling or goals. As long as it fits in I have no objections. I hope this goes without saying, but make sure to be verbose while messaging. This minimizes all the guessing work one might have to do.


## Theming

Theming is done via the [light-dark](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark) CSS color function. The theme is then being changed by setting a different `color-scheme` value in a CSS root tag. Try to follow the general styling.

## Settings/Context

The AppSettings are being saved at the $HOME/.factor/settings.json file, to persist values between restarts. Be aware, that there will be a new folder created. There are plans to changes this behavior to choose the recommended folder by the system, but for now, thats what it is.

## Yarn Package Manager

To use yarn the official way [corepack](https://nodejs.org/api/corepack.html) must be enabled. Follow [this](https://yarnpkg.com/getting-started/install) instruction guide to get started

## Data Structures

Here is an Example made with [DrawDB](https://github.com/drawdb-io/drawdb) of the customers_db database. Each "table" is an oStore. `row` is always the keyPath.  The data types don't match entirely. Fields with a key icon are indexed fields. Indexed if form of [IDBIndex](https://developer.mozilla.org/en-US/docs/Web/API/IDBIndex). Every field, from which a `1->n` connection originates, is of type `ArrayBuffer`. The `ArrayBuffer`, when decoded with `Uint32`,
has n = `ArrayBuffer.byteLength` / `2` references. The reference (the `Uint32` number) is then the row number in the oStore. The oStore name is always the key

![customers_db](./resources/img/customers_db.png)

Also have a look at `./src/renderer/src/util/types/database`

## Workspace

Some files are hidden by default in `factor.code-workspace`. Development so far happened in [VSCodium](https://github.com/VSCodium/vscodium). You may choose whatever IDE you like.
