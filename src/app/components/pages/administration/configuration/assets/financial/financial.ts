import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImportColumn, ImportFileModal } from 'shared-ui';
import { RowActions } from 'shared-ui';

export interface FinancialEntry {
  assetId: string;
  assetName: string;
  purchaseCost: string;
  purchaseDate: string;
  vendorDetails: string;
  invoiceNumber: string;
  depreciationMethod: string;
  currentBookValue: string;
  residualValue: string;
  costCenterAllocation: string;
}

@Component({
  standalone: true,
  selector: 'app-asset-financial',
  imports: [CommonModule, ImportFileModal, RowActions],
  templateUrl: './financial.html',
  styleUrls: ['./financial.css']
})
export class AssetFinancial {
  readonly importColumns: ImportColumn[] = [
    { key: 'assetId', label: 'Asset ID' },
    { key: 'assetName', label: 'Asset Name' },
    { key: 'purchaseCost', label: 'Purchase Cost' },
    { key: 'purchaseDate', label: 'Purchase Date' },
    { key: 'vendorDetails', label: 'Vendor Details' },
    { key: 'invoiceNumber', label: 'Invoice Number' },
    { key: 'depreciationMethod', label: 'Depreciation Method' },
    { key: 'currentBookValue', label: 'Current Book Value' },
    { key: 'residualValue', label: 'Residual Value' },
    { key: 'costCenterAllocation', label: 'Cost Center Allocation' }
  ];

  showImportModal = false;

  entries: FinancialEntry[] = [
    {
      assetId: 'AST-0001',
      assetName: 'HVAC Compressor Unit 2',
      purchaseCost: 'AED 42,500',
      purchaseDate: '2025-02-10',
      vendorDetails: 'Gulf Technical Supplies',
      invoiceNumber: 'INV-88213',
      depreciationMethod: 'Straight-line',
      currentBookValue: 'AED 34,000',
      residualValue: 'AED 4,250',
      costCenterAllocation: 'Facilities - CC-102'
    },
    {
      assetId: 'AST-0002',
      assetName: 'Safety Barrier Set A',
      purchaseCost: 'AED 18,900',
      purchaseDate: '2023-08-01',
      vendorDetails: 'Al Noor Safety Equipment',
      invoiceNumber: 'INV-44120',
      depreciationMethod: 'Reducing balance',
      currentBookValue: 'AED 9,450',
      residualValue: 'AED 1,890',
      costCenterAllocation: 'Safety - CC-207'
    }
  ];

  onAdd(): void {
    // TODO: open add financial entry flow
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
        purchaseCost: row['purchaseCost'] ?? '',
        purchaseDate: row['purchaseDate'] ?? '',
        vendorDetails: row['vendorDetails'] ?? '',
        invoiceNumber: row['invoiceNumber'] ?? '',
        depreciationMethod: row['depreciationMethod'] ?? '',
        currentBookValue: row['currentBookValue'] ?? '',
        residualValue: row['residualValue'] ?? '',
        costCenterAllocation: row['costCenterAllocation'] ?? ''
      }))
    ];
    this.showImportModal = false;
  }

  onDownload(): void {
    // TODO: export current financial list
  }

  onRefresh(): void {
    // TODO: reload financial data from backend
  }

  onDelete(): void {
    // TODO: delete selected entries
  }

  editRow(entry: FinancialEntry): void {
    // TODO: open edit flow for a single row (no existing per-row edit flow to mirror on this page)
  }

  deleteRow(entry: FinancialEntry): void {
    this.entries = this.entries.filter((e) => e !== entry);
  }
}
