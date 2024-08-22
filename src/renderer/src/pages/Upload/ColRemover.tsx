import React, { useState, useRef } from 'react';
import { useAppContext } from '@renderer/App';
export function ColRemover({
	worker,
	count,
	updateHook,
}: {
	worker: Worker;
	count: number;
	updateHook: { update: boolean; setUpdate: (newVal: boolean) => void };
}): React.JSX.Element {
	const { general, database } = useAppContext();
	const [showOptions, setShowOptions] = useState<boolean>(false);
	const conditionRef = useRef<HTMLSelectElement>(null);
	const stringRef = useRef<HTMLInputElement>(null);
	const numberRef = useRef<HTMLInputElement>(null);
	const [stringInput, setStringInput] = useState<string>('');
	const [numberInput, setNumberInput] = useState<string>('');
	const [conditionValue, setConditionValue] = useState<
		| 'empty text'
		| 'undefined'
		| 'null'
		| '0'
		| 'custom string'
		| 'custom number'
		| '-'
	>('empty text');
	const [showTextInput, setShowTextInput] = useState<boolean>(false);
	const [showNumberInput, setShowNumberInput] = useState<boolean>(false);
	const [progress, setProgress] = useState<string>('Go!');
	const conditionHandler = () => {
		if (conditionRef.current?.value !== undefined) {
			//@ts-expect-error ..current.value is of type UploadMode, because of the hardcoded <options values={...}> in side the select element. TS does not know that
			setConditionValue(conditionRef.current?.value);
			if (conditionRef.current.value === 'custom text') {
				setShowTextInput(true);
				setShowNumberInput(false);
			} else if (conditionRef.current.value === 'custom number') {
				setShowTextInput(false);
				setShowNumberInput(true);
			} else {
				setShowTextInput(false);
				setShowNumberInput(false);
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

	const goHandler = () => {
		console.log('starting ranking');
		worker.postMessage({
			type: 'rankColsByCondition',
			dbVersion: database.dbVersion,
			dataBaseName: 'factor_db',
			message: {
				condition: conditionValue,
				custom: {
					string: stringInput,
					number: numberInput,
				},
			},
		});

		worker.onmessage = (e) => {
			//   setShowOptions(false)
			switch (e.data.type) {
				case 'progress':
					setProgress(e.data.message);
					if (e.data.message === '100.00%') {
						setProgress('Go!');
						setShowOptions(false);
					}
					break;
				case 'ranking':
					const ranking = e.data.message;
					console.log('starting deletion');
					console.log(ranking);
					for (const [column, conditionSuccessCount] of ranking) {
						console.log(column);
						if (conditionSuccessCount === count) {
							updateHook.setUpdate(true);
							worker.postMessage({
								type: 'deleteCol',
								message: column,
								dbVersion: database.dbVersion,
								dataBaseName: 'factor_db',
							});
						}
					}
					break;
				case 'colDeletion':
					updateHook.setUpdate(false);
					console.log(e.data.message);
					break;
				default:
					console.log(e.data);
			}
		};
	};

	return (
		<>
			<div className="colRemover">
				<button
					onClick={() => setShowOptions((old) => !old)}
					className="removerButton">
					{general.language === 'deutsch'
						? 'Spalten Entfernen'
						: 'Remove Columns'}
				</button>
				<div
					className="removerOptions"
					style={{ display: showOptions ? 'flex' : 'none' }}>
					<p>
						{general.language === 'deutsch'
							? 'Spalte entfernen, wenn der Wert in jeder Zeile gleich'
							: 'Remove a column, if the value in every row matches'}
					</p>
					<select
						ref={conditionRef}
						id="colInput"
						onInput={conditionHandler}>
						<option defaultChecked>-</option>
						<optgroup>
							<option value={'empty text'}>
								{general.language === 'deutsch'
									? 'leerer Text'
									: 'empty text'}
							</option>
							<option value={'undefined'}>
								{general.language === 'deutsch'
									? 'nicht ausgefüllt (undefined value)'
									: 'undefined value'}
							</option>
							<option value={'null'}>
								{general.language === 'deutsch'
									? 'leer (null value)'
									: 'empty (null value)'}
							</option>
							<option value={'0'}>0</option>
						</optgroup>
						<optgroup>
							<option value={'custom text'}>
								{general.language === 'deutsch'
									? 'eigener text'
									: 'custom text'}
							</option>
							<option value={'custom number'}>
								{general.language === 'deutsch'
									? 'eigene Zahl'
									: 'custom number'}
							</option>
						</optgroup>
					</select>
					{showNumberInput ? (
						<>
							<input
								type="number"
								id="number-match"
								placeholder="my number"
								ref={numberRef}
								onInput={numberInputHandler}
							/>
						</>
					) : (
						<></>
					)}
					{showTextInput ? (
						<>
							<input
								ref={stringRef}
								type="text"
								id="string-match"
								placeholder="my custom "
								onInput={stringInputHandler}
							/>
						</>
					) : (
						<></>
					)}
					<div className="divider" />
					<div className="removerActions">
						<button onClick={() => setShowOptions(false)}>
							{general.language === 'deutsch' ? 'Abbrechen' : 'Cancel'}
						</button>
						<button onClick={goHandler}>{progress}</button>
					</div>
				</div>
			</div>
		</>
	);
}
