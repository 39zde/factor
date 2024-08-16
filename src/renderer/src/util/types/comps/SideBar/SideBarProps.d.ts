import React from 'react';
import type { RouteType } from './routes';
export interface SideBarProps {
	routesHook: {
		route: RouteType;
		setRoute: (newVal: RouteType) => void;
		showSettings: boolean,
		setShowSettings: (newVal: boolean) => void;
		showHelp: boolean,
		setShowHelp: (newVal: boolean) => void;
	};
}

export interface RouterButtonProps {
	route: RouteType;
	handler: (newVal: RouteType) => void;
	routeName: RouteType;
	icon: React.ReactNode;
	textOverride?: string;
	active: boolean;
}


export interface LowerButtonProps {
	handler: () => void;
	icon: React.ReactNode;
	text: string;
	active: boolean;
}
