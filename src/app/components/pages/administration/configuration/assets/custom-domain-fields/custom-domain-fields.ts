import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface CustomDomainFieldEntry {
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
  imports: [CommonModule, FormsModule],
  templateUrl: './custom-domain-fields.html',
  styleUrls: ['./custom-domain-fields.css']
})
export class AssetCustomDomainFields {
  // Master: asset types with domain-specific attribute sets
  assetTypeOptions: string[] = Object.keys(DYNAMIC_FIELD_MAP);

  entries: CustomDomainFieldEntry[] = [
    { assetType: 'Forklift', fieldName: 'Load Capacity', fieldValue: '2.5 Tons' },
    { assetType: 'Forklift', fieldName: 'Engine Hours', fieldValue: '1,240 hrs' },
    { assetType: 'Forklift', fieldName: 'Fuel Type', fieldValue: 'Diesel' },
    { assetType: 'Pallet', fieldName: 'Weight Capacity', fieldValue: '1.2 Tons' },
    { assetType: 'Pallet', fieldName: 'Material Type', fieldValue: 'Plastic' },
    { assetType: 'Vehicle', fieldName: 'Registration Number', fieldValue: 'WP-CAB-4521' },
    { assetType: 'Vehicle', fieldName: 'Insurance Details', fieldValue: 'Policy #INS-88213, expires 2027-02-01' }
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
        assetType,
        fieldName: this.fieldNameOptionsFor(assetType)[0] ?? '',
        fieldValue: ''
      }
    ];
  }

  onUpload(): void {
    // TODO: trigger file upload (e.g. bulk import via Excel/CSV)
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
}
