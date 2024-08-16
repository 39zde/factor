import { AppContext } from '@renderer/App';
import React, { useContext } from 'react';
export function Help(): React.JSX.Element {
	const { general } = useContext(AppContext);
	return (
		<>
			<h1>{general.language === 'deutsch' ? 'Hilfe' : 'Help'}</h1>
		</>
	);
}
