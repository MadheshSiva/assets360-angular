import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppUser, UserFormValue } from '../../../../services/users.service';

export interface RoleOption {
  roleId: string;
  roleName: string;
}

function emptyModel(): UserFormValue {
  return {
    userName: '',
    shortName: '',
    contactNo: '',
    email: '',
    loginPassword: '',
    activeDirectoryUserName: '',
    userRoleId: ''
  };
}

@Component({
  standalone: true,
  selector: 'app-add-user-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './add-user-modal.html',
  styleUrls: ['./add-user-modal.css'],
})
export class AddUserModal implements OnChanges {
  /** Controls whether the modal is shown */
  @Input() visible = false;

  /** Dropdown options for ROLE, sourced from the real roles list */
  @Input() roleOptions: RoleOption[] = [];

  /** When set, the modal edits this user instead of creating a new one */
  @Input() editingUser: AppUser | null = null;

  /** Emitted when the user confirms with valid data */
  @Output() save = new EventEmitter<UserFormValue>();

  /** Emitted when the modal is dismissed without saving */
  @Output() cancel = new EventEmitter<void>();

  model: UserFormValue = emptyModel();

  get isEditMode(): boolean {
    return !!this.editingUser;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['visible'] || changes['editingUser']) && this.visible) {
      this.model = this.editingUser
        ? {
            userName: this.editingUser.userName,
            shortName: this.editingUser.shortName,
            contactNo: this.editingUser.contactNo,
            email: this.editingUser.email,
            loginPassword: '',
            activeDirectoryUserName: this.editingUser.activeDirectoryUserName,
            userRoleId: this.editingUser.userRoleId
          }
        : emptyModel();
    }
  }

  onSave(): void {
    // Minimal required-field guard; swap for proper form validation as needed
    if (!this.model.userName.trim() || !this.model.email.trim() || !this.model.loginPassword.trim()) {
      return;
    }

    this.save.emit({ ...this.model });
    this.resetAndClose();
  }

  onCancel(): void {
    this.cancel.emit();
    this.resetAndClose();
  }

  onOverlayClick(event: MouseEvent): void {
    // Clicking the dark backdrop behaves like Cancel
    this.onCancel();
  }

  private resetAndClose(): void {
    this.model = emptyModel();
    this.visible = false;
  }
}
