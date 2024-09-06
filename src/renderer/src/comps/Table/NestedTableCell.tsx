import React, { MouseEvent } from 'react';
import { AddressType, BankType, CompanyType, EmailType, PersonType, PhoneNumberType } from '@renderer/util/types/types';

export function NestedTableCell({ columnName, data }: { columnName: string; data: object[] | string[] }): React.JSX.Element {
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
		case 'website':
			return <WebsiteTableCell data={data[0] as string} />;
		case 'banks':
			return <BankTableCell data={data as BankType[]} />;
		default:
			return <></>;
	}
}

function PersonTableCell({ data }: { data: PersonType[] }): React.JSX.Element {
	return (
		<>
			<span className="nestedCell">
				{data !== undefined ? (
					data.map((item) => {
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
								<p key={text}>{text}</p>
							</>
						);
					})
				) : (
					<></>
				)}
			</span>
		</>
	);
}

function AddressTableCell({ data }: { data: AddressType[] }): React.JSX.Element {
	return (
		<>
			<span className="nestedCell">
				{data !== undefined ? (
					data.map((item) => {
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
								<p key={textRow1}>{textRow1}</p>
								<p key={textRow2}>
									{textRow2}({textRow3})
								</p>
							</>
						);
					})
				) : (
					<></>
				)}
			</span>
		</>
	);
}

function EmailTableCell({ data }: { data: EmailType[] }): React.JSX.Element {
	return (
		<>
			<span className="nestedCell">
				{data !== undefined ? (
					data.map((item) => {
						let text1 = '';
						if (item?.email !== undefined) {
							text1 += item.email;
						}
						return (
							<>
								<a key={text1} tabIndex={-1} href={`mailto:${text1}`}>
									{text1}
								</a>
							</>
						);
					})
				) : (
					<></>
				)}
			</span>
		</>
	);
}

function PhoneTableCell({ data }: { data: PhoneNumberType[] }): React.JSX.Element {
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
							<a key={text1} tabIndex={-1} href={`tel:${text1}`}>
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

function CompanyTableCell({ data }: { data: CompanyType[] }): React.JSX.Element {
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

function WebsiteTableCell({ data }: { data: string }): React.JSX.Element {
	const clickHandler = (e: MouseEvent) => {
		e.preventDefault();
		window.electron.ipcRenderer.send('openURL', data);
	};
	return (
		<>
			<span className="nestedCell">
				<a tabIndex={-1} href={data} onClick={clickHandler}>
					{data.replace('https://', '')}
				</a>
			</span>
		</>
	);
}

function BankTableCell({ data }: { data: BankType[] }): React.JSX.Element {
	return (
		<>
			{data !== undefined ? (
				data.map((item, index) => {
					const line1 = item.name;
					const item2 = item.iban;
					// const item3 = item.notes;

					return (
						<div key={`nestedBank-${index}-${line1}-${item2}`}>
							<p>{line1}</p>
							{item2 !== undefined ? (
								<>
									<p>{item2}</p>
								</>
							) : (
								<></>
							)}
						</div>
					);
				})
			) : (
				<></>
			)}
		</>
	);
}
