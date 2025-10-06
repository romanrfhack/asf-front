import { inject } from '@angular/core';
import { CanMatchFn, Route } from '@angular/router';
import { AuthService } from './auth.service';
import { Role } from './models';

export const roleGuard: CanMatchFn = (route: Route) => {
  const auth = inject(AuthService);
  const allowed = (route.data?.['roles'] as Role[] | undefined) ?? [];
  const current = auth.role();
  return allowed.length === 0 || !!current && allowed.includes(current);
};
