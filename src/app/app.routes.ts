import { Routes } from '@angular/router';
import { Login } from './components/pages/login/login/login';
import { Signup } from './components/pages/signup/signup/signup';
import { Dashboard } from './components/pages/dashboard/dashboard/dashboard';
import { Locating } from './components/pages/locating/locating/locating';
import { Events } from './components/pages/events/events/events';
import { Reports } from './components/pages/reports/reports/reports';
import { CreateReport } from './components/pages/reports/create-report/create-report';
import { Layout } from './components/shared/layout/layout';
// DEMO MODE: Auth guard import kept for reference
// import { authGuard } from './components/guard/auth-guard';
import { Administration } from './components/pages/administration/administration/administration';
import { Configuration } from './components/pages/administration/configuration/configuration';
import { License } from './components/pages/administration/license/license';
import { UserManagement } from './components/pages/administration/user-management/user-management';
import { User } from './components/pages/administration/user-management/user/user';
import { Role } from './components/pages/administration/user-management/role/role';
import { CreateRole } from './components/pages/administration/user-management/create-role/create-role';

import { Projects } from './components/pages/administration/configuration/projects/projects';
import { Devices } from './components/pages/administration/configuration/devices/devices';
import { Assets } from './components/pages/administration/configuration/assets/assets';
import { AssetLocationHistory } from './components/pages/administration/configuration/assets/location-history/location-history';
import { AssetAssignmentOwnership } from './components/pages/administration/configuration/assets/assignment-ownership/assignment-ownership';
import { AssetLifecycle } from './components/pages/administration/configuration/assets/asset-lifecycle/asset-lifecycle';
import { AssetTrackingTelemetry } from './components/pages/administration/configuration/assets/tracking-telemetry/tracking-telemetry';
import { AssetMaintenanceService } from './components/pages/administration/configuration/assets/maintenance-service/maintenance-service';
import { AssetUtilizationPerformance } from './components/pages/administration/configuration/assets/utilization-performance/utilization-performance';
import { AssetFinancial } from './components/pages/administration/configuration/assets/financial/financial';
import { AssetDocumentAttachment } from './components/pages/administration/configuration/assets/document-attachment/document-attachment';
import { AssetWarrantyContract } from './components/pages/administration/configuration/assets/warranty-contract/warranty-contract';
import { AssetAlertIncident } from './components/pages/administration/configuration/assets/alert-incident/alert-incident';
import { AssetAuditVerification } from './components/pages/administration/configuration/assets/audit-verification/audit-verification';
import { AssetActivityAuditTrail } from './components/pages/administration/configuration/assets/activity-audit-trail/activity-audit-trail';
import { AssetCustomDomainFields } from './components/pages/administration/configuration/assets/custom-domain-fields/custom-domain-fields';
import { AssetIntegration } from './components/pages/administration/configuration/assets/integration/integration';
import { AssetComplianceCertification } from './components/pages/administration/configuration/assets/compliance-certification/compliance-certification';
import { ProcessAutomation } from './components/pages/process-automation/process-automation/process-automation';
import { ProcessAutomationAdd } from './components/pages/process-automation/process-automation-add/process-automation-add';

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
      { path: 'report/create', component: CreateReport },
      { path: 'process-automation', component: ProcessAutomation },
      { path: 'process-automation/add', component: ProcessAutomationAdd },
      {
        path: 'administration',
        component: Administration,
        children: [
          { path: '', redirectTo: 'configuration', pathMatch: 'full' },
          {
            path: 'configuration',
            component: Configuration,
            children: [
              { path: '', redirectTo: 'projects', pathMatch: 'full' },
              { path: 'projects', component: Projects },
              { path: 'devices', component: Devices },
              { path: 'assets', component: Assets },
              { path: 'assets/asset-registry', component: Assets },
              { path: 'assets/location-history', component: AssetLocationHistory },
              { path: 'assets/assignment-ownership', component: AssetAssignmentOwnership },
              { path: 'assets/asset-lifecycle', component: AssetLifecycle },
              { path: 'assets/tracking-telemetry', component: AssetTrackingTelemetry },
              { path: 'assets/maintenance-service', component: AssetMaintenanceService },
              { path: 'assets/utilization-performance', component: AssetUtilizationPerformance },
              { path: 'assets/financial', component: AssetFinancial },
              { path: 'assets/document-attachment', component: AssetDocumentAttachment },
              { path: 'assets/warranty-contract', component: AssetWarrantyContract },
              { path: 'assets/alert-incident', component: AssetAlertIncident },
              { path: 'assets/audit-verification', component: AssetAuditVerification },
              { path: 'assets/activity-audit-trail', component: AssetActivityAuditTrail },
              { path: 'assets/custom-domain-fields', component: AssetCustomDomainFields },
              { path: 'assets/integration', component: AssetIntegration },
              { path: 'assets/compliance-certification', component: AssetComplianceCertification }
            ]
          },
          { path: 'license', component: License },
          {
            path: 'user-management',
            component: UserManagement,
            children: [
              { path: '', redirectTo: 'user', pathMatch: 'full' },
              { path: 'user', component: User },
              { path: 'role', component: Role },
              { path: 'role/create', component: CreateRole }
            ]
          }
        ]
      }
    ]
  }
];

