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
            { label: 'Projects', path: '/administration/configuration/projects', icon: '' },
            { label: 'Devices', path: '/administration/configuration/devices', icon: '' },
            { label: 'People', path: '/administration/configuration/people', icon: '' },
            { label: 'Attendance', path: '/administration/configuration/attendance', icon: '' },
            { label: 'Access Control', path: '/administration/configuration/access-control', icon: '' },
            { label: 'OT Management', path: '/administration/configuration/ot-management', icon: '' },
            { label: 'Visitor Management', path: '/administration/configuration/visitor-management', icon: '' },
            { label: 'Patrol', path: '/administration/configuration/patrol', icon: '' }
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
      this.flyoutPosition = null;
      return;
    }

    if (!(triggerEl instanceof HTMLElement)) {
      // Defensive fallback: still open the dropdown, just without a measured
      // position (template guards on `flyoutPosition` before rendering anyway).
      this.openDropdown = label;
      this.openSubDropdown = null;
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
  }

  isDropdownOpen(label: string): boolean {
    return this.openDropdown === label;
  }

  // Expands/collapses a nested item inside the open flyout (e.g. "User Management")
  toggleSubDropdown(label: string): void {
    this.openSubDropdown = this.openSubDropdown === label ? null : label;
  }

  isSubDropdownOpen(label: string): boolean {
    return this.openSubDropdown === label;
  }

  // Navigates to a leaf item's route and closes the whole flyout stack
  navigateAndClose(path: string): void {
    this.openDropdown = null;
    this.openSubDropdown = null;
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
      this.flyoutPosition = null;
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.openDropdown) {
      this.openDropdown = null;
      this.openSubDropdown = null;
      this.flyoutPosition = null;
    }
  }
}