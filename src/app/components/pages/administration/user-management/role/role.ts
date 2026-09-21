import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RoleService, AppRole } from '../../../../services/user.service';

@Component({
  standalone: true,
  selector: 'app-role',
  imports: [CommonModule, FormsModule],
  templateUrl: './role.html',
  styleUrls: ['./role.css']
})
export class Role {
  roles: AppRole[] = [];
  searchTerm = '';
  loading = false;
  errorMessage = '';
  deleteTarget: AppRole | null = null;

  constructor(private service: RoleService, private router: Router) {
    this.loadRoles();
  }

  get filteredRoles(): AppRole[] {
    return this.service.filterRoles(this.roles, this.searchTerm);
  }

  summarize(role: AppRole): string {
    return this.service.summarizePermissions(role.accessPermission);
  }

  addRole(): void {
    this.router.navigate(['/administration/user-management/role/create']);
  }

  refresh(): void {
    this.searchTerm = '';
    this.loadRoles();
  }

  exportRoles(): void {
    // hook up CSV/export logic here
  }

  deleteRole(role: AppRole): void {
    this.deleteTarget = role;
  }

  cancelDelete(): void {
    this.deleteTarget = null;
  }

  confirmDelete(): void {
    if (!this.deleteTarget) return;
    const id = this.deleteTarget.id;
    this.deleteTarget = null;
    this.service.deleteRole(id).subscribe({
      next: () => this.loadRoles(),
      error: () => this.errorMessage = 'Failed to delete role. Please try again.'
    });
  }

  editRole(role: AppRole): void {
    this.router.navigate(['/administration/user-management/role/edit', role.id]);
  }

  private loadRoles(): void {
    this.loading = true;
    this.errorMessage = '';
    this.service.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load roles.';
        this.loading = false;
      }
    });
  }
}
