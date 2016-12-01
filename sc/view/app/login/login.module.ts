import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';

import { LoginComponent }    from './login.component';
//import { loginRouting } from './login.routing';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
//    loginRouting
  ],
  declarations: [
    LoginComponent
  ],
  providers: [
  ]
})
export class LoginModule {}