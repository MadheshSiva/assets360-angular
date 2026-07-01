import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './breadcrumb.html',
  styleUrls: ['./breadcrumb.css']
})
export class Breadcrumb {
  @Input() items: Array<{ label: string; path: string | null }> = [];
  @Input() dropdownOptions: Map<string, Array<{ label: string; path: string }>> = new Map();
  
  openDropdown: string | null = null;

  constructor(private router: Router) {}

  navigate(path: string): void {
    if (path) {
      this.router.navigateByUrl(path);
    }
  }

  toggleDropdown(label: string): void {
    this.openDropdown = this.openDropdown === label ? null : label;
  }

  closeDropdown(): void {
    this.openDropdown = null;
  }

  hasDropdown(label: string): boolean {
    return this.dropdownOptions.has(label);
  }

  getDropdownItems(label: string): Array<{ label: string; path: string }> {
    return this.dropdownOptions.get(label) || [];
  }
}