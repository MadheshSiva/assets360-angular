import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-configuration',
  imports: [CommonModule],
  template: '<div class="config-page"><h2>Configuration</h2><p>Configuration page coming soon.</p></div>',
  styles: [`.config-page { padding: 20px; }`]
})
export class Configuration {}