import React from 'react';

export interface TableBodyDisplayProps {
	tableBodyRef: React.RefObject<HTMLTableSectionElement>;
	causeRerender: boolean;
}
