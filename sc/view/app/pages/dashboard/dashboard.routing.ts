import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule }   from '@angular/router';

import {DashboardComponent} from './dashboard.component'

const appRoutes: Routes = [
    {
        path: 'dashboard',
        component: DashboardComponent
    },
];

export const appRoutingProviders: any[] = [

];

export const dashboardRouting: ModuleWithProviders = RouterModule.forChild(appRoutes);
