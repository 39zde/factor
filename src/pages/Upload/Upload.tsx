import React, { useEffect, useRef, useState, useId } from 'react';
import { ImportIcon, FileIcon, XIcon, ReplaceIcon } from 'lucide-react';

// non-lib imports
import { RowShifter } from './RowShifter';
import { ColRemover } from './ColRemover';
import { ImportModule } from './ImportModule';
import { useAppContext, solids, useChangeContext } from '@app';
import Comps from '@comps';
import type { CustomerSortingMap, ArticleSortingMap, DataBaseNames, DocumentSortingMap, ImportWorkerMessageResponse, RankDoneData } from '@type';
import './Upload.css';

export function Upload(): React.JSX.Element {
	const dispatch = useChangeContext();
	const { general, worker, database } = useAppContext();
	const fileSelector = useRef<HTMLInputElement>(null);
	const [showTable, setShowTable] = useState<boolean>(false);
	const [showFile, setShowFile] = useState<boolean>(false);
	const [fileName, setFileName] = useState<string>('');
	const [isRed, setIsRed] = useState<boolean>(false);
	const [isRedModal, setIsRedModal] = useState<boolean>(false);
	const [cols, setCols] = useState<string[]>([]);
	const [, setAllCols] = useState<string[]>([]);
	const [entries, setEntries] = useState<number>(0);
	const [update, setUpdate] = useState<boolean>(false); // stop rendering while updating
	const tableImportModeInputRef = useRef<HTMLSelectElement>(null);
	const tableWrapperRef = useRef<HTMLDivElement>(null);
	const [importButtonText, setImportButtonText] = useState<string>(general.language === 'deutsch' ? 'Importieren' : 'Import');
	const [createButtonText, setCreateButtonText] = useState<string>(
		general.language === 'deutsch' ? 'Tabelle erstellen/erneuern' : 'Create/Update Table'
	);
	const [showShiftOptions, setShowShiftOptions] = useState<boolean>(false);
	const [shiftProgress, setShiftProgress] = useState<string>('Go!');
	const [deleteProgress, setDeleteProgress] = useState<string>('Go!');
	const [showDeleteOptions, setShowDeleteOptions] = useState<boolean>(false);
	const [fileUploadHandle, setFileUploadHandle] = useState<File>();
	const rankedDeletionRef = useRef<HTMLDialogElement>(null);
	const [rankedDeletionColumns, setRankedDeletionColumns] = useState<RankDoneData | undefined>();
	const [rankedDeletionProgress, setRankedDeletionProgress] = useState<(string | null)[]>([]);
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
	const [tableImportMode, setTableImportMode] = useState<DataBaseNames | undefined>(undefined);

	const showShiftOptionsHook = {
		text: shiftProgress,
		value: showShiftOptions,
		setValue: (newVal: boolean) => {
			setShowShiftOptions(newVal);
		},
	};

	const showDeleteOptionsHook = {
		text: deleteProgress,
		value: showDeleteOptions,
		setValue: (newVal: boolean) => {
			setShowDeleteOptions(newVal);
		},
	};

	const tableImportModeHandler = (): void => {
		if (tableImportModeInputRef.current === null) {
			return;
		}
		// @ts-expect-error ..current.value is of type UploadMode, because of the hardcoded <options values={...}> in side the select element. TS does not know that
		setTableImportMode(tableImportModeInputRef.current.value);
	};

	const fileHandler = function handleFiles() {
		removeFileHandler();
		const files = fileSelector.current?.files;
		if (files) {
			if (files.length === 1) {
				try {
					setFileUploadHandle(files[0]);
					sessionStorage.setItem('fileName', files[0].name);
					setFileName(files[0].name);
					setShowFile(true);
				} catch {
					dispatch({
						type: 'notify',
						notification: {
							title: general.language === 'deutsch' ? 'Ein Fehler ist aufgetreten' : 'An error occurred',
							body: 'Failed to convert file to text',
						},
					});
				}
			} else {
				dispatch({
					type: 'notify',
					notification: {
						title: general.language === 'deutsch' ? 'Ein Fehler ist aufgetreten' : 'An error occurred',
						body: 'More than one file was selected',
					},
				});
			}
		} else {
			dispatch({
				type: 'notify',
				notification: {
					title: general.language === 'deutsch' ? 'Ein Fehler ist aufgetreten' : 'An error occurred',
					body: 'Could not get this file',
				},
			});
		}
	};

	useEffect((): void => {
		const name = sessionStorage.getItem('fileName');
		if (name) {
			setFileName(name);
		}
	}, []);

	const removeFileHandler = (): void => {
		setFileUploadHandle(undefined);
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

	const createHandler = () => {
		if (tableImportMode === 'customer_db' && map !== undefined) {
			console.log('test');
			//@ts-expect-error this needs work
			if (map['customers']['id'] === undefined) {
				dispatch({
					type: 'notify',
					notification: {
						title: general.language === 'deutsch' ? 'Ein Fehler ist aufgetreten' : 'An error occurred',
						body: general.language === 'deutsch' ? 'Kundennummer fehlt' : 'Customers ID is a requirement',
					},
				});
			} else {
				worker.ImportWorker.postMessage({
					channelName: 'import-sorter',
					type: 'sort',
					data: map,
					targetDBName: tableImportMode,
					dbVersion: database.dbVersion,
					dataBaseName: 'factor_db',
				});
			}
		} else {
			worker.ImportWorker.postMessage({
				channelName: 'import-sorter',
				type: 'sort',
				data: map,
				targetDBName: tableImportMode,
				dbVersion: database.dbVersion,
				dataBaseName: 'factor_db',
			});
		}
	};

	const restoreBackupHandler = () => {
		if (fileUploadHandle) {
			const transfer = {
				type: 'restore',
				dataBaseName: '',
				dbVersion: database.dbVersion,
				data: 'json',
			};
			const transferStream = fileUploadHandle.stream();
			worker.ImportWorker.postMessage([transfer, transferStream], { transfer: [transferStream] });
		}
	};

	const actionHandler = (): void => {
		if (fileUploadHandle) {
			const transfer = {
				type: 'import',
				dbVersion: database.dbVersion,
				dataBaseName: 'factor_db',
				data: fileUploadHandle.type.split('/')[1],
			};
			const transferStream = fileUploadHandle.stream();
			worker.ImportWorker.postMessage([transfer, transferStream], { transfer: [transferStream] });
		}
	};

	const rankedDeletionHandler = (name: string, index: number) => {
		worker.ImportWorker.postMessage({
			type: 'delete-rank',
			dataBaseName: 'factor_db',
			dbVersion: database.dbVersion,
			data: {
				columnName: name,
				columnIndex: index,
			},
		});
	};

	worker.ImportWorker.onmessage = (e) => {
		const eventData = e.data as ImportWorkerMessageResponse;
		switch (eventData.type) {
			case 'import-progress':
				setImportButtonText(eventData.data as string);
				break;
			case 'import-done':
				setImportButtonText(general.language === 'deutsch' ? 'Importieren' : 'Import');
				colsHook.setCols(e.data.data[1]);
				entriesHook(e.data.data[0]);
				setShowTable(true);
				break;
			case 'rank-progress':
				setDeleteProgress(eventData.data as string);
				break;
			case 'rank-done':
				setDeleteProgress('Go!');
				showDeleteOptionsHook.setValue(false);
				setRankedDeletionColumns(eventData.data as RankDoneData);
				setRankedDeletionProgress(
					(eventData.data as RankDoneData).map(() => (general.language === 'deutsch' ? 'Spalte löschen' : 'Delete Column'))
				);
				if (rankedDeletionRef.current !== null) {
					rankedDeletionRef.current.showModal();
				}
				break;
			case 'align-progress':
				setShiftProgress(eventData.data as string);
				break;
			case 'align-done':
				setShiftProgress('Go!');
				showShiftOptionsHook.setValue(false);
				updateHook.setUpdate(false);
				break;
			case 'delete-col-progress':
				setDeleteProgress(eventData.data as string);
				break;
			case 'delete-col-done':
				setDeleteProgress('Go!');
				showDeleteOptionsHook.setValue(false);
				updateHook.setUpdate(false);
				break;
			case 'delete-rank-progress':
				if (eventData.addons !== undefined) {
					setRankedDeletionProgress(
						//@ts-expect-error low prio operation, no need to further complicate things
						rankedDeletionProgress.map((v, i) => (i === (eventData.addons[0] as number) ? (eventData.data as string) : v))
					);
				}
				break;
			case 'delete-rank-done':
				if (eventData.data !== undefined && rankedDeletionColumns) {
					colsHook.setCols(colsHook.cols.toSpliced(colsHook.cols.indexOf(rankedDeletionColumns[eventData.data as number][0]), 1));
					setRankedDeletionProgress(rankedDeletionProgress.map((v, i) => (i === (eventData.data as number) ? null : v)));
				}
				break;
			case 'sort-progress':
				setCreateButtonText(eventData.data as string);
				break;
			case 'sort-done':
				switch (eventData.data) {
					case 'customer_db':
						dispatch({
							type: 'set',
							change: {
								database: {
									// @ts-expect-error we don't need to list all databases since it is only a change
									databases: {
										customer_db: ['customers', 'persons', 'emails', 'phones', 'addresses', 'banks', 'company'],
									},
								},
							},
						});
						break;
					default:
						console.error('import db default');
				}
				setCreateButtonText(general.language === 'deutsch' ? 'Tabelle erstellen/erneuern' : 'Create/Update Table');
				setFileName('');
				setShowFile(false);
				break;
			case 'restore-progress':
				break;
			case 'restore-done':
				switch (eventData.data) {
					case 'customer_db':
						dispatch({
							type: 'set',
							change: {
								database: {
									// @ts-expect-error we don't need to list all databases since it is only a change
									databases: {
										customer_db: ['customers', 'persons', 'emails', 'phones', 'addresses', 'banks', 'company'],
									},
								},
							},
						});
						break;
					default:
						console.error('import db default');
				}
				break;
			case 'error':
				console.error(eventData.data as string);
			default:
				break;
		}
	};

	return (
		<>
			<div className="uploadPage page" style={{ overflow: 'hidden' }}>
				<div className="tableInfoWrapper">
					<menu className="toolbar">
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
									accept="text/csv,application/json"
									// accept="text/csv,application/vnd.oasis.opendocument.spreadsheet,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
									className="fileInput"
									onChange={fileHandler}
									onInput={fileHandler}
									multiple={false}
								/>
								{showFile ? (
									<>
										<div className="fileDisplay">
											<button
												onClick={removeFileHandler}
												className="removeFile"
												onMouseEnter={() => setIsRed(true)}
												onMouseLeave={() => setIsRed(false)}>
												<XIcon
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

										{fileUploadHandle && fileUploadHandle.type === 'application/json' ? (
											<>
												<button
													style={{
														display: showFile ? (showTable ? 'none' : 'flex') : 'none',
													}}
													onClick={restoreBackupHandler}>
													<ReplaceIcon
														color="light-dark(var(--color-dark-1),var(--color-light-1))"
														size={solids.icon.size.regular}
														strokeWidth={solids.icon.strokeWidth.regular}
													/>
													{general.language === 'deutsch' ? 'Backup Wiederherstellen' : 'Restore Backup'}
												</button>
											</>
										) : (
											<>
												<button
													style={{
														display: showTable ? 'none' : 'flex',
													}}
													onClick={actionHandler}>
													<ImportIcon
														color="light-dark(var(--color-dark-1),var(--color-light-1))"
														size={solids.icon.size.regular}
														strokeWidth={solids.icon.strokeWidth.regular}
													/>
													{importButtonText}
												</button>
											</>
										)}
									</>
								) : (
									<></>
								)}
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
									<RowShifter cols={cols} showOptionsHook={showShiftOptionsHook} updateHook={updateHook} />
								</li>
								<li key={'tableInfo4'}>
									<ColRemover updateHook={updateHook} showOptionsHook={showDeleteOptionsHook} colsHook={colsHook} />
								</li>
							</>
						) : (
							<></>
						)}
					</menu>
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
								nativeColumnNames={true}
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
							<menu className="toolbar">
								<li>
									<select onInput={tableImportModeHandler} ref={tableImportModeInputRef} defaultValue={undefined}>
										<option value={undefined}>-</option>
										<option value="article_db">{general.language == 'deutsch' ? 'Artikel' : 'articles'}</option>
										<option value="customer_db">{general.language == 'deutsch' ? 'Kunden' : 'customers'}</option>
										<option value="document_db">{general.language == 'deutsch' ? 'Dokumente' : 'Documents'}</option>
									</select>
								</li>
								<li>
									<button onClick={createHandler}>{createButtonText}</button>
								</li>
								<li>
									<button
										onClick={() => {
											const channel = new BroadcastChannel('reset-column-selection');
											channel.postMessage('reset');
										}}>
										{general.language === 'deutsch' ? 'Auswahl zurücksetzen' : 'Reset selection'}
									</button>
								</li>
							</menu>
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
				<dialog ref={rankedDeletionRef}>
					<button
						onMouseEnter={() => setIsRedModal(true)}
						onMouseLeave={() => setIsRedModal(false)}
						className="closeRankedDel"
						onClick={() => {
							if (rankedDeletionRef.current !== null) {
								rankedDeletionRef.current.close();
							}
						}}>
						<XIcon
							onMouseEnter={() => setIsRed(true)}
							onMouseLeave={() => setIsRed(false)}
							color={isRedModal ? 'var(--color-primary)' : 'light-dark(var(--color-dark-2),var(--color-light-2))'}
							size={solids.icon.size.regular}
							strokeWidth={solids.icon.strokeWidth.regular}
						/>
					</button>
					{rankedDeletionColumns ? (
						<>
							<div className="columnRanking">
								<div className="rankedColumn">
									<div>
										<p>{general.language === 'deutsch' ? 'Spaltenname' : 'Column name'}</p>
									</div>
									<div>
										<p>{general.language === 'deutsch' ? 'Trefferrate' : 'Match rate'}</p>
									</div>
									<div>
										<p>{general.language === 'deutsch' ? 'Aktion' : 'Action'}</p>
									</div>
								</div>
								{rankedDeletionColumns.map((rank, index) => {
									if (index !== 0 && rankedDeletionProgress[index] !== null) {
										return (
											<div key={`ranked-${rank[0]}`} className="rankedColumn">
												<div>
													<p>{rank[0]}</p>
												</div>
												<div>
													<p>{((rank[1] / entries) * 100).toFixed(2)} %</p>
												</div>
												<div>
													<button onClick={() => rankedDeletionHandler(rank[0], index)}>{rankedDeletionProgress[index]}</button>
												</div>
											</div>
										);
									}
								})}
							</div>
						</>
					) : (
						<></>
					)}
				</dialog>
			</div>
		</>
	);
}
