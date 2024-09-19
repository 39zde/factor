import React, { forwardRef } from 'react';
// non-lib imports
import { ColumnSetterProps } from '@typings';
import './ColumnSetter.css';

export const ColumnSetter = forwardRef<HTMLSelectElement, ColumnSetterProps>(function ColumnSetter(props, ref): React.JSX.Element {
	return (
		<>
			<div className="dataRow">
				<span>
					{props.name}
					{props.name === 'Customers ID' ? <sup>*</sup> : ''}:
				</span>
				<select ref={ref} onInput={props.onInput} required={props.name === 'Customers ID' ? true : false}>
					<option value={undefined} selected={props.defaultIndex === -1 ? true : false}>
						-
					</option>
					{props.columns.map((item) => {
						return (
							<>
								<option
									selected={props.defaultIndex !== -1 ? (item === props.columns[props.defaultIndex + 1] ? true : false) : undefined}
									key={props.name + item + (Math.random() * 1000).toFixed(0)}
									value={item}>
									{item}
								</option>
							</>
						);
					})}
				</select>
			</div>
		</>
	);
});
