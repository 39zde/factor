# Contributions

Anyone can contribute. This is not a Pet-Project nor do I follow any agenda with this repo. So I'm happy to accept any contributions. As long as it fits in I have no objections. I hope this goes without saying, but make sure to be verbose while messaging. This minimizes all the guessing work one might have to do.

- [Workspace](#workspace)
	- [Yarn Package Manager](#yarn-package-manager)
- [Theming](#theming)
- [Data Storage](#data-storage)
	- [File Storage](#file-storage)
	- [IndexedDB](#indexeddb)
		- [factor_db](#factor_db)
  		- [customers_db](#customers_db)
  		- [articles_db](#articles_db)
  		- [documents_db](#documents_db)
	- [Local Storage](#local-storage)
	- [Session Storage](#session-storage)
- [Sample Data](#sample-data)

## Workspace

Some files are hidden by default in [`factor.code-workspace`](./factor.code-workspace). Development so far happened in [VSCodium](https://github.com/VSCodium/vscodium). You may choose whatever IDE you like.

 ### Yarn Package Manager

To use yarn the official way [corepack](https://nodejs.org/api/corepack.html) must be enabled. Follow [this](https://yarnpkg.com/getting-started/install) instruction guide to get started.

## Theming

Theming is done via the [light-dark](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark) CSS color function. The theme is then being changed by setting a different `color-scheme` value in a CSS root tag. Try to follow the general styling.


## Data Storage

The app uses multiple storage methods. Here are the ones we will use and what purpose they serve, and how important each on is.
Ratings:
 - High: Very important data. Treat very carefully.
 - Medium: The App does need it to function properly, but a loss of the data is not a big deal. Will stop the information flow, if broken.
 - Low: The App function fine without this data it, but looses some convenience features.

 ### File Storage

  The App saves the it's settings as a json file. The reason for doing so is user/system accessibility and persistence between reinstalls. The AppSettings are being saved at the $HOME/.factor/settings.json file, to persist values between restarts and install. Be aware, that there will be a new folder created. There are plans to change this behavior to choose the recommended folder by the system, but for now, that's what it is.<br>
  _Rating: Medium_

 ### IndexedDB
 ---
  This app utilizes more than one IndexedDB Instance.

  #### factor_db

   Holds application specific data like data uploads and such. This is up for deletion any time, so nothing important should be stored here.<br>
   _Rating: Medium_

  #### customer_db

   Holds the customer data distributes across different oStores.<br>
   _Rating: High_

  #### article_db

   Holds the article data distributed across different oStores.<br>
   _Rating: High_

  #### document_db

   Hold the data of created Documents across different oStores.<br>
   _Rating: High_

 ### Session Storage
 ---
  Holds uploaded files as plain text before importing to factor_db.<br>
  _Rating: Medium_

 ### Local Storage
 ---

  Saved the columns widths of every column of every table.<br>
  _Rating: Low_

## Data Structures

 Here is an Example made with [DrawDB](https://github.com/drawdb-io/drawdb) of the customers_db database. Each "table" is an oStore. `row` is always the keyPath.  The data types don't match entirely. Fields with a key icon are indexed fields, where indexed means [IDBIndex](https://developer.mozilla.org/en-US/docs/Web/API/IDBIndex). Every field, from which a `1->n` connection originates, is of type `ArrayBuffer`. The `ArrayBuffer`, when decoded with `Uint32`, has n = `ArrayBuffer.byteLength` / `2` references. The reference (the `Uint32` number) is then the row number in the other oStore. The other oStore name is always the key. Thats how relations are stored.

 ![customers_db](./resources/img/customers_db.png)

 Also have a look at [`./src/renderer/src/util/types/database`](./src/renderer/src/util/types/database/)


## Sample Data

 The Sample Data was generated with [fakery.dev](https://fakery.dev/). All Sample data is stored in [`./resources/data`](./resources/data)
