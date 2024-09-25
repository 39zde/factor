import React, { useState, useRef } from 'react';
// non-lib imports
import { useAppContext } from '@app';
import type { RemoveCondition } from '@type';

export function ColRemover({
	showOptionsHook,
	updateHook,
	colsHook,
}: {
	showOptionsHook: {
		text: string;
		value: boolean;
		setValue: (newVal: boolean) => void;
	};
	updateHook: { update: boolean; setUpdate: (newVal: boolean) => void };
	colsHook: {
		cols: string[];
		setCols: (newCols: string[]) => void;
		setAllCols: (newVal: string[]) => void;
	};
}): React.JSX.Element {
	const { general, database, worker } = useAppContext();
	const [showOptions, setShowOptions] = useState<boolean>(false);
	const conditionRef = useRef<HTMLSelectElement>(null);
	const stringRef = useRef<HTMLInputElement>(null);
	const numberRef = useRef<HTMLInputElement>(null);
	const colRef = useRef<HTMLSelectElement>(null);
	const [stringInput, setStringInput] = useState<string>('');
	const [numberInput, setNumberInput] = useState<string>('');
	const [colInput, setColInput] = useState<string | undefined>();
	const [conditionValue, setConditionValue] = useState<RemoveCondition>('empty text');
	const [showTextInput, setShowTextInput] = useState<boolean>(false);
	const [showNumberInput, setShowNumberInput] = useState<boolean>(false);
	const [showColInput, setShowColInput] = useState<boolean>(false);
	const conditionHandler = () => {
		if (conditionRef.current?.value !== undefined) {
			//@ts-expect-error ..current.value is of type UploadMode, because of the hardcoded <options values={...}> in side the select element. TS does not know that
			setConditionValue(conditionRef.current?.value);
			if (conditionRef.current.value === 'custom text') {
				setShowTextInput(true);
				setShowNumberInput(false);
				setShowColInput(false);
			} else if (conditionRef.current.value === 'custom number') {
				setShowTextInput(false);
				setShowNumberInput(true);
				setShowColInput(false);
			} else if (conditionRef.current.value === 'column') {
				setShowTextInput(false);
				setShowNumberInput(false);
				setShowColInput(true);
			} else {
				setShowTextInput(false);
				setShowNumberInput(false);
				setShowColInput(false);
			}
		}
	};

	const stringInputHandler = () => {
		if (stringRef.current?.value !== undefined) {
			setStringInput(stringRef.current.value);
		}
	};

	const numberInputHandler = () => {
		if (numberRef.current?.value !== undefined) {
			setNumberInput(numberRef.current.value);
		}
	};

	const colInputHandler = () => {
		if (colRef.current !== null) {
			if (colRef.current.value !== undefined) {
				setColInput(colRef.current.value);
			}
		}
	};

	const goHandler = () => {
		if (showColInput) {
			updateHook.setUpdate(true);
			worker.ImportWorker.postMessage({
				type: 'delete-col',
				data: colInput,
			});
		} else {
			updateHook.setUpdate(true);
			worker.ImportWorker.postMessage({
				channelName: 'import-col-remover',
				type: 'rankColsByCondition',
				dbVersion: database.dbVersion,
				dataBaseName: 'factor_db',
				data: {
					condition: conditionValue,
					custom: {
						string: stringInput,
						number: numberInput,
						column: colInput,
					},
				},
			});
		}
	};

	return (
		<>
			<div className="colRemover">
				<button onClick={() => setShowOptions((old) => !old)} className="removerButton">
					{general.language === 'deutsch' ? 'Spalten Entfernen' : 'Remove Columns'}
				</button>
				<div className="removerOptions" style={{ display: showOptions ? 'flex' : 'none' }}>
					<p>
						{general.language === 'deutsch'
							? 'Spalte entfernen, wenn der Wert in jeder Zeile gleich'
							: 'Remove a column, if the value in every row matches'}
					</p>
					<select ref={conditionRef} id="colInput" onInput={conditionHandler}>
						<option defaultChecked>-</option>
						<optgroup label={general.language === 'deutsch' ? 'Inhaltsbasiert' : 'Value based'}>
							<option value={'empty text'}>{general.language === 'deutsch' ? 'leerer Text' : 'empty text'}</option>
							<option value={'undefined'}>{general.language === 'deutsch' ? 'nicht ausgefüllt (undefined value)' : 'undefined value'}</option>
							<option value={'null'}>{general.language === 'deutsch' ? 'leer (null value)' : 'empty (null value)'}</option>
							<option value={'0'}>0</option>
						</optgroup>
						<optgroup label={general.language === 'deutsch' ? 'Selbst definiert' : 'custom defined'}>
							<option value={'custom text'}>{general.language === 'deutsch' ? 'eigener text' : 'custom text'}</option>
							<option value={'custom number'}>{general.language === 'deutsch' ? 'eigene Zahl' : 'custom number'}</option>
						</optgroup>
						<optgroup label={general.language === 'deutsch' ? 'Spaltenbasiert' : 'column based'}>
							<option value={'column'}>{general.language === 'deutsch' ? 'Ausgewählte Spalte' : 'Selected Column'}</option>
						</optgroup>
					</select>
					{showNumberInput ? (
						<>
							<input type="number" id="number-match" placeholder="my number" ref={numberRef} onInput={numberInputHandler} />
						</>
					) : (
						<></>
					)}
					{showTextInput ? (
						<>
							<input ref={stringRef} type="text" id="string-match" placeholder="my custom " onInput={stringInputHandler} />
						</>
					) : (
						<></>
					)}
					{showColInput ? (
						<>
							<select ref={colRef} onInput={colInputHandler}>
								{colsHook.cols.map((column, index) => {
									if (index !== 0) {
										return (
											<option key={`colRemover-${column}`} value={column}>
												{column}
											</option>
										);
									}
								})}
							</select>
						</>
					) : (
						<></>
					)}
					<div className="divider" />
					<div className="removerActions">
						<button onClick={() => setShowOptions(false)}>{general.language === 'deutsch' ? 'Abbrechen' : 'Cancel'}</button>
						<button onClick={goHandler}>{showOptionsHook.text}</button>
					</div>
				</div>
			</div>
		</>
	);
}
