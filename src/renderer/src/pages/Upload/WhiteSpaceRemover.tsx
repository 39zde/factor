import { AppContext } from '@renderer/App';
import React, { useState, useContext } from 'react';
export function WhiteSpaceRemover({
	updateHook,
}: {
	worker: Worker;
	count: number;
	updateHook: { update: boolean; setUpdate: (newVal: boolean) => void };
}): React.JSX.Element {
	const { general, worker } = useContext(AppContext);
	const [showOptions, setShowOptions] = useState<boolean>(false);


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
					<button>
							{general.language === "deutsch" ? "Mehrfache Leerzeichen entfernen": "Remove multiple spaces"}
					</button>
					<button>
							{general.language === "deutsch" ? "Führende/Endende Leerzeichen entfernen": "Trim leading/tailing whitespace"}
					</button>
				</div>
			</div>
		</>
	);
}
