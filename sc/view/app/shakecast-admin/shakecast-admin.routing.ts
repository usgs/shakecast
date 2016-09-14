import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule }   from '@angular/router';

import { ShakeCastAdminComponent } from './shakecast-admin.component'

import { DashboardComponent } from './pages/dashboard/dashboard.component'
import { EarthquakesComponent } from './pages/earthquakes/earthquakes.component'

import { LoginGuard } from '../auth/login.guard'
import { AdminGuard } from '../auth/admin.guard'

const appRoutes: Routes = [
    {
        path: '',
        component: ShakeCastAdminComponent,
        canActivate: [LoginGuard, AdminGuard],
        children: [
            {
                path: 'dashboard',
                component: DashboardComponent
            },
            {
                path: 'earthquakes',
                component: EarthquakesComponent
            },
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            }
        ]
    }
];

export const shakecastAdminRoutes: Routes = [
    {
        path: 'shakecast-admin',
        loadChildren: 'app/shakecast-admin/shakecast-admin.module#ShakeCastAdminModule'
    }
]

export const routing: ModuleWithProviders = RouterModule.forChild(appRoutes);
