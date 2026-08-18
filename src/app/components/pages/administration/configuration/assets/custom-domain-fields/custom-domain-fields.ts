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

// Dynamic Master: the set of attribute fields shown depends on the selected asset type.
const DYNAMIC_FIELD_MAP: Record<string, string[]> = {
  Forklift: ['Load Capacity', 'Engine Hours', 'Fuel Type'],
  Pallet: ['Weight Capacity', 'Material Type'],
  Vehicle: ['Registration Number', 'Insurance Details']
};

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

  // Master: asset types with domain-specific attribute sets
  assetTypeOptions: string[] = Object.keys(DYNAMIC_FIELD_MAP);

  entries: CustomDomainFieldEntry[] = [
    { assetId: 'AST-0001', assetName: 'Forklift Unit 4', assetType: 'Forklift', fieldName: 'Load Capacity', fieldValue: '2.5 Tons' },
    { assetId: 'AST-0002', assetName: 'Forklift Unit 5', assetType: 'Forklift', fieldName: 'Engine Hours', fieldValue: '1,240 hrs' },
    { assetId: 'AST-0003', assetName: 'Forklift Unit 6', assetType: 'Forklift', fieldName: 'Fuel Type', fieldValue: 'Diesel' },
    { assetId: 'AST-0004', assetName: 'Pallet Jack Model X', assetType: 'Pallet', fieldName: 'Weight Capacity', fieldValue: '1.2 Tons' },
    { assetId: 'AST-0005', assetName: 'Pallet Jack Model Y', assetType: 'Pallet', fieldName: 'Material Type', fieldValue: 'Plastic' },
    { assetId: 'AST-0006', assetName: 'Company Vehicle Van 1', assetType: 'Vehicle', fieldName: 'Registration Number', fieldValue: 'WP-CAB-4521' },
    { assetId: 'AST-0007', assetName: 'Company Vehicle Van 2', assetType: 'Vehicle', fieldName: 'Insurance Details', fieldValue: 'Policy #INS-88213, expires 2027-02-01' }
  ];

  // Field Name options depend on that row's currently selected Asset Type (Dynamic Master).
  fieldNameOptionsFor(assetType: string): string[] {
    return DYNAMIC_FIELD_MAP[assetType] ?? [];
  }

  // Switching Asset Type on a row invalidates its Field Name — snap to the first valid option.
  onRowAssetTypeChange(entry: CustomDomainFieldEntry): void {
    entry.fieldName = this.fieldNameOptionsFor(entry.assetType)[0] ?? '';
  }

  // Adds a new row directly to the table — each cell is already a live dropdown/textbox.
  onAdd(): void {
    const assetType = this.assetTypeOptions[0];
    this.entries = [
      ...this.entries,
      {
        assetId: '',
        assetName: '',
        assetType,
        fieldName: this.fieldNameOptionsFor(assetType)[0] ?? '',
        fieldValue: ''
      }
    ];
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

  // No separate edit mode exists for this table — each row's fields (Asset Type, Field Name,
  // Field Value) are already live, directly-editable inline controls, so there is no existing
  // per-row "start editing" affordance to mirror here. Kept as a no-op to satisfy the Actions
  // column contract.
  editRow(entry: CustomDomainFieldEntry): void {
  }

  deleteRow(entry: CustomDomainFieldEntry): void {
    this.entries = this.entries.filter((e) => e !== entry);
  }
}
