import React from 'react';
import ReactDOM from 'react-dom/client';
// non-lib imports
import App from '@app';
import '@base';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);
