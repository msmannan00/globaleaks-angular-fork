import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {LoginComponent} from "./login/login.component";
import {SimpleLoginComponent} from "./login/templates/simple-login/simple-login.component";
import {DefaultLoginComponent} from "./login/templates/default-login/default-login.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NgSelectModule} from "@ng-select/ng-select";
import {PasswordResetComponent} from "./password-reset/password-reset.component";
import {PasswordRequestedComponent} from "@app/pages/auth/passwordreqested/password-requested.component";
import {PasswordResetResponseComponent} from "./password-reset-response/password-reset-response.component";
import {TranslateModule} from "@ngx-translate/core";
import {SharedModule} from "@app/shared.module";

@NgModule({
  declarations: [
    LoginComponent,
    SimpleLoginComponent,
    DefaultLoginComponent,
    PasswordResetComponent,
    PasswordRequestedComponent,
    PasswordResetResponseComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    SharedModule
  ]
})
export class AuthModule {
}