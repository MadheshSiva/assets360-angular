import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Asset {
  assetId: string;
  assetName: string;
  description: string;
  category: string;
  subCategory: string;
  serialNumber: string;
  tagIds: string;
  assetType: string;
  parentAsset: string;
  selected?: boolean;
}

interface AssetColumn {
  key: string;
  label: string;
  visible: boolean;
}

interface NewAssetForm {
  assetId: string;
  assetName: string;
  description: string;
  categorySub: string;
  serialNumber: string;
  tagIds: string;
  assetType: string;
  parentAsset: string;
}

@Component({
  standalone: true,
  selector: 'app-assets',
  imports: [CommonModule, FormsModule],
  templateUrl: './assets.html',
  styleUrls: ['./assets.css']
})
export class Assets {
  searchTerm = '';

  columns: AssetColumn[] = [
    { key: 'assetId', label: 'Asset ID', visible: true },
    { key: 'assetName', label: 'Asset Name', visible: true },
    { key: 'description', label: 'Description', visible: true },
    { key: 'category', label: 'Category / Sub-category', visible: true },
    { key: 'serialNumber', label: 'Serial Number', visible: true },
    { key: 'tagIds', label: 'Tag IDs', visible: true },
    { key: 'assetType', label: 'Asset Type', visible: true },
    { key: 'parentAsset', label: 'Parent Asset', visible: true }
  ];

  showColumnPicker = false;

  assets: Asset[] = [
    {
      assetId: 'AST-1001',
      assetName: 'HVAC Unit 1',
      description: 'Rooftop air handling unit',
      category: 'Mechanical',
      subCategory: 'HVAC',
      serialNumber: 'SN-88213',
      tagIds: 'BLE',
      assetType: 'Equipment',
      parentAsset: '-'
    },
    {
      assetId: 'AST-1002',
      assetName: 'Fire Panel A',
      description: 'Main fire alarm control panel',
      category: 'Safety',
      subCategory: 'Fire Detection',
      serialNumber: 'SN-44120',
      tagIds: 'RFID',
      assetType: 'Equipment',
      parentAsset: '-'
    },
    {
      assetId: 'AST-1003',
      assetName: 'Chiller Pump 2',
      description: 'Secondary chilled water pump',
      category: 'Mechanical',
      subCategory: 'Plumbing',
      serialNumber: 'SN-77894',
      tagIds: 'QR',
      assetType: 'Component',
      parentAsset: 'HVAC Unit 1'
    }
  ];

  filteredAssets: Asset[] = [...this.assets];

  showFormModal = false;
  isEditMode = false;
  private editingAsset: Asset | null = null;

  // Mock "Category Master" — in production this would come from a backend master-data lookup.
  categorySubOptions: string[] = [
    'Mechanical / HVAC',
    'Mechanical / Plumbing',
    'Safety / Fire Detection',
    'Electrical / Power Distribution',
    'IT / Network'
  ];

  // Mock "Technology Backend Master" for tag identification technology.
  tagTechnologyOptions: string[] = ['QR', 'RFID', 'BLE', 'GPS'];

  assetTypeOptions: string[] = ['Equipment', 'Component', 'Facility'];

  form: NewAssetForm = this.emptyForm();

  // "Parent Asset" master — sourced from the existing asset list, excluding the asset being edited.
  get parentAssetOptions(): string[] {
    return this.assets
      .filter((a) => a !== this.editingAsset)
      .map((a) => a.assetName);
  }

  private emptyForm(): NewAssetForm {
    return {
      assetId: '',
      assetName: '',
      description: '',
      categorySub: '',
      serialNumber: '',
      tagIds: '',
      assetType: '',
      parentAsset: ''
    };
  }

  isColumnVisible(key: string): boolean {
    return this.columns.find((c) => c.key === key)?.visible ?? true;
  }

  toggleColumnPicker(): void {
    this.showColumnPicker = !this.showColumnPicker;
  }

  closeColumnPicker(): void {
    this.showColumnPicker = false;
  }

  toggleColumn(col: AssetColumn): void {
    col.visible = !col.visible;
  }

  get selectedAssets(): Asset[] {
    return this.filteredAssets.filter((a) => a.selected);
  }

  get allSelected(): boolean {
    return this.filteredAssets.length > 0 && this.filteredAssets.every((a) => a.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredAssets.forEach((a) => (a.selected = next));
  }

  toggleSelectAsset(asset: Asset): void {
    asset.selected = !asset.selected;
  }

  onSearch(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredAssets = [...this.assets];
      return;
    }
    this.filteredAssets = this.assets.filter((a) =>
      Object.values(a).some((value) => String(value).toLowerCase().includes(term))
    );
  }

  onRefresh(): void {
    this.searchTerm = '';
    this.filteredAssets = [...this.assets];
  }

  onCreate(): void {
    this.isEditMode = false;
    this.editingAsset = null;
    this.form = this.emptyForm();
    this.showFormModal = true;
  }

  onEdit(): void {
    if (this.selectedAssets.length !== 1) return;
    const asset = this.selectedAssets[0];
    this.isEditMode = true;
    this.editingAsset = asset;
    this.form = {
      assetId: asset.assetId,
      assetName: asset.assetName,
      description: asset.description,
      categorySub: `${asset.category} / ${asset.subCategory}`,
      serialNumber: asset.serialNumber,
      tagIds: asset.tagIds,
      assetType: asset.assetType,
      parentAsset: asset.parentAsset
    };
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.editingAsset = null;
  }

  submitForm(): void {
    const [category, subCategory] = this.form.categorySub.split(' / ');
    const { categorySub, assetId, parentAsset, ...rest } = this.form;

    if (this.isEditMode && this.editingAsset) {
      Object.assign(this.editingAsset, rest, {
        category,
        subCategory,
        parentAsset: parentAsset || '-'
      });
    } else {
      const nextId = this.assets.length + 1001;
      this.assets = [
        ...this.assets,
        {
          ...rest,
          assetId: assetId || `AST-${nextId}`,
          category,
          subCategory,
          parentAsset: parentAsset || '-',
          selected: false
        }
      ];
    }
    this.onSearch();
    this.closeFormModal();
  }

  onUpload(): void {
    // TODO: trigger file upload (e.g. bulk import via Excel/CSV)
  }

  onDownload(): void {
    // TODO: export current asset list
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeColumnPicker();
  }
}
