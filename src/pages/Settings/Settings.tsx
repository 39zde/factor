import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Save } from 'lucide-react';
// non-lib imports
import { useAppContext, useChangeContext, solids } from '@app';
import { getDataBaseDisplayName } from '@util';
import Comps from '@comps';
import {
	ColorThemeSetting,
	AppSettingsChange,
	LanguageSetting,
	DecimalSeparatorSetting,
	AppSettingsAppearance,
	AppSettingsGeneral,
	AppSettingsDatabase,
	DataBaseNames,
} from '@type';
import './Settings.css';
export function Settings() {
	const context = useAppContext();
	const dispatch = useChangeContext();
	const themeInputRef = useRef<HTMLSelectElement>(null);
	const rowHeightInputRef = useRef<HTMLInputElement>(null);
	const colWidthInputRef = useRef<HTMLInputElement>(null);
	const langInputRef = useRef<HTMLSelectElement>(null);
	const decimalSeparatorInputRef = useRef<HTMLSelectElement>(null);
	const sideBarWidthInputRef = useRef<HTMLInputElement>(null);
	const scrollSpeedRef = useRef<HTMLInputElement>(null);
	const notificationInputRef = useRef<HTMLInputElement>(null);
	const [changed, setChanged] = useState<AppSettingsChange>({});
	const [colorTheme, setColorTheme] = useState<ColorThemeSetting>(context.appearances.colorTheme);
	const [rowHeight, setRowHeight] = useState<number>(context.appearances.rowHeight);
	const [columnWidth, setColumnWidth] = useState<number>(context.appearances.columnWidth);
	const [language, setLanguage] = useState<LanguageSetting>(context.general.language);
	const [decimalSeparator, setDecimalSeparator] = useState<DecimalSeparatorSetting>(context.general.decimalSeparator);
	const [sideBarWidth, setSideBarWidth] = useState<number>(context.appearances.sideBarWidth + 26);
	const [scrollSpeed, setScrollSpeed] = useState<number>(context.general.scrollSpeed);
	const [allowNotifications, setAllowNotifications] = useState<boolean>(context.general.notifications);
	const dialogRef = useRef<HTMLDialogElement>(null);
	const dbDeletionRefs = useRef<React.RefObject<HTMLInputElement>[]>([]);
	const [dbDeletion, setDBDeletion] = useState<boolean[]>([false, false, false]);
	const [modalDatabaseIndex, setModalDatabaseIndex] = useState<number>(100);
	const dataBaseArray: DataBaseNames[] = useMemo(() => {
		return Object.entries(context.database.databases).map(([key, _val]) => key as DataBaseNames);
	}, []);

	useEffect(() => {
		if (notificationInputRef.current !== undefined) {
			notificationInputRef.current?.setAttribute('checked', allowNotifications.toString());
		}
	}, [allowNotifications]);

	const themeInputHandler = () => {
		if (themeInputRef.current !== null) {
			if (themeInputRef.current.value === 'light' || themeInputRef.current.value === 'dark' || themeInputRef.current.value === 'light dark') {
				setColorTheme(themeInputRef.current.value);
				updateChanged({
					appearances: { colorTheme: themeInputRef.current.value },
				});
			} else {
				setColorTheme('light dark');
				updateChanged({
					appearances: { colorTheme: 'light dark' },
				});
			}
		}
	};

	const rowHeightInputHandler = () => {
		if (rowHeightInputRef.current !== null) {
			if (typeof rowHeightInputRef.current.value === 'number') {
				setRowHeight(rowHeightInputRef.current.value);
				updateChanged({
					appearances: { rowHeight: rowHeightInputRef.current.value },
				});
			} else if (typeof rowHeightInputRef.current.value === 'string') {
				const tmp = parseInt(rowHeightInputRef.current.value);
				if (tmp !== undefined && tmp !== null) {
					setRowHeight(tmp);
					updateChanged({
						appearances: { rowHeight: tmp },
					});
				}
			}
		}
	};

	const langInputHandler = () => {
		if (langInputRef.current !== null) {
			if (langInputRef.current.value === 'english' || langInputRef.current.value === 'deutsch') {
				setLanguage(langInputRef.current.value);
				updateChanged({
					general: { language: langInputRef.current.value },
				});
			}
		}
	};

	const decimalSeparatorInputHandler = () => {
		if (decimalSeparatorInputRef.current !== null) {
			if (decimalSeparatorInputRef.current.value === ',' || decimalSeparatorInputRef.current.value === '.') {
				setDecimalSeparator(decimalSeparatorInputRef.current.value);
				updateChanged({
					general: {
						decimalSeparator: decimalSeparatorInputRef.current.value,
					},
				});
			}
		}
	};

	const sideBarWidthInputHandler = () => {
		if (sideBarWidthInputRef.current !== null) {
			if (sideBarWidthInputRef.current.value !== undefined) {
				setSideBarWidth(parseInt(sideBarWidthInputRef.current.value));
				updateChanged({
					appearances: {
						sideBarWidth: parseInt(sideBarWidthInputRef.current.value) - 26,
					},
				});
			}
		}
	};

	const columnWidthInputHandler = () => {
		if (colWidthInputRef.current !== null) {
			if (colWidthInputRef.current.value !== undefined) {
				setColumnWidth(parseInt(colWidthInputRef.current.value));
				updateChanged({
					appearances: {
						columnWidth: parseInt(colWidthInputRef.current.value),
					},
				});
			}
		}
	};

	const scrollSpeedInputHandler = () => {
		if (scrollSpeedRef.current !== null) {
			if (scrollSpeedRef.current.value !== undefined) {
				setScrollSpeed(parseInt(scrollSpeedRef.current.value));
				updateChanged({
					general: { scrollSpeed: parseInt(scrollSpeedRef.current.value) },
				});
			}
		}
	};

	const notificationInputHandler = () => {
		if (notificationInputRef.current !== null) {
			if (notificationInputRef.current.checked !== undefined) {
				if (notificationInputRef.current.checked) {
					setAllowNotifications(true);
					updateChanged({ general: { notifications: true } });
				} else {
					setAllowNotifications(false);
					updateChanged({ general: { notifications: false } });
				}
			}
		}
	};

	const updateChanged = useCallback(
		(change: AppSettingsChange) => {
			const copy = changed;
			const parentKeys = Object.keys(change);
			if (parentKeys !== undefined) {
				const parentKey = parentKeys[0] as keyof AppSettingsChange;
				const child = change[parentKey] as AppSettingsAppearance | AppSettingsGeneral | AppSettingsDatabase;
				const key = Object.keys(child)[0];
				if (copy[parentKey] === undefined) {
					Object.defineProperty(copy, parentKey, {
						configurable: true,
						enumerable: true,
						writable: true,
						value: change[parentKey],
					});
				} else {
					//@ts-expect-error this needs work, the types are just to messy. Works for now though
					copy[parentKey][key] = change[parentKey][key];
				}
				setChanged(copy);
			}
		},
		[changed]
	);

	const dbDeletionHandler = (index: number) => {
		if (dbDeletionRefs.current[index] !== null) {
			if (dbDeletionRefs.current[index].current !== null) {
				if (dbDeletionRefs.current[index].current.checked !== undefined) {
					if (dialogRef.current !== null) {
						if (dbDeletion[index]) {
							setDBDeletion(dbDeletion.map((v, i) => (i === index ? !v : v)));
						} else {
							setModalDatabaseIndex(index);
							dialogRef.current.showModal();
						}
					}
				}
			}
		}
	};

	const removeDataBases = useCallback(() => {
		for (const [index, shouldDelete] of dbDeletion.entries()) {
			if (shouldDelete) {
				const dbName = dataBaseArray[index];
				if (dbName === 'article_db') {
					dispatch({
						type: 'set',
						change: {
							database: {
								//@ts-expect-error fix postponed
								databases: {
									article_db: null,
								},
							},
						},
					});
					setDBDeletion(dbDeletion.map((v, i) => (i === index ? false : v)));
				}
				if (dbName === 'customer_db') {
					dispatch({
						type: 'set',
						change: {
							database: {
								//@ts-expect-error fix postponed
								databases: {
									customer_db: null,
								},
							},
						},
					});
					setDBDeletion(dbDeletion.map((v, i) => (i === index ? false : v)));
				}

				if (dbName === 'document_db') {
					dispatch({
						type: 'set',
						change: {
							database: {
								//@ts-expect-error fix postponed
								databases: {
									document_db: null,
								},
							},
						},
					});
					setDBDeletion(dbDeletion.map((v, i) => (i === index ? false : v)));
				}
			}
		}
	}, [dbDeletion, dataBaseArray, context]);

	const saveSettings = useCallback(() => {
		removeDataBases();

		if (Object.keys(changed).length !== 0) {
			dispatch({
				type: 'set',
				change: changed,
			});
		}
	}, [changed, context, removeDataBases]);

	return (
		<>
			<div className="settingsPage appRoute helper">
				<div className="settingsList">
					<div className="settingOptions">
						<h2>{context.general.language === 'deutsch' ? 'Aussehen' : 'Appearances'}</h2>
						<div className="settingsOption">
							<p>{context.general.language === 'english' ? 'Color Theme' : 'Farbschema'}</p>
							<select className="settingsSelect" ref={themeInputRef} onInput={themeInputHandler} defaultValue={colorTheme}>
								<option value={'light dark'}>{context.general.language === 'deutsch' ? 'Systemfarbschema ' : 'System theme '}</option>
								<option value={'dark'}>{context.general.language === 'deutsch' ? 'dunkel ' : 'dark '}</option>
								<option value={'light'}>{context.general.language === 'deutsch' ? 'hell ' : 'light '}</option>
							</select>
						</div>
						<div className="settingsOption">
							<p>
								{context.general.language === 'deutsch' ? 'Tabellenzeilenhöhe ' : 'Table Row Height '}
								(px)
							</p>
							<input onInput={rowHeightInputHandler} ref={rowHeightInputRef} type="number" min={20} max={60} step={1} value={rowHeight} />
						</div>
						<div className="settingsOption">
							<p>
								{context.general.language === 'deutsch' ? 'Standartspaltenbreite ' : 'Default column width '}
								(px)
							</p>
							<input onInput={columnWidthInputHandler} ref={colWidthInputRef} type="number" min={50} max={400} step={1} value={columnWidth} />
						</div>
						<div className="settingsOption">
							<p>
								{context.general.language === 'english' ? 'Side Bar Width ' : 'Seitenleistenbreite '}
								(px)
							</p>
							<input
								onInput={sideBarWidthInputHandler}
								ref={sideBarWidthInputRef}
								type="number"
								min={200}
								max={300}
								step={1}
								value={sideBarWidth}
							/>
						</div>
						<h2>{context.general.language === 'deutsch' ? 'Allgemein' : 'General'}</h2>
						<div className="settingsOption">
							<p>{context.general.language === 'english' ? 'Language' : 'Sprache'}</p>
							<select className="settingsSelect" ref={langInputRef} onInput={langInputHandler} defaultValue={language}>
								<option value={'english'}>english </option>
								<option value={'deutsch'}>deutsch </option>
							</select>
						</div>
						<div className="settingsOption">
							<p>{context.general.language === 'english' ? 'Decimal Separator' : 'Dezimaltrennzeichen'}</p>
							<select ref={decimalSeparatorInputRef} onInput={decimalSeparatorInputHandler} defaultValue={decimalSeparator}>
								<option>.</option>
								<option>,</option>
							</select>
						</div>
						<div className="settingsOption">
							<p>
								{context.general.language === 'deutsch' ? 'Scroll-Geschwindigkeit ' : 'Scrolling speed '}
								(px)
							</p>
							<input onInput={scrollSpeedInputHandler} ref={scrollSpeedRef} type="number" min={1} max={150} step={1} value={scrollSpeed} />
						</div>
						<div className="settingsOption">
							<div className="settingsOptionChild">
								<p>{context.general.language === 'deutsch' ? 'Benachrichtigungen ' : 'Notifications '}</p>
								<div
									onClick={() => {
										dispatch({ type: 'notify', notification: { title: 'test', body: 'test' } });
									}}>
									<small className="notificationTester">
										{context.general.language === 'deutsch' ? 'Benachrichtigungen testen' : 'Test Notifications'}
									</small>
								</div>
							</div>
							<input onChange={notificationInputHandler} ref={notificationInputRef} type="checkbox" />
						</div>
						<h2>{context.general.language === 'deutsch' ? 'Datenbank' : 'Database'}</h2>
						<div className="dangerZone">
							<div />
							<em>{context.general.language === 'deutsch' ? 'Gefahrenzone!' : 'Danger Zone!'}</em>
							<div />
						</div>
						{Object.entries(context.database.databases).map(([key, _value], index) => {
							const deletionRef = useRef<HTMLInputElement>(null);
							dbDeletionRefs.current[index] = deletionRef;
							return (
								<div className="settingsOption" key={key + 'deletion'}>
									<p>{getDataBaseDisplayName(context.general.language, key as DataBaseNames)}</p>
									<div className="settingsOptionChild">
										<small className="deletionNote">
											{context.general.language === 'deutsch' ? 'Datenbank nach dem Speichern löschen' : 'Delete on Save'}
										</small>
										<input type="checkbox" ref={deletionRef} checked={dbDeletion[index]} onChange={() => dbDeletionHandler(index)} />
									</div>
								</div>
							);
						})}
					</div>

					<div className="saveSection">
						<button
							onClick={saveSettings}
							style={{
								textShadow: context.appearances.colorTheme === 'dark' ? 'var(--color-primary-dark) 0px 0px 20px' : 'none',
							}}>
							<Save
								size={solids.icon.size.regular}
								strokeWidth={solids.icon.strokeWidth.regular}
								color="light-dark(var(--color-dark-1),var(--color-light-1)"
							/>{' '}
							{context.general.language === 'deutsch' ? 'Speichern' : 'Save'}
						</button>
					</div>
				</div>
				<div className="versionsWrapper">
					<Comps.Versions />
				</div>
				<dialog ref={dialogRef}>
					<div
						className="dataBaseDeletionModal"
						style={{
							height: dialogRef.current !== null ? dialogRef.current.getBoundingClientRect().height - 64 : 'auto',
						}}>
						<h3>{context.general.language === 'deutsch' ? 'Haben Sie ein Backup gemacht?' : 'Have you done a backup?'}</h3>
						<p>
							{context.general.language === 'deutsch'
								? `Sie sind im Begriff '${getDataBaseDisplayName(context.general.language, dataBaseArray[modalDatabaseIndex])}' zu löschen.`
								: `You are about to delete '${getDataBaseDisplayName(context.general.language, dataBaseArray[modalDatabaseIndex])}'.`}
						</p>
						<div className="dataBaseDeletionButtons">
							<button
								onClick={() => {
									if (dialogRef.current !== null) {
										dialogRef.current.close();
									}
								}}>
								{context.general.language === 'deutsch' ? 'Noch nicht' : 'Not yet'}
							</button>
							<button
								onClick={() => {
									setDBDeletion(
										dbDeletion.map((val, index) => {
											if (index === modalDatabaseIndex) {
												return true;
											} else {
												return val;
											}
										})
									);
									if (dialogRef.current !== null) {
										dialogRef.current.close();
									}
								}}>
								{context.general.language === 'deutsch' ? 'Ja, Datenbank löschen' : 'Yes, delete Database'}
							</button>
						</div>
					</div>
				</dialog>
			</div>
		</>
	);
}
