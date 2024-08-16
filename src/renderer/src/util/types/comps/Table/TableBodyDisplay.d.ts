import React, { WheelEvent } from 'react';
import type { Table } from 'dexie';

export interface TableBodyDisplayProps {
	tableName: string;
	tableBodyRef: React.RefObject<HTMLTableSectionElement>;
	count?: number;
	uniqueKey: string;
	scope: number;
	updateHook?: { update: boolean; setUpdate: (newVal: boolean) => void };
	start: React.RefObject;
}
