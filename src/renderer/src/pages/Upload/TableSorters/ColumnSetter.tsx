import React, { useId, forwardRef } from 'react';

import './ColumnSetter.css';


export const ColumnSetter = forwardRef(function ColumnSetter({
	props,
	ref,
}: {
	ref: React.RefObject<HTMLSelectElement>;
	props: {
		checkBoxRef?: React.MutableRefObject<HTMLInputElement | null>;
		columns: string[];
		name: string;
		onInput: React.FormEventHandler<HTMLSelectElement>;
	};
}): React.JSX.Element {
	return (
		<>
			<div className="dataRow">
				{props.name}:
				<select ref={ref} onInput={props.onInput}>
					<option defaultChecked value={undefined}>
						-
					</option>
					{props.columns.map((item) => (
						<option key={useId()}>{item}</option>
					))}
				</select>
			</div>
		</>
	);
});
