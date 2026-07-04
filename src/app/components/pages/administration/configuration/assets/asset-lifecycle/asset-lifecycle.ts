import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface AssetLifecycleEntry {
  procurementDate: string;
  deploymentDate: string;
  status: string;
  disposalDetails: string;
  reasonForRetirement: string;
}

@Component({
  standalone: true,
  selector: 'app-asset-lifecycle',
  imports: [CommonModule],
  templateUrl: './asset-lifecycle.html',
  styleUrls: ['./asset-lifecycle.css']
})
export class AssetLifecycle {
  entries: AssetLifecycleEntry[] = [
    {
      procurementDate: '2025-02-14',
      deploymentDate: '2025-03-01',
      status: 'Active',
      disposalDetails: '-',
      reasonForRetirement: '-'
    },
    {
      procurementDate: '2023-08-05',
      deploymentDate: '2023-08-20',
      status: 'Retired',
      disposalDetails: 'Sold to third-party vendor',
      reasonForRetirement: 'End of service life'
    }
  ];

  onAdd(): void {
    // TODO: open add asset lifecycle entry flow
  }

  onUpload(): void {
    // TODO: trigger file upload (e.g. bulk import via Excel/CSV)
  }

  onDownload(): void {
    // TODO: export current asset lifecycle list
  }

  onRefresh(): void {
    // TODO: reload asset lifecycle data from backend
  }

  onDelete(): void {
    // TODO: delete selected entries
  }
}
