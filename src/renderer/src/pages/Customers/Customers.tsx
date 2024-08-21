import React, { useRef, useState } from 'react';
import { Table } from '@renderer/comps/Table/Table';
import './Customers.css';
export function Customers(): React.JSX.Element {
	const tableWrapperRef = useRef<HTMLDivElement>(null);
	const [update, setUpdate] = useState<boolean>(false); // stop rendering while updating

	const updateHook = {
		update: update,
		setUpdate: (newValue: boolean) => {
			setUpdate(newValue);
		},
	};

	return (
		<>
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
