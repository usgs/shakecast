import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule }   from '@angular/router';

import { ShakeCastComponent } from './shakecast.component'

import { DashboardComponent } from './pages/dashboard/dashboard.component'
import { EarthquakesComponent } from './pages/earthquakes/earthquakes.component'

import { AuthGuard } from '../auth/auth.guard'

const appRoutes: Routes = [
    {
        path: '',
        component: ShakeCastComponent,
        canActivate: [AuthGuard],
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
                redirectTo: '/dashboard',
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
