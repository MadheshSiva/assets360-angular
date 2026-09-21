import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddUserModal, RoleOption } from '../user-model/add-user-modal';
import { UserService, AppUser, UserFormValue } from '../../../../services/users.service';
import { RoleService } from '../../../../services/user.service';

@Component({
  standalone: true,
  selector: 'app-user',
  imports: [CommonModule, FormsModule, AddUserModal],
  templateUrl: './user.html',
  styleUrls: ['./user.css'],
})
export class User {
  searchTerm = '';
  users: AppUser[] = [];
  roleOptions: RoleOption[] = [];
  loading = false;
  errorMessage = '';

  showAddModal = false;
  editingUser: AppUser | null = null;
  deleteTarget: AppUser | null = null;

  constructor(private userService: UserService, private roleService: RoleService) {
    this.loadRoles();
    this.loadUsers();
  }

  get filteredUsers(): AppUser[] {
    return this.userService.filterUsers(this.users, this.searchTerm);
  }

  roleName(user: AppUser): string {
    return this.roleOptions.find(r => r.roleId === user.userRoleId)?.roleName || user.userRoleId || '—';
  }

  onAdd(): void {
    this.editingUser = null;
    this.showAddModal = true;
  }

  onUserSaved(fields: UserFormValue): void {
    const request$ = this.editingUser
      ? this.userService.updateUser(this.editingUser.id, fields)
      : this.userService.createUser(fields);

    request$.subscribe({
      next: () => {
        this.showAddModal = false;
        this.editingUser = null;
        this.loadUsers();
      },
      error: (err) => {
        this.errorMessage = err?.error?.errors
          ? Object.values(err.error.errors).flat().join(' ')
          : (err?.error?.message || 'Failed to save user. Please try again.');
      }
    });
  }

  onModalCancel(): void {
    this.showAddModal = false;
    this.editingUser = null;
  }

  onExport(): void {
    // TODO: export visible users (e.g. to CSV)
  }

  onRefresh(): void {
    this.searchTerm = '';
    this.loadUsers();
  }

  onEdit(user: AppUser): void {
    this.editingUser = user;
    this.showAddModal = true;
  }

  onDelete(user: AppUser): void {
    this.deleteTarget = user;
  }

  cancelDelete(): void {
    this.deleteTarget = null;
  }

  confirmDelete(): void {
    if (!this.deleteTarget) return;
    const id = this.deleteTarget.id;
    this.deleteTarget = null;
    this.userService.deleteUser(id).subscribe({
      next: () => this.loadUsers(),
      error: () => this.errorMessage = 'Failed to delete user. Please try again.'
    });
  }

  private loadRoles(): void {
    this.roleService.getRoles().subscribe({
      next: (roles) => this.roleOptions = roles.map(r => ({ roleId: r.roleId, roleName: r.roleName })),
      error: () => this.errorMessage = 'Failed to load roles.'
    });
  }

  private loadUsers(): void {
    this.loading = true;
    this.errorMessage = '';
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load users.';
        this.loading = false;
      }
    });
  }
}
