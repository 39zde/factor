import React, { WheelEvent } from 'react';
import type { Table } from 'dexie';

export interface TableBodyDisplayProps {
	tableBodyRef: React.RefObject<HTMLTableSectionElement>;
	scrollHandler: (e: WheelEvent) => void;
	table: any[] | never[];
	//@ts-ignore
	dbTable?: Table<any, any, any>;
	count?: number;
	uniqueKey: string;
}
