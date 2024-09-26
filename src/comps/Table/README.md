# The Table Component

The Table Components at it's core displays the data stored in one oStore of a IndexedDB database, where one Row corresponds to one oStore entry.
It implements its own event loop and orchestrates the rendering of Head, Body and Foot.

## Structure

The main component is [Table.tsx](./Table.tsx). It
- initiates the Table Context,
- creates the state management with the use of React's [useReducer](https://react.dev/reference/react/useReducer)
- handles the responses from the table worker
- manages the context menu
	- column order
	- column visibility
- listens for Prop changes
- listens for mouse events
	- onMouseDown
	- onMouseMove
	- onMouseUp
	

## Data Information flow

```javascript
/*
		Table
		|
1.		├useReducer-init
		|     Results:
		|		|- defaultTableState
		|
		listen to tableBodyRef and once tableBodyRef.current !== null
		|
2.		initTableState[tableName, dataBaseName, uniqueKey, database.dbVersion]
		|     Results:
		|<----|-tableState.hasStared => false
		|<----|-tableState.start = 1
		|<----|-tableState.rows = []
		|<----|-tableState.dataBaseName = prop: dataBaseName
		|<----|-tableState.tableName = prop: tableName
		|<----|-tableState.uniqueKey = prop: uniqueKey
		|<----|-tableState.dbVersion = appContext.database.dbVersion
		|<----|-tableState.nativeColumnNames = prop: nativeColumnNames
		|		if wrapper.current !== null
2.1	|     |- updateSizing(prop: dataBaseName,appContext.database.dbVersion,hasStarted,
		|			 |					tableState.scope,tableState.start,prop: tableName,	tableState.rows,
		|			 | 					appContext.appearances.rowHeight, scrollBarHeight, wrapperRef.current)
		|         Results:
		|<----------|-tableState.resizeElemHeight
		|				...calc scope
2.1.1	|				|-updateScope(dataBaseName,dbVersion,tableState.hasStarted,calculated-scope,oldScope,
		|					|				tableState.start,tableState.tableName,tablesState.rows)
		|					Results:
		|<-------------|-tableState.scope
		|					|
		|		--------hasStarted?------------
		|		|										|
		|	  true								 false
		|	   |										|
		|	  	..remove rows   	   			..request the starting package from the table worker
		|<----|tableState.rows
		|<----|-tablesState.lastReceived
		|		..or add rows
		|		..request stream(type:add)
		|
		|
		|
3.		tableWorker.onmessage:
		|		Starter Package:
		|		Results:
		|		|-tableState.count
		|		|-tableState.columns (can use localStorage)
		|		|-tableState.allColumns (can use localStorage)
		|		|-tableState.colsRef
		|		|-tableState.resizeStyles
		|		|-tableState.columnWidths
		|		|-tableState.rows
		|		|-tableState.lastReceived
		|		|-tableState.hasStarted
		|
		|
		|
		|
		|<---------------------let us say the  tableName changes
		|
		|<---------------------let us say updateHook.update will then be set to true
		|
		|
		|
4.		useEffect[updateHook.update] registers the updateHook change
		|	|
		|	Result:
		|<---|-tableState.update
		|	  |
		|	  ...if update === true, then start at step 2
		|
*/

```
