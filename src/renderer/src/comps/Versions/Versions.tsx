import React, { useState, useMemo } from 'react';

import './Versions.css';
import { useAppContext } from '@renderer/App';

function Versions(): React.JSX.Element {
	const { general, appearances } = useAppContext();
	const [versions] = useState(window.electron.process.versions ?? '');
	const [used, setUsed] = useState<string>('');
	const [free, setFree] = useState<string>('');
	useMemo(async () => {
		try {
			const storage = await navigator.storage.estimate();
			if (storage !== null) {
				setUsed(((storage.usage ?? 0) / Math.pow(1024, 2)).toFixed(1));
				setFree(((storage.quota ?? 0) / (Math.pow(1024, 2) * 1000)).toFixed(1));
			}
		} catch (e) {
			new Notification(general.language === 'deutsch' ? 'Ein Fehler ist aufgetreten' : 'An error occurred', {
				body: 'Failed to estimate disk usage',
			});
		}
	}, []);

	return (
		<ul className="versions">
			<li
				title={
					general.language === 'deutsch'
						? `Erstellt platformübergreifende Desktop-Anwendungen mit JavaScript, HTML, und CSS`
						: `Builds cross-platform desktop apps with JavaScript, HTML, and CSS`
				}>
				Electron v{versions.electron}
			</li>
			<li title={general.language === 'deutsch' ? `Chromium ist ein quelloffenes Browser Projekt` : `Chromium is an open-source browser project`}>
				Chromium v{versions.chrome}
			</li>
			<li
				title={
					general.language === 'deutsch'
						? `Node.js® ist eine freie, quelloffene und platformübergreifende JavaScript Laufzeitumgebung`
						: `Node.js® is a free, open-source, cross-platform JavaScript runtime environment`
				}>
				Node v{versions.node}
			</li>
			<li title={general.language === 'deutsch' ? `Speicherplatzbedarf der gespeicherten Tabellen` : `Disk usage of the saved tables`}>
				{general.language === 'deutsch' ? 'Speicherplatzbedarf' : 'Disk usage'} {used} MB
			</li>
			<li title={general.language === 'deutsch' ? `Restlicher Speicherplatz auf der Festplatte` : `Remaining storage space on the storage medium`}>
				{general.language === 'deutsch' ? 'Speicherplatzverfügbarkeit' : 'Free space'} {free} GB{' '}
			</li>
			<li title={general.language === 'deutsch' ? 'Betriebssystemart' : 'The type of operating system'}>
				{window.electron !== undefined ? <>Platform {window.electron.process.platform}</> : <></>}
			</li>
			<li title={general.language === 'deutsch' ? 'Der momentane im System eingeloggte Benutzer' : 'The currently logged in system user '}>
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
			<li title={general.language === 'deutsch' ? 'Pixelauflösung des Bildschirms' : 'Pixel resolution of the display'}>
				{general.language === 'deutsch' ? 'Bildschirmauflösung' : 'Screen resolution'}: {window.screen.width}x{window.screen.height}px
			</li>
			<li title={general.language === 'deutsch' ? 'Fenstergröße der Anwendung' : 'Window size of the application'}>
				{general.language === 'deutsch' ? 'Fenstergröße' : 'Window size'}:{' '}
				{appearances.width}x{appearances.height}px
			</li>
			<li title={general.language === 'deutsch' ? 'Farbtiefe des Bildschirms' : 'Color depth of the display'}>
				{general.language === 'deutsch' ? 'Farbtiefe' : 'Color Depth'}:{' '}
				{window.screen.colorDepth.toFixed(0)} bits
			</li>
			<li title={general.language === 'deutsch' ? 'Pixelseitenverhältnis des Bildschirms' : 'Pixel ratio of the display'}>
				{general.language === 'deutsch' ? 'Pixelseitenverhältnis' : 'Device pixel ratio'}:{' '}
				{window.devicePixelRatio}
			</li>
		</ul>
	);
}

export default Versions;
