import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { RowActions } from '@shared/row-actions/row-actions';

export interface WarrantyContractEntry {
  warrantyPeriod: string;
  amc: string;
  slaDetails: string;
  vendorContractDocuments: string;
}

@Component({
  standalone: true,
  selector: 'app-asset-warranty-contract',
  imports: [CommonModule, ImportFileModal, RowActions],
  templateUrl: './warranty-contract.html',
  styleUrls: ['./warranty-contract.css']
})
export class AssetWarrantyContract {
  readonly importColumns: ImportColumn[] = [
    { key: 'warrantyPeriod', label: 'Warranty Start & End Date' },
    { key: 'amc', label: 'AMC (Annual Maintenance Contract)' },
    { key: 'slaDetails', label: 'SLA Details' },
    { key: 'vendorContractDocuments', label: 'Vendor Contract Documents' }
  ];

  showImportModal = false;

  entries: WarrantyContractEntry[] = [
    {
      warrantyPeriod: '2025-02-14 to 2027-02-13',
      amc: 'AMC Active - Al Futtaim Technical Services',
      slaDetails: '24hr response, 99% uptime',
      vendorContractDocuments: 'amc_contract_88213.pdf'
    },
    {
      warrantyPeriod: '2023-08-05 to 2025-08-04',
      amc: 'AMC Expired',
      slaDetails: '48hr response, 95% uptime',
      vendorContractDocuments: 'amc_contract_44120.pdf'
    }
  ];

  onAdd(): void {
    // TODO: open add warranty & contract entry flow
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    this.entries = [
      ...this.entries,
      ...rows.map((row) => ({
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
    // TODO: open edit flow for a single row (no existing per-row edit flow to mirror on this page)
  }

  deleteRow(entry: WarrantyContractEntry): void {
    this.entries = this.entries.filter((e) => e !== entry);
  }
}
