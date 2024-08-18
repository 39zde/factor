import React from 'react';
import { Check } from 'lucide-react';
import './CheckBox.css';

export function CheckBox({ ticked }: { ticked: boolean }): React.JSX.Element {
	return (
		<>
			<div
				className="checkBox"
				style={{
					background: ticked ? 'var(--color-primary)' : 'none',
				}}>
				{ticked ? (
					<>
						<Check
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
