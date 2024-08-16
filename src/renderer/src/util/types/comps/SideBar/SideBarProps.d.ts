import React from 'react';
import type { RouteType } from './routes';
export interface SideBarProps {
	routesHook: {
		route: RouteType;
		setRoute: (newVal: RouteType) => void;
	};
}

export interface RouterButtonProps {
	route: RouteType;
	handler: (newVal: RouteType) => void;
	routeName: RouteType;
	icon: React.ReactNode;
	textOverride?: string;
}
