import React from 'react';
export interface HelpTexts {
	usage: {
		title: string;
		items: HelpItem[];
	};
	pages: {
		title: string;
		items: HelpItem[];
	};
}

export interface HelpItem {
	// what title this section should be given
	title: string;
	// the contents of this section
	item: React.JSX.Element;
}
