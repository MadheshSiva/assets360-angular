import { Component, HostBinding } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Topbar } from '../topbar/topbar';
import { Sidebar } from '../sidebar/sidebar';

@Component({
  standalone: true,
  selector: 'app-layout',
  imports: [CommonModule, RouterOutlet, Topbar, Sidebar],
  templateUrl: './layout.html',
  styleUrls: ['./layout.css']
})
export class Layout {
  collapsed = false;

  @HostBinding('class.sidebar-collapsed') get isSidebarCollapsed() { return this.collapsed; }

  onCollapseChange(value: boolean): void {
    this.collapsed = value;
  }

  onToggleSidebar(): void {
    this.collapsed = !this.collapsed;
  }
}
