import React, { useEffect, useState } from 'react';
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
	File,
} from 'lucide-react';
// non-lib imports
import { RouterButton } from './RouterButton';
import { LowerButton } from './LowerButton';
import { useAppContext, solids } from '@app';
import { RouteType, SideBarProps } from '@typings';
import './SideBar.css';

export function SideBar({ routesHook }: SideBarProps): React.JSX.Element {
	const { appearances, general, database } = useAppContext();
	const [sideBarWidth, setSideBarWidth] = useState<number>(appearances.sideBarWidth);
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
								size={solids.icon.size.regular}
								strokeWidth={
									routesHook.route === 'Home' && !routesHook.showHelp && !routesHook.showSettings
										? solids.icon.strokeWidth.large
										: solids.icon.strokeWidth.regular
								}
								color={
									routesHook.route === 'Home' && !routesHook.showHelp && !routesHook.showSettings
										? 'var(--color-primary)'
										: 'light-dark(var(--color-dark-1),var(--color-light-1))'
								}
							/>
						}
						route={routesHook.route}
						routeName="Home"
						textOverride={general.language === 'deutsch' ? 'Start' : 'Home'}
					/>

					<RouterButton
						handler={routeHandler}
						active={!routesHook.showHelp && !routesHook.showSettings}
						icon={
							<UploadIcon
								size={solids.icon.size.regular}
								strokeWidth={
									routesHook.route === 'Upload' && !routesHook.showHelp && !routesHook.showSettings
										? solids.icon.strokeWidth.large
										: solids.icon.strokeWidth.regular
								}
								color={
									routesHook.route === 'Upload' && !routesHook.showHelp && !routesHook.showSettings
										? 'var(--color-primary)'
										: 'light-dark(var(--color-dark-1),var(--color-light-1))'
								}
							/>
						}
						route={routesHook.route}
						routeName="Upload"
						textOverride={general.language === 'deutsch' ? 'Hochladen' : 'Upload'}
					/>
					<RouterButton
						handler={routeHandler}
						active={!routesHook.showHelp && !routesHook.showSettings}
						icon={
							<ArrowRightFromLineIcon
								size={solids.icon.size.regular}
								strokeWidth={
									routesHook.route === 'ExportPage' && !routesHook.showHelp && !routesHook.showSettings
										? solids.icon.strokeWidth.large
										: solids.icon.strokeWidth.regular
								}
								color={
									routesHook.route === 'ExportPage' && !routesHook.showHelp && !routesHook.showSettings
										? 'var(--color-primary)'
										: 'light-dark(var(--color-dark-1),var(--color-light-1))'
								}
							/>
						}
						route={routesHook.route}
						routeName="ExportPage"
						textOverride={general.language === 'deutsch' ? 'Exportieren' : 'Export'}
					/>
					<RouterButton
						handler={routeHandler}
						active={!routesHook.showHelp && !routesHook.showSettings}
						icon={
							<File
								size={solids.icon.size.regular}
								strokeWidth={
									routesHook.route === 'Templates' && !routesHook.showHelp && !routesHook.showSettings
										? solids.icon.strokeWidth.large
										: solids.icon.strokeWidth.regular
								}
								color={
									routesHook.route === 'Templates' && !routesHook.showHelp && !routesHook.showSettings
										? 'var(--color-primary)'
										: 'light-dark(var(--color-dark-1),var(--color-light-1))'
								}
							/>
						}
						route={routesHook.route}
						routeName="Templates"
						textOverride={general.language === 'deutsch' ? 'Vorlagen' : 'Templates'}
					/>
					<div className="divider" />
					{database.databases.article_db !== null ? (
						<>
							<RouterButton
								active={!routesHook.showHelp && !routesHook.showSettings}
								handler={routeHandler}
								icon={
									<CuboidIcon
										size={solids.icon.size.regular}
										strokeWidth={
											routesHook.route === 'Articles' && !routesHook.showHelp && !routesHook.showSettings
												? solids.icon.strokeWidth.large
												: solids.icon.strokeWidth.regular
										}
										color={
											routesHook.route === 'Articles' && !routesHook.showHelp && !routesHook.showSettings
												? 'var(--color-primary)'
												: 'light-dark(var(--color-dark-1),var(--color-light-1))'
										}
									/>
								}
								route={routesHook.route}
								routeName="Articles"
								textOverride={general.language === 'deutsch' ? 'Artikel' : 'Articles'}
							/>
						</>
					) : (
						<></>
					)}
					{database.databases.customer_db !== null ? (
						<>
							<RouterButton
								active={!routesHook.showHelp && !routesHook.showSettings}
								handler={routeHandler}
								icon={
									<UserRoundIcon
										size={solids.icon.size.regular}
										strokeWidth={
											routesHook.route === 'Customers' && !routesHook.showHelp && !routesHook.showSettings
												? solids.icon.strokeWidth.large
												: solids.icon.strokeWidth.regular
										}
										color={
											routesHook.route === 'Customers' && !routesHook.showHelp && !routesHook.showSettings
												? 'var(--color-primary)'
												: 'light-dark(var(--color-dark-1),var(--color-light-1))'
										}
									/>
								}
								route={routesHook.route}
								routeName="Customers"
								textOverride={general.language === 'deutsch' ? 'Kunden' : 'Customers'}
							/>
						</>
					) : (
						<></>
					)}
					{database.databases.document_db !== null && database.databases.document_db.includes('deliveries') ? (
						<>
							<RouterButton
								active={!routesHook.showHelp && !routesHook.showSettings}
								handler={routeHandler}
								icon={
									<TruckIcon
										size={solids.icon.size.regular}
										strokeWidth={
											routesHook.route === 'Deliveries' && !routesHook.showHelp && !routesHook.showSettings
												? solids.icon.strokeWidth.large
												: solids.icon.strokeWidth.regular
										}
										color={
											routesHook.route === 'Deliveries' && !routesHook.showHelp && !routesHook.showSettings
												? 'var(--color-primary)'
												: 'light-dark(var(--color-dark-1),var(--color-light-1))'
										}
									/>
								}
								route={routesHook.route}
								routeName="Deliveries"
								textOverride={general.language === 'deutsch' ? 'Lieferungen' : 'Deliveries'}
							/>
						</>
					) : (
						<></>
					)}
					{database.databases.document_db !== null && database.databases.document_db.includes('invoices') ? (
						<>
							<RouterButton
								active={!routesHook.showHelp && !routesHook.showSettings}
								handler={routeHandler}
								icon={
									<ReceiptTextIcon
										size={solids.icon.size.regular}
										strokeWidth={
											routesHook.route === 'Invoices' && !routesHook.showHelp && !routesHook.showSettings
												? solids.icon.strokeWidth.large
												: solids.icon.strokeWidth.regular
										}
										color={
											routesHook.route === 'Invoices' && !routesHook.showHelp && !routesHook.showSettings
												? 'var(--color-primary)'
												: 'light-dark(var(--color-dark-1),var(--color-light-1))'
										}
									/>
								}
								route={routesHook.route}
								routeName="Invoices"
								textOverride={general.language === 'deutsch' ? 'Rechnungen' : 'Invoices'}
							/>
						</>
					) : (
						<></>
					)}
					{database.databases.document_db !== null && database.databases.document_db.includes('quotes') ? (
						<>
							<RouterButton
								active={!routesHook.showHelp && !routesHook.showSettings}
								handler={routeHandler}
								icon={
									<FileOutputIcon
										size={solids.icon.size.regular}
										strokeWidth={routesHook.route === 'Quotes' ? solids.icon.strokeWidth.large : solids.icon.strokeWidth.regular}
										color={
											routesHook.route === 'Quotes' && !routesHook.showHelp && !routesHook.showSettings
												? 'var(--color-primary)'
												: 'light-dark(var(--color-dark-1),var(--color-light-1))'
										}
									/>
								}
								route={routesHook.route}
								routeName="Quotes"
								textOverride={general.language === 'deutsch' ? 'Angebote' : 'Quotes'}
							/>
						</>
					) : (
						<></>
					)}
					{database.databases.document_db !== null && database.databases.document_db.includes('returnees') ? (
						<>
							<RouterButton
								active={!routesHook.showHelp && !routesHook.showSettings}
								handler={routeHandler}
								icon={
									<RotateCcwIcon
										size={solids.icon.size.regular}
										strokeWidth={routesHook.route === 'Returnees' ? solids.icon.strokeWidth.large : solids.icon.strokeWidth.regular}
										color={
											routesHook.route === 'Returnees' && !routesHook.showHelp && !routesHook.showSettings
												? 'var(--color-primary)'
												: 'light-dark(var(--color-dark-1),var(--color-light-1))'
										}
									/>
								}
								route={routesHook.route}
								routeName="Returnees"
								textOverride={general.language === 'deutsch' ? 'Rückgaben' : 'Returnees'}
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
								size={solids.icon.size.regular}
								strokeWidth={routesHook.showHelp ? solids.icon.strokeWidth.large : solids.icon.strokeWidth.regular}
								color={routesHook.showHelp ? 'var(--color-primary)' : 'light-dark(var(--color-dark-1),var(--color-light-1))'}
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
								size={solids.icon.size.regular}
								strokeWidth={routesHook.showSettings ? solids.icon.strokeWidth.large : solids.icon.strokeWidth.regular}
								color={routesHook.showSettings ? 'var(--color-primary)' : 'light-dark(var(--color-dark-1),var(--color-light-1))'}
							/>
						}
						text={general.language === 'deutsch' ? 'Einstellungen' : 'Settings'}
						active={routesHook.showSettings}
					/>
				</div>
			</div>
		</>
	);
}
