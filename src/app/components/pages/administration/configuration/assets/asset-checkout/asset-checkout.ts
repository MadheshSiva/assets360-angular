import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImportColumn, ImportFileModal } from 'shared-ui';
import { RowActions } from 'shared-ui';

export interface AssetCheckoutEntry {
  assetId: string;
  assetName: string;
  assetCode: string;
  assetDescription: string;
  company: string;
  site: string;
  building: string;
  floor: string;
  room: string;
  departmentName: string;
  custodianName: string;
  mainCategory: string;
  subCategory: string;
}

export interface AssetCheckoutForm {
  assetId: string;
  assetName: string;
  assetCode: string;
  assetDescription: string;
  company: string;
  site: string;
  building: string;
  floor: string;
  room: string;
  departmentName: string;
  custodianName: string;
  mainCategory: string;
  subCategory: string;
}

@Component({
  standalone: true,
  selector: 'app-asset-checkout',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './asset-checkout.html',
  styleUrls: ['./asset-checkout.css']
})
export class AssetCheckout {
  readonly importColumns: ImportColumn[] = [
    { key: 'assetId', label: 'Asset ID' },
    { key: 'assetName', label: 'Asset Name' },
    { key: 'assetCode', label: 'Asset Code' },
    { key: 'assetDescription', label: 'Asset Description' },
    { key: 'company', label: 'Company' },
    { key: 'site', label: 'Site' },
    { key: 'building', label: 'Building' },
    { key: 'floor', label: 'Floor' },
    { key: 'room', label: 'Room' },
    { key: 'departmentName', label: 'Department Name' },
    { key: 'custodianName', label: 'Custodian Name' },
    { key: 'mainCategory', label: 'Main Category' },
    { key: 'subCategory', label: 'Sub Category' }
  ];

  showImportModal = false;

  showFormModal = false;
  isEditMode = false;
  private editingEntry: AssetCheckoutEntry | null = null;
  form: AssetCheckoutForm = this.emptyForm();

  readonly mainCategoryOptions: string[] = ['IT/Hardware', 'Kitchen Equipment', 'Furniture & Fixture'];

  entries: AssetCheckoutEntry[] = [
    { assetId: 'AST-0001', assetName: 'Honeywell CT60 Mobile Computer', assetCode: '00188417', assetDescription: 'Honeywell CT60 Mobile Computer', company: 'Central Bank of Oman', site: 'Sharjah', building: 'Gate Tower', floor: 'First Floor', room: 'Main Conference Room', departmentName: 'Projects & Solutions', custodianName: 'Faseeh Akthar', mainCategory: 'IT/Hardware', subCategory: 'Mobile Computer' },
    { assetId: 'AST-0002', assetName: 'Mobile Device-3', assetCode: '00000258', assetDescription: 'Mobile Device-3', company: 'Central Bank of Oman', site: 'Sharjah', building: 'Gate Tower', floor: 'First Floor', room: 'Main Conference Room', departmentName: 'Engineering', custodianName: 'Faseeh Akthar', mainCategory: 'IT/Hardware', subCategory: 'CPU' },
    { assetId: 'AST-0003', assetName: 'DELL OPTIPLEX 7010 CPU', assetCode: '00000257', assetDescription: 'DELL OPTIPLEX 7010 CPU', company: 'Central Bank of Oman', site: 'Abudhabi', building: 'ADDAX Tower', floor: '8th Floor', room: 'IT Store', departmentName: 'Stores', custodianName: 'Joseph', mainCategory: 'IT/Hardware', subCategory: 'CPU' },
    { assetId: 'AST-0004', assetName: 'DELL OPTIPLEX 7010 CPU', assetCode: '00000256', assetDescription: 'DELL OPTIPLEX 7010 CPU', company: 'Central Bank of Oman', site: 'Abudhabi', building: 'ADDAX Tower', floor: '8th Floor', room: 'IT Store', departmentName: 'Stores', custodianName: 'IT Store In Charge', mainCategory: 'IT/Hardware', subCategory: 'CPU' },
    { assetId: 'AST-0005', assetName: 'Zebra TC21 Mobile Computer', assetCode: '00000255', assetDescription: 'zebra TC 21 mobile computer', company: 'Central Bank of Oman', site: 'Abudhabi', building: 'ADDAX Tower', floor: '8th Floor', room: 'Meeting Room', departmentName: 'Projects & Solutions', custodianName: 'IT Store In Charge', mainCategory: 'IT/Hardware', subCategory: 'Mobile Computer' },
    { assetId: 'AST-0006', assetName: 'Zebra TC21 Mobile Computer', assetCode: '00000254', assetDescription: 'zebra TC 21 mobile computer', company: 'Central Bank of Oman', site: 'Abudhabi', building: 'ADDAX Tower', floor: '8th Floor', room: 'IT Store', departmentName: 'Stores', custodianName: 'Joseph', mainCategory: 'IT/Hardware', subCategory: 'Mobile Computer' },
    { assetId: 'AST-0007', assetName: 'Mobile Device-2', assetCode: '00000253', assetDescription: 'Mobile Device-2', company: 'Central Bank of Oman', site: 'Sharjah', building: 'Gate Tower', floor: 'First Floor', room: 'Main Conference Room', departmentName: 'Projects & Solutions', custodianName: 'Faseeh Akthar', mainCategory: 'IT/Hardware', subCategory: 'Mobile Computer' },
    { assetId: 'AST-0008', assetName: 'Fridge West Point 170 Ltr', assetCode: '00000250', assetDescription: 'Fridge West Point 170 Ltr', company: 'Central Bank of Oman', site: 'Sharjah', building: 'Gate Tower', floor: 'First Floor', room: 'Main Conference Room', departmentName: 'Administration', custodianName: 'Manisha', mainCategory: 'Kitchen Equipment', subCategory: 'Chillers & Freezers' }
  ];

  private emptyForm(): AssetCheckoutForm {
    return {
      assetId: '',
      assetName: '',
      assetCode: '',
      assetDescription: '',
      company: '',
      site: '',
      building: '',
      floor: '',
      room: '',
      departmentName: '',
      custodianName: '',
      mainCategory: '',
      subCategory: ''
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
        assetCode: row['assetCode'] ?? '',
        assetDescription: row['assetDescription'] ?? '',
        company: row['company'] ?? '',
        site: row['site'] ?? '',
        building: row['building'] ?? '',
        floor: row['floor'] ?? '',
        room: row['room'] ?? '',
        departmentName: row['departmentName'] ?? '',
        custodianName: row['custodianName'] ?? '',
        mainCategory: row['mainCategory'] ?? '',
        subCategory: row['subCategory'] ?? ''
      }))
    ];
    this.showImportModal = false;
  }

  onDownload(): void {
    // TODO: export current asset check-out list
  }

  onRefresh(): void {
    // TODO: reload asset check-out data from backend
  }

  onDelete(): void {
    // TODO: delete selected entries
  }

  editRow(entry: AssetCheckoutEntry): void {
    this.isEditMode = true;
    this.editingEntry = entry;
    this.form = { ...entry };
    this.showFormModal = true;
  }

  deleteRow(entry: AssetCheckoutEntry): void {
    this.entries = this.entries.filter((e) => e !== entry);
  }
}
