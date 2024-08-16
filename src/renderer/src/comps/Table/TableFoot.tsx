import React from 'react';
import type { TableFootProps } from '@renderer/util/types/comps/Table/TableFootProps';

// a copy of table head without the ability to  resize
export function TableFoot({ columns }: TableFootProps): React.JSX.Element {
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
					{columns !== undefined ? (
						<>
							{columns.map((item, index) => {
								if (item !== undefined) {
									return (
										<>
											<th
												style={{
													borderBottom: 'none',
													borderLeft:
														index === 0 ? 'none' : 'inherit',
												}}
												key={`tf-${index}`}>
												<span className="guts">{item}</span>
											</th>
										</>
									);
								} else {
									return (
										<th key={`tf-${index}-df`}>
											<span className="guts"></span>
										</th>
									);
								}
							})}
						</>
					) : (
						<></>
					)}
				</tr>
			</tfoot>
		</>
	);
}
