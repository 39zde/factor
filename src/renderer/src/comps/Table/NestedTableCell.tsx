import React from 'react';
import { PersonType } from '@renderer/util/types/types';

export function NestedTableCell({
	columnName,
	data,
}: {
	columnName: string;
	data: object[];
}): React.JSX.Element {
	switch (columnName) {
		case 'persons':
			return <PersonTableCell data={data as PersonType[]} />;
		default:
			return <></>;
	}
}

function PersonTableCell({ data }: { data: PersonType[] }): React.JSX.Element {
	return (
		<>
			<span className="nestedCell">
				{data.map((item) => {
					let text = '';
					if (item?.title !== undefined) {
						text += item.title + ' ';
					}
					if (item?.firstName !== undefined) {
						text += item.firstName + ' ';
					}
					if (item?.alias !== undefined) {
						text += "'" + item.alias + "' ";
					}
					if (item?.lastName !== undefined) {
						text += item.lastName;
					}

					return (
						<>
							<p>{text}</p>
						</>
					);
				})}
			</span>
		</>
	);
}
