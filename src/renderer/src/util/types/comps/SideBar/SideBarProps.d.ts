import React from 'react';
import type { RouteType } from './routes';
export interface SideBarProps {
	routesHook: {
		route: RouteType;
		setRoute: Function<RouteType>;
	};
}


export interface RouterButtonProps {
	route: RouteType;
	handler: Function;
	routeName: RouteType;
	icon: React.ReactNode;
	textOverride?: string;
}
