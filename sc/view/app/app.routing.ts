import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule }   from '@angular/router';

import { ShakeCastComponent } from './shakecast/shakecast.component'
import { shakecastRoutes } from './shakecast/shakecast.routing'

import { loginRoutes } from './login/login.routing'

import { AuthGuard } from './auth/auth.guard'

const appRoutes: Routes = [
    ...shakecastRoutes,
    ...loginRoutes
];

export const appRoutingProviders: any[] = [
    AuthGuard
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
