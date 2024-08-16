import React, { WheelEvent } from 'react';
import type { Table } from 'dexie';

export interface TableBodyDisplayProps {
	tableBodyRef: React.RefObject<HTMLTableSectionElement>;
}
