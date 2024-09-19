import React, { MouseEvent } from 'react';
import { open } from '@tauri-apps/plugin-shell';
// non-lib imports
import { useTableContext } from './Table';
import { useAppContext } from '@app';
import { AddressType, BankType, CompanyType, EmailType, PersonType, PhoneNumberType, TableRowItemProps } from '@typings';

export function RowItems({ items, uniqueParentKey }: TableRowItemProps): React.JSX.Element {
	const { appearances } = useAppContext();
	const tableState = useTableContext();
	return (
		<>
			{tableState.allColumns.map((columnName, index) => {
				if (tableState.columns.includes(columnName)) {
					return (
						<>
							<td
								style={{
									maxHeight: appearances.rowHeight,
									height: appearances.rowHeight,
									minHeight: appearances.rowHeight,
								}}>
								<span className="guts">
									<TableCell parentKey={`col${index}${uniqueParentKey}`} contents={items[columnName]} columnName={columnName} />
								</span>
							</td>
						</>
					);
				} else {
					return <></>;
				}
			})}
		</>
	);
}

function TableCell({
	contents,
	columnName,
}: {
	parentKey: string;
	contents: string | object | object[] | number | boolean;
	columnName: string;
}): React.JSX.Element {
	if (Array.isArray(contents)) {
		switch (columnName) {
			case 'persons':
				return <PersonTableCell data={contents as PersonType[]} />;
			case 'addresses':
				return <AddressTableCell data={contents as AddressType[]} />;
			case 'emails':
				return <EmailTableCell data={contents as EmailType[]} />;
			case 'phones':
				return <PhoneTableCell data={contents as PhoneNumberType[]} />;
			case 'notes':
				return <NotesTableCell data={contents as string[]} />;
			case 'company':
				return <CompanyTableCell data={contents as CompanyType[]} />;
			case 'banks':
				return <BankTableCell data={contents as BankType[]} />;
			default:
				return <></>;
		}
	} else {
		switch (typeof contents) {
			case 'object':
				switch (contents.constructor.name) {
					case 'Date':
						return <>{(contents as Date).toLocaleDateString()}</>;
					case 'Object':
						return <>Company</>;
				}
				return <></>;
			case 'number':
				return <>{contents}</>;
			case 'boolean':
				return <>{contents}</>;
			case 'string':
				if (columnName === 'website') {
					return <WebsiteTableCell data={contents as string} />;
				}
				return <>{contents}</>;
			default:
				return <></>;
		}
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
							if (item.alias.length !== 0) {
								text +=
									"'" +
									item.alias
										.map((val) => {
											if (val !== '') {
												return val;
											}
										})
										.join(', ') +
									"' ";
							}
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
			<address className="nestedCell">
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
			</address>
		</>
	);
}

function EmailTableCell({ data }: { data: EmailType[] }): React.JSX.Element {
	return (
		<>
			<address className="nestedCell">
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
			</address>
		</>
	);
}

function PhoneTableCell({ data }: { data: PhoneNumberType[] }): React.JSX.Element {
	return (
		<>
			<address className="nestedCell">
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
			</address>
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
		open(data);
	};
	return (
		<>
			<address className="nestedCell">
				<a tabIndex={-1} href={data} onClick={clickHandler}>
					{data.replace('https://', '')}
				</a>
			</address>
		</>
	);
}

function BankTableCell({ data }: { data: BankType[] }): React.JSX.Element {
	return (
		<>
			{data !== undefined ? (
				data.map((item, index) => {
					const line1 = item.name;
					let item2;
					if (item.name !== undefined) {
						item2 = Array.from(item.iban as string)
							.map((v, i) => {
								if (i > 2) {
									if (i % 4 === 0) {
										return ' ' + v;
									}
								}

								return v;
							})
							.join('');
					}
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
