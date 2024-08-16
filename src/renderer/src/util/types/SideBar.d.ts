import React from 'react';
import type { RouteType } from './routes';
export interface SideBarPros {
	routesHook: {
		route: RouteType;
		setRoute: Function<RouteType>;
	};
}
