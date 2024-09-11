import React, { useId, forwardRef } from 'react';
// non-lib imports
import './ColumnSetter.css';

type columnSetterProps = {
	checkBoxRef?: React.MutableRefObject<HTMLInputElement | null>;
	columns: string[];
	name: string;
	onInput: React.FormEventHandler<HTMLSelectElement>;
};

export const ColumnSetter = forwardRef<HTMLSelectElement, columnSetterProps>(function ColumnSetter(props, ref): React.JSX.Element {
	return (
		<>
			<div className="dataRow">
				<span>
					{props.name}
					{props.name === 'Customers ID' ? <sup>*</sup> : ''}:
				</span>
				<select ref={ref} onInput={props.onInput} required={props.name === 'Customers ID' ? true : false}>
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
