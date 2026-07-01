import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-configuration',
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './configuration.html',
  styleUrls: ['./configuration.css']
})
export class Configuration {
  activeTab: 'projects' = 'projects';
}