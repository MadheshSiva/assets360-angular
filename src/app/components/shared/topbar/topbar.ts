import { Component, ElementRef, HostListener, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../service/auth/auth.service';
import { environment } from '../../../../environments/environment';

interface BreadcrumbItem {
  label: string;
  path: string;
}

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './topbar.html',
  styleUrls: ['./topbar.scss']
})
export class Topbar {
  @Output() toggleSidebar = new EventEmitter<void>();
  breadcrumbs: BreadcrumbItem[] = [];
  isDropdownOpen = false;
  flyoutPosition: { top: number; left: number } | null = null;

  constructor(private router: Router, private elementRef: ElementRef, private auth: AuthService) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.updateBreadcrumbs());
  }

  get displayEmail(): string {
    return this.auth.getUserEmail() || environment.supportEmail;
  }

  toggleMenu(): void {
    this.toggleSidebar.emit();
  }

  toggleAdminDropdown(triggerEl: EventTarget | null): void {
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen && triggerEl instanceof HTMLElement) {
      const rect = triggerEl.getBoundingClientRect();
      this.flyoutPosition = {
        top: rect.bottom + window.scrollY + 4,
        left: rect.right - 200 + window.scrollX
      };
    } else {
      this.flyoutPosition = null;
    }
  }

  logout(): void {
    this.isDropdownOpen = false;
    this.flyoutPosition = null;
    this.router.navigate(['/login']);
  }

  private updateBreadcrumbs(): void {
    const url = this.router.url;
    this.breadcrumbs = [];

    if (url.includes('/administration/user-management/user')) {
      this.breadcrumbs = [
        { label: 'Administration', path: '/administration' },
        { label: 'User Management', path: '/administration/user-management' },
        { label: 'User', path: '/administration/user-management/user' }
      ];
    } else if (url.includes('/administration/user-management/role')) {
      this.breadcrumbs = [
        { label: 'Administration', path: '/administration' },
        { label: 'User Management', path: '/administration/user-management' },
        { label: 'Role', path: '/administration/user-management/role' }
      ];
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isDropdownOpen || !event.target) {
      return;
    }
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    const clickedInsideFlyout = !!(event.target as HTMLElement).closest('.admin-flyout');
    if (!clickedInside && !clickedInsideFlyout) {
      this.isDropdownOpen = false;
      this.flyoutPosition = null;
    }
  }

  @HostListener('window:resize')
  @HostListener('window:scroll')
  onViewportChange(): void {
    if (this.isDropdownOpen) {
      this.isDropdownOpen = false;
      this.flyoutPosition = null;
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isDropdownOpen) {
      this.isDropdownOpen = false;
      this.flyoutPosition = null;
    }
  }
}
