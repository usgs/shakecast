import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule }   from '@angular/router';

import { ShakeCastComponent } from './shakecast.component'

import { DashboardComponent } from './pages/dashboard/dashboard.component'
import { EarthquakesComponent } from './pages/earthquakes/earthquakes.component'

import { LoginGuard } from '../auth/login.guard'

const appRoutes: Routes = [
    {
        path: '',
        component: ShakeCastComponent,
        canActivate: [LoginGuard],
        children: [
            {
                path: 'dashboard',
                component: DashboardComponent
            },
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            }
        ]
    }
];

export const shakecastRoutes: Routes = [
    {
        path: '',
        redirectTo: '/shakecast',
        pathMatch: 'full'
    },
    {
        path: 'shakecast',
        loadChildren: 'app/shakecast/shakecast.module#ShakeCastModule'
    }
]

export const routing: ModuleWithProviders = RouterModule.forChild(appRoutes);
