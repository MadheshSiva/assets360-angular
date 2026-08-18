import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface CheckedOutAssetRow {
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
  selected?: boolean;
}

@Component({
  standalone: true,
  selector: 'app-asset-checkin',
  imports: [CommonModule, FormsModule],
  templateUrl: './asset-checkin.html',
  styleUrls: ['./asset-checkin.css']
})
export class AssetCheckin {
  // Currently checked-out assets (same shape/records as the Asset Check-Out tab —
  // each Assets tab keeps its own local copy, this app has no shared services
  // between tabs).
  rows: CheckedOutAssetRow[] = [
    { assetId: 'AST-0001', assetName: 'Honeywell CT60 Mobile Computer', assetCode: '00188417', assetDescription: 'Honeywell CT60 Mobile Computer', company: 'Central Bank of Oman', site: 'Sharjah', building: 'Gate Tower', floor: 'First Floor', room: 'Main Conference Room', departmentName: 'Projects & Solutions', custodianName: 'Faseeh Akthar' },
    { assetId: 'AST-0002', assetName: 'Mobile Device-3', assetCode: '00000258', assetDescription: 'Mobile Device-3', company: 'Central Bank of Oman', site: 'Sharjah', building: 'Gate Tower', floor: 'First Floor', room: 'Main Conference Room', departmentName: 'Engineering', custodianName: 'Faseeh Akthar' },
    { assetId: 'AST-0003', assetName: 'DELL OPTIPLEX 7010 CPU', assetCode: '00000257', assetDescription: 'DELL OPTIPLEX 7010 CPU', company: 'Central Bank of Oman', site: 'Abudhabi', building: 'ADDAX Tower', floor: '8th Floor', room: 'IT Store', departmentName: 'Stores', custodianName: 'Joseph' },
    { assetId: 'AST-0004', assetName: 'DELL OPTIPLEX 7010 CPU', assetCode: '00000256', assetDescription: 'DELL OPTIPLEX 7010 CPU', company: 'Central Bank of Oman', site: 'Abudhabi', building: 'ADDAX Tower', floor: '8th Floor', room: 'IT Store', departmentName: 'Stores', custodianName: 'IT Store In Charge' },
    { assetId: 'AST-0005', assetName: 'Zebra TC21 Mobile Computer', assetCode: '00000255', assetDescription: 'zebra TC 21 mobile computer', company: 'Central Bank of Oman', site: 'Abudhabi', building: 'ADDAX Tower', floor: '8th Floor', room: 'Meeting Room', departmentName: 'Projects & Solutions', custodianName: 'IT Store In Charge' },
    { assetId: 'AST-0006', assetName: 'Zebra TC21 Mobile Computer', assetCode: '00000254', assetDescription: 'zebra TC 21 mobile computer', company: 'Central Bank of Oman', site: 'Abudhabi', building: 'ADDAX Tower', floor: '8th Floor', room: 'IT Store', departmentName: 'Stores', custodianName: 'Joseph' },
    { assetId: 'AST-0007', assetName: 'Mobile Device-2', assetCode: '00000253', assetDescription: 'Mobile Device-2', company: 'Central Bank of Oman', site: 'Sharjah', building: 'Gate Tower', floor: 'First Floor', room: 'Main Conference Room', departmentName: 'Projects & Solutions', custodianName: 'Faseeh Akthar' },
    { assetId: 'AST-0008', assetName: 'Fridge West Point 170 Ltr', assetCode: '00000250', assetDescription: 'Fridge West Point 170 Ltr', company: 'Central Bank of Oman', site: 'Sharjah', building: 'Gate Tower', floor: 'First Floor', room: 'Main Conference Room', departmentName: 'Administration', custodianName: 'Manisha' }
  ];

  get custodianOptions(): string[] {
    return Array.from(new Set(this.rows.map((r) => r.custodianName))).sort();
  }

  selectedCustodian = '';

  // ===== Grid filtering + pagination =====
  pageSizeOptions = [10, 15, 30, 60, 100];
  pageSize = 10;
  currentPage = 1;

  get filteredRows(): CheckedOutAssetRow[] {
    return this.rows.filter((r) => !this.selectedCustodian || r.custodianName === this.selectedCustodian);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredRows.length / this.pageSize));
  }

  get pagedRows(): CheckedOutAssetRow[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredRows.slice(start, start + this.pageSize);
  }

  onCustodianChange(): void {
    this.currentPage = 1;
  }

  setPageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  get allPagedSelected(): boolean {
    return this.pagedRows.length > 0 && this.pagedRows.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allPagedSelected;
    this.pagedRows.forEach((r) => (r.selected = next));
  }

  get selectedRows(): CheckedOutAssetRow[] {
    return this.filteredRows.filter((r) => r.selected);
  }

  // ===== Check-in details form =====
  // Each "apply" flag lets the user optionally override that field across every
  // selected asset at check-in time — useful since a batch of checked-out
  // assets can span multiple departments/companies. Site/Building/Floor are
  // always applied (no override toggle) since they describe where the asset
  // is physically being returned to.
  companyOptions: string[] = ['Central Bank of Oman'];
  siteOptions: string[] = ['Sharjah', 'Abudhabi'];
  buildingOptions: string[] = ['Gate Tower', 'ADDAX Tower'];
  floorOptions: string[] = ['First Floor', '8th Floor'];
  departmentOptions: string[] = ['Projects & Solutions', 'Engineering', 'Stores', 'Administration'];

  form = {
    applyCustodian: false,
    custodianValue: '',
    applyCompany: false,
    companyValue: '',
    applyDepartment: false,
    departmentValue: '',
    site: '',
    building: '',
    floor: '',
    remarks: ''
  };

  private resetForm(): void {
    this.form = {
      applyCustodian: false,
      custodianValue: '',
      applyCompany: false,
      companyValue: '',
      applyDepartment: false,
      departmentValue: '',
      site: '',
      building: '',
      floor: '',
      remarks: ''
    };
  }

  onCheckIn(): void {
    const selected = this.selectedRows;
    if (selected.length === 0) return;

    const codes = new Set(selected.map((r) => r.assetCode));
    // Checking in removes the asset from the checked-out list.
    this.rows = this.rows.filter((r) => !codes.has(r.assetCode));
    this.currentPage = 1;
    this.resetForm();
  }
}
