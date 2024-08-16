import React from 'react';
import type { RouteType } from './routes';
export interface SideBarProps {
	routesHook: {
		route: RouteType;
		setRoute: Function<RouteType>;
	};
}
