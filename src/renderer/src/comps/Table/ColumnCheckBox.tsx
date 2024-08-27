import React, { useEffect, useState } from 'react';
import { CheckBox } from '../CheckBox/CheckBox';
import { useTableDispatch, useTableContext } from './Table';

export function ColumnCheckBox({
	index,
	columnName,
}: {
	index: number;
	columnName: string;
}): React.JSX.Element {
	const dispatch = useTableDispatch();
	const tableState = useTableContext();
	const [checked, setChecked] = useState<boolean>(false);
	const columnChecker = () => {
		if (tableState.columns.includes(columnName)) {
			dispatch({
				type: 'set',
				name: 'columns',
				newVal: tableState.columns.toSpliced(
					tableState.columns.indexOf(columnName),
					1
				),
			});
		} else {
			let insertIndex = index;
			for (const col of tableState.allColumns) {
				if (col === columnName) {
					break;
				}
				// if there is a column before our item, which is not visible, subtract 1 from the insertion index
				if (!tableState.columns.includes(col)) {
					insertIndex -= 1;
				}
			}
			dispatch({
				type: 'set',
				name: 'columns',
				newVal: tableState.columns.toSpliced(
					insertIndex,
					0,
					tableState.allColumns[index]
				),
			});
		}
	};

	// exec once on first render
	useEffect(() => {
		if (tableState.columns.includes(columnName)) {
			setChecked(true);
		} else {
			setChecked(false);
		}
	}, []);

	const mouseDownHandler = () => {
		setChecked(!checked);
		columnChecker();
	};

	return (
		<>
			{index !== 0 ? (
				<>
					<p
						aria-modal="true"
						className="menuRow"
						onMouseDown={mouseDownHandler}>
						{columnName}
						<CheckBox ticked={checked} />
					</p>
				</>
			) : (
				<></>
			)}
		</>
	);
}