import React, { Fragment, useRef, useState } from 'react';
import { FileHandle, create, BaseDirectory } from '@tauri-apps/plugin-fs';
// non-lib imports
import { useAppContext, useChangeContext } from '@app';
import type { CompressionTypes, ExportWorkerResponse } from '@type';
import './ExportPage.css';

export function ExportPage(): React.JSX.Element {
	const context = useAppContext();
	const dispatch = useChangeContext();
	const [format, setFormat] = useState<'json' | 'csv'>('json');
	const [useCompression, setUseCompression] = useState<CompressionTypes | undefined>(undefined);
	const [fileHandle, setFileHandle] = useState<FileHandle | undefined>(undefined);
	const formatRef = useRef<HTMLSelectElement>(null);
	const compressionRef = useRef<HTMLSelectElement>(null);

	const exportHandler = (
		type: 'db' | 'oStore' | 'all',
		dataBaseName: string,
		oStoreName: string | undefined,
		compression: CompressionTypes | undefined
	) => {
		setFileHandle(undefined);

		context.worker.ExportWorker.postMessage({
			type: type,
			dataBaseName: dataBaseName,
			oStoreName: oStoreName,
			format: format,
			compression: compression,
		});
		// }
	};

	const formatHandler = () => {
		if (formatRef.current !== null) {
			if (formatRef.current.value !== undefined) {
				setFormat(formatRef.current.value as 'json' | 'csv');
			}
		}
	};

	const compressionHandler = () => {
		if (compressionRef.current !== null) {
			setUseCompression(compressionRef.current.value as CompressionTypes);
		}
	};

	context.worker.ExportWorker.onmessage = (e) => {
		const eventData = e.data as ExportWorkerResponse;
		switch (eventData.type) {
			case 'create':
				const channel = new BroadcastChannel('file-callbacks');
				const fileName = eventData.data as string;
				if (window.__USE_TAURI__) {
					create(fileName, { baseDir: BaseDirectory.Download }).then((handle) => {
						setFileHandle(handle);
						if (eventData.scope !== undefined) {
							channel.postMessage({ type: 'create', name: fileName, scope: eventData.scope });
						}
					});
				}

				break;
			case 'data':
				if (window.__USE_TAURI__) {
					if (fileHandle !== undefined) {
						fileHandle.write(eventData.data as Uint8Array);
					} else {
						// context.notify({ title: 'some content failed to write', body: new TextDecoder().decode(eventData.data as Uint8Array) });
						console.error('failed to write ', new TextDecoder().decode(eventData.data as Uint8Array));
					}
				}
				break;
			case 'close':
				if (window.__USE_TAURI__) {
					if (fileHandle !== undefined) {
						// let fileName = eventData.data as string;
						fileHandle.close().then(() => {
							setFileHandle(undefined);
							const channel = new BroadcastChannel('file-callbacks');
							channel.postMessage({ type: 'close', name: eventData.data, scope: eventData.scope });
							return dispatch({
								type: 'notify',
								notification: {
									title: context.general.language === 'deutsch' ? 'Export abgeschlossen' : 'Exported data',
									body: `${context.general.language === 'deutsch' ? 'Datei ' : 'File '}${eventData.data} ${context.general.language === 'deutsch' ? 'wurde im Download-Ordner abgelegt' : 'was written to the download folder'}`,
								},
							});
						});
					}
				}
				break;
		}
	};

	return (
		<>
			<div className="alert">unstable</div>

			<div className="exportPage">
				<menu className="toolbar">
					<li>
						<div className="fileExportFormatSelectWrapper">
							<p>{context.general.language === 'deutsch' ? 'Dateiformat:' : 'File Format:'}</p>
							<select ref={formatRef} onInput={formatHandler}>
								<option value={'json'} defaultChecked>
									JSON
								</option>
								<option value={'csv'}>CSV</option>
							</select>
						</div>
					</li>
					<li>
						<div
							className="fileExportCompressionSelectWrapper"
							style={{
								display: 'none',
							}}>
							<p>{context.general.language === 'deutsch' ? 'Kompressionsverfahren:' : 'Compression Type:'}</p>
							<select ref={compressionRef} onInput={compressionHandler}>
								<option value={undefined} defaultChecked>
									{context.general.language === 'deutsch' ? 'Keines' : 'None'}
								</option>
								<option value={'gzip'}>Gzip</option>
								<option value={'deflate'}>Deflate</option>
							</select>
						</div>
					</li>
				</menu>
				<div className="exportDatabases">
					{Object.entries(context.database.databases).map(([key, value]) => {
						const oStores = value as string[];
						const dbName = key as string;
						if (value !== null) {
							return (
								<div key={key} className="exportDatabase">
									<div className="exportWholeDatabase">
										<h2>
											{context.general.language === 'deutsch' ? 'Datenbank' : 'Database'}: <em>{dbName}</em>
										</h2>
										<button
											onClick={() => {
												if (fileHandle === undefined) {
													exportHandler('db', dbName, undefined, useCompression);
												}
											}}
											style={{
												cursor: fileHandle !== undefined ? 'no-drop' : 'initial',
												border: fileHandle !== undefined ? '2px solid light-dark(var(--color-dark-3),var(--color-dark-3))' : '',
												background: fileHandle !== undefined ? 'none' : '',
											}}>
											{context.general.language === 'deutsch' ? 'Datenbank exportieren' : 'Export Database'}
										</button>
									</div>
									<div className="exportOStores">
										{oStores.map((oStore, index) => {
											return (
												<div key={`${oStore}-${key}-exportOStores-${index}`} className="exportOStore">
													<p>
														{context.general.language === 'deutsch' ? 'Tabelle' : 'Table'}: <em>{oStore}</em>
													</p>
													<button
														onClick={() => {
															if (fileHandle == undefined) {
																exportHandler('oStore', dbName, oStore, useCompression);
															}
														}}
														style={{
															cursor: fileHandle !== undefined ? 'no-drop' : 'initial',
															border: fileHandle !== undefined ? '2px solid light-dark(var(--color-dark-3),var(--color-dark-3))' : '',
															background: fileHandle !== undefined ? 'none' : '',
														}}>
														{context.general.language === 'deutsch' ? 'Tabelle exportieren' : 'Export Table'}
													</button>
												</div>
											);
										})}
									</div>
								</div>
							);
						} else {
							return <Fragment key={key} />;
						}
					})}
				</div>
				{/* <button className="exportAllButton" onClick={() => exportHandler('all', 'all', undefined)}>
					{context.general.language === 'deutsch' ? 'Alles Exportieren' : 'Export All'}
				</button> */}
			</div>
		</>
	);
}
