import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {AddUserModal,NewUser} from "../user-model/add-user-modal"
export interface UserRow {
  userId: string;
  userName: string;
  shortName: string;
  contactNo: string;
  emailId: string;
  role: string;
  roleName: string;
  adUserName: string;
}

@Component({
  standalone: true,
  selector: 'app-user',
  imports: [CommonModule, FormsModule, AddUserModal],
  templateUrl: './user.html',
  styleUrls: ['./user.css'],
})
export class User {
  searchTerm = '';

  users: UserRow[] = [
    { userId: 'U001', userName: 'Amit Sharma',  shortName: 'AmitS',  contactNo: '+971 50 111 2233', emailId: 'amit.s@hospital.com',    role: 'Admin',   roleName: 'System Administrator', adUserName: 'amit_admin' },
    { userId: 'U002', userName: 'Sarah Jenkins', shortName: 'SarahJ', contactNo: '+971 50 444 5566', emailId: 's.jenkins@hospital.com', role: 'Staff',   roleName: 'Senior Nurse',         adUserName: 'sarah_n' },
    { userId: 'U003', userName: 'Rajesh Kumar',  shortName: 'RajeshK',contactNo: '+971 50 777 8899', emailId: 'rajesh.k@hospital.com', role: 'Staff',   roleName: 'Technician',           adUserName: 'rajesh_t' },
    { userId: 'U004', userName: 'Elena Rossi',   shortName: 'ElenaR', contactNo: '+971 50 999 0011', emailId: 'elena.r@hospital.com',  role: 'Manager', roleName: 'Operations Manager',   adUserName: 'elena_mgr' },
    { userId: 'U005', userName: 'Omar Al-Farsi', shortName: 'OmarA',  contactNo: '+971 50 222 3344', emailId: 'omar.f@hospital.com',   role: 'Doctor',  roleName: 'Surgeon',              adUserName: 'omar_dr' },
  ];

  filteredUsers: UserRow[] = [...this.users];
  
  
  onSearch(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredUsers = [...this.users];
      return;
    }
    this.filteredUsers = this.users.filter(u =>
      Object.values(u).some(value => value.toLowerCase().includes(term))
    );
  }

  showAddModal = false;
  onAdd(): void {
  this.showAddModal = true;
}

onUserSaved(newUser: NewUser): void {
   this.users.push({ ...newUser, role: newUser.roleName });
    this.onSearch();
    this.showAddModal = false;
}
  onExport(): void {
    // TODO: export visible users (e.g. to CSV)
    console.log('Export clicked', this.filteredUsers);
  }

  onRefresh(): void {
    // TODO: re-fetch users from backend
    this.searchTerm = '';
    this.filteredUsers = [...this.users];
    console.log('Refresh clicked');
  }

  onEdit(user: UserRow): void {
    // TODO: open edit-user form / modal
    console.log('Edit user', user);
  }

  onDelete(user: UserRow): void {
    // TODO: confirm + call delete API
    this.users = this.users.filter(u => u.userId !== user.userId);
    this.onSearch();
    console.log('Delete user', user);
  }
}