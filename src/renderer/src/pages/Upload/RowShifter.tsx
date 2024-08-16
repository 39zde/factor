import React, { useId, useState, useRef } from 'react';
export function RowShifter({
	cols,
	worker,
}: {
	cols: Array<string>;
	worker: Worker;
}): React.JSX.Element {
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
			//@ts-ignore
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
		worker.postMessage({
			type: 'align',
			message: {
				col: colInput,
				value: valInput,
				offset: offsetInput,
				direction: directionInput,
			},
		});

		worker.onmessage = (e) => {
			console.log(e.data);
			setShowOptions(false);
		};
	};

	return (
		<>
			<div className="rowShifter">
				<button
					onClick={() => setShowOptions((old) => !old)}
					className="alignButton"
				>
					Align shifted rows
				</button>
				<div
					className="alignOptions"
					style={{ display: showOptions ? 'flex' : 'none' }}
				>
					<p>Shift every Row, where</p>
					<select
						ref={colInputRef}
						id="colInput"
						onInput={colInputHandler}
					>
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
					<p>has the value</p>
					<input
						ref={valueInputRef}
						type="text"
						id="colValueInput"
						placeholder="my value"
						onInput={colValueInputHandler}
					/>
					<p>by</p>
					<input
						type="number"
						min={1}
						max={cols.length}
						id="offsetCount"
						placeholder="my number"
						ref={offsetInputRef}
						onInput={offsetInputHandler}
					/>
					<p>towards the</p>
					<select onInput={directionHandler} ref={directionRef}>
						<option>Left</option>
						<option>Right</option>
					</select>
					<p>side.</p>
					<div className="divider" />
					<div className="alignActions">
						<button onClick={() => setShowOptions(false)}>Cancel</button>
						<button onClick={goHandler}>Go!</button>
					</div>
				</div>
			</div>
		</>
	);
}
