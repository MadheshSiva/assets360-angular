import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImportColumn, ImportFileModal } from 'shared-ui';
import { MasterLinkIcons } from '@shared/master-link-icons/master-link-icons';
import { RowActions } from 'shared-ui';

export interface CustomDomainFieldEntry {
  assetId: string;
  assetName: string;
  assetType: string;
  fieldName: string;
  fieldValue: string;
}

export interface CustomDomainFieldForm {
  assetId: string;
  assetName: string;
  assetType: string;
  fieldName: string;
  fieldValue: string;
}

@Component({
  standalone: true,
  selector: 'app-asset-custom-domain-fields',
  imports: [CommonModule, FormsModule, ImportFileModal, MasterLinkIcons, RowActions],
  templateUrl: './custom-domain-fields.html',
  styleUrls: ['./custom-domain-fields.css']
})
export class AssetCustomDomainFields {
  readonly importColumns: ImportColumn[] = [
    { key: 'assetId', label: 'Asset ID' },
    { key: 'assetName', label: 'Asset Name' },
    { key: 'assetType', label: 'Asset Type' },
    { key: 'fieldName', label: 'Field Name' },
    { key: 'fieldValue', label: 'Field Value' }
  ];

  showImportModal = false;

  showFormModal = false;
  isEditMode = false;
  private editingEntry: CustomDomainFieldEntry | null = null;
  form: CustomDomainFieldForm = this.emptyForm();

  entries: CustomDomainFieldEntry[] = [
    { assetId: 'AST-0001', assetName: 'Forklift Unit 4', assetType: 'Forklift', fieldName: 'Load Capacity', fieldValue: '2.5 Tons' },
    { assetId: 'AST-0002', assetName: 'Forklift Unit 5', assetType: 'Forklift', fieldName: 'Engine Hours', fieldValue: '1,240 hrs' },
    { assetId: 'AST-0003', assetName: 'Forklift Unit 6', assetType: 'Forklift', fieldName: 'Fuel Type', fieldValue: 'Diesel' },
    { assetId: 'AST-0004', assetName: 'Pallet Jack Model X', assetType: 'Pallet', fieldName: 'Weight Capacity', fieldValue: '1.2 Tons' },
    { assetId: 'AST-0005', assetName: 'Pallet Jack Model Y', assetType: 'Pallet', fieldName: 'Material Type', fieldValue: 'Plastic' },
    { assetId: 'AST-0006', assetName: 'Company Vehicle Van 1', assetType: 'Vehicle', fieldName: 'Registration Number', fieldValue: 'WP-CAB-4521' },
    { assetId: 'AST-0007', assetName: 'Company Vehicle Van 2', assetType: 'Vehicle', fieldName: 'Insurance Details', fieldValue: 'Policy #INS-88213, expires 2027-02-01' }
  ];

  private emptyForm(): CustomDomainFieldForm {
    return {
      assetId: '',
      assetName: '',
      assetType: '',
      fieldName: '',
      fieldValue: ''
    };
  }

  onAdd(): void {
    this.isEditMode = false;
    this.editingEntry = null;
    this.form = this.emptyForm();
    this.showFormModal = true;
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
        assetType: row['assetType'] ?? '',
        fieldName: row['fieldName'] ?? '',
        fieldValue: row['fieldValue'] ?? ''
      }))
    ];
    this.showImportModal = false;
  }

  onDownload(): void {
    // TODO: export current custom/domain-specific field list
  }

  onRefresh(): void {
    // TODO: reload custom/domain-specific field data from backend
  }

  onDelete(): void {
    // TODO: delete selected entries
  }

  editRow(entry: CustomDomainFieldEntry): void {
    this.isEditMode = true;
    this.editingEntry = entry;
    this.form = {
      assetId: entry.assetId,
      assetName: entry.assetName,
      assetType: entry.assetType,
      fieldName: entry.fieldName,
      fieldValue: entry.fieldValue
    };
    this.showFormModal = true;
  }

  deleteRow(entry: CustomDomainFieldEntry): void {
    this.entries = this.entries.filter((e) => e !== entry);
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
}
