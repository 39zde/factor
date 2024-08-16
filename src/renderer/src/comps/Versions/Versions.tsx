import { useState, useMemo } from 'react';

import './Versions.css';

function Versions(): JSX.Element {
	const [versions] = useState(window.electron.process.versions);
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
			<li className="electron-version">Electron v{versions.electron}</li>
			<li className="chrome-version">Chromium v{versions.chrome}</li>
			<li className="node-version">Node v{versions.node}</li>
			<li className="storage-usage">Disk usage {used} MB</li>
			<li className="storage-avail">Free Space {free} GB </li>
			<li className="platform">
				Platform {window.electron.process.platform}
			</li>
			<li className="">
				User&#9;
				{window.electron.process.platform === 'win32' ? (
					<>{window.electron.process.env['USERNAME']}</>
				) : window.electron.process.platform == 'linux' ? (
					<>{window.electron.process.env['USER']}</>
				) : window.electron.process.platform == 'macOS' ? (
					<>{window.electron.process.env['USER']}</>
				) : (
					<></>
				)}
			</li>
		</ul>
	);
}

export default Versions;
