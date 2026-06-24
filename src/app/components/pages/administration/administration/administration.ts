import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-administration',
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './administration.html',
  styleUrls: ['./administration.css']
})
export class Administration {
  activeTab: 'configuration' | 'license' | 'user-management' = 'configuration';
}