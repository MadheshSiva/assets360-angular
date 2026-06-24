import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-license',
  imports: [CommonModule],
  template: '<div class="license-page"><h2>License</h2><p>License page coming soon.</p></div>',
  styles: [`.license-page { padding: 20px; }`]
})
export class License {}