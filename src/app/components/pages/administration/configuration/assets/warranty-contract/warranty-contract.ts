import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImportColumn, ImportFileModal } from 'shared-ui';
import { RowActions } from 'shared-ui';

export interface WarrantyContractEntry {
  assetId: string;
  assetName: string;
  warrantyPeriod: string;
  amc: string;
  slaDetails: string;
  vendorContractDocuments: string;
}

type WarrantyContractEntryForm = {
  assetId: string;
  assetName: string;
  warrantyPeriod: string;
  amc: string;
  slaDetails: string;
  vendorContractDocuments: string;
};

@Component({
  standalone: true,
  selector: 'app-asset-warranty-contract',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './warranty-contract.html',
  styleUrls: ['./warranty-contract.css']
})
export class AssetWarrantyContract {
  readonly importColumns: ImportColumn[] = [
    { key: 'assetId', label: 'Asset ID' },
    { key: 'assetName', label: 'Asset Name' },
    { key: 'warrantyPeriod', label: 'Warranty Start & End Date' },
    { key: 'amc', label: 'AMC (Annual Maintenance Contract)' },
    { key: 'slaDetails', label: 'SLA Details' },
    { key: 'vendorContractDocuments', label: 'Vendor Contract Documents' }
  ];

  showImportModal = false;

  showFormModal = false;
  isEditMode = false;
  private editingEntry: WarrantyContractEntry | null = null;
  form: WarrantyContractEntryForm = this.emptyForm();

  entries: WarrantyContractEntry[] = [
    {
      assetId: 'AST-0001',
      assetName: 'Industrial Generator 2',
      warrantyPeriod: '2025-02-14 to 2027-02-13',
      amc: 'AMC Active - Al Futtaim Technical Services',
      slaDetails: '24hr response, 99% uptime',
      vendorContractDocuments: 'amc_contract_88213.pdf'
    },
    {
      assetId: 'AST-0002',
      assetName: 'Water Pump Unit 3',
      warrantyPeriod: '2023-08-05 to 2025-08-04',
      amc: 'AMC Expired',
      slaDetails: '48hr response, 95% uptime',
      vendorContractDocuments: 'amc_contract_44120.pdf'
    }
  ];

  private emptyForm(): WarrantyContractEntryForm {
    return {
      assetId: '',
      assetName: '',
      warrantyPeriod: '',
      amc: '',
      slaDetails: '',
      vendorContractDocuments: ''
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
        warrantyPeriod: row['warrantyPeriod'] ?? '',
        amc: row['amc'] ?? '',
        slaDetails: row['slaDetails'] ?? '',
        vendorContractDocuments: row['vendorContractDocuments'] ?? ''
      }))
    ];
    this.showImportModal = false;
  }

  onDownload(): void {
    // TODO: export current warranty & contract list
  }

  onRefresh(): void {
    // TODO: reload warranty & contract data from backend
  }

  onDelete(): void {
    // TODO: delete selected entries
  }

  editRow(entry: WarrantyContractEntry): void {
    this.isEditMode = true;
    this.editingEntry = entry;
    this.form = {
      assetId: entry.assetId,
      assetName: entry.assetName,
      warrantyPeriod: entry.warrantyPeriod,
      amc: entry.amc,
      slaDetails: entry.slaDetails,
      vendorContractDocuments: entry.vendorContractDocuments
    };
    this.showFormModal = true;
  }

  deleteRow(entry: WarrantyContractEntry): void {
    this.entries = this.entries.filter((e) => e !== entry);
  }
}
