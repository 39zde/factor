import type { TableRow } from '../../database/DataBaseData';

export interface TableRowItemProps {
	items: TableRow;
	colIndex?: number;
	key?: string;
	uniqueParentKey: string;
}
