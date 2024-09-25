import React, { Fragment, useEffect, useState } from 'react';
import { CogIcon, HomeIcon, UploadIcon, UserRoundIcon, ArrowRightFromLineIcon, CuboidIcon, ReceiptTextIcon, HelpCircle, File } from 'lucide-react';
// non-lib imports
import { RouterButton } from './RouterButton';
import { LowerButton } from './LowerButton';
import { useAppContext, solids } from '@app';
import { getDataBaseDisplayName } from '@util';
import { RouteType, SideBarProps, DataBaseNames } from '@type';
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
			<nav
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
					{window.__USE_TAURI__ ? (
						<>
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
						</>
					) : (
						<></>
					)}
					<div className="divider" />
					{Object.entries(database.databases).map(([key, val]) => {
						if (val !== null) {
							return (
								<Fragment key={key}>
									<RouterButton
										// key={key}
										active={!routesHook.showHelp && !routesHook.showSettings}
										handler={routeHandler}
										icon={
											key === 'customer_db' ? (
												<>
													<UserRoundIcon
														size={solids.icon.size.regular}
														strokeWidth={
															routesHook.route === getDataBaseDisplayName('english', key as DataBaseNames) &&
															!routesHook.showHelp &&
															!routesHook.showSettings
																? solids.icon.strokeWidth.large
																: solids.icon.strokeWidth.regular
														}
														color={
															routesHook.route === getDataBaseDisplayName('english', key as DataBaseNames) &&
															!routesHook.showHelp &&
															!routesHook.showSettings
																? 'var(--color-primary)'
																: 'light-dark(var(--color-dark-1),var(--color-light-1))'
														}
													/>
												</>
											) : key === 'article_db' ? (
												<>
													<CuboidIcon
														size={solids.icon.size.regular}
														strokeWidth={
															routesHook.route === getDataBaseDisplayName('english', key as DataBaseNames) &&
															!routesHook.showHelp &&
															!routesHook.showSettings
																? solids.icon.strokeWidth.large
																: solids.icon.strokeWidth.regular
														}
														color={
															routesHook.route === getDataBaseDisplayName('english', key as DataBaseNames) &&
															!routesHook.showHelp &&
															!routesHook.showSettings
																? 'var(--color-primary)'
																: 'light-dark(var(--color-dark-1),var(--color-light-1))'
														}
													/>
												</>
											) : (
												<>
													<ReceiptTextIcon
														size={solids.icon.size.regular}
														strokeWidth={
															routesHook.route === getDataBaseDisplayName('english', key as DataBaseNames) &&
															!routesHook.showHelp &&
															!routesHook.showSettings
																? solids.icon.strokeWidth.large
																: solids.icon.strokeWidth.regular
														}
														color={
															routesHook.route === getDataBaseDisplayName('english', key as DataBaseNames) &&
															!routesHook.showHelp &&
															!routesHook.showSettings
																? 'var(--color-primary)'
																: 'light-dark(var(--color-dark-1),var(--color-light-1))'
														}
													/>
												</>
											)
										}
										route={routesHook.route}
										routeName={getDataBaseDisplayName('english', key as DataBaseNames) as RouteType}
										textOverride={getDataBaseDisplayName(general.language, key as DataBaseNames)}
									/>
								</Fragment>
							);
						}
					})}
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
			</nav>
		</>
	);
}
