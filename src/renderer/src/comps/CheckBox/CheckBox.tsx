import React from 'react';
import { Check } from 'lucide-react';
import './CheckBox.css';

export function CheckBox({ ticked }: { ticked?: boolean }): React.JSX.Element {
	return (
		<>
			<div
				aria-modal='true'
				className="checkBox"
				style={{
					background: ticked ? 'var(--color-primary)' : 'none',
				}}>
				{ticked ? (
					<>
						<Check
							aria-modal='true'
							color="var(--color-light-1)"
							size={12}
							strokeWidth={3}
						/>
					</>
				) : (
					<></>
				)}
			</div>
		</>
	);
}
