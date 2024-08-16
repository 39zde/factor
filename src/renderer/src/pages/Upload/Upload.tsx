import React, { useEffect, useRef, useState, useContext, useId } from 'react';
import { ImportIcon, FileIcon, XIcon } from 'lucide-react';
import { RowShifter } from './RowShifter';
import { ColRemover } from './ColRemover';

import { Table } from '@comps/Table/Table';
import './Upload.css';
import type {
	CustomerSortingMap,
	ImportModuleProps,
	ArticleSortingMap,
	UploadMode,
} from '@util/types/types';
import { AppContext } from '@renderer/App';
import { AppSettingsType } from '@renderer/util/App';

export function Upload(): React.JSX.Element {
	const { general, worker, database, appearances, changeContext } =
		useContext(AppContext);
	const fileSelector = useRef<HTMLInputElement>(null);
	const [showTable, setShowTable] = useState<boolean>(false);
	const [showFile, setShowFile] = useState<boolean>(false);
	const [fileName, setFileName] = useState<string>('');
	const [isRed, setIsRed] = useState<boolean>(false);
	const [cols, setCols] = useState<string[]>([]);
	const [entries, setEntries] = useState<number>(0);
	const [update, setUpdate] = useState<boolean>(false); // stop rendering while updating
	const tableImportModeInputRef = useRef<HTMLSelectElement>(null);
	const tableWrapperRef = useRef<HTMLDivElement>(null);
	const importButtonRef = useRef<HTMLButtonElement>(null);
	const [map, setMap] = useState<CustomerSortingMap | ArticleSortingMap>({
		row: 'row',
		id: '',
	});
	const [tableImportMode, setTableImportMode] = useState<
		UploadMode | undefined
	>(undefined);
	const tableImportModeHandler = (): void => {
		if (tableImportModeInputRef.current === null) {
			return;
		}
		// @ts-expect-error ..current.value is of type UploadMode, because of the hardcoded <options values={...}> in side the select element. TS does not know that
		setTableImportMode(tableImportModeInputRef.current.value);
	};

	const fileHandler = async (): Promise<void> => {
		const files = fileSelector.current?.files;
		if (files !== undefined) {
			// console.log(files)

			if (files?.length === 1) {
				try {
					// console.log(files[0].type)
					const data = await files[0].text();
					sessionStorage.setItem('fileName', files[0].name);
					sessionStorage.setItem('fileUpload', data);
					setFileName(files[0].name);
					setShowFile(true);
				} catch (e) {
					console.log(e);
				}
			}
		}
	};

	useEffect((): void => {
		const name = sessionStorage.getItem('fileName');
		if (name !== null && sessionStorage.getItem('fileUpload') !== null) {
			setFileName(name);
			setShowFile(true);
		}
	}, []);

	const removeFileHandler = (): void => {
		sessionStorage.removeItem('fileUpload');
		sessionStorage.removeItem('fileName');
		setShowFile(false);
		setShowTable(false);
	};

	const colsHook = {
		cols: cols,
		setCols: (newCols: string[]) => {
			setCols(newCols);
		},
	};

	const entriesHook = {
		entries: entries,
		setEntries: (newVal: number) => {
			setEntries(newVal);
		},
	};

	const updateHook = {
		update: update,
		setUpdate: (newValue: boolean) => {
			setUpdate(newValue);
		},
	};

	const sortingMapHook = {
		map: map,
		setMap: (newVal: ArticleSortingMap | CustomerSortingMap) => {
			setMap(newVal);
		},
	};

	const importHandler = async () => {
		worker.ImportWorker.postMessage({
			type: 'sort',
			message: map,
			content: tableImportMode,
			dbVersion: database.dbVersion,
			dataBaseName: 'factor_db'
		});
		worker.ImportWorker.onmessage = (e) => {
			if (e.data !== undefined) {
				switch (e.data.type) {
					case 'progress':
						if (importButtonRef.current !== null) {
							// @ts-ignore
							importButtonRef.current.innerText = e.data.message;
						}
						break;
					case 'success':
						// @ts-ignore
						importButtonRef.current.innerText =
							general.language === 'deutsch'
								? 'Tabelle erstellen/erneuern'
								: 'Create/Update Table';
						if (tableImportModeInputRef.current !== null) {
							switch (tableImportModeInputRef.current.value) {
								case 'customers':
									const newTables = [...database.tables];
									if (newTables.includes('customers')) {
										break;
									}
									newTables.push('customers');
									const newContext: AppSettingsType = {
										appearances: {
											...appearances,
										},
										database: {
											tables: newTables,
											dbVersion: database.dbVersion,
										},
										general: {
											...general,
										},
									};

									changeContext(newContext);
							}
						}
						const oldContext: AppSettingsType = {
							appearances: {
								...appearances,
							},
							database: {
								dbVersion: database.dbVersion,
								tables: database.tables,
							},
							general: {
								...general,
							},
						};
						changeContext(oldContext);
						break;
					case 'error':
					default:
						window.alert('Import Error: \n' + e.data?.message);
				}
			}
		};
	};

	const actionHandler = (): void => {
		const file = sessionStorage.getItem('fileUpload');
		if (file !== undefined) {
			worker.ImportWorker.postMessage({ type: 'import', message: file, dbVersion: database.dbVersion, dataBaseName: 'factor_db'});
		}
		worker.ImportWorker.onmessage = (e) => {
			if (e.data.type === 'imported') {
				colsHook.setCols(e.data.message[1]);
				entriesHook.setEntries(e.data.message[0]);

				// sessionStorage.removeItem('fileUpload')
				// sessionStorage.removeItem('fileName')
				setShowTable(true);
				// ImportWorker.terminate()
			}
		};
	};

	return (
		<>
			<div className="uploadPage page" style={{ overflow: 'hidden' }}>
				<h1>{general.language === 'deutsch' ? 'Hochladen' : 'Upload'}</h1>
				<div className="fileSelector">
					{showTable ? (
						<></>
					) : (
						<>
							<label
								htmlFor="table_file_upload"
								className="uploadButton">
								{general.language === 'deutsch'
									? 'Wählen Sie eine CSV Datei aus'
									: 'Choose a CSV file'}
							</label>
						</>
					)}
					<div className="uploader">
						<input
							autoComplete="off"
							style={{
								display: showFile ? 'none' : 'flex',
							}}
							ref={fileSelector}
							type="file"
							id="table_file_upload"
							accept="text/csv"
							// accept="text/csv,application/vnd.oasis.opendocument.spreadsheet,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
							className="fileInput"
							onInput={fileHandler}
							multiple={false}
						/>
						<div
							className="fileDisplay"
							style={{
								display: showFile ? 'flex' : 'none',
							}}>
							<button onClick={removeFileHandler} className="removeFile">
								<XIcon
									onMouseEnter={() => setIsRed(true)}
									onMouseLeave={() => setIsRed(false)}
									color={
										isRed
											? 'var(--color-primary)'
											: 'light-dark(var(--color-dark-2),var(--color-light-2))'
									}
									size={24}
									strokeWidth={2}
								/>
							</button>
							<FileIcon
								color="light-dark(var(--color-dark-1),var(--color-light-1))"
								size={24}
								strokeWidth={2}
							/>
							{fileName}
						</div>
						<button
							style={{
								display: showFile
									? showTable
										? 'none'
										: 'flex'
									: 'none',
							}}
							onClick={actionHandler}>
							<ImportIcon
								color="light-dark(var(--color-dark-1),var(--color-light-1))"
								size={24}
								strokeWidth={2}
							/>
							{general.language === 'deutsch' ? 'Importieren' : 'Import'}
						</button>
					</div>
				</div>
				<div className="tableInfoWrapper">
					{showTable && cols.length !== 0 ? (
						<>
							<ul className="tableInfo">
								<li key={'tableInfo1'}>
									{general.language === 'deutsch'
										? 'Einträge'
										: 'Entries'}
									: {(entries - 1).toString() ?? '-'}
								</li>
								<li key={'tableInfo2'}>
									{general.language === 'deutsch'
										? 'Spalten'
										: 'Columns'}
									: {cols.length ?? '-'}
								</li>
								<li key={'tableInfo3'}>
									<RowShifter cols={cols} />
								</li>
								<li key={'tableInfo4'}>
									<ColRemover
										updateHook={updateHook}
										count={entries}
										worker={worker.ImportWorker}
									/>
								</li>
							</ul>
						</>
					) : (
						<></>
					)}
				</div>
				<div className="uploadTableWrapper" ref={tableWrapperRef}>
					{showTable ? (
						<>
							<Table
							   dataBaseName='factor_db'
								key={useId()}
								uniqueKey={'row'}
								tableName="data_upload"
								colsHook={colsHook}
								entriesHook={entriesHook}
								updateHook={updateHook}
							/>
						</>
					) : (
						<>
							<span key={useId()}></span>
						</>
					)}
				</div>
				<div className="dataSorter">
					{showTable ? (
						<>
							<h2>
								{general.language === 'english'
									? 'Sort and Assign Data'
									: 'Daten Sortieren und Einordnen'}
							</h2>
							<ul className="sorter">
								<li>
									<select
										onInput={tableImportModeHandler}
										ref={tableImportModeInputRef}
										defaultValue={undefined}>
										<option value={undefined}>-</option>
										<option value="articles">
											{general.language == 'deutsch'
												? 'Artikel'
												: 'articles'}
										</option>
										<option value="customers">
											{general.language == 'deutsch'
												? 'Kunden'
												: 'customers'}
										</option>
										<option value="quotes">
											{general.language == 'deutsch'
												? 'Angebote'
												: 'quotes'}
										</option>
										<option value="invoices">
											{general.language == 'deutsch'
												? 'Rechnungen'
												: 'invoices'}
										</option>
										<option value="deliveries">
											{general.language == 'deutsch'
												? 'Lieferscheine'
												: 'deliveries'}
										</option>
										<option value="returnees">
											{general.language == 'deutsch'
												? 'Rückgaben'
												: 'returned items'}
										</option>
									</select>
								</li>
								<li>
									<button
										ref={importButtonRef}
										onClick={importHandler}>
										{general.language === 'deutsch'
											? 'Tabelle erstellen/erneuern'
											: 'Create/Update Table'}
									</button>
								</li>
							</ul>
						</>
					) : (
						<></>
					)}
					<div className="assignWrapper">
						{tableImportMode !== undefined ? (
							<>
								<ImportModule
									mode={tableImportMode}
									columns={cols}
									hook={sortingMapHook}
								/>
							</>
						) : (
							<></>
						)}
					</div>
				</div>
			</div>
		</>
	);
}

function ImportModule({
	mode,
	columns,
	hook,
}: ImportModuleProps): React.JSX.Element {
	switch (mode) {
		case 'customers':
			return <Customers columns={columns} hook={hook} />;
		case 'articles':
			return <></>;
		case 'deliveries':
			return <></>;
		case 'invoices':
			return <></>;
		case 'quotes':
			return <></>;
		case 'returnees':
			return <></>;
		default:
			return <></>;
	}
}

function Customers({
	columns,
	hook,
}: {
	columns: string[];
	hook: {
		map: any;
		setMap: (newVal: CustomerSortingMap | ArticleSortingMap) => void;
	};
}) {
	const { general } = useContext(AppContext);

	const idRef = useRef<HTMLSelectElement>(null);
	const [idCol, setIdCol] = useState<string>('row');
	const idHandler = () => {
		if (idRef.current !== null) {
			setIdCol(idRef.current.value);
		}
	};

	const titleRef = useRef<HTMLSelectElement>(null);
	const [titleCol, setTitleCol] = useState<string>();
	const titleHandler = () => {
		if (titleRef.current !== null) {
			setTitleCol(titleRef.current.value);
		}
	};

	const firstNameRef = useRef<HTMLSelectElement>(null);
	const [firstNameCol, setFirstNameCol] = useState<string>();
	const firstNameHandler = () => {
		if (firstNameRef.current !== null) {
			setFirstNameCol(firstNameRef.current.value);
		}
	};

	const lastNameRef = useRef<HTMLSelectElement>(null);
	const [lastNameCol, setLastNameCol] = useState<string>();
	const lastNameHandler = () => {
		if (lastNameRef.current !== null) {
			setLastNameCol(lastNameRef.current.value);
		}
	};

	const emailRef = useRef<HTMLSelectElement>(null);
	const [emailCol, setEmailCol] = useState<string>();
	const emailHandler = () => {
		if (emailRef.current !== null) {
			setEmailCol(emailRef.current.value);
		}
	};

	const phoneRef = useRef<HTMLSelectElement>(null);
	const [phoneCol, setPhoneCol] = useState<string>();
	const phoneHandler = () => {
		if (phoneRef.current !== null) {
			setPhoneCol(phoneRef.current.value);
		}
	};

	const webRef = useRef<HTMLSelectElement>(null);
	const [webCol, setWebCol] = useState<string>();
	const webHandler = () => {
		if (webRef.current !== null) {
			setWebCol(webRef.current.value);
		}
	};

	const companyNameRef = useRef<HTMLSelectElement>(null);
	const [companyNameCol, setCompanyNameCol] = useState<string>();
	const companyNameHandler = () => {
		if (companyNameRef.current !== null) {
			setCompanyNameCol(companyNameRef.current.value);
		}
	};

	const aliasRef = useRef<HTMLSelectElement>(null);
	const [aliasCol, setAliasCol] = useState<string>();
	const aliasHandler = () => {
		if (aliasRef.current !== null) {
			setAliasCol(aliasRef.current.value);
		}
	};

	const streetRef = useRef<HTMLSelectElement>(null);
	const [streetCol, setStreetCol] = useState<string>();
	const streetHandler = () => {
		if (streetRef.current !== null) {
			setStreetCol(streetRef.current.value);
		}
	};

	const zipRef = useRef<HTMLSelectElement>(null);
	const [zipCol, setZipCol] = useState<string>();
	const zipHandler = () => {
		if (zipRef.current !== null) {
			setZipCol(zipRef.current.value);
		}
	};

	const cityRef = useRef<HTMLSelectElement>(null);
	const [cityCol, setCityCol] = useState<string>();
	const cityHandler = () => {
		if (cityRef.current !== null) {
			setCityCol(cityRef.current.value);
		}
	};

	const countryRef = useRef<HTMLSelectElement>(null);
	const [countryCol, setCountryCol] = useState<string>();
	const countryHandler = () => {
		if (countryRef.current !== null) {
			setCountryCol(countryRef.current.value);
		}
	};

	const firstContactRef = useRef<HTMLSelectElement>(null);
	const [firstContactCol, setFistContactCol] = useState<string>();
	const fistContactHandler = () => {
		if (firstContactRef.current !== null) {
			setFistContactCol(firstContactRef.current.value);
		}
	};

	const latestContactRef = useRef<HTMLSelectElement>(null);
	const [latestContactCol, setLatestContactCol] = useState<string>();
	const latestContactHandler = () => {
		if (latestContactRef.current !== null) {
			setLatestContactCol(latestContactRef.current.value);
		}
	};

	const customerNotesRef = useRef<HTMLSelectElement>(null);
	const [customerNotesCol, setCustomerNotesCol] = useState<string>();
	const customerNotesHandler = () => {
		if (customerNotesRef.current !== null) {
			setCustomerNotesCol(customerNotesRef.current.value);
		}
	};

	const addressNotesRef = useRef<HTMLSelectElement>(null);
	const [addressNotesCol, setAddressNotesCol] = useState<string>();
	const addressNotesHandler = () => {
		if (addressNotesRef.current !== null) {
			setAddressNotesCol(addressNotesRef.current.value);
		}
	};

	const personNotesRef = useRef<HTMLSelectElement>(null);
	const [personNotesCol, setPersonNotesCol] = useState<string>();
	const personNotesHandler = () => {
		if (personNotesRef.current !== null) {
			setPersonNotesCol(personNotesRef.current.value);
		}
	};

	const companyNotesRef = useRef<HTMLSelectElement>(null);
	const [companyNotesCol, setCompanyNotesCol] = useState<string>();
	const companyNotesHandler = () => {
		if (companyNotesRef.current !== null) {
			setCompanyNotesCol(companyNotesRef.current.value);
		}
	};

	const bicRef = useRef<HTMLSelectElement>(null);
	const [bicCol, setBicCol] = useState<string>();
	const bicHandler = () => {
		if (bicRef.current !== null) {
			setBicCol(bicRef.current.value);
		}
	};

	const ibanRef = useRef<HTMLSelectElement>(null);
	const [ibanCol, setIbanCol] = useState<string>();
	const IbanHandler = () => {
		if (ibanRef.current !== null) {
			setIbanCol(ibanRef.current.value);
		}
	};

	const bankCodeRef = useRef<HTMLSelectElement>(null);
	const [bankCodeCol, setBankCodeCol] = useState<string>();
	const bankCodeHandler = () => {
		if (bankCodeRef.current !== null) {
			setBankCodeCol(bankCodeRef.current.value);
		}
	};

	const bankNameRef = useRef<HTMLSelectElement>(null);
	const [bankNameCol, setBankNameCol] = useState<string>();
	const bankNameHandler = () => {
		if (bankNameRef.current !== null) {
			setBankNameCol(bankNameRef.current.value);
		}
	};

	const bankNotesRef = useRef<HTMLSelectElement>(null);
	const [bankNotesCol, setBankNotesCol] = useState<string>();
	const bankNotesHandler = () => {
		if (bankNotesRef.current !== null) {
			setBankNotesCol(bankNotesRef.current.value);
		}
	};

	const descriptionRef = useRef<HTMLSelectElement>(null);
	const [descriptionCol, setDescriptionCol] = useState<string>();
	const descriptionHandler = () => {
		if (descriptionRef.current !== null) {
			setDescriptionCol(descriptionRef.current.value);
		}
	};

	useEffect(() => {
		const map: CustomerSortingMap = {
			row: 'row',
			id: idCol,
			alias: aliasCol,
			city: cityCol,
			companyName: companyNameCol,
			country: countryCol,
			email: emailCol,
			firstName: firstNameCol,
			lastName: lastNameCol,
			customerNotes: customerNotesCol,
			phone: phoneCol,
			street: streetCol,
			title: titleCol,
			web: webCol,
			zip: zipCol,
			firstContact: firstContactCol,
			latestContact: latestContactCol,
			addressNotes: addressNotesCol,
			personNotes: personNotesCol,
			companyNotes: companyNotesCol,
			bic: bicCol,
			iban: ibanCol,
			bankCode: bankCodeCol,
			bankName: bankNameCol,
			bankNotes: bankNotesCol,
			description: descriptionCol,
		};

		hook.setMap(map);
	}, [
		customerNotesCol,
		latestContactCol,
		firstContactCol,
		countryCol,
		cityCol,
		zipCol,
		streetCol,
		aliasCol,
		companyNameCol,
		webCol,
		phoneCol,
		emailCol,
		lastNameCol,
		firstNameCol,
		titleCol,
		idCol,
		addressNotesCol,
		personNotesCol,
		companyNotesCol,
		bicCol,
		ibanCol,
		bankNameCol,
		bankNotesCol,
		bankCodeCol,
		descriptionCol,
	]);
	return (
		<>
			<div className="customerOptions">
				<div className="dataRow">
					{general.language === 'deutsch' ? 'Kundennummer' : 'Customer ID'}
					:
					<select ref={idRef} onInput={idHandler}>
						<option defaultChecked value={undefined}>
							-
						</option>
						{columns.map((item) => (
							<option key={useId()}>{item}</option>
						))}
					</select>
				</div>
				<div className="dataRow">
					{general.language === 'deutsch' ? 'Anrede' : 'Title'}:
					<select ref={titleRef} onInput={titleHandler}>
						<option defaultChecked value={undefined}>
							-
						</option>
						{columns.map((item) => (
							<option key={useId()}>{item}</option>
						))}
					</select>
				</div>
				<div className="dataRow">
					{general.language === 'deutsch' ? 'Vorname' : 'First Name'}:
					<select ref={firstNameRef} onInput={firstNameHandler}>
						<option defaultChecked value={undefined}>
							-
						</option>

						{columns.map((item) => (
							<option key={useId()}>{item}</option>
						))}
					</select>
				</div>
				<div className="dataRow">
					{general.language === 'deutsch' ? 'Nachname' : 'Last Name'}:
					<select ref={lastNameRef} onInput={lastNameHandler}>
						<option defaultChecked value={undefined}>
							-
						</option>

						{columns.map((item) => (
							<option key={useId()}>{item}</option>
						))}
					</select>
				</div>
				<div className="dataRow">
					Email:
					<select ref={emailRef} onInput={emailHandler}>
						<option defaultChecked value={undefined}>
							-
						</option>

						{columns.map((item) => (
							<option key={useId()}>{item}</option>
						))}
					</select>
				</div>
				<div className="dataRow">
					{general.language === 'deutsch'
						? 'Telefonnummer'
						: 'Phone Number'}
					:
					<select ref={phoneRef} onInput={phoneHandler}>
						<option defaultChecked value={undefined}>
							-
						</option>

						{columns.map((item) => (
							<option key={useId()}>{item}</option>
						))}
					</select>
				</div>
				<div className="dataRow">
					Website:
					<select ref={webRef} onInput={webHandler}>
						<option defaultChecked value={undefined}>
							-
						</option>

						{columns.map((item) => (
							<option key={useId()}>{item}</option>
						))}
					</select>
				</div>
				<div className="dataRow">
					{general.language === 'deutsch' ? 'Firmenname' : 'Company Name'}:
					<select ref={companyNameRef} onInput={companyNameHandler}>
						<option defaultChecked value={undefined}>
							-
						</option>

						{columns.map((item) => (
							<option key={useId()}>{item}</option>
						))}
					</select>
				</div>
				<div className="dataRow">
					Alias:
					<select ref={aliasRef} onInput={aliasHandler}>
						<option defaultChecked value={undefined}>
							-
						</option>

						{columns.map((item) => (
							<option key={useId()}>{item}</option>
						))}
					</select>
				</div>
				<div className="dataRow">
					{general.language === 'deutsch' ? 'Straße' : 'Street'}:
					<select ref={streetRef} onInput={streetHandler}>
						<option defaultChecked value={undefined}>
							-
						</option>

						{columns.map((item) => (
							<option key={useId()}>{item}</option>
						))}
					</select>
				</div>
				<div className="dataRow">
					{general.language === 'deutsch' ? 'Postleitzahl' : 'Zip Code'}:
					<select ref={zipRef} onInput={zipHandler}>
						<option defaultChecked value={undefined}>
							-
						</option>

						{columns.map((item) => (
							<option key={useId()}>{item}</option>
						))}
					</select>
				</div>
				<div className="dataRow">
					{general.language === 'deutsch' ? 'Stadt' : 'City'}:
					<select ref={cityRef} onInput={cityHandler}>
						<option defaultChecked value={undefined}>
							-
						</option>

						{columns.map((item) => (
							<option key={useId()}>{item}</option>
						))}
					</select>
				</div>
				<div className="dataRow">
					{general.language === 'deutsch' ? 'Land' : 'Country'}:
					<select ref={countryRef} onInput={countryHandler}>
						<option defaultChecked value={undefined}>
							-
						</option>

						{columns.map((item) => (
							<option key={useId()}>{item}</option>
						))}
					</select>
				</div>
				<div className="dataRow">
					{general.language === 'deutsch'
						? 'Datum des ersten Treffens'
						: 'Date of first meeting'}
					:
					<select ref={firstContactRef} onInput={fistContactHandler}>
						<option defaultChecked value={undefined}>
							-
						</option>

						{columns.map((item) => (
							<option key={useId()}>{item}</option>
						))}
					</select>
				</div>
				<div className="dataRow">
					{general.language === 'deutsch'
						? 'Datum der jüngsten Interaktion'
						: 'Date of the latest interaction'}
					:
					<select ref={latestContactRef} onInput={latestContactHandler}>
						<option defaultChecked value={undefined}>
							-
						</option>

						{columns.map((item) => (
							<option key={useId()}>{item}</option>
						))}
					</select>
				</div>
				<div className="dataRow">
					{general.language === 'deutsch'
						? 'Notizen über Kunden'
						: 'Notes about customer'}
					:
					<select ref={customerNotesRef} onInput={customerNotesHandler}>
						<option defaultChecked value={undefined}>
							-
						</option>

						{columns.map((item) => (
							<option key={useId()}>{item}</option>
						))}
					</select>
				</div>
				<div className="dataRow">
					{general.language === 'deutsch'
						? 'Notizen über Adresse'
						: 'Notes about address'}
					:
					<select ref={addressNotesRef} onInput={addressNotesHandler}>
						<option defaultChecked value={undefined}>
							-
						</option>

						{columns.map((item) => (
							<option key={useId()}>{item}</option>
						))}
					</select>
				</div>
				<div className="dataRow">
					{general.language === 'deutsch'
						? 'Notizen über Person'
						: 'Notes about person'}
					:
					<select ref={personNotesRef} onInput={personNotesHandler}>
						<option defaultChecked value={undefined}>
							-
						</option>

						{columns.map((item) => (
							<option key={useId()}>{item}</option>
						))}
					</select>
				</div>
				<div className="dataRow">
					{general.language === 'deutsch'
						? 'Notizen über Person'
						: 'Notes about person'}
					:
					<select ref={companyNotesRef} onInput={companyNotesHandler}>
						<option defaultChecked value={undefined}>
							-
						</option>

						{columns.map((item) => (
							<option key={useId()}>{item}</option>
						))}
					</select>
				</div>
				<div className="dataRow">
					{general.language === 'deutsch' ? 'IABN' : 'IABN'}:
					<select ref={ibanRef} onInput={IbanHandler}>
						<option defaultChecked value={undefined}>
							-
						</option>

						{columns.map((item) => (
							<option key={useId()}>{item}</option>
						))}
					</select>
				</div>
				<div className="dataRow">
					{general.language === 'deutsch' ? 'BIC' : 'BIC'}:
					<select ref={bicRef} onInput={bicHandler}>
						<option defaultChecked value={undefined}>
							-
						</option>

						{columns.map((item) => (
							<option key={useId()}>{item}</option>
						))}
					</select>
				</div>
				<div className="dataRow">
					{general.language === 'deutsch' ? 'Bankname' : 'Bank Name'}:
					<select ref={bankNameRef} onInput={bankNameHandler}>
						<option defaultChecked value={undefined}>
							-
						</option>

						{columns.map((item) => (
							<option key={useId()}>{item}</option>
						))}
					</select>
				</div>
				<div className="dataRow">
					{general.language === 'deutsch' ? 'Bankcode' : 'Bank code'}:
					<select ref={bankCodeRef} onInput={bankCodeHandler}>
						<option defaultChecked value={undefined}>
							-
						</option>

						{columns.map((item) => (
							<option key={useId()}>{item}</option>
						))}
					</select>
				</div>
				<div className="dataRow">
					{general.language === 'deutsch'
						? 'Notizen zur Bank'
						: 'Notes about the bank'}
					:
					<select ref={bankNotesRef} onInput={bankNotesHandler}>
						<option defaultChecked value={undefined}>
							-
						</option>

						{columns.map((item) => (
							<option key={useId()}>{item}</option>
						))}
					</select>
				</div>
				<div className="dataRow">
					{general.language === 'deutsch' ? 'Beschreibung' : 'Description'}
					:
					<select ref={descriptionRef} onInput={descriptionHandler}>
						<option defaultChecked value={undefined}>
							-
						</option>

						{columns.map((item) => (
							<option key={useId()}>{item}</option>
						))}
					</select>
				</div>
			</div>
		</>
	);
}
