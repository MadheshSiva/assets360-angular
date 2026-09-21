import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RoleService, ModulePermission } from '../../../../services/user.service';
import { HierarchyNode } from '../../../../../models/hierarchy-node.model';
import { HierarchyNodeComponent } from '../../../../../components/hierarchy-node/hierarchy-node-component';

@Component({
  standalone: true,
  selector: 'app-create-role',
  imports: [CommonModule, FormsModule, HierarchyNodeComponent],
  templateUrl: './create-role.html',
  styleUrls: ['./create-role.css']
})
export class CreateRole {
  roleName = '';
  description = '';
  permissions: ModulePermission[];
  hierarchy: HierarchyNode[];
  submitted = false;
  saving = false;
  loading = false;
  errorMessage = '';
  editId: string | null = null;

  constructor(private service: RoleService, private router: Router, private route: ActivatedRoute) {
    this.permissions = this.service.getEmptyPermissions();
    this.hierarchy = this.service.getHierarchyData();

    this.editId = this.route.snapshot.paramMap.get('id');
    if (this.editId) {
      this.loading = true;
      this.service.getRole(this.editId).subscribe({
        next: (role) => {
          this.roleName = role.roleName;
          this.description = role.description;
          this.permissions = this.service.mergePermissions(role.accessPermission);
          this.loading = false;
        },
        error: () => {
          this.errorMessage = 'Failed to load role.';
          this.loading = false;
        }
      });
    }
  }

  get isEditMode(): boolean {
    return !!this.editId;
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
    this.errorMessage = '';
    if (!this.isValid || this.saving) return;

    this.saving = true;
    const request$ = this.editId
      ? this.service.updateRole(this.editId, this.roleName.trim(), this.description.trim(), this.permissions)
      : this.service.createRole(this.roleName.trim(), this.description.trim(), this.permissions);

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/administration/user-management/role']);
      },
      error: (err) => {
        this.saving = false;
        this.errorMessage = err?.error?.message || 'Failed to save role. Please try again.';
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/administration/user-management/role']);
  }
}
