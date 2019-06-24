import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { shakecastRoutes } from './shakecast/shakecast.routing';
import { LoginComponent } from './login/login.component';
import { shakecastAdminRoutes } from './shakecast-admin/shakecast-admin.routing';

import { LoginGuard } from './auth/login.guard';
import { AdminGuard } from './auth/admin.guard';

const appRoutes: Routes = [
    ...shakecastRoutes,
    ...shakecastAdminRoutes,
    {
        path: 'login',
        component: LoginComponent
    }
];

export const appRoutingProviders: any[] = [
    LoginGuard,
    AdminGuard
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
