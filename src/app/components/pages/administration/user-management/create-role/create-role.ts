import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RoleService, ModulePermission } from '../../../../services/user.service';

@Component({
  standalone: true,
  selector: 'app-create-role',
  imports: [CommonModule, FormsModule],
  templateUrl: './create-role.html',
  styleUrls: ['./create-role.css']
})
export class CreateRole {
  roleName = '';
  description = '';
  permissions: ModulePermission[];
  submitted = false;

  constructor(private service: RoleService, private router: Router) {
    this.permissions = this.service.getEmptyPermissions();
  }

  toggleView(perm: ModulePermission): void {
    perm.view = !perm.view;
    if (!perm.view) perm.edit = false; // edit implies view
  }

  toggleEdit(perm: ModulePermission): void {
    perm.edit = !perm.edit;
    if (perm.edit) perm.view = true; // edit implies view
  }

  get isValid(): boolean {
    return this.roleName.trim().length > 0;
  }

  saveRole(): void {
    this.submitted = true;
    if (!this.isValid) return;

    this.service.addRole({
      roleName: this.roleName.trim(),
      description: this.description.trim(),
      accessPermission: this.permissions,
      clientId: 'CLT-' + Math.floor(1000 + Math.random() * 9000)
    });

    this.router.navigate(['/administration/user-management/role']);
  }

  cancel(): void {
    this.router.navigate(['/administration/user-management/role']);
  }
}