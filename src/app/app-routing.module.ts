import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { MainComponent } from './components/main/main.component';
import { AuthGuard } from './guards/auth.guard';
import { MainWrapperComponent } from './components/main-wrapper/main-wrapper.component';
import { RegisterComponent } from './components/register/register.component';
import { SettingsComponent } from './components/settings/settings.component';
import { SettingsAccountComponent } from './components/settings/settings-account/settings-account.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: '',
    component: MainWrapperComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: MainComponent,
      },
      {
        path: 'settings',
        component: SettingsComponent,
        children: [
          {
            path: 'account',
            component: SettingsAccountComponent,
          },
        ],
      },
      {
        path: ':id',
        component: MainComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
