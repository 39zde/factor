import React, { useState , useContext} from 'react';
import './SideBar.css';
import { SideBarPros } from '@util/types/SideBar';
import {
	CogIcon,
	HomeIcon,
	UploadIcon,
	UserRoundIcon,
	ArrowRightFromLineIcon,
} from 'lucide-react';
import { AppContext } from '@renderer/App';
import { RouteType } from '@util/types/routes';

export default function SideBar({
	routesHook,
}: SideBarPros): React.JSX.Element {
	const {appearances} = useContext(AppContext)
	const routeHandler = (newRoute: RouteType) => {
		routesHook.setRoute(newRoute);
	};

	return (
		<>
			<div className="sideBar"
				style={{
					width: appearances.sideBarWidth
				}}
			>
				<div className="topIcons">
					<RouterButton
						handler={routeHandler}
						icon={<HomeIcon size={24} strokeWidth={2} color="light-dark(var(--color-dark-1),var(--color-light-1))" />}
						route={routesHook.route}
						routeName="Home"
					/>
					<RouterButton
						handler={routeHandler}
						icon={<UploadIcon size={24} strokeWidth={2} color="light-dark(var(--color-dark-1),var(--color-light-1))" />}
						route={routesHook.route}
						routeName="Upload"
					/>
					<RouterButton
						handler={routeHandler}
						icon={
							<ArrowRightFromLineIcon
								size={25}
								strokeWidth={2}
								color="white"
							/>
						}
						route={routesHook.route}
						routeName="ExportPage"
						textOverride="Export"
					/>
					<div className="divider"></div>
					<RouterButton
						handler={routeHandler}
						icon={
							<UserRoundIcon size={24} strokeWidth={2} color="light-dark(var(--color-dark-1),var(--color-light-1))" />
						}
						route={routesHook.route}
						routeName="Customers"
					/>
					<RouterButton
						handler={routeHandler}
						icon={
							<UserRoundIcon size={24} strokeWidth={2} color="light-dark(var(--color-dark-1),var(--color-light-1))" />
						}
						route={routesHook.route}
						routeName="Customers"
					/>
				</div>
				<div className="bottomIcons">
					<RouterButton
						handler={routeHandler}
						icon={<CogIcon size={24} strokeWidth={2} color="light-dark(var(--color-dark-1),var(--color-light-1))" />}
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
	textOverride,
}: {
	route: RouteType;
	handler: Function;
	routeName: RouteType;
	icon: React.JSX.Element;
	textOverride?: string;
}): React.JSX.Element {
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
						? "light-dark(var(--color-light-3),var(--color-dark-3))"
						: route === routeName
							? "light-dark(var(--color-light-1),var(--color-dark-1))"
							: "light-dark(var(--color-light-2),var(--color-dark-2))",
				}}
				className="sideBarButton"
			>
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
