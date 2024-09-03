import type { HelpTexts } from '@util/types/types';
export const HelpTextDE: HelpTexts = {
	usage: {
		title: 'Nutzung',
		items: [
			{
				title: 'Tabellennavigation',
				item: (
					<>
						<div>
							<h4>Wege zum horizontalen navigieren in der Tabelle:</h4>
							<ol>
								<li>
									<span className="keyBoardShortcut">
										<span className="keyboardKey">&#8679;</span>
										<span> + </span>
										<span>Scroll</span>
									</span>
								</li>
								<li>Mittlere Maustaste gedrückt halten und in die gewünschte Richtung ziehen</li>
								<li>Scroll-Leiste benutzen</li>
							</ol>
							<h4>Wege zum vertikalen Navigieren: </h4>
							<ol>
								<li>Scroll-Rad</li>
								<li>Die Pfeile in der linken oberen und unteren Ecke der Tabelle drücken</li>
							</ol>
						</div>
					</>
				),
			},
		],
	},
	pages: {
		title: 'Seiten',
		items: [
			{
				title: 'Hochladen',
				item: (
					<>
						<p>
							'Beim Hochladen von Dateien ist sowohl auf den Dateityp, als auch auf das Trennzeichen zu achten. Beim Dateityp muss es sich um
							eine CSV Datei handeln. Das Trennzeichen sollte ein Semicolon (;), da ein Komma auch oft in den Tabellenfeldern vorkommt. Je nach
							Art des zu importierenden Datensatzes können so Problemen vorgebeugt werden.',
						</p>
					</>
				),
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
				item: (
					<>
						<div>
							<h4>Ways to navigate horizontally: </h4>
							<ol>
								<li>
									<span className="keyBoardShortcut">
										<span className="keyboardKey">&#8679;</span>
										<span>+ Scroll</span>
									</span>
								</li>
								<li>Press and hold the mouse wheel and drag towards the wanted direction</li>
								<li>Using the Scrollbar</li>
							</ol>
							<h4>Ways to navigate vertically: </h4>
							<ol>
								<li>Use the mouse wheel</li>
								<li>Use the buttons in the upper and lower left corner of the table</li>
							</ol>
						</div>
					</>
				),
			},
		],
	},
	pages: {
		title: 'Pages',
		items: [
			{
				title: 'Upload',
				item: (
					<>
						<p>
							While uploading consider the type of file and the delimiting character.The supported file type is CSV. The delimiter should be a
							semicolon (;), because a comma appears often in the value of cells. This would distort the whole table. Depending on the to be
							imported dataset, this way problems can be mitigated in advance.
						</p>
					</>
				),
			},
		],
	},
};
