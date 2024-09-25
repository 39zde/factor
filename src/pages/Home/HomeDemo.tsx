import React from 'react';
import "./Home.css";

export function HomeDemo(): React.JSX.Element {
	return (
		<>
			<div className="appRoute">
				<div className="demoWrapper">
						<h1>Factor Demo</h1>
						<p>Note: this is a simple demo, which is adjusted to run in the browser. Depending on the Browser settings this demo might not work. If it does not work, download the executable:</p>
						<a href="https://github.com/39zde/factor/releases" target='_blank'>Github Releases</a>
						<b>Getting started:</b>
						<ol>
							<li>Make sure persistent storage is enabled</li>
							<li>
								Download the Data-Backup:
							<a href="https://raw.githubusercontent.com/39zde/factor/refs/heads/master/resources/data/customer.backup.json" download>Download the Backup-Data</a>
							</li>
							<li>
								Go to the Upload Page and upload the data.
							</li>
							<li>Click `Restore Backup`</li>
							<li>once imported successfully a new menu item appears in side bar.</li>
						</ol>
				</div>
			</div>
		</>
	);
}
