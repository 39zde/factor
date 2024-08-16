import React, { useContext } from 'react';
import './SideBar.css';
import {
	CogIcon,
	HomeIcon,
	UploadIcon,
	UserRoundIcon,
	ArrowRightFromLineIcon,
	CuboidIcon,
	TruckIcon,
	ReceiptTextIcon,
	FileOutputIcon,
	RotateCcwIcon,
} from 'lucide-react';

import { AppContext } from '@renderer/App';
import { RouterButton } from './RouterButton';

import { RouteType, SideBarProps } from '@util/types/types';

export default function SideBar({
	routesHook,
}: SideBarProps): React.JSX.Element {
	const { appearances, general } = useContext(AppContext);
	const routeHandler = (newRoute: RouteType) => {
		routesHook.setRoute(newRoute);
	};

	return (
		<>
			<div
				className="sideBar"
				style={{
					width: appearances.sideBarWidth,
				}}
			>
				<div className="topIcons">
					<RouterButton
						handler={routeHandler}
						icon={
							<HomeIcon
								size={24}
								strokeWidth={routesHook.route === 'Home' ? 3 : 2}
								color={
									routesHook.route === 'Home'
										? 'var(--color-primary)'
										: 'light-dark(var(--color-dark-1),var(--color-light-1))'
								}
							/>
						}
						route={routesHook.route}
						routeName="Home"
						textOverride={
							general.language === 'deutsch' ? 'Start' : 'Home'
						}
					/>
					<RouterButton
						handler={routeHandler}
						icon={
							<UploadIcon
								size={24}
								strokeWidth={routesHook.route === 'Upload' ? 3 : 2}
								color={
									routesHook.route === 'Upload'
										? 'var(--color-primary)'
										: 'light-dark(var(--color-dark-1),var(--color-light-1))'
								}
							/>
						}
						route={routesHook.route}
						routeName="Upload"
						textOverride={
							general.language === 'deutsch' ? 'Hochladen' : 'Upload'
						}
					/>
					<RouterButton
						handler={routeHandler}
						icon={
							<ArrowRightFromLineIcon
								size={25}
								strokeWidth={routesHook.route === 'ExportPage' ? 3 : 2}
								color={
									routesHook.route === 'ExportPage'
										? 'var(--color-primary)'
										: 'light-dark(var(--color-dark-1),var(--color-light-1))'
								}
							/>
						}
						route={routesHook.route}
						routeName="ExportPage"
						textOverride={
							general.language === 'deutsch' ? 'Exportieren' : 'Export'
						}
					/>
					<div className="divider" />
					<RouterButton
						handler={routeHandler}
						icon={
							<CuboidIcon
								size={24}
								strokeWidth={routesHook.route === 'Articles' ? 3 : 2}
								color={
									routesHook.route === 'Articles'
										? 'var(--color-primary)'
										: 'light-dark(var(--color-dark-1),var(--color-light-1))'
								}
							/>
						}
						route={routesHook.route}
						routeName="Articles"
						textOverride={
							general.language === 'deutsch' ? 'Artikel' : 'Articles'
						}
					/>
					<RouterButton
						handler={routeHandler}
						icon={
							<UserRoundIcon
								size={24}
								strokeWidth={routesHook.route === 'Customers' ? 3 : 2}
								color={
									routesHook.route === 'Customers'
										? 'var(--color-primary)'
										: 'light-dark(var(--color-dark-1),var(--color-light-1))'
								}
							/>
						}
						route={routesHook.route}
						routeName="Customers"
						textOverride={
							general.language === 'deutsch' ? 'Kunden' : 'Customers'
						}
					/>
					<RouterButton
						handler={routeHandler}
						icon={
							<TruckIcon
								size={24}
								strokeWidth={routesHook.route === 'Deliveries' ? 3 : 2}
								color={
									routesHook.route === 'Deliveries'
										? 'var(--color-primary)'
										: 'light-dark(var(--color-dark-1),var(--color-light-1))'
								}
							/>
						}
						route={routesHook.route}
						routeName="Deliveries"
						textOverride={
							general.language === 'deutsch'
								? 'Lieferungen'
								: 'Deliveries'
						}
					/>
					<RouterButton
						handler={routeHandler}
						icon={
							<ReceiptTextIcon
								size={24}
								strokeWidth={routesHook.route === 'Invoices' ? 3 : 2}
								color={
									routesHook.route === 'Invoices'
										? 'var(--color-primary)'
										: 'light-dark(var(--color-dark-1),var(--color-light-1))'
								}
							/>
						}
						route={routesHook.route}
						routeName="Invoices"
						textOverride={
							general.language === 'deutsch' ? 'Rechnungen' : 'Invoices'
						}
					/>
					<RouterButton
						handler={routeHandler}
						icon={
							<FileOutputIcon
								size={24}
								strokeWidth={routesHook.route === 'Quotes' ? 3 : 2}
								color={
									routesHook.route === 'Quotes'
										? 'var(--color-primary)'
										: 'light-dark(var(--color-dark-1),var(--color-light-1))'
								}
							/>
						}
						route={routesHook.route}
						routeName="Quotes"
						textOverride={
							general.language === 'deutsch' ? 'Angebote' : 'Quotes'
						}
					/>
					<RouterButton
						handler={routeHandler}
						icon={
							<RotateCcwIcon
								size={24}
								strokeWidth={routesHook.route === 'Returnees' ? 3 : 2}
								color={
									routesHook.route === 'Returnees'
										? 'var(--color-primary)'
										: 'light-dark(var(--color-dark-1),var(--color-light-1))'
								}
							/>
						}
						route={routesHook.route}
						routeName="Returnees"
						textOverride={
							general.language === 'deutsch' ? 'Rückgaben' : 'Returnees'
						}
					/>
				</div>
				<div className="bottomIcons">
					<RouterButton
						handler={routeHandler}
						icon={
							<CogIcon
								size={24}
								strokeWidth={routesHook.route === 'Settings' ? 3 : 2}
								color={
									routesHook.route === 'Settings'
										? 'var(--color-primary)'
										: 'light-dark(var(--color-dark-1),var(--color-light-1))'
								}
							/>
						}
						route={routesHook.route}
						routeName="Settings"
						textOverride={
							general.language === 'deutsch'
								? 'Einstellungen'
								: 'Settings'
						}
					/>
				</div>
			</div>
		</>
	);
}
