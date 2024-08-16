import React, { useState } from 'react';
import './SideBar.css';
import { SideBarPros } from '@util/types/SideBar';
import { CogIcon, HomeIcon, UploadIcon, UserRound } from 'lucide-react';
import { RouteType } from '@util/types/routes';

export default function SideBar({
	routesHook,
}: SideBarPros): React.JSX.Element {
	const routeHandler = (newRoute: string) => {
		routesHook.setRoute(newRoute);
	};

	return (
		<>
			<div className="sideBar">
				<div className="topIcons">
					<RouterButton
						handler={routeHandler}
						icon={<HomeIcon size={24} strokeWidth={2} color="white" />}
						route={routesHook.route}
						routeName="Home"
					/>
					<RouterButton
						handler={routeHandler}
						icon={<UploadIcon size={24} strokeWidth={2} color="white" />}
						route={routesHook.route}
						routeName="Upload"
					/>
					<div className="divider"></div>
					<RouterButton
						handler={routeHandler}
						icon={<UserRound size={24} strokeWidth={2} color="white" />}
						route={routesHook.route}
						routeName="Customers"
					/>
				</div>
				<div className="bottomIcons">
					<RouterButton
						handler={routeHandler}
						icon={<CogIcon size={24} strokeWidth={2} color="white" />}
						route={routesHook.route}
						routeName="Settings"
					/>
				</div>
			</div>
		</>
	);
}

function RouterButton({
	route,
	handler,
	routeName,
	icon,
}: {
	route: RouteType;
	handler: Function;
	routeName: RouteType;
	icon: React.JSX.Element;
}): React.JSX.Element {
	const [hover, setHover] = useState<boolean>(false);

	return (
		<>
			<button
				onMouseEnter={() => setHover(true)}
				onMouseLeave={() => setHover(false)}
				onClick={() => handler(routeName)}
				style={{
					background: hover
						? '#434a56'
						: route === routeName
							? '#0b0c0e'
							: '#22242a',
				}}
				className="sideBarButton"
			>
				{icon}
				{routeName}
			</button>
		</>
	);
}
