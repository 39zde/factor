import React, { useEffect, useRef, useState, useContext, useId } from 'react';
import { ImportIcon, FileIcon, XIcon } from 'lucide-react';
import { RowShifter } from './RowShifter';
import { ColRemover } from './ColRemover';

import { Table } from '@comps/Table/Table';
import './Upload.css';
import type { CustomerSortingMap, ImportModuleProps, ArticleSortingMap } from '@util/types/types';
import { AppContext } from '@renderer/App';

export function Upload(): React.JSX.Element {
	const { general, worker } = useContext(AppContext);
	const fileSelector = useRef<HTMLInputElement>(null);
	const [showTable, setShowTable] = useState<boolean>(false);
	const [showFile, setShowFile] = useState<boolean>(false);
	const [fileName, setFileName] = useState<string>('');
	const [isRed, setIsRed] = useState<boolean>(false);
	const [cols, setCols] = useState<Array<string>>([]);
	const [entries, setEntries] = useState<number>(0);
	const [update, setUpdate] = useState<boolean>(false); // stop rendering while updating
	const [mouseInSorter, setMouseInSorter] = useState<boolean>(false);
	const tableImportModeInputRef = useRef<HTMLSelectElement>(null);
	const pageRef = useRef<HTMLDivElement>(null);
	const [dataSorterHeight, setDataSorterHeight] = useState<number>(0);
	const [sortingMap, setSortingMap] = useState<CustomerSortingMap |ArticleSortingMap>({customerID: ""});
	const [tableImportMode, setTableImportMode] = useState<
		'articles' | 'customers' | 'quotes' | 'invoices' | 'deliveries' | 'returnees'
	>('customers');
	const tableImportModeHandler = (): void => {
		if (tableImportModeInputRef.current === null) {
			return;
		}
		if (general.language === 'deutsch') {
			switch (tableImportModeInputRef.current.value) {
				case 'Artikel':
					setTableImportMode('articles');
					break;
				case 'Kunden':
					setTableImportMode('customers');
					break;
				case 'Angebote':
					setTableImportMode('quotes');
					break;
				case 'Lieferscheine':
					setTableImportMode('deliveries');
					break;
				case 'Rechnungen':
					setTableImportMode('invoices');
					break;
				default:
					setTableImportMode('customers');
			}
		} else {
			//@ts-expect-error
			setTableImportMode(tableImportModeInputRef.current.value);
		}
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

	useEffect((): void => {
		if (pageRef.current !== null) {
			let heightAvail = pageRef.current.getBoundingClientRect().height;
			for (const child of pageRef.current.children) {
				if (child.className !== 'dataSorter') {
					heightAvail -= child.getBoundingClientRect().height;
				}
			}
			setDataSorterHeight(heightAvail);
		}
	}, [showTable]);

	const removeFileHandler = (): void => {
		sessionStorage.removeItem('fileUpload');
		sessionStorage.removeItem('fileName');
		setShowFile(false);
		setShowTable(false);
	};

	const actionHandler = (): void => {
		const file = sessionStorage.getItem('fileUpload');
		if (file !== undefined) {
			worker.ImportWorker.postMessage({ type: 'import', message: file });
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

	const sortEnterHandler = (): void => {
		setMouseInSorter(true);
	};

	const sortLeaveHandler = (): void => {
		setMouseInSorter(false);
	};

	const colsHook = {
		cols: cols,
		setCols: (newCols: Array<string>) => {
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
		sortingMap: sortingMap,
		setSortingMap: (newVal: ArticleSortingMap | CustomerSortingMap) => {
			setSortingMap(newVal);
		},
	};

	const importHandler = async () => {
		
		worker.ImportWorker.postMessage({
			type: 'sort',
			message: sortingMap,
			content: tableImportMode,
		});
		worker.ImportWorker.onmessage = (e) => {
			console.log(e.data);
		};
	};

	return (
		<>
			<div
				className="uploadPage page"
				ref={pageRef}
				style={{ overflow: 'hidden' }}
			>
				<h1>{general.language === 'deutsch' ? 'Hochladen' : 'Upload'}</h1>
				<div className="fileSelector">
					{showTable ? (
						<></>
					) : (
						<>
							<label
								htmlFor="table_file_upload"
								className="uploadButton"
							>
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
							}}
						>
							<button onClick={removeFileHandler} className="removeFile">
								<XIcon
									onMouseEnter={() => setIsRed(true)}
									onMouseLeave={() => setIsRed(false)}
									color={isRed ? 'red' : 'white'}
									size={24}
									strokeWidth={2}
								/>
							</button>
							<FileIcon color="white" size={24} strokeWidth={2} />
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
							onClick={actionHandler}
							className="importButton"
						>
							<ImportIcon color="white" size={24} strokeWidth={2} />
							{general.language=== "deutsch" ? "Importieren": "Import"}
						</button>
					</div>
				</div>
				{showTable && cols.length !== 0 ? (
					<>
						<ul className="tableInfo">
							<li key={'tableInfo1'}>
								{general.language=== "deutsch" ? "Einträge": "Entries"}: {entries.toString() ?? '-'}
							</li>
							<li key={'tableInfo2'}>{general.language=== "deutsch" ? "Spalten": "Columns"}: {cols.length ?? '-'}</li>
							<li key={'tableInfo3'}>
								<RowShifter cols={cols} worker={worker.ImportWorker} />
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

				{showTable ? (
					<>
						<div
							className="dataSorter"
							style={{ height: dataSorterHeight }}
						>
							<Table
								tableName="data_upload"
								colsHook={colsHook}
								entriesHook={entriesHook}
								updateHook={updateHook}
							/>
							<div className="dataAssigner">
								<h2>
									{general.language === 'english'
										? 'Sort and Assign Data'
										: 'Daten Sortieren und Einordnen'}
								</h2>
								<div className="tableInfo">
									<ul>
										<li>
											<select
												onInput={tableImportModeHandler}
												ref={tableImportModeInputRef}
												defaultValue={'customers'}
											>
												<option>
													{general.language == 'english'
														? 'articles'
														: 'Article'}
												</option>
												<option>
													{general.language == 'english'
														? 'customers'
														: 'Kunden'}
												</option>
												<option>
													{general.language == 'english'
														? 'quotes'
														: 'Angebote'}
												</option>
												<option>
													{general.language == 'english'
														? 'invoices'
														: 'Rechnungen'}
												</option>
												<option>
													{general.language == 'english'
														? 'deliveries'
														: 'Lieferscheine'}
												</option>
											</select>
										</li>
										<li>
											<button onClick={importHandler}>
												{general.language=== "deutsch" ? "Tabelle erstellen/erneuern": "Create/Update Table"}
											</button>
										</li>
									</ul>
								</div>

								<div
									className="assignWrapper"
									onMouseEnter={sortEnterHandler}
									onMouseLeave={sortLeaveHandler}
								>
									<ImportModule
										mode={tableImportMode}
										columns={cols}
										hook={sortingMapHook}
									/>
								</div>
							</div>
						</div>
					</>
				) : (
					<></>
				)}
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
	columns: Array<string>;
	hook: {
		sortingMap: any;
		setSortingMap: (newVal: CustomerSortingMap) => void;
	};
}) {
	const { general } = useContext(AppContext);

	const idRef = useRef<HTMLSelectElement>(null);
	const [idCol, setIdCol] = useState<string>('-');
	const idHandler = () => {
		if (idRef.current !== null) {
			setIdCol(idRef.current.value);
		}
	};

	const titleRef = useRef<HTMLSelectElement>(null);
	const [titleCol, setTitleCol] = useState<string>('-');
	const titleHandler = () => {
		if (titleRef.current !== null) {
			setTitleCol(titleRef.current.value);
		}
	};

	const firstNameRef = useRef<HTMLSelectElement>(null);
	const [firstNameCol, setFirstNameCol] = useState<string>('-');
	const firstNameHandler = () => {
		if (firstNameRef.current !== null) {
			setFirstNameCol(firstNameRef.current.value);
		}
	};

	const lastNameRef = useRef<HTMLSelectElement>(null);
	const [lastNameCol, setLastNameCol] = useState<string>('-');
	const lastNameHandler = () => {
		if (lastNameRef.current !== null) {
			setLastNameCol(lastNameRef.current.value);
		}
	};

	const emailRef = useRef<HTMLSelectElement>(null);
	const [emailCol, setEmailCol] = useState<string>('-');
	const emailHandler = () => {
		if (emailRef.current !== null) {
			setEmailCol(emailRef.current.value);
		}
	};

	const phoneRef = useRef<HTMLSelectElement>(null);
	const [phoneCol, setPhoneCol] = useState<string>('-');
	const phoneHandler = () => {
		if (phoneRef.current !== null) {
			setPhoneCol(phoneRef.current.value);
		}
	};

	const webRef = useRef<HTMLSelectElement>(null);
	const [webCol, setWebCol] = useState<string>('-');
	const webHandler = () => {
		if (webRef.current !== null) {
			setWebCol(webRef.current.value);
		}
	};

	const copmanyNameRef = useRef<HTMLSelectElement>(null);
	const [copmanyNameCol, setCopmanyNameCol] = useState<string>('-');
	const copmanyNameHandler = () => {
		if (copmanyNameRef.current !== null) {
			setCopmanyNameCol(copmanyNameRef.current.value);
		}
	};

	const aliasRef = useRef<HTMLSelectElement>(null);
	const [aliasCol, setAliasCol] = useState<string>('-');
	const aliasHandler = () => {
		if (aliasRef.current !== null) {
			setAliasCol(aliasRef.current.value);
		}
	};

	const streetRef = useRef<HTMLSelectElement>(null);
	const [streetCol, setStreetCol] = useState<string>('-');
	const streetHandler = () => {
		if (streetRef.current !== null) {
			setStreetCol(streetRef.current.value);
		}
	};

	const zipRef = useRef<HTMLSelectElement>(null);
	const [zipCol, setZipCol] = useState<string>('-');
	const zipHandler = () => {
		if (zipRef.current !== null) {
			setZipCol(zipRef.current.value);
		}
	};

	const cityRef = useRef<HTMLSelectElement>(null);
	const [cityCol, setCityCol] = useState<string>('-');
	const cityHandler = () => {
		if (cityRef.current !== null) {
			setCityCol(cityRef.current.value);
		}
	};

	const countryRef = useRef<HTMLSelectElement>(null);
	const [countryCol, setCountryCol] = useState<string>('-');
	const countryHandler = () => {
		if (countryRef.current !== null) {
			setCountryCol(countryRef.current.value);
		}
	};

	const fistContactRef = useRef<HTMLSelectElement>(null);
	const [fistContactCol, setFistContactCol] = useState<string>('-');
	const fistContactHandler = () => {
		if (fistContactRef.current !== null) {
			setFistContactCol(fistContactRef.current.value);
		}
	};

	const latestContactRef = useRef<HTMLSelectElement>(null);
	const [latestContactCol, setLatestContactCol] = useState<string>('-');
	const latestContactHandler = () => {
		if (latestContactRef.current !== null) {
			setLatestContactCol(latestContactRef.current.value);
		}
	};

	const notesRef = useRef<HTMLSelectElement>(null);
	const [notesCol, setNotesCol] = useState<string>('-');
	const notesHandler = () => {
		if (notesRef.current !== null) {
			setNotesCol(notesRef.current.value);
		}
	};

	useEffect(() => {
		const map: CustomerSortingMap = {
			customerID: idCol,
			alias: aliasCol,
			city: cityCol,
			companyName: copmanyNameCol,
			country: countryCol,
			email: emailCol,
			first: fistContactCol,
			firstName: firstNameCol,
			lastName: lastNameCol,
			latest: latestContactCol,
			notes: notesCol,
			phone: phoneCol,
			street: streetCol,
			title: titleCol,
			web: webCol,
			zip: zipCol,
		};

		hook.setSortingMap(map);
	}, [
		notesCol,
		latestContactCol,
		fistContactCol,
		countryCol,
		cityCol,
		zipCol,
		streetCol,
		aliasCol,
		copmanyNameCol,
		webCol,
		phoneCol,
		emailCol,
		lastNameCol,
		firstNameCol,
		titleCol,
		idCol,
	]);
	return (
		<>
			<h3>
				{general.language === 'deutsch'
					? 'Datenstruktur Artikel'
					: 'Data Structure Articles'}
			</h3>
			<div className="customerOptions">
				<div className="dataRow">
					{general.language === 'deutsch' ? 'Kundennummer' : 'Customer ID'}
					:
					<select ref={idRef} onInput={idHandler}>
						<option defaultChecked>-</option>
						{columns.map((item) => (
							<option key={useId()}>{item}</option>
						))}
					</select>
				</div>
				<div className="dataRow">
					{general.language === 'deutsch' ? 'Anrede' : 'Title'}:
					<select ref={titleRef} onInput={titleHandler}>
						<option defaultChecked>-</option>
						{columns.map((item) => (
							<option key={useId()}>{item}</option>
						))}
					</select>
				</div>
				<div className="dataRow">
					{general.language === 'deutsch' ? 'Vorname' : 'First Name'}:
					<select ref={firstNameRef} onInput={firstNameHandler}>
						<option defaultChecked>-</option>

						{columns.map((item) => (
							<option key={useId()}>{item}</option>
						))}
					</select>
				</div>
				<div className="dataRow">
					{general.language === 'deutsch' ? 'Nachname' : 'Last Name'}:
					<select ref={lastNameRef} onInput={lastNameHandler}>
						<option defaultChecked>-</option>

						{columns.map((item) => (
							<option key={useId()}>{item}</option>
						))}
					</select>
				</div>
				<div className="dataRow">
					Email:
					<select ref={emailRef} onInput={emailHandler}>
						<option defaultChecked>-</option>

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
						<option defaultChecked>-</option>

						{columns.map((item) => (
							<option key={useId()}>{item}</option>
						))}
					</select>
				</div>
				<div className="dataRow">
					Website:
					<select ref={webRef} onInput={webHandler}>
						<option defaultChecked>-</option>

						{columns.map((item) => (
							<option key={useId()}>{item}</option>
						))}
					</select>
				</div>
				<div className="dataRow">
					{general.language === 'deutsch' ? 'Firmenname' : 'Company Name'}:
					<select ref={copmanyNameRef} onInput={copmanyNameHandler}>
						<option defaultChecked>-</option>

						{columns.map((item) => (
							<option key={useId()}>{item}</option>
						))}
					</select>
				</div>
				<div className="dataRow">
					Alias:
					<select ref={aliasRef} onInput={aliasHandler}>
						<option defaultChecked>-</option>

						{columns.map((item) => (
							<option key={useId()}>{item}</option>
						))}
					</select>
				</div>
				<div className="dataRow">
					{general.language === 'deutsch' ? 'Straße' : 'Street'}:
					<select ref={streetRef} onInput={streetHandler}>
						<option defaultChecked>-</option>

						{columns.map((item) => (
							<option key={useId()}>{item}</option>
						))}
					</select>
				</div>
				<div className="dataRow">
					{general.language === 'deutsch' ? 'Postleitzahl' : 'Zip Code'}:
					<select ref={zipRef} onInput={zipHandler}>
						<option defaultChecked>-</option>

						{columns.map((item) => (
							<option key={useId()}>{item}</option>
						))}
					</select>
				</div>
				<div className="dataRow">
					{general.language === 'deutsch' ? 'Stadt' : 'City'}:
					<select ref={cityRef} onInput={cityHandler}>
						<option defaultChecked>-</option>

						{columns.map((item) => (
							<option key={useId()}>{item}</option>
						))}
					</select>
				</div>
				<div className="dataRow">
					{general.language === 'deutsch' ? 'Land' : 'Country'}:
					<select ref={countryRef} onInput={countryHandler}>
						<option defaultChecked>-</option>

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
					<select ref={fistContactRef} onInput={fistContactHandler}>
						<option defaultChecked>-</option>

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
						<option defaultChecked>-</option>

						{columns.map((item) => (
							<option key={useId()}>{item}</option>
						))}
					</select>
				</div>
				<div className="dataRow">
					{general.language === 'deutsch' ? 'Notizen' : 'Notes'}:
					<select ref={notesRef} onInput={notesHandler}>
						<option defaultChecked>-</option>

						{columns.map((item) => (
							<option key={useId()}>{item}</option>
						))}
					</select>
				</div>
			</div>
		</>
	);
}
