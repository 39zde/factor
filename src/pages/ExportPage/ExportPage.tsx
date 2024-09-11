import React, { useRef, useState } from 'react';
// non-lib imports
import { useAppContext } from '@app';
import type { CompressionTypes } from '@typings';
import './ExportPage.css';

export function ExportPage(): React.JSX.Element {
	const { general, database, worker } = useAppContext();
	const [format, setFormat] = useState<'json' | 'csv'>('json');
	const [useCompression, setUseCompression] = useState<CompressionTypes | undefined>(undefined);
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
		worker.ExportWorker.postMessage(
			{
				type: type,
				dataBaseName: dataBaseName,
				oStoreName: oStoreName,
				format: format,
				compression: useCompression,
			}
		);
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

	return (
		<>
			<div className="exportPage">
				<ul className="toolbar">
					<li>
						<div className="fileExportFormatSelectWrapper">
							<p>{general.language === 'deutsch' ? 'Dateiformat:' : 'File Format:'}</p>
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
							<p>{general.language === 'deutsch' ? 'Kompressionsverfahren:' : 'Compression Type:'}</p>
							<select ref={formatRef} onInput={compressionHandler}>
								<option value={undefined} defaultChecked>
									{general.language === 'deutsch' ? 'Keines' : 'None'}
								</option>
								<option value={'br'}>Brotli</option>
								<option value={'gz'}>Gzip</option>
								<option value={'zz'}>Deflate</option>
							</select>
						</div>
					</li>
				</ul>
				<div className="exportDatabases">
					{Object.entries(database.databases).map(([key, value]) => {
						let oStores = value as string[];
						let dbName = key as string;
						if (value !== null) {
							return (
								<div key={key} className="exportDatabase">
									<div className="exportWholeDatabase">
										<h2>
											{general.language === 'deutsch' ? 'Datenbank' : 'Database'}: <em>{dbName}</em>
										</h2>
										<button onClick={() => exportHandler('db', dbName, undefined)}>
											{general.language === 'deutsch' ? 'Datenbank exportieren' : 'Export Database'}
										</button>
									</div>
									<div className="exportOStores">
										{oStores.map((oStore, index) => {
											return (
												<>
													<div key={`${oStore}-${key}-exportOStores-${index}`} className="exportOStore">
														<p>
															{general.language === 'deutsch' ? 'Tabelle' : 'Table'}: <em>{oStore}</em>
														</p>
														<button onClick={() => exportHandler('oStore', dbName, oStore)}>
															{general.language === 'deutsch' ? 'Tabelle exportieren' : 'Export Table'}
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
					{general.language === 'deutsch' ? 'Alles Exportieren' : 'Export All'}
				</button>
			</div>
		</>
	);
}
