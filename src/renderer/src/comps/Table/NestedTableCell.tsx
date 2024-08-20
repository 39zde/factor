import React from 'react';
import { AddressType, PersonType } from '@renderer/util/types/types';

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
		case 'addresses':
			return <AddressTableCell data={data as AddressType[]} />
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


function AddressTableCell({ data }: { data: AddressType[] }): React.JSX.Element {
	return (
		<>
			<span className="nestedCell">
				{data.map((item) => {
					let textRow1 = '';
					if (item?.street !== undefined) {
						textRow1 += item.street + ' ';
					}
					let textRow2 = '';
					if (item?.zip !== undefined) {
						textRow2 += item.zip + ' ';
					}
					if (item?.city !== undefined) {
						textRow2 += item.city + ' ';
					}
					let textRow3 = '';
					if (item?.country !== undefined) {
						textRow3 += item.country;
					}

					return (
						<>
							<p>{textRow1}</p>
							<p>{textRow2}</p>
						</>
					);
				})}
			</span>
		</>
	);
}

function DateTableCell({ data }: { data: AddressType[] }): React.JSX.Element {
	return (
		<>
			<span className="nestedCell">
				{data.map((item) => {
					let textRow1 = '';
					if (item?.street !== undefined) {
						textRow1 += item.street + ' ';
					}
					let textRow2 = '';
					if (item?.zip !== undefined) {
						textRow2 += item.zip + ' ';
					}
					if (item?.city !== undefined) {
						textRow2 += item.city + ' ';
					}
					let textRow3 = '';
					if (item?.country !== undefined) {
						textRow3 += item.country;
					}

					return (
						<>
							<p>{textRow1}</p>
							<p>{textRow2}</p>
						</>
					);
				})}
			</span>
		</>
	);
}

