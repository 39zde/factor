import React, { useContext } from 'react';

import { AppContext } from '@renderer/App';
import type { HelpTexts } from '@util/types/types';

import { HelpTextDE, HelpTextEN } from './HelpTexts';

import './Help.css';

export function Help(): React.JSX.Element {
	const { general } = useContext(AppContext);
	return (
		<>
			<div className="helpWrapper">
				<h1>{general.language === 'deutsch' ? 'Hilfe' : 'Help'}</h1>
				<div className="helpContentsWrapper">
					<ul className="helpContentsList">
						<li></li>
					</ul>
				</div>
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
					<>
						<h2 key={`help-h2-${index}`}>{entry[1].title}</h2>
						<div className='helpCategoryWrapper' key={`help-div1-${index}`}>
							{entry[1].items.map((item, index2) => {
								return (
									<>
										<h3 key={`help-h3-${index}-${index2}`}>
											{item.title}
										</h3>
										<div className='helpCategoryItemWrapper' key={`help-div2-${index}-${index2}`}>
											{item.text.map((text, index3) => (
												<p
													key={`help-p-${index}-${index2}-${index3}`}>
													{text}
												</p>
											))}
										</div>
									</>
								);
							})}
						</div>
					</>
				);
			})}
		</>
	);
}
