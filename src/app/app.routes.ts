import { Routes } from '@angular/router';
import { Login } from './components/pages/login/login/login';
import { Signup } from './components/pages/signup/signup/signup';
import { Dashboard } from './components/pages/dashboard/dashboard/dashboard';
import { Locating } from './components/pages/locating/locating/locating';
import { Events } from './components/pages/events/events/events';
import { Reports } from './components/pages/reports/reports/reports';
import { ProcessAutomation } from './components/pages/process-automation/process-automation/process-automation';
import { ProcessAutomationAdd } from './components/pages/process-automation/process-automation-add/process-automation-add';
import { Layout } from './components/shared/layout/layout';
// DEMO MODE: Auth guard import kept for reference
// import { authGuard } from './components/guard/auth-guard';
import { Administration } from './components/pages/administration/administration/administration';
import { Configuration } from './components/pages/administration/configuration/configuration';
import { License } from './components/pages/administration/license/license';
import { UserManagement } from './components/pages/administration/user-management/user-management';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  {
    path: '',
    component: Layout,
    // DEMO MODE: Auth guard is disabled
    // canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'locating', component: Locating },
      { path: 'events', component: Events },
      { path: 'report', component: Reports },
      { path: 'process-automation', component: ProcessAutomation },
      { path: 'process-automation/add', component: ProcessAutomationAdd },
      {
        path: 'administration',
        component: Administration,
        children: [
          { path: '', redirectTo: 'configuration', pathMatch: 'full' },
          { path: 'configuration', component: Configuration },
          { path: 'license', component: License },
          { path: 'user-management', component: UserManagement }
        ]
      }
    ]
  }
];

