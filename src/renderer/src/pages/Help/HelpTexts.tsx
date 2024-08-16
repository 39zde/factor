import type { HelpTexts } from "@util/types/types";
export const HelpTextDE: HelpTexts = {
	usage: {
		title: 'Nutzung',
		items: [
			{
				title: 'Tabellennavigation',
				text: [
					'Wege zum horizontalen navigieren in der Tabelle: ',
					'Shift + Scroll ',
					'Mittlere Maustaste gedrückt halten und in die gewünschte Richtung ziehen',
					'Scroll-Leiste benutzen',
					'Wege zum vertikalen Navigieren: ',
					'Scroll-Rad benutzen',
				],
			},
		],
	},
	pages: {
		title: 'Seiten',
		items: [
			{
				title: 'Hochladen',
				text: [
					'Beim Hochladen von Dateien ist sowohl auf den Dateityp, als auch auf das Trennzeichen zu achten. Beim Dateityp muss es sich um eine CSV Datei handeln. Das Trennzeichen sollte ein Semicolon (;), da ein Komma auch oft in den Tabellenfeldern vorkommt. Je nach Art des zu importierenden Datensatzes können so Problemen vorgebeugt werden.',
				],
			},
		],
	},
};

export const HelpTextEN: HelpTexts = {
	usage: {
		title: 'Usage',
		items: [
			{
				title: 'Table Navigation',
				text: [
					'Ways to navigate horizontally: ',
					'Shift + Scroll ',
					'Press and hold the mouse wheel and drag towards the wanted direction',
					'Using the Scrollbar',
					'Ways to navigate vertically: ',
					'Use the mouse wheel',
				],
			},
		],
	},
	pages: {
		title: 'Pages',
		items: [
			{
				title: 'Upload',
				text: [
					'While uploading consider the type of file and the delimiting character.The supported file type is CSV. The delimiter should be a semicolon (;), because a comma appears often in the value of cells. This would distort the whole table. Depending on the to be imported dataset, this way problems can be mitigated in advance.',
				],
			},
		],
	},
};
