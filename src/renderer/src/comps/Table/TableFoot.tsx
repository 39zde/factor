import React from 'react';
import { useTableContext } from './Table';

/** mostly  a copy of table head without the ability to  resize */
export function TableFoot(): React.JSX.Element {
	const tableState = useTableContext();

	return (
		<>
			<tfoot>
				<tr
					style={{
						height: '100%',
						borderBottom: 'none',
						borderLeft: 'none',
						borderRight: 'none',
					}}>
					{tableState.allColumns.map((item, index) => {
						if (tableState.columns.includes(item)) {
							if (item !== undefined) {
								return (
									<>
										<th key={`tablefoot-${index}-${item}`}>
											<span className="guts">{item}</span>
										</th>
									</>
								);
							} else {
								return (
									<th key={`tablefoot-${index}-`}>
										<span className="guts"></span>
									</th>
								);
							}
						}
					})}
				</tr>
			</tfoot>
		</>
	);
}
