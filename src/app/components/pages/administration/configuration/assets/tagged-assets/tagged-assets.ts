import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { RowActions } from '@shared/row-actions/row-actions';

export interface TaggedAssetEntry {
  assetCode: string;
  assetDescription: string;
  company: string;
  site: string;
  building: string;
  floor: string;
  room: string;
  mainCategory: string;
  subCategory: string;
  subSubCategory: string;
  brand: string;
}

@Component({
  standalone: true,
  selector: 'app-asset-tagged-assets',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './tagged-assets.html',
  styleUrls: ['./tagged-assets.css']
})
export class AssetTaggedAssets {
  readonly importColumns: ImportColumn[] = [
    { key: 'assetCode', label: 'Asset Code' },
    { key: 'assetDescription', label: 'Asset Description' },
    { key: 'company', label: 'Company' },
    { key: 'site', label: 'Site' },
    { key: 'building', label: 'Building' },
    { key: 'floor', label: 'Floor' },
    { key: 'room', label: 'Room' },
    { key: 'mainCategory', label: 'Main Category' },
    { key: 'subCategory', label: 'Sub Category' },
    { key: 'subSubCategory', label: 'Sub Sub Category' },
    { key: 'brand', label: 'Brand' }
  ];

  showImportModal = false;

  readonly mainCategoryOptions: string[] = [
    'Furniture & Fixture',
    'IT/Hardware',
    'Computer Hardware & Peripherals',
    'Audio Video Equipment',
    'Kitchen Equipment'
  ];

  readonly locationFilterOptions: string[] = ['Subhan Industrial', 'Head Office', 'Sharjah', 'Abudhabi'];
  readonly categoryFilterOptions: string[] = [
    'Furniture & Fixture',
    'IT/Hardware',
    'Computer Hardware & Peripherals',
    'Audio Video Equipment'
  ];

  locationFilter = '';
  categoryFilter = '';

  entries: TaggedAssetEntry[] = [
    { assetCode: 'EMC-14-CTA-000004', assetDescription: 'office table', company: 'Mezzan Holding', site: 'Subhan Industrial', building: 'Corporate Office', floor: 'First Floor', room: '1F Conference Room', mainCategory: 'Furniture & Fixture', subCategory: 'Table', subSubCategory: 'Office Table', brand: '' },
    { assetCode: 'B-0000022', assetDescription: 'Lenovo ThinkPad E14', company: 'Mezzan Holding', site: 'Subhan Industrial', building: 'Corporate Office', floor: 'First Floor', room: '1F Conference Room', mainCategory: 'IT/Hardware', subCategory: 'Laptop', subSubCategory: '', brand: '' },
    { assetCode: 'ABC001', assetDescription: 'Laptop', company: 'Central Bank of Oman', site: 'Head Office', building: 'CAFETERIA', floor: 'FIRST FLOOR', room: '33', mainCategory: 'Computer Hardware & Peripherals', subCategory: 'Laptop', subSubCategory: '', brand: '' },
    { assetCode: '78009', assetDescription: 'Digital Camera', company: 'Central Bank of Oman', site: 'Head Office', building: 'CAFETERIA', floor: 'FIRST FLOOR', room: '33', mainCategory: 'Audio Video Equipment', subCategory: 'Digital Camera', subSubCategory: '', brand: '' },
    { assetCode: '6889', assetDescription: 'Laptop', company: 'Central Bank of Oman', site: 'Head Office', building: 'CAFETERIA', floor: 'FIRST FLOOR', room: '33', mainCategory: 'Computer Hardware & Peripherals', subCategory: 'Laptop', subSubCategory: '', brand: '' }
  ];

  // Live-computed view of `entries` filtered by the two dropdown panels above
  // the table. Reading this straight off the getter means Search doesn't need
  // to copy any state — it's already always in sync with the filters.
  get filteredEntries(): TaggedAssetEntry[] {
    return this.entries.filter((entry) => {
      const matchesLocation =
        !this.locationFilter ||
        entry.building === this.locationFilter ||
        entry.site === this.locationFilter;
      const matchesCategory = !this.categoryFilter || entry.mainCategory === this.categoryFilter;
      return matchesLocation && matchesCategory;
    });
  }

  onSearch(): void {
    // filteredEntries is a live getter, so filtering already reflects the
    // current dropdown selections — nothing else to trigger here.
  }

  onClearFilters(): void {
    this.locationFilter = '';
    this.categoryFilter = '';
  }

  // Adds a new row directly to the table — each editable cell is already a
  // live textbox/select, so there's no separate add form.
  onAdd(): void {
    this.entries = [
      ...this.entries,
      {
        assetCode: '',
        assetDescription: '',
        company: '',
        site: '',
        building: '',
        floor: '',
        room: '',
        mainCategory: '',
        subCategory: '',
        subSubCategory: '',
        brand: ''
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
        assetCode: row['assetCode'] ?? '',
        assetDescription: row['assetDescription'] ?? '',
        company: row['company'] ?? '',
        site: row['site'] ?? '',
        building: row['building'] ?? '',
        floor: row['floor'] ?? '',
        room: row['room'] ?? '',
        mainCategory: row['mainCategory'] ?? '',
        subCategory: row['subCategory'] ?? '',
        subSubCategory: row['subSubCategory'] ?? '',
        brand: row['brand'] ?? ''
      }))
    ];
    this.showImportModal = false;
  }

  onDownload(): void {
    // TODO: export current tagged assets list
  }

  onRefresh(): void {
    // TODO: reload tagged assets data from backend
  }

  onDelete(): void {
    // TODO: delete selected entries
  }

  editRow(entry: TaggedAssetEntry): void {
    // Rows here are already inline-editable; no separate edit flow to mirror.
  }

  deleteRow(entry: TaggedAssetEntry): void {
    this.entries = this.entries.filter((e) => e !== entry);
  }
}
