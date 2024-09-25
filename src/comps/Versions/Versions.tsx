import React, { useState, useMemo } from 'react';
// non-lib imports
import { useAppContext, useChangeContext } from '@app';
import './Versions.css';

export function Versions(): React.JSX.Element {
	const { general, appearances } = useAppContext();
	const dispatch = useChangeContext();
	const [tauriVersion, setTauriVersion] = useState<string>();
	const [platform, setPlatform] = useState<string>();
	const [used, setUsed] = useState<string>('');
	const [free, setFree] = useState<string>('');
	useMemo(async () => {
		async function getVersions() {
			try {
				const storage = navigator.storage.estimate();

				const plat = window.navigator.platform.toLowerCase();
				if (plat.includes('win')) {
					setPlatform('Windows');
				}
				if (plat.includes('mac')) {
					setPlatform('Mac OS');
				}
				if (plat.includes('linux')) {
					setPlatform('Linux');
				}

				const storageResult = await storage;
				if (storageResult !== null) {
					setUsed(((storageResult.usage ?? 0) / Math.pow(1024, 2)).toFixed(1));
					setFree(((storageResult.quota ?? 0) / (Math.pow(1024, 2) * 1000)).toFixed(1));
				}

				if (window.__USE_TAURI__) {
					const tVersion = window.__TAURI__.app.getTauriVersion();
					const tVersionResult = await tVersion;
					if (tVersionResult !== '') {
						setTauriVersion(tVersionResult);
					} else {
						setTauriVersion('error');
					}
				}
			} catch (e) {
				setTauriVersion('error');

				console.error('error', e);
				dispatch({
					type: 'notify',
					notification: {
						title: general.language === 'deutsch' ? 'Ein Fehler ist aufgetreten' : 'An error occurred',
						body: 'Failed to estimate disk usage',
					},
				});
			}
		}
		getVersions();
	}, []);

	return (
		<ul className="versions">
			<li title={general.language === 'deutsch' ? `Name+Version dieser Anwendung` : `The name+version of this application`}>
				Factor {window.__FACTOR_VERSION__}
			</li>
			<li
				title={
					general.language === 'deutsch'
						? `Tauri ist ein System für das Erstellen von kleinen und schnellen Anwendungen für alle großen Desktop und Mobile Plattformen`
						: `Tauri is a framework for building tiny, fast binaries for all major desktop and mobile platforms.`
				}>
				Tauri v{tauriVersion}
			</li>
			<li title={general.language === 'deutsch' ? `Speicherplatzbedarf der gespeicherten Tabellen` : `Disk usage of the saved tables`}>
				{general.language === 'deutsch' ? 'Speicherplatzbedarf' : 'Disk usage'} {used} MB
			</li>
			<li title={general.language === 'deutsch' ? `Restlicher Speicherplatz auf der Festplatte` : `Remaining storage space on the storage medium`}>
				{general.language === 'deutsch' ? 'Speicherplatzverfügbarkeit' : 'Free space'} {free} GB{' '}
			</li>
			<li title={general.language === 'deutsch' ? 'Betriebssystemart' : 'The type of operating system'}>
				{general.language === 'deutsch' ? 'Plattform: ' : 'Platform: '}
				{platform}
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
