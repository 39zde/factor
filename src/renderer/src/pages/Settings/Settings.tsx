import { useCallback, useRef, useState } from 'react';
import './Settings.css';
import Versions from '@comps/Versions/Versions';
import { useAppContext, useChangeContext, solids } from '@renderer/App';
import {
	ColorThemeSetting,
	AppSettingsChange,
	LanguageSetting,
	DecimalSeparatorSetting,
} from '@renderer/util/App';
import { Save } from 'lucide-react';
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
	const [changed, setChanged] = useState<AppSettingsChange>({});
	const [colorTheme, setColorTheme] = useState<ColorThemeSetting>(
		context.appearances.colorTheme
	);
	const [rowHeight, setRowHeight] = useState<number>(
		context.appearances.rowHeight
	);
	const [columnWidth, setColumnWidth] = useState<number>(
		context.appearances.columnWidth
	);
	const [language, setLanguage] = useState<LanguageSetting>(
		context.general.language
	);
	const [decimalSeparator, setDecimalSeparator] =
		useState<DecimalSeparatorSetting>(context.general.decimalSeparator);
	const [sideBarWidth, setSideBarWidth] = useState<number>(
		context.appearances.sideBarWidth + 26
	);
	const [scrollSpeed, setScrollSpeed] = useState<number>(
		context.general.scrollSpeed
	);

	const themeInputHandler = () => {
		if (themeInputRef.current !== null) {
			if (
				themeInputRef.current.value === 'light' ||
				themeInputRef.current.value === 'dark' ||
				themeInputRef.current.value === 'light dark'
			) {
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
			if (
				langInputRef.current.value === 'english' ||
				langInputRef.current.value === 'deutsch'
			) {
				setLanguage(langInputRef.current.value);
				updateChanged({
					general: { language: langInputRef.current.value },
				});
			}
		}
	};

	const decimalSeparatorInputHandler = () => {
		if (decimalSeparatorInputRef.current !== null) {
			if (
				decimalSeparatorInputRef.current.value === ',' ||
				decimalSeparatorInputRef.current.value === '.'
			) {
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
						sideBarWidth:
							parseInt(sideBarWidthInputRef.current.value) - 26,
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

	const updateChanged = useCallback(
		(change: AppSettingsChange) => {
			const copy = changed;
			const parentKey = Object.keys(change)[0];
			const key = Object.keys(change[parentKey])[0];
			if (copy[parentKey] === undefined) {
				Object.defineProperty(copy, parentKey, {
					configurable: true,
					enumerable: true,
					writable: true,
					value: change[parentKey],
				});
			} else {
				copy[parentKey][key] = change[parentKey][key];
			}
			setChanged(copy);
		},
		[changed]
	);

	const saveSettings = useCallback(() => {
		if (Object.keys(changed).length !== 0) {
			dispatch({
				type: 'set',
				change: changed,
			});
		}
	}, [changed, context]);

	return (
		<>
			<div className="settingsPage appRoute helper">
				<div className='settingsList'>
					<div className="settingOptions">
						<h2>
							{context.general.language === 'english'
								? 'Appearances'
								: 'Aussehen'}
						</h2>
						<div className="settingsOption">
							<p>
								{context.general.language === 'english'
									? 'Color Theme'
									: 'Farbschema'}
							</p>
							<select
								className="settingsSelect"
								ref={themeInputRef}
								onInput={themeInputHandler}
								defaultValue={colorTheme}>
								<option value={'light dark'}>
									{context.general.language === 'deutsch'
										? 'Systemfarbschema '
										: 'System theme '}
								</option>
								<option value={'dark'}>
									{context.general.language === 'deutsch'
										? 'dunkel '
										: 'dark '}
								</option>
								<option value={'light'}>
									{context.general.language === 'deutsch'
										? 'hell '
										: 'light '}
								</option>
							</select>
						</div>
						<div className="settingsOption">
							<p>
								{context.general.language === 'deutsch'
									? 'Tabellenzeilenhöhe '
									: 'Table Row Height '}
								(px)
							</p>
							<input
								onInput={rowHeightInputHandler}
								ref={rowHeightInputRef}
								type="number"
								min={20}
								max={60}
								step={1}
								value={rowHeight}
							/>
						</div>
						<div className="settingsOption">
							<p>
								{context.general.language === 'deutsch'
									? 'Standartspaltenbreite '
									: 'Default column width '}
								(px)
							</p>
							<input
								onInput={columnWidthInputHandler}
								ref={colWidthInputRef}
								type="number"
								min={50}
								max={400}
								step={1}
								value={columnWidth}
							/>
						</div>
						<div className="settingsOption">
							<p>
								{context.general.language === 'english'
									? 'Side Bar Width '
									: 'Seitenleistenbreite '}
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
						<h2>
							{context.general.language === 'english'
								? 'General'
								: 'Allgemein'}
						</h2>
						<div className="settingsOption">
							<p>
								{context.general.language === 'english'
									? 'Language'
									: 'Sprache'}
							</p>
							<select
								className="settingsSelect"
								ref={langInputRef}
								onInput={langInputHandler}
								defaultValue={language}>
								<option value={'english'}>english </option>
								<option value={'deutsch'}>deutsch </option>
							</select>
						</div>
						<div className="settingsOption">
							<p>
								{context.general.language === 'english'
									? 'Decimal Separator'
									: 'Dezimaltrennzeichen'}
							</p>
							<select
								ref={decimalSeparatorInputRef}
								onInput={decimalSeparatorInputHandler}
								defaultValue={decimalSeparator}>
								<option>.</option>
								<option>,</option>
							</select>
						</div>
						<div className="settingsOption">
							<p>
								{context.general.language === 'deutsch'
									? 'Scroll-Geschwindigkeit '
									: 'Scrolling speed '}
								(px)
							</p>
							<input
								onInput={scrollSpeedInputHandler}
								ref={scrollSpeedRef}
								type="number"
								min={1}
								max={150}
								step={1}
								value={scrollSpeed}
							/>
						</div>
					</div>

					<div className="saveSection">
						<button
							onClick={saveSettings}
							style={{
								textShadow:
									context.appearances.colorTheme === 'dark'
										? 'var(--color-primary-dark) 0px 0px 20px'
										: 'none',
							}}>
							<Save
								size={solids.icon.size.regular}
								strokeWidth={solids.icon.strokeWidth.regular}
								color="light-dark(var(--color-dark-1),var(--color-light-1)"
							/>{' '}
							{context.general.language === 'deutsch'
								? 'Speichern'
								: 'Save'}
						</button>
					</div>
				</div>
				<div className="versionsWrapper">
					<Versions />
				</div>
			</div>
		</>
	);
}
