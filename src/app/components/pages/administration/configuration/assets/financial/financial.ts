import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface FinancialEntry {
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
  imports: [CommonModule],
  templateUrl: './financial.html',
  styleUrls: ['./financial.css']
})
export class AssetFinancial {
  entries: FinancialEntry[] = [
    {
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
    // TODO: trigger file upload (e.g. bulk import via Excel/CSV)
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
}
