import React from 'react';
import {
	AddressType,
	CompanyType,
	EmailType,
	PersonType,
	PhoneNumberType,
} from '@renderer/util/types/types';

export function NestedTableCell({
	columnName,
	data,
}: {
	columnName: string;
	data: object[] | string[];
}): React.JSX.Element {
	switch (columnName) {
		case 'persons':
			return <PersonTableCell data={data as PersonType[]} />;
		case 'addresses':
			return <AddressTableCell data={data as AddressType[]} />;
		case 'emails':
			return <EmailTableCell data={data as EmailType[]} />;
		case 'phones':
			return <PhoneTableCell data={data as PhoneNumberType[]} />;
		case 'notes':
			return <NotesTableCell data={data as string[]} />;
		case 'company':
			return <CompanyTableCell data={data as CompanyType[]} />;
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

function AddressTableCell({
	data,
}: {
	data: AddressType[];
}): React.JSX.Element {
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

function EmailTableCell({ data }: { data: EmailType[] }): React.JSX.Element {
	return (
		<>
			<span className="nestedCell">
				{data.map((item) => {
					let text1 = '';
					if (item?.email !== undefined) {
						text1 += item.email;
					}
					return (
						<>
							<a tabIndex={-1} href={`mailto:${text1}`}>
								{text1}
							</a>
						</>
					);
				})}
			</span>
		</>
	);
}

function PhoneTableCell({
	data,
}: {
	data: PhoneNumberType[];
}): React.JSX.Element {
	return (
		<>
			<span className="nestedCell">
				{data.map((item) => {
					let text1 = '';
					if (item?.phone !== undefined) {
						text1 += item.phone;
					}
					return (
						<>
							<a tabIndex={-1} href={`tel:${text1}`}>
								{text1}
							</a>
						</>
					);
				})}
			</span>
		</>
	);
}

function NotesTableCell({ data }: { data: string[] }): React.JSX.Element {
	return (
		<>
			<span className="nestedCell">
				{data.map((item) => {
					return (
						<>
							<p spellCheck={true}>{item}</p>
						</>
					);
				})}
			</span>
		</>
	);
}

function CompanyTableCell({
	data,
}: {
	data: CompanyType[];
}): React.JSX.Element {
	return (
		<>
			<span className="nestedCell">
				{data.map((item) => {
					let text1 = '';
					if (item?.name !== undefined) {
						text1 += item.name;
					}
					return (
						<>
							<p>{text1}</p>
						</>
					);
				})}
			</span>
		</>
	);
}
