import React, { useEffect, useState } from 'react';
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
	HelpCircle,
} from 'lucide-react';

import { useAppContext } from '@renderer/App';
import { RouterButton } from './RouterButton';
import { LowerButton } from './LowerButton';

import { RouteType, SideBarProps } from '@util/types/types';

export default function SideBar({
	routesHook,
}: SideBarProps): React.JSX.Element {
	const { appearances, general, database } = useAppContext();
	const [sideBarWidth, setSideBarWidth] = useState<number>(
		appearances.sideBarWidth
	);
	const routeHandler = (newVal: RouteType) => {
		if (routesHook !== undefined) {
			routesHook.setShowSettings(false);
			routesHook.setShowHelp(false);
			routesHook.setRoute(newVal);
		}
	};

	useEffect(() => {
		setSideBarWidth(appearances.sideBarWidth);
	}, [appearances.sideBarWidth]);

	return (
		<>
			<div
				className="sideBar"
				style={{
					width: sideBarWidth,
				}}>
				<div className="topIcons">
					<RouterButton
						handler={routeHandler}
						active={!routesHook.showHelp && !routesHook.showSettings}
						icon={
							<HomeIcon
								size={24}
								strokeWidth={
									routesHook.route === 'Home' &&
									!routesHook.showHelp &&
									!routesHook.showSettings
										? 2.5
										: 2
								}
								color={
									routesHook.route === 'Home' &&
									!routesHook.showHelp &&
									!routesHook.showSettings
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
						active={!routesHook.showHelp && !routesHook.showSettings}
						icon={
							<UploadIcon
								size={24}
								strokeWidth={
									routesHook.route === 'Upload' &&
									!routesHook.showHelp &&
									!routesHook.showSettings
										? 2.5
										: 2
								}
								color={
									routesHook.route === 'Upload' &&
									!routesHook.showHelp &&
									!routesHook.showSettings
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
						active={!routesHook.showHelp && !routesHook.showSettings}
						icon={
							<ArrowRightFromLineIcon
								size={25}
								strokeWidth={
									routesHook.route === 'ExportPage' &&
									!routesHook.showHelp &&
									!routesHook.showSettings
										? 2.5
										: 2
								}
								color={
									routesHook.route === 'ExportPage' &&
									!routesHook.showHelp &&
									!routesHook.showSettings
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
					{database.databases.article_db !== null ? (
						<>
							<RouterButton
								active={
									!routesHook.showHelp && !routesHook.showSettings
								}
								handler={routeHandler}
								icon={
									<CuboidIcon
										size={24}
										strokeWidth={
											routesHook.route === 'Articles' &&
											!routesHook.showHelp &&
											!routesHook.showSettings
												? 2.5
												: 2
										}
										color={
											routesHook.route === 'Articles' &&
											!routesHook.showHelp &&
											!routesHook.showSettings
												? 'var(--color-primary)'
												: 'light-dark(var(--color-dark-1),var(--color-light-1))'
										}
									/>
								}
								route={routesHook.route}
								routeName="Articles"
								textOverride={
									general.language === 'deutsch'
										? 'Artikel'
										: 'Articles'
								}
							/>
						</>
					) : (
						<></>
					)}
					{database.databases.customer_db !== null ? (
						<>
							<RouterButton
								active={
									!routesHook.showHelp && !routesHook.showSettings
								}
								handler={routeHandler}
								icon={
									<UserRoundIcon
										size={24}
										strokeWidth={
											routesHook.route === 'Customers' &&
											!routesHook.showHelp &&
											!routesHook.showSettings
												? 2.5
												: 2
										}
										color={
											routesHook.route === 'Customers' &&
											!routesHook.showHelp &&
											!routesHook.showSettings
												? 'var(--color-primary)'
												: 'light-dark(var(--color-dark-1),var(--color-light-1))'
										}
									/>
								}
								route={routesHook.route}
								routeName="Customers"
								textOverride={
									general.language === 'deutsch'
										? 'Kunden'
										: 'Customers'
								}
							/>
						</>
					) : (
						<></>
					)}
					{database.databases.document_db !== null &&
					database.databases.document_db.includes('deliveries') ? (
						<>
							<RouterButton
								active={
									!routesHook.showHelp && !routesHook.showSettings
								}
								handler={routeHandler}
								icon={
									<TruckIcon
										size={24}
										strokeWidth={
											routesHook.route === 'Deliveries' &&
											!routesHook.showHelp &&
											!routesHook.showSettings
												? 2.5
												: 2
										}
										color={
											routesHook.route === 'Deliveries' &&
											!routesHook.showHelp &&
											!routesHook.showSettings
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
						</>
					) : (
						<></>
					)}
					{database.databases.document_db !== null &&
					database.databases.document_db.includes('invoices') ? (
						<>
							<RouterButton
								active={
									!routesHook.showHelp && !routesHook.showSettings
								}
								handler={routeHandler}
								icon={
									<ReceiptTextIcon
										size={24}
										strokeWidth={
											routesHook.route === 'Invoices' &&
											!routesHook.showHelp &&
											!routesHook.showSettings
												? 2.5
												: 2
										}
										color={
											routesHook.route === 'Invoices' &&
											!routesHook.showHelp &&
											!routesHook.showSettings
												? 'var(--color-primary)'
												: 'light-dark(var(--color-dark-1),var(--color-light-1))'
										}
									/>
								}
								route={routesHook.route}
								routeName="Invoices"
								textOverride={
									general.language === 'deutsch'
										? 'Rechnungen'
										: 'Invoices'
								}
							/>
						</>
					) : (
						<></>
					)}
					{database.databases.document_db !== null &&
					database.databases.document_db.includes('quotes') ? (
						<>
							<RouterButton
								active={
									!routesHook.showHelp && !routesHook.showSettings
								}
								handler={routeHandler}
								icon={
									<FileOutputIcon
										size={24}
										strokeWidth={
											routesHook.route === 'Quotes' ? 2.5 : 2
										}
										color={
											routesHook.route === 'Quotes' &&
											!routesHook.showHelp &&
											!routesHook.showSettings
												? 'var(--color-primary)'
												: 'light-dark(var(--color-dark-1),var(--color-light-1))'
										}
									/>
								}
								route={routesHook.route}
								routeName="Quotes"
								textOverride={
									general.language === 'deutsch'
										? 'Angebote'
										: 'Quotes'
								}
							/>
						</>
					) : (
						<></>
					)}
					{database.databases.document_db !== null &&
					database.databases.document_db.includes('returnees') ? (
						<>
							<RouterButton
								active={
									!routesHook.showHelp && !routesHook.showSettings
								}
								handler={routeHandler}
								icon={
									<RotateCcwIcon
										size={24}
										strokeWidth={
											routesHook.route === 'Returnees' ? 2.5 : 2
										}
										color={
											routesHook.route === 'Returnees' &&
											!routesHook.showHelp &&
											!routesHook.showSettings
												? 'var(--color-primary)'
												: 'light-dark(var(--color-dark-1),var(--color-light-1))'
										}
									/>
								}
								route={routesHook.route}
								routeName="Returnees"
								textOverride={
									general.language === 'deutsch'
										? 'Rückgaben'
										: 'Returnees'
								}
							/>
						</>
					) : (
						<></>
					)}
				</div>
				<div className="bottomIcons">
					<LowerButton
						handler={() => {
							routesHook.setShowSettings(false);
							routesHook.setShowHelp(true);
						}}
						icon={
							<HelpCircle
								size={24}
								strokeWidth={routesHook.showHelp ? 2.5 : 2}
								color={
									routesHook.showHelp
										? 'var(--color-primary)'
										: 'light-dark(var(--color-dark-1),var(--color-light-1))'
								}
							/>
						}
						text={general.language === 'deutsch' ? 'Hilfe' : 'Help'}
						active={routesHook.showHelp}
					/>
					<LowerButton
						handler={() => {
							routesHook.setShowHelp(false);
							routesHook.setShowSettings(true);
						}}
						icon={
							<CogIcon
								size={24}
								strokeWidth={routesHook.showSettings ? 2.5 : 2}
								color={
									routesHook.showSettings
										? 'var(--color-primary)'
										: 'light-dark(var(--color-dark-1),var(--color-light-1))'
								}
							/>
						}
						text={
							general.language === 'deutsch'
								? 'Einstellungen'
								: 'Settings'
						}
						active={routesHook.showSettings}
					/>
				</div>
			</div>
		</>
	);
}
