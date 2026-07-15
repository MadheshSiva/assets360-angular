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
import { MaintenanceWorkOrder } from './components/pages/administration/configuration/maintenance/work-order/work-order';
import { MaintenanceTask } from './components/pages/administration/configuration/maintenance/maintenance-task/maintenance-task';
import { MaintenancePreventive } from './components/pages/administration/configuration/maintenance/preventive-maintenance/preventive-maintenance';
import { MaintenancePredictive } from './components/pages/administration/configuration/maintenance/predictive-maintenance/predictive-maintenance';
import { MaintenanceBreakdownIssueReporting } from './components/pages/administration/configuration/maintenance/breakdown-issue-reporting/breakdown-issue-reporting';
import { MaintenanceSpareParts } from './components/pages/administration/configuration/maintenance/spare-parts/spare-parts';
import { MaintenanceTechnician } from './components/pages/administration/configuration/maintenance/technician/technician';
import { MaintenanceVendorAmc } from './components/pages/administration/configuration/maintenance/vendor-amc/vendor-amc';
import { MaintenanceCostTracking } from './components/pages/administration/configuration/maintenance/cost-tracking/cost-tracking';
import { MaintenanceDowntimeTracking } from './components/pages/administration/configuration/maintenance/downtime-tracking/downtime-tracking';
import { MaintenancePerformance } from './components/pages/administration/configuration/maintenance/performance/performance';
import { MaintenanceComplianceInspection } from './components/pages/administration/configuration/maintenance/compliance-inspection/compliance-inspection';
import { MasterManagementMaster } from './components/pages/administration/configuration/master-management/master-maintenance/master-maintenance';
import { MasterManagementCategorySubcategory } from './components/pages/administration/configuration/master-management/category-subcategory/category-subcategory';
import { MasterManagementAssetType } from './components/pages/administration/configuration/master-management/asset-type/asset-type';
import { MasterManagementAssignedCustodianDepartment } from './components/pages/administration/configuration/master-management/assigned-custodian-department/assigned-custodian-department';
import { MasterManagementCurrentLocation } from './components/pages/administration/configuration/master-management/current-location/current-location';
import { MasterManagementStatusChanges } from './components/pages/administration/configuration/master-management/status-changes/status-changes';
import { MasterManagementTagIds } from './components/pages/administration/configuration/master-management/tag-ids/tag-ids';
import { MasterManagementDepreciationMethod } from './components/pages/administration/configuration/master-management/depreciation-method/depreciation-method';
import { MasterManagementCostCenter } from './components/pages/administration/configuration/master-management/cost-center/cost-center';
import { MasterManagementAlertType } from './components/pages/administration/configuration/master-management/alert-type/alert-type';
import { MasterManagementResolutionStatus } from './components/pages/administration/configuration/master-management/resolution-status/resolution-status';
import { MasterManagementAuditorDetails } from './components/pages/administration/configuration/master-management/auditor-details/auditor-details';
import { MasterManagementPhysicalVerificationResult } from './components/pages/administration/configuration/master-management/physical-verification-result/physical-verification-result';
import { MasterManagementAssetTypeFields } from './components/pages/administration/configuration/master-management/asset-type-fields/asset-type-fields';
import { MasterManagementApiSyncStatusMaster } from './components/pages/administration/configuration/master-management/api-sync-status-master/api-sync-status-master';
import { MasterManagementCertificationTypeMaster } from './components/pages/administration/configuration/master-management/certification-type-master/certification-type-master';
import { MasterManagementWorkType } from './components/pages/administration/configuration/master-management/work-type/work-type';
import { MasterManagementPriority } from './components/pages/administration/configuration/master-management/priority/priority';
import { MasterManagementStatus } from './components/pages/administration/configuration/master-management/status/status';
import { MasterManagementResourceType } from './components/pages/administration/configuration/master-management/resource-type/resource-type';
import { MasterManagementSkillMaster } from './components/pages/administration/configuration/master-management/skill-master/skill-master';
import { MasterManagementShiftMaster } from './components/pages/administration/configuration/master-management/shift-master/shift-master';
import { MasterManagementChecklistTypeMaster } from './components/pages/administration/configuration/master-management/checklist-type-master/checklist-type-master';
import { MasterManagementResponseTypeMaster } from './components/pages/administration/configuration/master-management/response-type-master/response-type-master';
import { MasterManagementConditionMaster } from './components/pages/administration/configuration/master-management/condition-master/condition-master';
import { MasterManagementIssueTypeMaster } from './components/pages/administration/configuration/master-management/issue-type-master/issue-type-master';
import { MasterManagementSeverityMaster } from './components/pages/administration/configuration/master-management/severity-master/severity-master';
import { MasterManagementUnitMaster } from './components/pages/administration/configuration/master-management/unit-master/unit-master';
import { MasterManagementPermitTypeMaster } from './components/pages/administration/configuration/master-management/permit-type-master/permit-type-master';
import { MasterManagementUpdateSourceMaster } from './components/pages/administration/configuration/master-management/update-source-master/update-source-master';
import { MasterManagementChartTypeMaster } from './components/pages/administration/configuration/master-management/chart-type-master/chart-type-master';
import { MasterManagementPermissionMaster } from './components/pages/administration/configuration/master-management/permission-master/permission-master';
import { MasterManagementModuleAccessMaster } from './components/pages/administration/configuration/master-management/module-access-master/module-access-master';
import { ProcessAutomation } from './components/pages/process-automation/process-automation/process-automation';
import { ProcessAutomationAdd } from './components/pages/process-automation/process-automation-add/process-automation-add';
import { WipJobMaster } from './components/pages/administration/configuration/wip/job-master/job-master';
import { WipStatusMaster } from './components/pages/administration/configuration/wip/status-master/status-master';
import { WipResourceMaster } from './components/pages/administration/configuration/wip/resource-master/resource-master';
import { WipTaskMaster } from './components/pages/administration/configuration/wip/task-master/task-master';
import { WipChecklistMaster } from './components/pages/administration/configuration/wip/checklist-master/checklist-master';
import { WipChecklistItems } from './components/pages/administration/configuration/wip/checklist-items/checklist-items';
import { WipLocationMaster } from './components/pages/administration/configuration/wip/location-master/location-master';
import { WipAssetLinking } from './components/pages/administration/configuration/wip/asset-linking/asset-linking';
import { WipSlaMaster } from './components/pages/administration/configuration/wip/sla-master/sla-master';
import { WipIssueDelay } from './components/pages/administration/configuration/wip/issue-delay/issue-delay';
import { WipMaterialConsumption } from './components/pages/administration/configuration/wip/material-consumption/material-consumption';
import { WipPermitCompliance } from './components/pages/administration/configuration/wip/permit-compliance/permit-compliance';
import { WipProgressLog } from './components/pages/administration/configuration/wip/progress-log/progress-log';
import { WipAlerts } from './components/pages/administration/configuration/wip/alerts/alerts';
import { WipKpiConfig } from './components/pages/administration/configuration/wip/kpi-config/kpi-config';
import { WipRoleAccess } from './components/pages/administration/configuration/wip/role-access/role-access';

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
              { path: 'assets/compliance-certification', component: AssetComplianceCertification },
              { path: 'maintenance', redirectTo: 'maintenance/work-order', pathMatch: 'full' },
              { path: 'maintenance/work-order', component: MaintenanceWorkOrder },
              { path: 'maintenance/maintenance-task', component: MaintenanceTask },
              { path: 'maintenance/preventive-maintenance', component: MaintenancePreventive },
              { path: 'maintenance/predictive-maintenance', component: MaintenancePredictive },
              { path: 'maintenance/breakdown-issue-reporting', component: MaintenanceBreakdownIssueReporting },
              { path: 'maintenance/spare-parts', component: MaintenanceSpareParts },
              { path: 'maintenance/technician', component: MaintenanceTechnician },
              { path: 'maintenance/vendor-amc', component: MaintenanceVendorAmc },
              { path: 'maintenance/cost-tracking', component: MaintenanceCostTracking },
              { path: 'maintenance/downtime-tracking', component: MaintenanceDowntimeTracking },
              { path: 'maintenance/performance', component: MaintenancePerformance },
              { path: 'maintenance/compliance-inspection', component: MaintenanceComplianceInspection },
              { path: 'wip', redirectTo: 'wip/job-master', pathMatch: 'full' },
              { path: 'wip/job-master', component: WipJobMaster },
              { path: 'wip/status-master', component: WipStatusMaster },
              { path: 'wip/resource-master', component: WipResourceMaster },
              { path: 'wip/task-master', component: WipTaskMaster },
              { path: 'wip/checklist-master', component: WipChecklistMaster },
              { path: 'wip/checklist-items', component: WipChecklistItems },
              { path: 'wip/location-master', component: WipLocationMaster },
              { path: 'wip/asset-linking', component: WipAssetLinking },
              { path: 'wip/sla-master', component: WipSlaMaster },
              { path: 'wip/issue-delay', component: WipIssueDelay },
              { path: 'wip/material-consumption', component: WipMaterialConsumption },
              { path: 'wip/permit-compliance', component: WipPermitCompliance },
              { path: 'wip/progress-log', component: WipProgressLog },
              { path: 'wip/alerts', component: WipAlerts },
              { path: 'wip/kpi-config', component: WipKpiConfig },
              { path: 'wip/role-access', component: WipRoleAccess },
              { path: 'master-management', redirectTo: 'master-management/master-maintenance', pathMatch: 'full' },
              { path: 'master-management/master-maintenance', component: MasterManagementMaster },
              { path: 'master-management/category-subcategory', component: MasterManagementCategorySubcategory },
              { path: 'master-management/asset-type', component: MasterManagementAssetType },
              { path: 'master-management/assigned-custodian-department', component: MasterManagementAssignedCustodianDepartment },
              { path: 'master-management/current-location', component: MasterManagementCurrentLocation },
              { path: 'master-management/status-changes', component: MasterManagementStatusChanges },
              { path: 'master-management/tag-ids', component: MasterManagementTagIds },
              { path: 'master-management/depreciation-method', component: MasterManagementDepreciationMethod },
              { path: 'master-management/cost-center', component: MasterManagementCostCenter },
              { path: 'master-management/alert-type', component: MasterManagementAlertType },
              { path: 'master-management/resolution-status', component: MasterManagementResolutionStatus },
              { path: 'master-management/auditor-details', component: MasterManagementAuditorDetails },
              { path: 'master-management/physical-verification-result', component: MasterManagementPhysicalVerificationResult },
              { path: 'master-management/asset-type-fields', component: MasterManagementAssetTypeFields },
              { path: 'master-management/api-sync-status-master', component: MasterManagementApiSyncStatusMaster },
              { path: 'master-management/certification-type-master', component: MasterManagementCertificationTypeMaster },
              { path: 'master-management/work-type', component: MasterManagementWorkType },
              { path: 'master-management/priority', component: MasterManagementPriority },
              { path: 'master-management/status', component: MasterManagementStatus },
              { path: 'master-management/resource-type', component: MasterManagementResourceType },
              { path: 'master-management/skill-master', component: MasterManagementSkillMaster },
              { path: 'master-management/shift-master', component: MasterManagementShiftMaster },
              { path: 'master-management/checklist-type-master', component: MasterManagementChecklistTypeMaster },
              { path: 'master-management/response-type-master', component: MasterManagementResponseTypeMaster },
              { path: 'master-management/condition-master', component: MasterManagementConditionMaster },
              { path: 'master-management/issue-type-master', component: MasterManagementIssueTypeMaster },
              { path: 'master-management/severity-master', component: MasterManagementSeverityMaster },
              { path: 'master-management/unit-master', component: MasterManagementUnitMaster },
              { path: 'master-management/permit-type-master', component: MasterManagementPermitTypeMaster },
              { path: 'master-management/update-source-master', component: MasterManagementUpdateSourceMaster },
              { path: 'master-management/chart-type-master', component: MasterManagementChartTypeMaster },
              { path: 'master-management/permission-master', component: MasterManagementPermissionMaster },
              { path: 'master-management/module-access-master', component: MasterManagementModuleAccessMaster }
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

