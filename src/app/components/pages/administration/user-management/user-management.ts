import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-user-management',
  imports: [CommonModule],
  template: '<div class="user-mgmt-page"><h2>User Management</h2><p>User Management page coming soon.</p></div>',
  styles: [`.user-mgmt-page { padding: 20px; }`]
})
export class UserManagement {}