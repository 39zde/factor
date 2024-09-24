import React from 'react';
// non-lib imports
import { HelpTextDE, HelpTextEN } from './HelpTexts';
import { useAppContext } from '@app';
import type { HelpTexts } from '@type';
import './Help.css';

export function Help(): React.JSX.Element {
	const { general } = useAppContext();
	return (
		<>
			<div className="helpWrapper helper">
				<h1>{general.language === 'deutsch' ? 'Hilfe' : 'Help'}</h1>
				<div className="helpContents">
					{general.language == 'deutsch' ? (
						<>
							<UnfoldHelp help={HelpTextDE} />
						</>
					) : (
						<>
							<UnfoldHelp help={HelpTextEN} />
						</>
					)}
				</div>
			</div>
		</>
	);
}

function UnfoldHelp({ help }: { help: HelpTexts }) {
	return (
		<>
			{Object.entries(help).map((entry, index) => {
				return (
					<div className="helpContentItem" key={`${entry[1].title}`}>
						<h2>{entry[1].title}</h2>
						<div className="helpCategoryWrapper">
							{entry[1].items.map((item, index2) => {
								return (
									<div className="helpCategory" key={`help-div2-${index}-${index2}`}>
										<h3>{item.title}</h3>
										<div className="helpCategoryItemWrapper">{item.item}</div>
									</div>
								);
							})}
						</div>
					</div>
				);
			})}
		</>
	);
}
