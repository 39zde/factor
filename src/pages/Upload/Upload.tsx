import React, { useEffect, useRef, useState, useId } from 'react';
import { ImportIcon, FileIcon, XIcon } from 'lucide-react';

// non-lib imports
import { RowShifter } from './RowShifter';
import { ColRemover } from './ColRemover';
import { ImportModule } from './ImportModule';
import { useAppContext, solids, useChangeContext } from '@app';
import Comps from '@comps';
import type { CustomerSortingMap, ArticleSortingMap, UploadMode, DocumentSortingMap } from '@typings';
import './Upload.css';

export function Upload(): React.JSX.Element {
	const dispatch = useChangeContext();
	const { general, worker, database } = useAppContext();
	const fileSelector = useRef<HTMLInputElement>(null);
	const [showTable, setShowTable] = useState<boolean>(false);
	const [showFile, setShowFile] = useState<boolean>(false);
	const [fileName, setFileName] = useState<string>('');
	const [isRed, setIsRed] = useState<boolean>(false);
	const [cols, setCols] = useState<string[]>([]);
	const [, setAllCols] = useState<string[]>([]);
	const [entries, setEntries] = useState<number>(0);
	const [update, setUpdate] = useState<boolean>(false); // stop rendering while updating
	const tableImportModeInputRef = useRef<HTMLSelectElement>(null);
	const tableWrapperRef = useRef<HTMLDivElement>(null);
	const importButtonRef = useRef<HTMLButtonElement>(null);
	const [map, setMap] = useState<CustomerSortingMap | ArticleSortingMap | DocumentSortingMap>({
		row: 'row',
		customers: {
			id: '',
		},
		persons: {},
		addresses: {},
		banks: {},
		company: {},
	});
	const [tableImportMode, setTableImportMode] = useState<UploadMode | undefined>(undefined);
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
			if (files?.length === 1) {
				try {
					const data = await files[0].text();
					sessionStorage.setItem('fileName', files[0].name);
					sessionStorage.setItem('fileUpload', data);
					setFileName(files[0].name);
					setShowFile(true);
				} catch {
					new Notification(general.language === 'deutsch' ? 'Ein Fehler ist aufgetreten' : 'An error occurred', {
						body: 'Failed to convert file to text',
					});
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
		setMap: (newVal: ArticleSortingMap | CustomerSortingMap | DocumentSortingMap) => {
			setMap(newVal);
		},
	};

	const importHandler = () => {
		if (tableImportMode === 'customer_db' && map !== undefined) {
			//@ts-expect-error this needs work
			if (map['customers']['id'] === undefined) {
				new Notification(general.language === 'deutsch' ? 'Ein Fehler ist aufgetreten' : 'An error occurred', {
					body: "'Customers ID is a requirement'",
				});
			} else {
				worker.ImportWorker.postMessage({
					type: 'sort',
					data: map,
					targetDBName: tableImportMode,
					dbVersion: database.dbVersion,
					dataBaseName: 'factor_db',
				});
			}
		} else {
			worker.ImportWorker.postMessage({
				type: 'sort',
				data: map,
				targetDBName: tableImportMode,
				dbVersion: database.dbVersion,
				dataBaseName: 'factor_db',
			});
		}
	};

	worker.ImportWorker.onmessage = (e) => {
		if (e.data !== undefined) {
			switch (e.data.type) {
				case 'progress':
					if (importButtonRef.current !== null) {
						importButtonRef.current.innerText = e.data.data;
					}
					break;
				case 'success':
					if (importButtonRef.current !== null) {
						importButtonRef.current.innerText = general.language === 'deutsch' ? 'Tabelle erstellen/erneuern' : 'Create/Update Table';
					}
					if (tableImportModeInputRef.current !== null) {
						switch (tableImportModeInputRef.current.value) {
							case 'customers':
								dispatch({
									type: 'set',
									change: {
										database: {
											databases: {
												customer_db: ['customers', 'persons', 'emails', 'phones', 'addresses', 'banks', 'company'],
												article_db: database.databases.article_db,
												document_db: database.databases.document_db,
											},
										},
									},
								});
						}
					}

					break;
				case 'error':
				default:
					new Notification(general.language === 'deutsch' ? 'Ein Fehler ist aufgetreten' : 'An error occurred', {
						body: 'Import Error: \n' + e.data?.data,
					});
			}
		}
	};

	const actionHandler = (): void => {
		const file = sessionStorage.getItem('fileUpload');
		if (file !== undefined) {
			worker.ImportWorker.postMessage({
				type: 'import',
				data: file,
				dbVersion: database.dbVersion,
				dataBaseName: 'factor_db',
			});
		}
		worker.ImportWorker.onmessage = (e) => {
			if (e.data.type === 'imported') {
				colsHook.setCols(e.data.data[1]);
				entriesHook(e.data.data[0]);

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
					<ul className="toolbar">
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
									<button onClick={removeFileHandler} className="removeFile">
										<XIcon
											onMouseEnter={() => setIsRed(true)}
											onMouseLeave={() => setIsRed(false)}
											color={isRed ? 'var(--color-primary)' : 'light-dark(var(--color-dark-2),var(--color-light-2))'}
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
										display: showFile ? (showTable ? 'none' : 'flex') : 'none',
									}}
									onClick={actionHandler}>
									<ImportIcon
										color="light-dark(var(--color-dark-1),var(--color-light-1))"
										size={solids.icon.size.regular}
										strokeWidth={solids.icon.strokeWidth.regular}
									/>
									{general.language === 'deutsch' ? 'Importieren' : 'Import'}
								</button>
							</div>
						</li>
						{showTable && cols.length !== 0 ? (
							<>
								<li key={'tableInfo1'}>
									{general.language === 'deutsch' ? 'Einträge' : 'Entries'}: {entries.toString() ?? '-'}
								</li>
								<li key={'tableInfo2'}>
									{general.language === 'deutsch' ? 'Spalten' : 'Columns'}: {cols.length ?? '-'}
								</li>
								<li key={'tableInfo3'}>
									<RowShifter cols={cols} />
								</li>
								<li key={'tableInfo4'}>
									<ColRemover updateHook={updateHook} count={entries} worker={worker.ImportWorker} />
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
							<Comps.Table
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
							<h2>{general.language === 'english' ? 'Sort and Assign Data' : 'Daten Sortieren und Einordnen'}</h2>
							<ul className="toolbar">
								<li>
									<select onInput={tableImportModeHandler} ref={tableImportModeInputRef} defaultValue={undefined}>
										<option value={undefined}>-</option>
										<option value="article_db">{general.language == 'deutsch' ? 'Artikel' : 'articles'}</option>
										<option value="customer_db">{general.language == 'deutsch' ? 'Kunden' : 'customers'}</option>
										<option value="document_db">{general.language == 'deutsch' ? 'Dokumente' : 'Documents'}</option>
									</select>
								</li>
								<li>
									<button ref={importButtonRef} onClick={importHandler}>
										{general.language === 'deutsch' ? 'Tabelle erstellen/erneuern' : 'Create/Update Table'}
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
								<ImportModule mode={tableImportMode} columns={cols} hook={sortingMapHook} />
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