import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import './Settings.css';
import Versions from '@comps/Versions/Versions';
import { AppContext } from '@renderer/App';
import { AppSettingsType } from '@renderer/util/App';
import { Save } from 'lucide-react';
export function Settings() {
	const context = useContext(AppContext);
	const themeInputRef = useRef<HTMLSelectElement>(null);
	const rowHeightInputRef = useRef<HTMLInputElement>(null);
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
			switch (themeInputRef.current.value) {
				case 'dark':
					setColorTheme('dark');
					break;
				case 'light':
					setColorTheme('light');
					break;
				case 'system':
					setColorTheme('light dark');
					break;
				default:
					setColorTheme('light dark');
			}
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

	const saveSettings = useCallback(() => {
		let changed: { value: any; name: string; category: string }[] = [];
		let items = [
			{ value: rowHeight, name: 'rowHeight', category: 'appearances' },
			{ value: colorTheme, name: 'colorTheme', category: 'appearances' },
			{ value: language, name: 'language', category: 'general' },
			{
				value: decimalSeparator,
				name: 'decimalSeparator',
				category: 'general',
			},
			{ value: sideBarWidth, name: 'sideBarWidth', category: 'appearances' },
		];

		for (const item of items) {
			if (context[item.category][item.name] !== undefined) {
				if (context[item.category][item.name] !== item.value) {
					changed.push(item);
				}
			}
		}

		if (changed.length > 0) {
			let newContext: AppSettingsType = {
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
			console.log(newContext);
			context.changeContext(newContext);
		}
	}, [rowHeight, colorTheme, language, decimalSeparator, sideBarWidth]);

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
							ref={themeInputRef}
							onInput={themeInputHandler}
							defaultValue={context.appearances.colorTheme}
						>
							<option>system</option>
							<option>dark</option>
							<option>light</option>
						</select>
					</div>
					<div className="settingsOption">
						<p>
							{context.general.language === 'english'
								? 'Table Row Height '
								: 'Tabellenzeilenhöhe '}
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
							{context.general.language === 'english'
								? 'Side Bar Width '
								: 'Seitenleistenbreite '}
							(px)
						</p>
						<input
							onInput={sideBarWidthInputHandler}
							ref={sideBarWidthInputRef}
							type="number"
							min={160}
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
							ref={langInputRef}
							onInput={langInputHandler}
							defaultValue={language}
						>
							<option>english</option>
							<option>deutsch</option>
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
							defaultValue={context.general.decimalSeparator}
						>
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
