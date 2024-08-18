import React, { useState } from 'react';
import type { LowerButtonProps, RouterButtonProps } from '@util/types/types';
import './SideBar.css';

export function LowerButton({
	handler,
	icon,
	text,
	active,
}: LowerButtonProps): React.JSX.Element {
	const [hover, setHover] = useState<boolean>(false);

	return (
		<>
			<button
				onMouseEnter={() => setHover(true)}
				onMouseLeave={() => setHover(false)}
				onClick={() => handler()}
				style={{
					minHeight: 25,
					background: hover
						? 'light-dark(var(--color-light-3),var(--color-dark-3))'
						: active
							? 'light-dark(var(--color-light-1),var(--color-dark-1))'
							: 'light-dark(var(--color-light-2),var(--color-dark-2))',
					color: active ? 'var(--color-primary)' : 'initial',
					fontWeight: active ? 'bold' : 'initial',
				}}
				className="sideBarButton">
				{icon}
				{text}
			</button>
		</>
	);
}
