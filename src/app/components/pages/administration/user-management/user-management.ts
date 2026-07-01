import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-user-management',
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.css']
})
export class UserManagement {
  activeTab: 'user' | 'role' = 'user';
}