import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImportColumn, ImportFileModal } from 'shared-ui';
import { RowActions } from 'shared-ui';

export interface AssetLifecycleEntry {
  assetId: string;
  assetName: string;
  procurementDate: string;
  deploymentDate: string;
  status: string;
  disposalDetails: string;
  reasonForRetirement: string;
}

type AssetLifecycleEntryForm = AssetLifecycleEntry;

@Component({
  standalone: true,
  selector: 'app-asset-lifecycle',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './asset-lifecycle.html',
  styleUrls: ['./asset-lifecycle.css']
})
export class AssetLifecycle {
  readonly importColumns: ImportColumn[] = [
    { key: 'assetId', label: 'Asset ID' },
    { key: 'assetName', label: 'Asset Name' },
    { key: 'procurementDate', label: 'Procurement Date' },
    { key: 'deploymentDate', label: 'Deployment Date' },
    { key: 'status', label: 'Status' },
    { key: 'disposalDetails', label: 'Disposal Details' },
    { key: 'reasonForRetirement', label: 'Reason for Retirement' }
  ];

  showImportModal = false;

  showFormModal = false;
  isEditMode = false;
  private editingEntry: AssetLifecycleEntry | null = null;
  form: AssetLifecycleEntryForm = this.emptyForm();

  entries: AssetLifecycleEntry[] = [
    {
      assetId: 'AST-0001',
      assetName: 'Forklift Unit 4',
      procurementDate: '2025-02-14',
      deploymentDate: '2025-03-01',
      status: 'Active',
      disposalDetails: '-',
      reasonForRetirement: '-'
    },
    {
      assetId: 'AST-0002',
      assetName: 'HVAC Compressor B',
      procurementDate: '2023-08-05',
      deploymentDate: '2023-08-20',
      status: 'Retired',
      disposalDetails: 'Sold to third-party vendor',
      reasonForRetirement: 'End of service life'
    }
  ];

  private emptyForm(): AssetLifecycleEntryForm {
    return {
      assetId: '',
      assetName: '',
      procurementDate: '',
      deploymentDate: '',
      status: '',
      disposalDetails: '',
      reasonForRetirement: ''
    };
  }

  onAdd(): void {
    this.isEditMode = false;
    this.editingEntry = null;
    this.form = this.emptyForm();
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.editingEntry = null;
  }

  submitForm(): void {
    if (this.isEditMode && this.editingEntry) {
      Object.assign(this.editingEntry, this.form);
    } else {
      this.entries = [...this.entries, { ...this.form }];
    }
    this.closeFormModal();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    this.entries = [
      ...this.entries,
      ...rows.map((row) => ({
        assetId: row['assetId'] ?? '',
        assetName: row['assetName'] ?? '',
        procurementDate: row['procurementDate'] ?? '',
        deploymentDate: row['deploymentDate'] ?? '',
        status: row['status'] ?? '',
        disposalDetails: row['disposalDetails'] ?? '',
        reasonForRetirement: row['reasonForRetirement'] ?? ''
      }))
    ];
    this.showImportModal = false;
  }

  onDownload(): void {
    // TODO: export current asset lifecycle list
  }

  onRefresh(): void {
    // TODO: reload asset lifecycle data from backend
  }

  onDelete(): void {
    // TODO: delete selected entries
  }

  editRow(entry: AssetLifecycleEntry): void {
    this.isEditMode = true;
    this.editingEntry = entry;
    this.form = {
      assetId: entry.assetId,
      assetName: entry.assetName,
      procurementDate: entry.procurementDate,
      deploymentDate: entry.deploymentDate,
      status: entry.status,
      disposalDetails: entry.disposalDetails,
      reasonForRetirement: entry.reasonForRetirement
    };
    this.showFormModal = true;
  }

  deleteRow(entry: AssetLifecycleEntry): void {
    this.entries = this.entries.filter((e) => e !== entry);
  }
}
