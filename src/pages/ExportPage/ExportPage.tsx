import React, { useRef, useState } from 'react';
import { FileHandle, create, BaseDirectory } from '@tauri-apps/plugin-fs';
// non-lib imports
import { useAppContext } from '@app';
import type { CompressionTypes, ExportWorkerResponse } from '@typings';
import './ExportPage.css';

export function ExportPage(): React.JSX.Element {
	const context = useAppContext();
	const [format, setFormat] = useState<'json' | 'csv'>('json');
	const [useCompression, setUseCompression] = useState<CompressionTypes | undefined>(undefined);
	const [fileHandle, setFileHandle] = useState<FileHandle | undefined>(undefined);
	const formatRef = useRef<HTMLSelectElement>(null);
	const compressionRef = useRef<HTMLSelectElement>(null);

	const exportHandler = (type: 'db' | 'oStore' | 'all', dataBaseName: string, oStoreName: string | undefined) => {
		console.log({
			type: type,
			dataBaseName: dataBaseName,
			oStoreName: oStoreName,
			format: format,
			compression: useCompression,
		});
		// if (channel.ExportChannel !== undefined) {
		context.worker.ExportWorker.postMessage({
			type: type,
			dataBaseName: dataBaseName,
			oStoreName: oStoreName,
			format: format,
			compression: useCompression,
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
				let fileName = eventData.data as string;
				create(fileName, { baseDir: BaseDirectory.Download }).then((handle) => {
					setFileHandle(handle);
				});
				break;
			case 'data':
				if (fileHandle !== undefined) {
					fileHandle.write(eventData.data as Uint8Array);
				}
				break;
			case 'close':
				if (fileHandle !== undefined) {
					let fileName = eventData.data as string;
					fileHandle
						.close()
						.then(() => {
							return context.notify({
								title: context.general.language === 'deutsch' ? 'Export abgeschlossen' : 'Exported data',
								body: `${context.general.language === 'deutsch' ? 'Datei ' : 'File '}${fileName} ${context.general.language === 'deutsch' ? 'wurde im Download-Ordner abgelegt' : 'was written to the download folder'}`
							});
						})
						.then((value) => {
							console.log('file export result: ', value);
						});
				}
				break;
		}
	};

	return (
		<>
			<div className="exportPage">
				<ul className="toolbar">
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
						<div className="fileExportCompressionSelectWrapper">
							<p>{context.general.language === 'deutsch' ? 'Kompressionsverfahren:' : 'Compression Type:'}</p>
							<select ref={formatRef} onInput={compressionHandler}>
								<option value={undefined} defaultChecked>
									{context.general.language === 'deutsch' ? 'Keines' : 'None'}
								</option>
								<option value={'br'}>Brotli</option>
								<option value={'gz'}>Gzip</option>
								<option value={'zz'}>Deflate</option>
							</select>
						</div>
					</li>
				</ul>
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
										<button onClick={() => exportHandler('db', dbName, undefined)}>
											{context.general.language === 'deutsch' ? 'Datenbank exportieren' : 'Export Database'}
										</button>
									</div>
									<div className="exportOStores">
										{oStores.map((oStore, index) => {
											return (
												<>
													<div key={`${oStore}-${key}-exportOStores-${index}`} className="exportOStore">
														<p>
															{context.general.language === 'deutsch' ? 'Tabelle' : 'Table'}: <em>{oStore}</em>
														</p>
														<button onClick={() => exportHandler('oStore', dbName, oStore)}>
															{context.general.language === 'deutsch' ? 'Tabelle exportieren' : 'Export Table'}
														</button>
													</div>
												</>
											);
										})}
									</div>
								</div>
							);
						} else {
							return <></>;
						}
					})}
				</div>
				<button className="exportAllButton" onClick={() => exportHandler('all', 'all', undefined)}>
					{context.general.language === 'deutsch' ? 'Alles Exportieren' : 'Export All'}
				</button>
			</div>
		</>
	);
}
