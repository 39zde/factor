import { useRef, createRef, useContext, useId } from 'react';
import type { TableFootProps } from '@renderer/util/types/comps/Table/TableFootProps';
import { AppContext } from '@renderer/App';

// a copy of table head without the ability to  resize
export function TableFoot({ columns }: TableFootProps) {
	const { appearances } = useContext(AppContext);
	const colRefs = useRef(columns.map(() => createRef<HTMLTableCellElement>()));

	return (
		<>
			<tfoot>
				<tr
					key={useId()}
					style={{
						height: appearances.rowHeight,
						borderBottom: 'none',
						borderLeft: 'none',
						borderRight: 'none',
					}}
				>
					{colRefs !== undefined ? (
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
												key={useId()}
											>
												{item}
											</th>
										</>
									);
								} else {
									return <th key={useId()}></th>;
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
