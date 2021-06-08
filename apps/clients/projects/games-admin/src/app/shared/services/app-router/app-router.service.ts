import { Injectable } from '@angular/core';
import { Router, Route, ActivatedRoute } from '@angular/router';

import { OrganizationId } from '@end/global';

type RouteData = {
  key: string;
};

type AppRoute = Omit<Route, 'data'> & {
  data?: RouteData;
  children?: AppRoutes;
};

export enum RouteParams {
  organizationId = 'organizationId',
}

export type AppRoutes = AppRoute[];
@Injectable({
  providedIn: 'root',
})
export class AppRouterService {
  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  goToHome() {
    return this.router.navigate(['/home']);
  }

  goToLogin() {
    return this.router.navigate(['/users/auth/signin']);
  }

  getRouteData() {
    let route = this.activatedRoute.snapshot.root;
    let params = { ...route.params };
    let data = route.data as RouteData;

    while (route.firstChild) {
      route = route.firstChild;
      params = { ...params, ...route.params };
      data = { ...data, ...route.data };
    }
    data = { ...data, ...route.data };

    const {
      url,
      root: { queryParams },
    } = this.activatedRoute.snapshot;

    return { url, params, queryParams, data };
  }

  isRouteActive(key: RouteData['key']) {
    const state = this.getRouteData();
    return state.data?.key === key;
  }

  getOrganizationId(): OrganizationId | undefined {
    return this.getRouteData().params[RouteParams.organizationId];
  }
}
