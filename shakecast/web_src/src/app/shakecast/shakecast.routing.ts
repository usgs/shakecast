import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule }   from '@angular/router';

import { ShakeCastComponent } from './shakecast.component'

import { DashboardComponent } from './pages/dashboard/dashboard.component'
import { UserProfileComponent } from './pages/user-profile/user-profile.component'

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
                path: 'user-profile',
                component: UserProfileComponent
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
