import { AppContext } from '@renderer/App';
import React, { useState, useRef, useContext } from 'react';
export function ColRemover({
	worker,
	count,
	updateHook,
}: {
	worker: Worker;
	count: number;
	updateHook: { update: boolean; setUpdate: Function };
}): React.JSX.Element {
	const {general} = useContext(AppContext)
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
			//@ts-ignore
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
							worker.postMessage({ type: 'deleteCol', message: column });
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
					className="removerButton"
				>
					Remove Empty Columns
				</button>
				<div
					className="removerOptions"
					style={{ display: showOptions ? 'flex' : 'none' }}
				>
					<p>Remove a column, if the value in every row matches</p>
					<select
						ref={conditionRef}
						id="colInput"
						onInput={conditionHandler}
					>
						<option defaultChecked>-</option>
						<optgroup>
							<option>empty text</option>
							<option>undefined</option>
							<option>null</option>
							<option>0</option>
						</optgroup>
						<optgroup>
							<option>custom text</option>
							<option>custom number</option>
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
						<button onClick={() => setShowOptions(false)}>{general.language === "deutsch"? "Abbrechen": "Cancel"}</button>
						<button onClick={goHandler}>{progress}</button>
					</div>
				</div>
			</div>
		</>
	);
}
