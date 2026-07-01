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

  constructor(private service: RoleService, private router: Router) {
    this.roles = this.service.getRoles();
  }

  get filteredRoles(): AppRole[] {
    return this.service.search(this.searchTerm);
  }

  summarize(role: AppRole): string {
    return this.service.summarizePermissions(role.accessPermission);
  }

  addRole(): void {
    this.router.navigate(['/administration/user-management/role/create']);
  }

  refresh(): void {
    this.searchTerm = '';
    this.roles = this.service.getRoles();
  }

  exportRoles(): void {
    // hook up CSV/export logic here
  }

  deleteRole(id: number): void {
    if (!confirm('Delete this role?')) return;
    this.service.deleteRole(id);
    this.roles = this.service.getRoles();
  }

  editRole(role: AppRole): void {
    // open edit-role modal / navigate to edit form
  }
}