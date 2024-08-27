import React, { useEffect, useRef, useState, useId } from 'react';
import { ImportIcon, FileIcon, XIcon } from 'lucide-react';
import { RowShifter } from './RowShifter';
import { ColRemover } from './ColRemover';
import { ImportModule } from './ImportModule';

import { Table } from '@comps/Table/Table';
import './Upload.css';
import type {
	CustomerSortingMap,
	ArticleSortingMap,
	UploadMode,
} from '@util/types/types';
import { useAppContext, solids } from '@renderer/App';

export function Upload(): React.JSX.Element {
	const { general, worker, database } = useAppContext();
	const fileSelector = useRef<HTMLInputElement>(null);
	const [showTable, setShowTable] = useState<boolean>(false);
	const [showFile, setShowFile] = useState<boolean>(false);
	const [fileName, setFileName] = useState<string>('');
	const [isRed, setIsRed] = useState<boolean>(false);
	const [cols, setCols] = useState<string[]>([]);
	const [allCols, setAllCols] = useState<string[]>([]);
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
		setAllCols: (newVal: string[]) => {
			setAllCols(newVal);
		},
	};

	const entriesHook = (count: number) => {
		setEntries(count);
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

	const importHandler = () => {
		worker.ImportWorker.postMessage({
			type: 'sort',
			message: map,
			content: tableImportMode,
			dbVersion: database.dbVersion,
			dataBaseName: 'factor_db',
		});
		worker.ImportWorker.onmessage = (e) => {
			if (e.data !== undefined) {
				switch (e.data.type) {
					case 'progress':
						if (importButtonRef.current !== null) {
							importButtonRef.current.innerText = e.data.message;
						}
						break;
					case 'success':
						if (importButtonRef.current !== null) {
							importButtonRef.current.innerText =
								general.language === 'deutsch'
									? 'Tabelle erstellen/erneuern'
									: 'Create/Update Table';
						}
						if (tableImportModeInputRef.current !== null) {
							switch (tableImportModeInputRef.current.value) {
								case 'customers':
								// const newTables = database;
								// if (newTables.includes('customer_db')) {
								// 	break;
								// }
								// newTables.push('customer_db');
								// dispatch({
								// 	type: 'set',
								// 	change: {
								// 		database: {
								// 			tables: newTables,
								// 		},
								// 	},
								// });
							}
						}

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
			worker.ImportWorker.postMessage({
				type: 'import',
				message: file,
				dbVersion: database.dbVersion,
				dataBaseName: 'factor_db',
			});
		}
		worker.ImportWorker.onmessage = (e) => {
			if (e.data.type === 'imported') {
				colsHook.setCols(e.data.message[1]);
				entriesHook(e.data.message[0]);

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
				<div className="tableInfoWrapper">
					<ul className="tableInfo">
						<li className="fileSelector">
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
									<button
										onClick={removeFileHandler}
										className="removeFile">
										<XIcon
											onMouseEnter={() => setIsRed(true)}
											onMouseLeave={() => setIsRed(false)}
											color={
												isRed
													? 'var(--color-primary)'
													: 'light-dark(var(--color-dark-2),var(--color-light-2))'
											}
											size={solids.icon.size.regular}
											strokeWidth={solids.icon.strokeWidth.regular}
										/>
									</button>
									<FileIcon
										color="light-dark(var(--color-dark-1),var(--color-light-1))"
										size={solids.icon.size.regular}
										strokeWidth={solids.icon.strokeWidth.regular}
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
										size={solids.icon.size.regular}
										strokeWidth={solids.icon.strokeWidth.regular}
									/>
									{general.language === 'deutsch'
										? 'Importieren'
										: 'Import'}
								</button>
							</div>
						</li>
						{showTable && cols.length !== 0 ? (
							<>
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
							</>
						) : (
							<></>
						)}
					</ul>
				</div>
				<div className="uploadTableWrapper" ref={tableWrapperRef}>
					{showTable ? (
						<>
							<Table
								dataBaseName="factor_db"
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
