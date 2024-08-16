import { useCallback, useContext, useRef, useState } from 'react';
import './Settings.css';
import Versions from '@comps/Versions/Versions';
import { AppContext } from '@renderer/App';
import { AppSettingsType } from '@renderer/util/App';
import { Save } from 'lucide-react';
export function Settings() {
	const context = useContext(AppContext);
	const themeInputRef = useRef<HTMLSelectElement>(null);
	const rowHeightInputRef = useRef<HTMLInputElement>(null);
	const colWidthInputRef = useRef<HTMLInputElement>(null);
	const langInputRef = useRef<HTMLSelectElement>(null);
	const decimalSeparatorInputRef = useRef<HTMLSelectElement>(null);
	const sideBarWidthInputRef = useRef<HTMLInputElement>(null);
	const [colorTheme, setColorTheme] = useState<
		'dark' | 'light' | 'light dark'
	>(
		context.appearances.colorTheme === 'system'
			? 'light dark'
			: context.appearances.colorTheme
	);
	const [rowHeight, setRowHeight] = useState<number>(
		context.appearances.rowHeight
	);
	const [columnWidth, setColumnWidth] = useState<number>(
		context.appearances.columnWidth
	);
	const [language, setLanguage] = useState<'english' | 'deutsch'>(
		context.general.language
	);
	const [decimalSeparator, setDecimalSeparator] = useState<',' | '.'>(
		context.general.decimalSeparator
	);
	const [sideBarWidth, setSideBarWidth] = useState<number>(
		context.appearances.sideBarWidth
	);

	const themeInputHandler = () => {
		if (themeInputRef.current !== null) {
			//@ts-expect-error  hard coded option values
			setColorTheme(themeInputRef.current.value);
		}
	};

	const rowHeightInputHandler = () => {
		if (rowHeightInputRef.current !== null) {
			if (typeof rowHeightInputRef.current.value === 'number') {
				setRowHeight(rowHeightInputRef.current.value);
			} else if (typeof rowHeightInputRef.current.value === 'string') {
				const tmp = parseInt(rowHeightInputRef.current.value);
				if (tmp !== undefined && tmp !== null) {
					setRowHeight(tmp);
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
			}
		}
	};

	const sideBarWidthInputHandler = () => {
		if (sideBarWidthInputRef.current !== null) {
			if (sideBarWidthInputRef.current.value !== undefined) {
				setSideBarWidth(parseInt(sideBarWidthInputRef.current.value));
			}
		}
	};

	const columnWidthInputHandler = () => {
		if (colWidthInputRef.current !== null) {
			if (colWidthInputRef.current.value !== undefined) {
				setColumnWidth(parseInt(colWidthInputRef.current.value));
			}
		}
	};

	const saveSettings = useCallback(() => {
		const changed: {
			value: number | string;
			name: string;
			category: string;
		}[] = [];
		const items = [
			{ value: rowHeight, name: 'rowHeight', category: 'appearances' },
			{ value: colorTheme, name: 'colorTheme', category: 'appearances' },
			{ value: language, name: 'language', category: 'general' },
			{
				value: decimalSeparator,
				name: 'decimalSeparator',
				category: 'general',
			},
			{ value: sideBarWidth, name: 'sideBarWidth', category: 'appearances' },
			{ value: columnWidth, name: 'columnWidth', category: 'appearances' },
		];

		for (const item of items) {
			if (context[item.category][item.name] !== undefined) {
				if (context[item.category][item.name] !== item.value) {
					changed.push(item);
				}
			}
		}

		if (changed.length > 0) {
			const newContext: AppSettingsType = {
				appearances: {
					...context.appearances,
				},
				general: {
					...context.general,
				},
				database: {
					dbVersion: context.database.dbVersion,
					tables: context.database.tables,
				},
			};
			for (const item of changed) {
				newContext[item.category][item.name] = item.value;
			}
			// console.log(newContext);
			context.changeContext(newContext);
		}
	}, [
		rowHeight,
		colorTheme,
		language,
		decimalSeparator,
		sideBarWidth,
		columnWidth,
	]);

	return (
		<>
			<div className="settingsPage appRoute">
				<h1>
					{context.general.language === 'english'
						? 'Settings'
						: 'Einstellungen'}
				</h1>

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
							defaultValue={context.appearances.colorTheme}>
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
							min={170}
							max={250}
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
							defaultValue={context.general.decimalSeparator}>
							<option>.</option>
							<option>,</option>
						</select>
					</div>
				</div>
				<div className="saveSection">
					<button onClick={saveSettings}>
						<Save
							size={24}
							strokeWidth={2}
							color="light-dark(var(--color-dark-1),var(--color-light-1)"
						/>{' '}
						{context.general.language === 'deutsch'
							? 'Speichern'
							: 'Save'}
					</button>
				</div>
				<div className="versionsWrapper">
					<Versions />
				</div>
			</div>
		</>
	);
}
