import { Component, ElementRef, HostListener, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

export interface NavItem {
  label: string;
  path: string;
  icon: string;
  children?: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar-component.scss'],
  host: {
    '[class.collapsed]': 'collapsed'
  }
})
export class Sidebar {
  @Output() collapsedChange = new EventEmitter<boolean>();
  collapsed = false;
  isCollapsing = false;

  // label of the top-level item whose flyout is open (e.g. 'Administration')
  openDropdown: string | null = null;
  // label of the nested sub-item that's expanded inside the open flyout (e.g. 'User Management')
  openSubDropdown: string | null = null;
  // label of the third-level item expanded inside the open sub-dropdown (e.g. 'Assets')
  openSubSubDropdown: string | null = null;
  // viewport coordinates for the currently open flyout, computed from the clicked trigger element
  flyoutPosition: { top: number; left: number } | null = null;

  navItems: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: this.assetUrl('dashboardpurple.png') },
    { label: 'Locating', path: '/locating', icon: this.assetUrl('trackingpurple.png') },
    { label: 'Events', path: '/events', icon: this.assetUrl('Events-purple.png') },
    { label: 'Report', path: '/report', icon: this.assetUrl('reports-purple.png') },
    { label: 'Process & Automation', path: '/process-automation', icon: this.assetUrl('Process&auto-purple.png') },
    {
      label: 'Administration',
      path: '/administration',
      icon: this.assetUrl('Administration-purple.png'),
      children: [
        {
          label: 'Configuration',
          path: '/administration/configuration',
          icon: '',
          children: [
            { label: 'Project', path: '/administration/configuration/projects', icon: '' },
            { label: 'Devices', path: '/administration/configuration/devices', icon: '' },
            {
              label: 'Assets',
              path: '/administration/configuration/assets',
              icon: '',
              children: [
                { label: 'Asset Registry', path: '/administration/configuration/assets/asset-registry', icon: '' },
                { label: 'Location History', path: '/administration/configuration/assets/location-history', icon: '' },
                { label: 'Assignment / Ownership', path: '/administration/configuration/assets/assignment-ownership', icon: '' },
                { label: 'Asset Lifecycle', path: '/administration/configuration/assets/asset-lifecycle', icon: '' },
                { label: 'Tracking & Telemetry', path: '/administration/configuration/assets/tracking-telemetry', icon: '' },
                { label: 'Maintenance & Service', path: '/administration/configuration/assets/maintenance-service', icon: '' },
                { label: 'Utilization & Performance', path: '/administration/configuration/assets/utilization-performance', icon: '' },
                { label: 'Financial', path: '/administration/configuration/assets/financial', icon: '' },
                { label: 'Document & Attachment', path: '/administration/configuration/assets/document-attachment', icon: '' },
                { label: 'Warranty & Contract', path: '/administration/configuration/assets/warranty-contract', icon: '' },
                { label: 'Alert & Incident', path: '/administration/configuration/assets/alert-incident', icon: '' },
                { label: 'Audit & Verification', path: '/administration/configuration/assets/audit-verification', icon: '' },
                { label: 'Activity / Audit Trail', path: '/administration/configuration/assets/activity-audit-trail', icon: '' },
                { label: 'Custom / Domain-specific Asset Type Fields', path: '/administration/configuration/assets/custom-domain-fields', icon: '' },
                { label: 'Integration', path: '/administration/configuration/assets/integration', icon: '' },
                { label: 'Compliance & Certification', path: '/administration/configuration/assets/compliance-certification', icon: '' }
              ]
            },
            {
              label: 'Maintenance',
              path: '/administration/configuration/maintenance',
              icon: '',
              children: [
                { label: 'Work Order', path: '/administration/configuration/maintenance/work-order', icon: '' },
                { label: 'Maintenance Task', path: '/administration/configuration/maintenance/maintenance-task', icon: '' },
                { label: 'Preventive Maintenance', path: '/administration/configuration/maintenance/preventive-maintenance', icon: '' },
                { label: 'Predictive Maintenance', path: '/administration/configuration/maintenance/predictive-maintenance', icon: '' },
                { label: 'Breakdown / Issue Reporting', path: '/administration/configuration/maintenance/breakdown-issue-reporting', icon: '' },
                { label: 'Spare Parts', path: '/administration/configuration/maintenance/spare-parts', icon: '' },
                { label: 'Technician', path: '/administration/configuration/maintenance/technician', icon: '' },
                { label: 'Vendor / AMC', path: '/administration/configuration/maintenance/vendor-amc', icon: '' },
                { label: 'Cost Tracking', path: '/administration/configuration/maintenance/cost-tracking', icon: '' },
                { label: 'Downtime Tracking', path: '/administration/configuration/maintenance/downtime-tracking', icon: '' },
                { label: 'Performance', path: '/administration/configuration/maintenance/performance', icon: '' },
                { label: 'Compliance & Inspection', path: '/administration/configuration/maintenance/compliance-inspection', icon: '' }
              ]
            },
            { label: 'Workflows', path: '/administration/configuration/workflows', icon: '' },
            {
              label: 'WIP',
              path: '/administration/configuration/wip',
              icon: '',
              children: [
                { label: 'Job Master', path: '/administration/configuration/wip/job-master', icon: '' },
                { label: 'Status Master', path: '/administration/configuration/wip/status-master', icon: '' },
                { label: 'Resource Master', path: '/administration/configuration/wip/resource-master', icon: '' },
                { label: 'Task Master', path: '/administration/configuration/wip/task-master', icon: '' },
                { label: 'Checklist Master', path: '/administration/configuration/wip/checklist-master', icon: '' },
                { label: 'Checklist Items', path: '/administration/configuration/wip/checklist-items', icon: '' },
                { label: 'Location Master', path: '/administration/configuration/wip/location-master', icon: '' },
                { label: 'Asset Linking', path: '/administration/configuration/wip/asset-linking', icon: '' },
                { label: 'SLA Master', path: '/administration/configuration/wip/sla-master', icon: '' },
                { label: 'Issue / Delay', path: '/administration/configuration/wip/issue-delay', icon: '' },
                { label: 'Material Consumption', path: '/administration/configuration/wip/material-consumption', icon: '' },
                { label: 'Permit / Compliance', path: '/administration/configuration/wip/permit-compliance', icon: '' },
                { label: 'Progress Log', path: '/administration/configuration/wip/progress-log', icon: '' },
                { label: 'Alerts', path: '/administration/configuration/wip/alerts', icon: '' },
                { label: 'KPI Config', path: '/administration/configuration/wip/kpi-config', icon: '' },
                { label: 'Role & Access', path: '/administration/configuration/wip/role-access', icon: '' }
              ]
            },
            {
              label: 'Master Management',
              path: '/administration/configuration/master-management',
              icon: '',
              children: [
                { label: 'Master Maintenance', path: '/administration/configuration/master-management/master-maintenance', icon: '' },
                { label: 'Category / Sub-category', path: '/administration/configuration/master-management/category-subcategory', icon: '' },
                { label: 'Asset Type', path: '/administration/configuration/master-management/asset-type', icon: '' },
                { label: 'Assigned Custodian / Department', path: '/administration/configuration/master-management/assigned-custodian-department', icon: '' },
                { label: 'Current Location', path: '/administration/configuration/master-management/current-location', icon: '' },
                { label: 'Status Changes', path: '/administration/configuration/master-management/status-changes', icon: '' },
                { label: 'Tag IDs', path: '/administration/configuration/master-management/tag-ids', icon: '' },
                { label: 'Depreciation Method', path: '/administration/configuration/master-management/depreciation-method', icon: '' },
                { label: 'Cost Center', path: '/administration/configuration/master-management/cost-center', icon: '' },
                { label: 'Alert Type', path: '/administration/configuration/master-management/alert-type', icon: '' },
                { label: 'Resolution Status', path: '/administration/configuration/master-management/resolution-status', icon: '' }
              ]
            }
          ]
        },
        { label: 'License', path: '/administration/license', icon: '' },
        {
          label: 'User Management',
          path: '/administration/user-management',
          icon: '',
          children: [
            { label: 'User', path: '/administration/user-management/user', icon: '' },
            { label: 'Role', path: '/administration/user-management/role', icon: '' }
          ]
        }
      ]
    }
  ];

  constructor(private router: Router, private elementRef: ElementRef) { }

  private assetUrl(fileName: string): string {
    return `/assets/${encodeURIComponent(fileName)}`;
  }

  toggleCollapse(): void {
    this.isCollapsing = true;
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
    setTimeout(() => {
      this.isCollapsing = false;
    }, 200);
  }

  // Opens/closes the top-level flyout (e.g. clicking "Administration")
  // `triggerEl` is the clicked row element (passed as $event.currentTarget from the
  // template, which TypeScript types as EventTarget | null), used to position the
  // fixed flyout beside it.
  toggleDropdown(label: string, triggerEl: EventTarget | null): void {
    if (this.openDropdown === label) {
      this.openDropdown = null;
      this.openSubDropdown = null;
      this.openSubSubDropdown = null;
      this.flyoutPosition = null;
      return;
    }

    if (!(triggerEl instanceof HTMLElement)) {
      // Defensive fallback: still open the dropdown, just without a measured
      // position (template guards on `flyoutPosition` before rendering anyway).
      this.openDropdown = label;
      this.openSubDropdown = null;
      this.openSubSubDropdown = null;
      this.flyoutPosition = null;
      return;
    }

    const sidebar = document.querySelector('.sidebar');
    const width = sidebar?.getBoundingClientRect().width || 280;

    this.flyoutPosition = {
      top: 0,
      left: width
    };
    this.openDropdown = label;
    this.openSubDropdown = null;
    this.openSubSubDropdown = null;
  }

  isDropdownOpen(label: string): boolean {
    return this.openDropdown === label;
  }

  // Expands/collapses a nested item inside the open flyout (e.g. "User Management")
  toggleSubDropdown(label: string): void {
    this.openSubDropdown = this.openSubDropdown === label ? null : label;
    this.openSubSubDropdown = null;
  }

  isSubDropdownOpen(label: string): boolean {
    return this.openSubDropdown === label;
  }

  // Expands/collapses a third-level item inside the open sub-dropdown (e.g. "Assets")
  toggleSubSubDropdown(label: string): void {
    this.openSubSubDropdown = this.openSubSubDropdown === label ? null : label;
  }

  isSubSubDropdownOpen(label: string): boolean {
    return this.openSubSubDropdown === label;
  }

  // Navigates to a leaf item's route and closes the whole flyout stack
  navigateAndClose(path: string): void {
    this.openDropdown = null;
    this.openSubDropdown = null;
    this.openSubSubDropdown = null;
    this.flyoutPosition = null;
    this.router.navigateByUrl(path);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.openDropdown || !event.target) {
      return;
    }
    const clickedInsideSidebar = this.elementRef.nativeElement.contains(event.target);
    const clickedInsideFlyout = !!(event.target as HTMLElement).closest('.nav-flyout');
    if (!clickedInsideSidebar && !clickedInsideFlyout) {
      this.openDropdown = null;
      this.openSubDropdown = null;
      this.openSubSubDropdown = null;
      this.flyoutPosition = null;
    }
  }

  @HostListener('window:resize')
  @HostListener('window:scroll')
  onViewportChange(): void {
    // Fixed-position flyouts go stale on scroll/resize since they no longer
    // track the trigger; simplest correct behavior is to close them.
    if (this.openDropdown) {
      this.openDropdown = null;
      this.openSubDropdown = null;
      this.openSubSubDropdown = null;
      this.flyoutPosition = null;
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.openDropdown) {
      this.openDropdown = null;
      this.openSubDropdown = null;
      this.openSubSubDropdown = null;
      this.flyoutPosition = null;
    }
  }
}