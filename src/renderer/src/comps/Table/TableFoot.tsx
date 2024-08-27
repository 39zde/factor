import React, { memo } from 'react';
import { useTableContext } from './Table';
import { TableFootProps } from '@renderer/util/types/types';

/** mostly  a copy of table head without the ability to  resize */
export function TableFoot(): React.JSX.Element {
	const tableState = useTableContext();

	const Footer = memo(function TableFooter({ columns }: TableFootProps) {
		console.log('footer Rerenders');
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
						{columns.map((item, index) => {
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
						})}
					</tr>
				</tfoot>
			</>
		);
	});

	return (
		<>
			<Footer columns={tableState.columns} />
		</>
	);
}
