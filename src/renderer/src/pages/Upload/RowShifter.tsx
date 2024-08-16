import { AppContext } from '@renderer/App';
import React, { useId, useState, useRef, useContext } from 'react';
export function RowShifter({
	cols,
}: {
	cols: string[];
}): React.JSX.Element {
	const { general, worker, database } = useContext(AppContext);
	const [showOptions, setShowOptions] = useState<boolean>(false);
	const colInputRef = useRef<HTMLSelectElement>(null);
	const valueInputRef = useRef<HTMLInputElement>(null);
	const offsetInputRef = useRef<HTMLInputElement>(null);
	const directionRef = useRef<HTMLSelectElement>(null);
	const [colInput, setColInput] = useState<string>('');
	const [valInput, setValInput] = useState<string>('');
	const [offsetInput, setOffsetInput] = useState<number>(1);
	const [directionInput, setDirectionInput] = useState<'Left' | 'Right'>(
		'Left'
	);
	const colInputHandler = () => {
		if (colInputRef.current?.value !== undefined) {
			setColInput(colInputRef.current?.value);
		}
	};

	const colValueInputHandler = () => {
		if (valueInputRef.current?.value !== undefined) {
			setValInput(valueInputRef.current?.value);
		}
	};

	const offsetInputHandler = () => {
		if (offsetInputRef.current?.value !== undefined) {
			const offsetNumber = parseInt(offsetInputRef.current?.value);

			setOffsetInput(offsetNumber);
		}
	};

	const directionHandler = () => {
		if (directionRef.current?.value !== undefined) {
			//@ts-ignore  ..current.value is of type UploadMode, because of the hardcoded <options values={...}> in side the select element. TS does not know that
			setDirectionInput(directionRef.current.value);
		}
	};

	const goHandler = () => {
		if (Number.isNaN(offsetInput) || offsetInput === 0) {
			console.log(
				'offset cannot be zero and must be an integer below the number of columns'
			);
		}
		console.log({
			col: colInput,
			value: valInput,
			offset: offsetInput,
			direction: directionInput,
		});
		worker.ImportWorker.postMessage({
			type: 'align',
			dbVersion: database.dbVersion,
			dataBaseName: 'factor_db',
			message: {
				col: colInput,
				value: valInput,
				offset: offsetInput,
				direction: directionInput,
			},
		});

		worker.ImportWorker.onmessage = (e) => {
			console.log(e.data);
			setShowOptions(false);
		};
	};

	return (
		<>
			<div className="rowShifter">
				<button
					onClick={() => setShowOptions((old) => !old)}
					className="alignButton">
					{general.language === 'deutsch'
						? 'Zeilen ausrichten'
						: 'Align Rows'}
				</button>
				<div
					className="alignOptions"
					style={{ display: showOptions ? 'flex' : 'none' }}>
					<p>
						{general.language === 'deutsch'
							? 'Zeile soll ausgerichtet werden, wenn'
							: 'Shift Row, if'}
					</p>
					<select
						ref={colInputRef}
						id="colInput"
						onInput={colInputHandler}>
						<option defaultChecked>-</option>
						{cols.length !== 0 ? (
							<>
								{cols.map((col) => (
									<option key={useId()}>{col}</option>
								))}
							</>
						) : (
							<></>
						)}
					</select>
					<p>
						{general.language === 'deutsch'
							? 'den Wert'
							: 'has the value'}
					</p>
					<input
						ref={valueInputRef}
						type="text"
						id="colValueInput"
						placeholder={
							general.language === 'deutsch' ? 'diesen Wert' : 'my value'
						}
						onInput={colValueInputHandler}
					/>
					<p>{general.language === 'deutsch' ? 'um' : 'by'}</p>
					<input
						type="number"
						min={1}
						max={cols.length}
						id="offsetCount"
						placeholder={
							general.language === 'deutsch'
								? 'diese Anzahl'
								: 'my number'
						}
						ref={offsetInputRef}
						onInput={offsetInputHandler}
					/>
					<p>{general.language === 'deutsch' ? 'zur' : 'towards the'}</p>
					<select onInput={directionHandler} ref={directionRef}>
						<option value={'Left'}>
							{general.language === 'deutsch' ? 'linken' : 'left'}
						</option>
						<option value={'Right'}>
							{general.language === 'deutsch' ? 'rechten' : 'right'}
						</option>
					</select>
					<p>{general.language === 'deutsch' ? 'Seite' : 'side'}</p>
					<div className="divider" />
					<div className="alignActions">
						<button onClick={() => setShowOptions(false)}>
							{general.language === 'deutsch' ? 'Abbrechen' : 'Cancel'}
						</button>
						<button onClick={goHandler}>Go!</button>
					</div>
				</div>
			</div>
		</>
	);
}
