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
    { label: 'People', path: '/administration/configuration/people' },
    { label: 'Attendance', path: '/administration/configuration/attendance' },
    { label: 'Access Control', path: '/administration/configuration/access-control' },
    { label: 'OT Management', path: '/administration/configuration/ot-management' },
    { label: 'Visitor Management', path: '/administration/configuration/visitor-management' },
    { label: 'Patrol', path: '/administration/configuration/patrol' }
  ];

  // Maps URL slug -> breadcrumb label, used when building the trail
  private configSlugLabelMap: Record<string, string> = {
    'projects': 'Projects',
    'devices': 'Devices',
    'people': 'People',
    'attendance': 'Attendance',
    'access-control': 'Access Control',
    'ot-management': 'OT Management',
    'visitor-management': 'Visitor Management',
    'patrol': 'Patrol'
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

    const userMgmtIdx = segments.indexOf('user-management');
    const configIdx = segments.indexOf('configuration');

    // Configuration submenu handling
    if (configIdx !== -1) {
      this.breadcrumbItems.push({ label: 'Configuration', path: '/administration/configuration' });

      const childSlug = segments[configIdx + 1];
      if (childSlug) {
        const childLabel = this.configSlugLabelMap[childSlug];
        if (childLabel) {
          this.breadcrumbItems.push({ label: childLabel, path: null });
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