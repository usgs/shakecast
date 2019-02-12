import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule }   from '@angular/router';

import { LoginComponent } from './login.component'

export const loginRoutes: Routes = [
    {
        path: 'login',
        component: LoginComponent
    }
];

