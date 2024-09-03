import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Table } from '@renderer/comps/Table/Table';
import { useAppContext } from '@renderer/App';
import type { CustomerDBObjectStores } from '@util/types/types';
import './Customers.css';
export function Customers(): React.JSX.Element {
	const customerTables: CustomerDBObjectStores[] = ['customers', 'persons', 'company', 'addresses', 'emails', 'phones', 'banks'];
	const { appearances } = useAppContext();
	const tableWrapperRef = useRef<HTMLDivElement>(null);
	const [update, setUpdate] = useState<boolean>(false); // stop rendering while updating
	const [tableName, setTableName] = useState<CustomerDBObjectStores>('customers');
	const [pageWidth, setPageWidth] = useState<'auto' | number>('auto');
	const updateHook = {
		update: update,
		setUpdate: (newValue: boolean) => {
			console.log('hook: update: ', newValue);
			setUpdate(newValue);
		},
	};

	useEffect(() => {
		if (tableWrapperRef.current !== null) {
			setPageWidth(tableWrapperRef.current.clientWidth);
		} else {
			setPageWidth('auto');
		}
	}, [appearances.sideBarWidth, tableWrapperRef.current]);

	const tableSwitchHandler = (tableName: CustomerDBObjectStores) => {
		setUpdate(true);
		setTableName(tableName);
	};

	return (
		<>
			<div ref={tableWrapperRef} className="customersWrapper">
				<div className="toolBarWrapper">
					<ul className="toolbar">
						{customerTables.map((item) => (
							<li key={`${item}-switcher`}>
								<button className={tableName === item ? 'tableActive' : ''} onClick={() => tableSwitchHandler(item)}>
									{item}
								</button>
							</li>
						))}
					</ul>
				</div>
				<Table dataBaseName="customer_db" tableName={tableName} uniqueKey="row" updateHook={updateHook} update={update} />
			</div>
		</>
	);
}
