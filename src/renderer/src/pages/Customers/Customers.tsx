import React, { useMemo, useContext } from 'react';
import { AppContext } from '@renderer/App';

export function Customers(): React.JSX.Element {
	const { database } = useContext(AppContext);
	useMemo(() => {
		console.log('[Customers.tsx]', database.database.tables);
	}, []);

	return (
		<>
			<div className="CustomerWrapper"></div>
		</>
	);
}
