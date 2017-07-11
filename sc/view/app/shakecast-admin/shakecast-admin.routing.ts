import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule }   from '@angular/router';

import { ShakeCastAdminComponent } from './shakecast-admin.component';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { FacilitiesComponent } from './pages/facilities/facilities.component';
import { GroupsComponent } from './pages/groups/groups.component';
import { UsersComponent } from './pages/users/users.component';
import { ConfigComponent } from './pages/config/config.component';
import { ScenariosComponent } from './pages/scenarios/scenarios.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';

import { LoginGuard } from '../auth/login.guard'
import { AdminGuard } from '../auth/admin.guard'

const appRoutes: Routes = [
    {
        path: '',
        component: ShakeCastAdminComponent,
        canActivate: [LoginGuard, AdminGuard],
        children: [
            {
                path: 'facilities',
                component: FacilitiesComponent
            },
            {
                path: 'groups',
                component: GroupsComponent
            },
            {
                path: 'users',
                component: UsersComponent
            },
            {
                path: 'scenarios',
                component: ScenariosComponent
            },
            {
                path: 'notifications',
                component: NotificationsComponent
            },
            {
                path: 'config',
                component: ConfigComponent
            },
            {
                path: '',
                redirectTo: 'facilities',
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
