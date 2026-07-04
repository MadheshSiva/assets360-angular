import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface WarrantyContractEntry {
  warrantyPeriod: string;
  amc: string;
  slaDetails: string;
  vendorContractDocuments: string;
}

@Component({
  standalone: true,
  selector: 'app-asset-warranty-contract',
  imports: [CommonModule],
  templateUrl: './warranty-contract.html',
  styleUrls: ['./warranty-contract.css']
})
export class AssetWarrantyContract {
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
    // TODO: trigger file upload (e.g. bulk import via Excel/CSV)
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
}
