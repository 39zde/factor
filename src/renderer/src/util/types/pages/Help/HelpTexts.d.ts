export type HelpTexts = {
	usage: {
		title: string;
		items: HelpItem[];
	};
	pages: {
		title: string;
		items: HelpItem[];
	};
};

export type HelpItem = {
	// what title this section should be given
	title: string;
	// the contents of this section
	text: string[];
};
