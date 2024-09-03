import React from 'react';
import { Check } from 'lucide-react';

import { solids } from '@renderer/App';
import './CheckBox.css';

export function CheckBox({ ticked }: { ticked: boolean }): React.JSX.Element {
	return (
		<>
			<div
				aria-modal="true"
				className="checkBox"
				style={{
					background: ticked ? 'var(--color-primary)' : 'none',
				}}>
				{ticked ? (
					<>
						<Check aria-modal="true" color="var(--color-light-1)" size={solids.icon.size.tiny} strokeWidth={solids.icon.strokeWidth.tiny} />
					</>
				) : (
					<></>
				)}
			</div>
		</>
	);
}
