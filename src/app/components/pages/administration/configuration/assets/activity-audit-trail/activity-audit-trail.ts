import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RowActions } from 'shared-ui';
import { AssetActivityService, AppAssetActivity } from '../../../../../services/asset-activity.service';

@Component({
  standalone: true,
  selector: 'app-asset-activity-audit-trail',
  imports: [CommonModule, RowActions],
  templateUrl: './activity-audit-trail.html',
  styleUrls: ['./activity-audit-trail.css']
})
export class AssetActivityAuditTrail {
  // All columns in this module are system-generated — there is no manual "Add" entry.
  entries: AppAssetActivity[] = [];
  loading = false;
  errorMessage = '';
  deleteTarget: AppAssetActivity | null = null;

  constructor(private service: AssetActivityService) {
    this.loadEntries();
  }

  onDownload(): void {
    // TODO: export current activity / audit trail list
  }

  onRefresh(): void {
    this.loadEntries();
  }

  onDelete(): void {
    // TODO: bulk-delete selected entries (no row-selection UI yet)
  }

  editRow(entry: AppAssetActivity): void {
    // TODO: open edit form for this activity / audit trail entry
  }

  deleteRow(entry: AppAssetActivity): void {
    this.deleteTarget = entry;
  }

  cancelDelete(): void {
    this.deleteTarget = null;
  }

  confirmDelete(): void {
    if (!this.deleteTarget) return;
    const id = this.deleteTarget.id;
    this.deleteTarget = null;
    this.service.delete(id).subscribe({
      next: () => this.loadEntries(),
      error: () => this.errorMessage = 'Failed to delete entry. Please try again.'
    });
  }

  private loadEntries(): void {
    this.loading = true;
    this.errorMessage = '';
    this.service.getAll().subscribe({
      next: (entries) => {
        this.entries = entries;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load activity / audit trail data.';
        this.loading = false;
      }
    });
  }
}
