import React, { useMemo, useContext, useRef, useState } from 'react';
import { AppContext } from '@renderer/App';
import { Table } from '@renderer/comps/Table/Table';
import './Customers.css';
export function Customers(): React.JSX.Element {
	const { general, database, worker, changeContext } = useContext(AppContext);
	const tableWrapperRef = useRef<HTMLDivElement>(null);
	const [cols, setCols] = useState<string[]>([]);
	const [entries, setEntries] = useState<number>(0);
	const [update, setUpdate] = useState<boolean>(false); // stop rendering while updating
	const colsHook = {
		cols: cols,
		setCols: (newCols: string[]) => {
			setCols(newCols);
		},
	};

	const entriesHook = {
		entries: entries,
		setEntries: (newVal: number) => {
			setEntries(newVal);
		},
	};

	const updateHook = {
		update: update,
		setUpdate: (newValue: boolean) => {
			setUpdate(newValue);
		},
	};

	return (
		<>
			<h1>{general.language === 'deutsch' ? 'Kunden' : 'Customers'}</h1>
			<div ref={tableWrapperRef} className="customersWrapper">
				<Table
					dataBaseName="customer_db"
					tableName="customers"
					uniqueKey="row"
					updateHook={updateHook}
				/>
			</div>
		</>
	);
}
