import { useContext, useEffect, useRef, useState } from 'react';
import './Settings.css';
import Versions from '@comps/Versions/Versions';
import { AppContext } from '@renderer/App';

export function Settings() {
	const { appearances, changeContext, database, general } =
		useContext(AppContext);
	const themeInputRef = useRef<HTMLSelectElement>(null);
	const rowHeightInputRef = useRef<HTMLInputElement>(null);
	const langInputRef = useRef<HTMLSelectElement>(null);
	const decimalSeparatorInputRef = useRef<HTMLSelectElement>(null);
	const [colorTheme, setColorTheme] = useState<'dark' | 'light' | 'system'>(
		appearances.colorTheme
	);
	const [rowHeight, setRowHeight] = useState<number>(appearances.rowHeight);
	const [lang, setLang] = useState<'english' | 'deutsch'>(general.language);
	const [decimalSeparator, setDecimalSeparator] = useState<',' | '.'>(
		general.decimalSeparator
	);

	const themeInputHandler = () => {
		if (themeInputRef.current !== null) {
			switch (themeInputRef.current.value) {
				case 'dark':
					setColorTheme('dark');
				case 'light':
					setColorTheme('light');
				case 'system':
					setColorTheme('system');
				default:
					setColorTheme('system');
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
				setLang(langInputRef.current.value);
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

	return (
		<>
			<div className="settingsPage page">
				<h1>
					{general.language === 'english' ? 'Settings' : 'Einstellungen'}
				</h1>
				<div className="settingOptions">
					<h2>
						{general.language === 'english' ? 'Appearances' : 'Aussehen'}
					</h2>
					<div className="settingsOption">
						<p>
							{general.language === 'english'
								? 'Color Theme'
								: 'Farbschema'}
						</p>
						<select
							ref={themeInputRef}
							onInput={themeInputHandler}
							defaultValue={appearances.colorTheme}
						>
							<option>system</option>
							<option>dark</option>
							<option>light</option>
						</select>
					</div>
					<div className="settingsOption">
						<p>
							{general.language === 'english'
								? 'Table Row Height'
								: 'Tabellenzeilenhöhe'}{' '}
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
					<h2>
						{general.language === 'english' ? 'General' : 'Allgemein'}
					</h2>
					<div className="settingsOption">
						<p>
							{general.language === 'english' ? 'Language' : 'Sprache'}
						</p>
						<select
							ref={langInputRef}
							onInput={langInputHandler}
							defaultValue={lang}
						>
							<option>english</option>
							<option>deutsch</option>
						</select>
					</div>
					<div className="settingsOption">
						<p>
							{general.language === 'english'
								? 'Decimal Separator'
								: 'Dezimaltrennzeichen'}
						</p>
						<select
							ref={decimalSeparatorInputRef}
							onInput={decimalSeparatorInputHandler}
							defaultValue={general.decimalSeparator}
						>
							<option>.</option>
							<option>,</option>
						</select>
					</div>
				</div>
				<div className="versionsWrapper">
					<Versions />
				</div>
			</div>
		</>
	);
}
