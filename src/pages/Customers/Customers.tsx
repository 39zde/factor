import React, { useRef, useState } from 'react';
// non-lib imports
import Comps from '@comps';
import type { CustomerDBObjectStores } from '@typings';
import { CustomerTableNames } from './CustomerTableNames';
import './Customers.css';

export function Customers(): React.JSX.Element {
	const customerTables: CustomerDBObjectStores[] = ['customers', 'persons', 'company', 'addresses', 'emails', 'phones', 'banks'];
	const tableWrapperRef = useRef<HTMLDivElement>(null);
	const [update, setUpdate] = useState<boolean>(false); // stop rendering while updating
	const [tableName, setTableName] = useState<CustomerDBObjectStores>('customers');
	const updateHook = {
		update: update,
		setUpdate: (newValue: boolean) => {
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
					<menu className="toolbar">
						{customerTables.map((item) => (
							<li key={`${item}-switcher`}>
								<button className={tableName === item ? 'tableActive' : ''} onClick={() => tableSwitchHandler(item)}>
									<CustomerTableNames tableName={item} />
								</button>
							</li>
						))}
					</menu>
				</div>
				<Comps.Table dataBaseName="customer_db" tableName={tableName} uniqueKey="row" updateHook={updateHook} update={update} />
			</div>
		</>
	);
}
