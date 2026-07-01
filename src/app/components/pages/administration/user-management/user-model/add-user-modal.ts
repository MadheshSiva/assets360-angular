import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface NewUser {
  userId: string;
  userName: string;
  shortName: string;
  contactNo: string;
  emailId: string;
  roleName: string;
  adUserName: string;
}

function emptyUser(): NewUser {
  return {
    userId: '',
    userName: '',
    shortName: '',
    contactNo: '',
    emailId: '',
    roleName: 'Admin',
    adUserName: '',
  };
}

@Component({
  standalone: true,
  selector: 'app-add-user-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './add-user-modal.html',
  styleUrls: ['./add-user-modal.css'],
})
export class AddUserModal {
  /** Controls whether the modal is shown */
  @Input() visible = false;

  /** Dropdown options for ROLE NAME */
  @Input() roleOptions: string[] = ['Admin', 'Manager', 'Staff', 'Doctor'];

  /** Emitted when the user confirms with valid data */
  @Output() save = new EventEmitter<NewUser>();

  /** Emitted when the modal is dismissed without saving */
  @Output() cancel = new EventEmitter<void>();

  model: NewUser = emptyUser();

  onSave(): void {
    // Minimal required-field guard; swap for proper form validation as needed
    if (!this.model.userId.trim() || !this.model.userName.trim() || !this.model.emailId.trim()) {
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
    this.model = emptyUser();
    this.visible = false;
  }
}