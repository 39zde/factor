import type { TableContextType, TableDispatchAction } from '../types/comps/Table/Table';

/** dispatch function for the TableContext */
export function tableReducer(tableState: TableContextType, action: TableDispatchAction): TableContextType {
	switch (action.type) {
		case 'changeAccept': {
			return {
				...tableState,
				accept: action.newVal === 'next' || action.newVal === 'prev' ? action.newVal : tableState.accept,
			};
		}
		case 'set': {
			if (action.name !== undefined) {
				Object.defineProperty(tableState, action.name, {
					configurable: true,
					enumerable: true,
					writable: true,
					value: action.newVal,
				});
				if (action.name === 'columns' && tableState.nativeColumnNames === false) {
					localStorage.setItem(`${tableState.tableName}-columns`, (action.newVal as string[]).join(','));
				}
				if (action.name === 'allColumns' && tableState.nativeColumnNames === false) {
					localStorage.setItem(`${tableState.tableName}-allColumns`, (action.newVal as string[]).join(','));
				}
				if (action.name === 'columnWidths' && tableState.nativeColumnNames === false) {
					localStorage.setItem(`${tableState.tableName}-columnWidths`, (action.newVal as number[]).join(','));
				}
			}
			return {
				...tableState,
			};
		}
		case 'mouseDown': {
			return {
				...tableState,
				isMouseDown: true,
				activeBg: action.newVal,
				activeCol: action.newVal,
				cursor: 'col-resize',
				userSelect: 'none',
			};
		}
		case 'mouseUp': {
			return {
				...tableState,
				activeCol: undefined,
				activeBg: undefined,
				cursor: 'initial',
				userSelect: 'initial',
				isMouseDown: false,
				resizeStyles: tableState.resizeStyles.map(() => ({
					background: 'none',
					cursor: 'initial',
				})),
			};
		}
		case 'mouseMove': {
			const currentWidth =
				//@ts-expect-error we accept  that colsReg might me null
				tableState.colsRef[tableState.activeCol ?? 0].current?.getBoundingClientRect().width;
			const currentX =
				//@ts-expect-error we accept  that colsReg might me null
				tableState.colsRef[tableState.activeCol ?? 0].current?.getBoundingClientRect().left;
			if (currentWidth !== undefined && currentX !== undefined) {
				const a = currentX;
				const b = action.newVal;
				const newWidth = Math.abs(Math.abs(b - a));
				if (!isNaN(newWidth)) {
					const newColWidths = tableState.columnWidths.map((value, index) => (index === tableState.activeCol ? newWidth : value));
					if (tableState.nativeColumnNames === false) {
						localStorage.setItem(`${tableState.tableName}-columnWidths`, newColWidths.join(','));
					}
					return {
						...tableState,
						cursorX: tableState.isMouseDown ? action.newVal : tableState.cursorX,
						activeBg: tableState.isMouseDown ? tableState.activeBg : undefined,
						columnWidths: newColWidths,
					};
				}
			} else {
				return {
					...tableState,
					cursorX: tableState.isMouseDown ? action.newVal : tableState.cursorX,
					activeBg: tableState.isMouseDown ? tableState.activeBg : undefined,
				};
			}
		}
		case 'mouseLeave': {
			return {
				...tableState,
				resizeStyles: tableState.isMouseDown
					? tableState.resizeStyles
					: tableState.resizeStyles.map((val, index) => (action.newVal === index ? { background: 'none', cursor: 'initial' } : val)),
				activeBg: tableState.isMouseDown ? tableState.activeBg : undefined,
			};
		}
		case 'mouseEnter': {
			return {
				...tableState,
				resizeStyles: tableState.isMouseDown
					? tableState.resizeStyles
					: tableState.resizeStyles.map((val, index) =>
							action.newVal === index
								? {
										background: 'var(--color-secondary-dark)',
										cursor: 'col-resize',
									}
								: val
						),
				activeBg: tableState.isMouseDown ? tableState.activeBg : action.newVal,
			};
		}
		default: {
			return tableState;
		}
	}
}
