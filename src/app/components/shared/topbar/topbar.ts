import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.html',
  styleUrls: ['./topbar.scss']
})
export class Topbar {
  @Output() toggleSidebar = new EventEmitter<void>();

  constructor(private router: Router) {}

  toggleMenu(): void {
    this.toggleSidebar.emit();
  }

  logout(): void {
    // DEMO MODE: Token removal is disabled
    // localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
