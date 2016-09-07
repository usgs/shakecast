import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule }   from '@angular/router';

import {EarthquakeListComponent} from './earthquake-list.component'

const appRoutes: Routes = [
    {
        path: 'earthquakes',
        component: EarthquakeListComponent
    }
];

export const appRoutingProviders: any[] = [

];

export const earthquakesRouting: ModuleWithProviders = RouterModule.forChild(appRoutes);
