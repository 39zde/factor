import type { HelpTexts } from '@type';
export const HelpTextDE: HelpTexts = {
	usage: {
		title: '1. Nutzung',
		items: [
			{
				title: 'Tabellennavigation',
				item: (
					<>
						<div className="helpItem">
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
			{
				title: 'Anpassen der Spaltenbreite',
				item: (
					<>
						<div className="helpItem">
							<p>
								Um die Spaltenbreite anzupassen ziehen Sie den Cursor auf die Line zwischen den Spalten. Sobald sich die Linienstärke
								vergrößert klicken und ziehen Sie die Line and die gewünschte stelle. Um alle Spaltenbreiten wieder in den Ursprungszustand
								zurückzuführen öffnen Sie das Kontextmenü mit der rechten Maustaste und wählen die Option
								<code>Spaltenbreiten zurücksetzen</code> aus.
							</p>
						</div>
					</>
				),
			},
		],
	},
	pages: {
		title: '2. Seiten',
		items: [
			{
				title: 'Hochladen',
				item: (
					<>
						<div className="helpItem">
							<p>
								Beim Hochladen von Dateien ist sowohl auf den Dateityp, als auch auf das Trennzeichen zu achten. Beim Dateityp muss es sich um
								eine CSV Datei handeln. Das Trennzeichen sollte ein Semicolon (;), da ein Komma auch oft in den Tabellenfeldern vorkommt. Je
								nach Art des zu importierenden Datensatzes können so Problemen vorgebeugt werden.
							</p>
						</div>
					</>
				),
			},
		],
	},
	feedback: {
		title: '3. Feedback',
		items: [
			{
				title: 'Wünsche',
				item: (
					<div className="helpItem">
						<p>Wenn Sie Wünsche haben, wie sich diese Anwendung in Zukunft weiterentwickeln soll können Sie uns diese gerne mitteilen.</p>
						<p>
							Entweder per Email an <a href="mailto:feature-request@39z.de">feature-request@39z.de</a>. Nennen Sie im Betreff{' '}
							<code>factor</code>. Falls Sie einen GitHub account haben sollten können Sie auch eine{' '}
							<a href="https://github.com/39zde/factor/issues/new">
								<code>Feature Request Issue</code>
							</a>{' '}
							erstellen.
						</p>
					</div>
				),
			},
		],
	},
};

export const HelpTextEN: HelpTexts = {
	usage: {
		title: '1. Usage',
		items: [
			{
				title: 'Table Navigation',
				item: (
					<>
						<div className="helpItem">
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
			{
				title: 'Adjusting the Column Width',
				item: (
					<>
						<div className="helpItem">
							<p>
								To adjust the column with hover over the line, which separates the columns. Once the stroke width increases press and drag the
								separator to the wanted location. To reset all column width to the default values open the context menu with a click of the
								right mouse button and select <code>Reset column widths</code>
							</p>
						</div>
					</>
				),
			},
		],
	},
	pages: {
		title: '2. Pages',
		items: [
			{
				title: 'Upload',
				item: (
					<>
						<div className="helpItem">
							<p>
								While uploading consider the type of file and the delimiting character.The supported file type is CSV. The delimiter should be
								a semicolon (;), because a comma appears often in the value of cells. This would distort the whole table. Depending on the to
								be imported dataset, this way problems can be mitigated in advance.
							</p>
						</div>
					</>
				),
			},
		],
	},
	feedback: {
		title: '3. Feedback',
		items: [
			{
				title: 'Feature Request',
				item: (
					<div className="helpItem">
						<p> Do you have a feature Request?</p>
						<p>
							Mail them to <a href="mailto:feature-request@39z.de">feature-request@39z.de</a>. Mention <code>factor</code> in the subject. If
							you have a GitHub account you can open a
							<a href="https://github.com/39zde/factor/issues/new">
								<code>Feature Request Issue</code>
							</a>{' '}
							instead.
						</p>
					</div>
				),
			},
		],
	},
};
