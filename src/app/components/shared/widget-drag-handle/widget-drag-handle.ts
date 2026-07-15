import { Component } from '@angular/core';
import { CdkDragHandle } from '@angular/cdk/drag-drop';

@Component({
  standalone: true,
  selector: 'app-widget-drag-handle',
  hostDirectives: [CdkDragHandle],
  template: `
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
      <circle cx="9" cy="5" r="1.5" /><circle cx="15" cy="5" r="1.5" />
      <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
      <circle cx="9" cy="19" r="1.5" /><circle cx="15" cy="19" r="1.5" />
    </svg>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      border-radius: 4px;
      color: #94a3b8;
      cursor: grab;
      flex: 0 0 auto;
    }
    :host:hover {
      background: rgba(100, 116, 139, 0.12);
      color: #475569;
    }
    :host:active {
      cursor: grabbing;
    }
  `],
})
export class WidgetDragHandle {}
