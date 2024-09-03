import React, { useRef, useState } from 'react';
import { Table } from '@renderer/comps/Table/Table';
import type { CustomerDBObjectStores } from '@util/types/types';
import './Customers.css';
export function Customers(): React.JSX.Element {
	const customerTables: CustomerDBObjectStores[] = ['customers', 'persons', 'company', 'addresses', 'emails', 'phones', 'banks'];
	const tableWrapperRef = useRef<HTMLDivElement>(null);
	const [update, setUpdate] = useState<boolean>(false); // stop rendering while updating
	const [tableName, setTableName] = useState<CustomerDBObjectStores>('customers');
	const updateHook = {
		update: update,
		setUpdate: (newValue: boolean) => {
			console.log('hook: update: ', newValue);
			setUpdate(newValue);
		},
	};

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
