import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Breadcrumb } from '../../../shared/breadcrumb/breadcrumb';

interface BreadcrumbItem {
  label: string;
  path: string | null;
}

interface BreadcrumbOption {
  label: string;
  path: string;
}

@Component({
  standalone: true,
  selector: 'app-administration',
  imports: [CommonModule, RouterModule, RouterOutlet, Breadcrumb],
  templateUrl: './administration.html',
  styleUrls: ['./administration.css']
})
export class Administration {
  showLanding = true;
  breadcrumbItems: BreadcrumbItem[] = [];
  dropdownOptions = new Map<string, BreadcrumbOption[]>();

  adminOptions: BreadcrumbOption[] = [
    { label: 'Configuration', path: '/administration/configuration' },
    { label: 'License', path: '/administration/license' },
    { label: 'User Management', path: '/administration/user-management' }
  ];

  userMgmtOptions: BreadcrumbOption[] = [
    { label: 'User', path: '/administration/user-management/user' },
    { label: 'Role', path: '/administration/user-management/role' }
  ];

  configOptions: BreadcrumbOption[] = [
    { label: 'Projects', path: '/administration/configuration/projects' },
    { label: 'Devices', path: '/administration/configuration/devices' },
    { label: 'Assets', path: '/administration/configuration/assets' },
    { label: 'Maintenance', path: '/administration/configuration/maintenance' },
    { label: 'Workflows', path: '/administration/configuration/workflows' },
    { label: 'WIP', path: '/administration/configuration/wip' },
    { label: 'Master Management', path: '/administration/configuration/master-management' },

  ];

  assetsOptions: BreadcrumbOption[] = [
    { label: 'Asset Registry', path: '/administration/configuration/assets/asset-registry' },
    { label: 'Location History', path: '/administration/configuration/assets/location-history' },
    { label: 'Assignment / Ownership', path: '/administration/configuration/assets/assignment-ownership' },
    { label: 'Asset Lifecycle', path: '/administration/configuration/assets/asset-lifecycle' },
    { label: 'Tracking & Telemetry', path: '/administration/configuration/assets/tracking-telemetry' },
    { label: 'Maintenance & Service', path: '/administration/configuration/assets/maintenance-service' },
    { label: 'Utilization & Performance', path: '/administration/configuration/assets/utilization-performance' },
    { label: 'Financial', path: '/administration/configuration/assets/financial' },
    { label: 'Document & Attachment', path: '/administration/configuration/assets/document-attachment' },
    { label: 'Warranty & Contract', path: '/administration/configuration/assets/warranty-contract' },
    { label: 'Alert & Incident', path: '/administration/configuration/assets/alert-incident' },
    { label: 'Audit & Verification', path: '/administration/configuration/assets/audit-verification' },
    { label: 'Activity / Audit Trail', path: '/administration/configuration/assets/activity-audit-trail' },
    { label: 'Custom / Domain-specific Asset Type Fields', path: '/administration/configuration/assets/custom-domain-fields' },
    { label: 'Integration', path: '/administration/configuration/assets/integration' },
    { label: 'Compliance & Certification', path: '/administration/configuration/assets/compliance-certification' }
  ];

  maintenanceOptions: BreadcrumbOption[] = [
    { label: 'Work Order', path: '/administration/configuration/maintenance/work-order' },
    { label: 'Maintenance Task', path: '/administration/configuration/maintenance/maintenance-task' },
    { label: 'Preventive Maintenance', path: '/administration/configuration/maintenance/preventive-maintenance' },
    { label: 'Predictive Maintenance', path: '/administration/configuration/maintenance/predictive-maintenance' },
    { label: 'Breakdown / Issue Reporting', path: '/administration/configuration/maintenance/breakdown-issue-reporting' },
    { label: 'Spare Parts', path: '/administration/configuration/maintenance/spare-parts' },
    { label: 'Technician', path: '/administration/configuration/maintenance/technician' },
    { label: 'Vendor / AMC', path: '/administration/configuration/maintenance/vendor-amc' },
    { label: 'Cost Tracking', path: '/administration/configuration/maintenance/cost-tracking' },
    { label: 'Downtime Tracking', path: '/administration/configuration/maintenance/downtime-tracking' },
    { label: 'Performance', path: '/administration/configuration/maintenance/performance' },
    { label: 'Compliance & Inspection', path: '/administration/configuration/maintenance/compliance-inspection' }
  ];

  wipOptions: BreadcrumbOption[] = [
    { label: 'Job Master', path: '/administration/configuration/wip/job-master' },
    { label: 'Status Master', path: '/administration/configuration/wip/status-master' },
    { label: 'Resource Master', path: '/administration/configuration/wip/resource-master' },
    { label: 'Task Master', path: '/administration/configuration/wip/task-master' },
    { label: 'Checklist Master', path: '/administration/configuration/wip/checklist-master' },
    { label: 'Checklist Items', path: '/administration/configuration/wip/checklist-items' },
    { label: 'Location Master', path: '/administration/configuration/wip/location-master' },
    { label: 'Asset Linking', path: '/administration/configuration/wip/asset-linking' },
    { label: 'SLA Master', path: '/administration/configuration/wip/sla-master' },
    { label: 'Issue / Delay', path: '/administration/configuration/wip/issue-delay' },
    { label: 'Material Consumption', path: '/administration/configuration/wip/material-consumption' },
    { label: 'Permit / Compliance', path: '/administration/configuration/wip/permit-compliance' },
    { label: 'Progress Log', path: '/administration/configuration/wip/progress-log' },
    { label: 'Alerts', path: '/administration/configuration/wip/alerts' },
    { label: 'KPI Config', path: '/administration/configuration/wip/kpi-config' },
    { label: 'Role & Access', path: '/administration/configuration/wip/role-access' }
  ];

  // Maps URL slug -> breadcrumb label, used when building the trail
  private configSlugLabelMap: Record<string, string> = {
    'projects': 'Projects',
    'devices': 'Devices',
    'assets': 'Assets',
    'maintenance': 'Maintenance',
    'wip': 'WIP',
    'people': 'People',
    'attendance': 'Attendance',
    'access-control': 'Access Control',
    'ot-management': 'OT Management',
    'visitor-management': 'Visitor Management',
    'patrol': 'Patrol'
  };

  // Maps URL slug -> breadcrumb label for pages nested under Assets
  private assetsSlugLabelMap: Record<string, string> = {
    'asset-registry': 'Asset Registry',
    'location-history': 'Location History',
    'assignment-ownership': 'Assignment / Ownership',
    'asset-lifecycle': 'Asset Lifecycle',
    'tracking-telemetry': 'Tracking & Telemetry',
    'maintenance-service': 'Maintenance & Service',
    'utilization-performance': 'Utilization & Performance',
    'financial': 'Financial',
    'document-attachment': 'Document & Attachment',
    'warranty-contract': 'Warranty & Contract',
    'alert-incident': 'Alert & Incident',
    'audit-verification': 'Audit & Verification',
    'activity-audit-trail': 'Activity / Audit Trail',
    'custom-domain-fields': 'Custom / Domain-specific Asset Type Fields',
    'integration': 'Integration',
    'compliance-certification': 'Compliance & Certification'
  };

  // Maps URL slug -> breadcrumb label for pages nested under Maintenance
  private maintenanceSlugLabelMap: Record<string, string> = {
    'work-order': 'Work Order',
    'maintenance-task': 'Maintenance Task',
    'preventive-maintenance': 'Preventive Maintenance',
    'predictive-maintenance': 'Predictive Maintenance',
    'breakdown-issue-reporting': 'Breakdown / Issue Reporting',
    'spare-parts': 'Spare Parts',
    'technician': 'Technician',
    'vendor-amc': 'Vendor / AMC',
    'cost-tracking': 'Cost Tracking',
    'downtime-tracking': 'Downtime Tracking',
    'performance': 'Performance',
    'compliance-inspection': 'Compliance & Inspection'
  };

  // Maps URL slug -> breadcrumb label for pages nested under WIP
  private wipSlugLabelMap: Record<string, string> = {
    'job-master': 'Job Master',
    'status-master': 'Status Master',
    'resource-master': 'Resource Master',
    'task-master': 'Task Master',
    'checklist-master': 'Checklist Master',
    'checklist-items': 'Checklist Items',
    'location-master': 'Location Master',
    'asset-linking': 'Asset Linking',
    'sla-master': 'SLA Master',
    'issue-delay': 'Issue / Delay',
    'material-consumption': 'Material Consumption',
    'permit-compliance': 'Permit / Compliance',
    'progress-log': 'Progress Log',
    'alerts': 'Alerts',
    'kpi-config': 'KPI Config',
    'role-access': 'Role & Access'
  };

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.showLanding = this.router.url === '/administration' || this.router.url === '/administration/';
        this.updateBreadcrumb();
      });
    this.showLanding = this.router.url === '/administration' || this.router.url === '/administration/';
    this.updateBreadcrumb();
  }

  private updateBreadcrumb(): void {
    const url = this.router.url;
    const segments = url.split('/').filter(s => s);

    this.breadcrumbItems = [
      { label: 'Administration', path: '/administration' }
    ];

    this.dropdownOptions = new Map<string, BreadcrumbOption[]>();
    this.dropdownOptions.set('Administration', this.adminOptions);
    this.dropdownOptions.set('User Management', this.userMgmtOptions);
    this.dropdownOptions.set('Configuration', this.configOptions);
    this.dropdownOptions.set('Assets', this.assetsOptions);
    this.dropdownOptions.set('Maintenance', this.maintenanceOptions);
    this.dropdownOptions.set('WIP', this.wipOptions);

    const userMgmtIdx = segments.indexOf('user-management');
    const configIdx = segments.indexOf('configuration');

    // Configuration submenu handling
    if (configIdx !== -1) {
      this.breadcrumbItems.push({ label: 'Configuration', path: '/administration/configuration' });

      const childSlug = segments[configIdx + 1];
      if (childSlug) {
        const childLabel = this.configSlugLabelMap[childSlug];
        if (childLabel) {
          const grandchildSlugMap: Record<string, Record<string, string>> = {
            'assets': this.assetsSlugLabelMap,
            'maintenance': this.maintenanceSlugLabelMap,
            'wip': this.wipSlugLabelMap
          };
          const grandchildSlug = grandchildSlugMap[childSlug] ? segments[configIdx + 2] : undefined;
          const grandchildLabel = grandchildSlug ? grandchildSlugMap[childSlug][grandchildSlug] : undefined;

          this.breadcrumbItems.push({
            label: childLabel,
            path: grandchildLabel ? `/administration/configuration/${childSlug}` : null
          });

          if (grandchildLabel) {
            this.breadcrumbItems.push({ label: grandchildLabel, path: null });
          }
        }
      }
    }

    if (userMgmtIdx !== -1) {
      this.breadcrumbItems.push({ label: 'User Management', path: '/administration/user-management' });

      if (segments[userMgmtIdx + 1]) {
        const childPage = segments[userMgmtIdx + 1];
        if (childPage === 'user') {
          this.breadcrumbItems.push({ label: 'User', path: null });
        } else if (childPage === 'role') {
          if (segments[userMgmtIdx + 2]) {
            this.breadcrumbItems.push({ label: 'Role', path: '/administration/user-management/role' });
            if (segments[userMgmtIdx + 2] === 'create') {
              this.breadcrumbItems.push({ label: 'Create', path: null });
            }
          } else {
            this.breadcrumbItems.push({ label: 'Role', path: null });
          }
        }
      }
    }
  }
}