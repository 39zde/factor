import React, { useState } from 'react';
import type { RouterButtonProps } from '@util/types/types';
import './SideBar.css';

export function RouterButton({
	route,
	handler,
	routeName,
	icon,
	textOverride,
	active,
}: RouterButtonProps): React.JSX.Element {
	const [hover, setHover] = useState<boolean>(false);

	return (
		<>
			<button
				onMouseEnter={() => setHover(true)}
				onMouseLeave={() => setHover(false)}
				onClick={() => handler(routeName)}
				style={{
					minHeight: 25,
					background: hover
						? 'light-dark(var(--color-light-3),var(--color-dark-3))'
						: route === routeName && active
							? 'light-dark(var(--color-light-1),var(--color-dark-1))'
							: 'light-dark(var(--color-light-2),var(--color-dark-2))',
					color:
						route === routeName && active
							? 'var(--color-primary)'
							: 'initial',
					fontWeight: route === routeName && active ? 'bold' : 'initial',
				}}
				className="sideBarButton">
				{icon}
				{textOverride !== undefined ? (
					<>{textOverride}</>
				) : (
					<>{routeName}</>
				)}
			</button>
		</>
	);
}
