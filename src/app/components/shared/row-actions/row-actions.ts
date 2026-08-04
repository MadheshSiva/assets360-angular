import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Small "Edit" / "Delete" icon-button pair for a single table row. Kept self-contained
 * (styles included) so it can be dropped into any table's Actions column without needing
 * matching CSS added to that page's own stylesheet.
 */
@Component({
  standalone: true,
  selector: 'app-row-actions',
  imports: [CommonModule],
  templateUrl: './row-actions.html',
  styleUrls: ['./row-actions.css']
})
export class RowActions {
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
}
