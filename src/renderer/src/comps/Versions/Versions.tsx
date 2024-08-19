import React, { useState, useMemo, useContext } from 'react';

import './Versions.css';
import { AppContext } from '@renderer/App';

function Versions(): React.JSX.Element {
	const { general, appearances } = useContext(AppContext);
	const [versions] = useState(window.electron.process.versions ?? '');
	const [used, setUsed] = useState<string>('');
	const [free, setFree] = useState<string>('');
	useMemo(async () => {
		try {
			const storage = await navigator.storage.estimate();
			if (storage !== null) {
				setUsed(((storage.usage ?? 0) / Math.pow(1024, 2)).toFixed(1));
				setFree(
					((storage.quota ?? 0) / (Math.pow(1024, 2) * 1000)).toFixed(1)
				);
			}
		} catch (e) {
			console.error(e);
		}
	}, []);

	return (
		<ul className="versions">
			<li title="electron-version">Electron v{versions.electron}</li>
			<li title="chrome-version">Chromium v{versions.chrome}</li>
			<li title="node-version">Node v{versions.node}</li>
			<li title="occupied disk space from Factor">
				{general.language === 'deutsch'
					? 'Speicherplatzbedarf'
					: 'Disk usage'}{' '}
				{used} MB
			</li>
			<li title="remaining space on this computer">
				{general.language === 'deutsch'
					? 'Speicherplatzverfügbarkeit'
					: 'Free space'}{' '}
				{free} GB{' '}
			</li>
			<li title="platform">
				{window.electron !== undefined ? (
					<>Platform {window.electron.process.platform}</>
				) : (
					<></>
				)}
			</li>
			<li title="username">
				{general.language === 'deutsch' ? 'Benutzer' : 'User'}&#9;
				{window.electron !== undefined ? (
					<>
						{window.electron.process.platform === 'win32' ? (
							<>{window.electron.process.env.USERNAME}</>
						) : window.electron.process.platform == 'linux' ? (
							<>{window.electron.process.env.USER}</>
						) : window.electron.process.platform == 'macOS' ? (
							<>{window.electron.process.env.USER}</>
						) : (
							<></>
						)}
					</>
				) : (
					<></>
				)}
			</li>
			<li title="Screen Size">
				{general.language === 'deutsch'
					? 'Bildschirmauflösung'
					: 'Screen resolution'}
				: {window.screen.width}x{window.screen.height}px
			</li>
			<li>
				{general.language === 'deutsch' ? 'Fenstergröße' : 'Window size'} :{' '}
				{appearances.width}x{appearances.height}px
			</li>
		</ul>
	);
}

export default Versions;
